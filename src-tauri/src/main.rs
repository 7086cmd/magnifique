#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use tauri::Manager;
use tauri::{
  CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, TrayIcon,
  WindowEvent,
};

#[tauri::command]
async fn show_window(window: tauri::Window) {
  // Show main window
  window.get_window("main").unwrap().show().unwrap();
}

fn main() {
  let quit = CustomMenuItem::new("quit".to_string(), "退出");
  let hide = CustomMenuItem::new("show".to_string(), "显示窗口");
  let tray_menu = SystemTrayMenu::new()
    .add_item(hide)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);
  tauri::Builder::default()
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .setup(|app| {
      app
        .tray_handle()
        .set_icon(TrayIcon::Raw(include_bytes!("../icons/icon.ico").to_vec()))
        .unwrap();
      let window = app.get_window("main").unwrap();
      window.on_window_event(|event| match event {
        WindowEvent::CloseRequested { api, .. } => {
          api.prevent_close();
        }
        _ => {}
      });
      Ok(())
    })
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a left click");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
        ..
      } => {
        // println!("{}", _);
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
      }
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        "quit" => {
          std::process::exit(0);
        }
        "show" => {
          let window = app.get_window("main").unwrap();
          window.show().unwrap();
        }
        _ => {}
      },
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![show_window])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
