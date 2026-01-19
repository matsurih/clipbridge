use super::{ClipboardError, Result};
use clipboard_win::{formats, get_clipboard, set_clipboard};

/// Get text from Windows clipboard
pub fn get_text() -> Result<String> {
    get_clipboard(formats::Unicode)
        .map_err(|e| ClipboardError::Unknown(format!("Failed to read clipboard: {}", e)))
}

/// Set text to Windows clipboard
pub fn set_text(text: &str) -> Result<()> {
    set_clipboard(formats::Unicode, text)
        .map_err(|e| ClipboardError::Unknown(format!("Failed to write clipboard: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_and_get_text() {
        let test_text = "Hello, ClipBridge on Windows!";
        set_text(test_text).unwrap();
        let retrieved = get_text().unwrap();
        assert_eq!(retrieved, test_text);
    }
}
