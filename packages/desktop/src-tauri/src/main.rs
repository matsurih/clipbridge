// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod clipboard;
mod network;

use clipboard::ClipboardMonitor;
use parking_lot::Mutex;
use std::sync::Arc;

#[allow(dead_code)]
#[derive(Clone, serde::Serialize)]
struct ClipboardUpdate {
    content: String,
    timestamp: u64,
}

struct AppState {
    #[allow(dead_code)]
    clipboard_monitor: Arc<Mutex<Option<ClipboardMonitor>>>,
    is_syncing: Arc<Mutex<bool>>,
}

#[tauri::command]
async fn start_sync(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut is_syncing = state.is_syncing.lock();
    if *is_syncing {
        return Ok(());
    }

    log::info!("Starting clipboard sync");
    *is_syncing = true;

    // TODO: Start network layer and clipboard monitoring

    Ok(())
}

#[tauri::command]
async fn stop_sync(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut is_syncing = state.is_syncing.lock();
    if !*is_syncing {
        return Ok(());
    }

    log::info!("Stopping clipboard sync");
    *is_syncing = false;

    // TODO: Stop monitoring

    Ok(())
}

#[tauri::command]
async fn get_clipboard_text() -> Result<String, String> {
    clipboard::get_text().map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_clipboard_text(text: String) -> Result<(), String> {
    clipboard::set_text(&text).map_err(|e| e.to_string())
}

#[tauri::command]
async fn is_syncing(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    Ok(*state.is_syncing.lock())
}

fn main() {
    env_logger::init();

    let app_state = AppState {
        clipboard_monitor: Arc::new(Mutex::new(None)),
        is_syncing: Arc::new(Mutex::new(false)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            start_sync,
            stop_sync,
            get_clipboard_text,
            set_clipboard_text,
            is_syncing
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
