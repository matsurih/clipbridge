use std::error::Error;
use std::fmt;
use std::sync::Arc;
use parking_lot::Mutex;
use std::thread;
use std::time::Duration;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "linux")]
mod linux;

#[derive(Debug)]
pub enum ClipboardError {
    #[allow(dead_code)]
    AccessDenied,
    #[allow(dead_code)]
    UnsupportedFormat,
    Unknown(String),
}

impl fmt::Display for ClipboardError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ClipboardError::AccessDenied => write!(f, "Clipboard access denied"),
            ClipboardError::UnsupportedFormat => write!(f, "Unsupported clipboard format"),
            ClipboardError::Unknown(msg) => write!(f, "Clipboard error: {}", msg),
        }
    }
}

impl Error for ClipboardError {}

pub type Result<T> = std::result::Result<T, ClipboardError>;

/// Get text from clipboard
pub fn get_text() -> Result<String> {
    #[cfg(target_os = "windows")]
    return windows::get_text();

    #[cfg(target_os = "linux")]
    return linux::get_text();

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    Err(ClipboardError::Unknown("Platform not supported".to_string()))
}

/// Set text to clipboard
pub fn set_text(text: &str) -> Result<()> {
    #[cfg(target_os = "windows")]
    return windows::set_text(text);

    #[cfg(target_os = "linux")]
    return linux::set_text(text);

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    Err(ClipboardError::Unknown("Platform not supported".to_string()))
}

/// Clipboard monitor for detecting changes
pub struct ClipboardMonitor {
    #[allow(dead_code)]
    last_content: Arc<Mutex<String>>,
    #[allow(dead_code)]
    is_running: Arc<Mutex<bool>>,
}

impl ClipboardMonitor {
    pub fn new() -> Self {
        Self {
            last_content: Arc::new(Mutex::new(String::new())),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Start monitoring clipboard changes
    #[allow(dead_code)]
    pub fn start<F>(&self, callback: F) -> Result<()>
    where
        F: Fn(String) + Send + 'static,
    {
        let mut is_running = self.is_running.lock();
        if *is_running {
            return Ok(());
        }

        *is_running = true;
        let is_running_clone = Arc::clone(&self.is_running);
        let last_content_clone = Arc::clone(&self.last_content);

        thread::spawn(move || {
            log::info!("Clipboard monitor started");

            while *is_running_clone.lock() {
                match get_text() {
                    Ok(current_content) => {
                        let mut last_content = last_content_clone.lock();
                        if current_content != *last_content && !current_content.is_empty() {
                            log::debug!("Clipboard changed: {} bytes", current_content.len());
                            *last_content = current_content.clone();
                            drop(last_content); // Release lock before callback
                            callback(current_content);
                        }
                    }
                    Err(e) => {
                        log::warn!("Failed to read clipboard: {}", e);
                    }
                }

                thread::sleep(Duration::from_millis(500));
            }

            log::info!("Clipboard monitor stopped");
        });

        Ok(())
    }

    /// Stop monitoring
    #[allow(dead_code)]
    pub fn stop(&self) {
        let mut is_running = self.is_running.lock();
        *is_running = false;
    }

    /// Check if monitoring is active
    #[allow(dead_code)]
    pub fn is_running(&self) -> bool {
        *self.is_running.lock()
    }
}

impl Default for ClipboardMonitor {
    fn default() -> Self {
        Self::new()
    }
}
