// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod clipboard;
mod network;

use clipboard::ClipboardMonitor;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

#[derive(Clone, serde::Serialize)]
struct ClipboardUpdate {
    content: String,
    timestamp: u64,
}

struct AppState {
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

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let sync = CustomMenuItem::new("sync".to_string(), "Start Sync");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(sync)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn main() {
    env_logger::init();

    let app_state = AppState {
        clipboard_monitor: Arc::new(Mutex::new(None)),
        is_syncing: Arc::new(Mutex::new(false)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .system_tray(create_system_tray())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "sync" => {
                    // Toggle sync
                    log::info!("Sync menu item clicked");
                }
                _ => {}
            },
            _ => {}
        })
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
