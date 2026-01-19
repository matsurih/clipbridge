use super::{ClipboardError, Result};
use arboard::Clipboard;
use std::sync::Mutex;

// Use a global clipboard instance to avoid X11 connection issues
lazy_static::lazy_static! {
    static ref CLIPBOARD: Mutex<Clipboard> = {
        Mutex::new(Clipboard::new().expect("Failed to initialize clipboard"))
    };
}

/// Get text from Linux clipboard
pub fn get_text() -> Result<String> {
    CLIPBOARD
        .lock()
        .unwrap()
        .get_text()
        .map_err(|e| ClipboardError::Unknown(format!("Failed to read clipboard: {}", e)))
}

/// Set text to Linux clipboard
pub fn set_text(text: &str) -> Result<()> {
    CLIPBOARD
        .lock()
        .unwrap()
        .set_text(text.to_string())
        .map_err(|e| ClipboardError::Unknown(format!("Failed to write clipboard: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_and_get_text() {
        let test_text = "Hello, ClipBridge on Linux!";
        set_text(test_text).unwrap();
        let retrieved = get_text().unwrap();
        assert_eq!(retrieved, test_text);
    }
}
