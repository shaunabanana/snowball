#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::path::Path;

use tauri::{Menu, MenuItem, Submenu};
use tauri_plugin_store::PluginBuilder;
use tauri_plugin_fs_extra::FsExtra;

#[tauri::command]
fn init_dir(path: String) {
    // println!("Creating directory: {}", path);
    if Path::new(&path).exists() {
        fs::remove_dir_all(&path);
    }
    fs::create_dir(path);
}

#[tauri::command]
fn write_file(path: String, contents: String) {
    // println!("Writing file: {}", path);
    // println!("File contents: {}", contents);
    fs::write(path, contents);
}

#[tauri::command]
fn read_file(path: String) -> String {
    // println!("Reading file: {}", path);
    let result = fs::read_to_string(path);
    match result {
        Err(_) => "This failed!".into(),
        Ok(contents) => contents.into()
    }
}

fn main() {
    let appmenu = Submenu::new("App", Menu::new()
    // .add_native_item(MenuItem::About("Snowball".to_string(), tauri::AboutMetadata {
    //     version: Some("0.1.0".to_string()),
    //     authors: Some(["Shengchen Zhang".to_string()].to_vec()),
    //     comments: Some("".to_string()),
    //     copyright: Some("Shengchen Zhang".to_string()),
    //     license: Some("MIT".to_string()),
    //     website: Some("https://shengchen.design/".to_string()),
    //     website_label: Some("Shengchen's Blog".to_string()),
    // }))
    .add_native_item(MenuItem::Quit));
    
    // let mut new = CustomMenuItem::new("new".to_string(), "New");
    // new.keyboard_accelerator = Some("CmdOrControl+N".to_string());
    // let mut open = CustomMenuItem::new("open".to_string(), "Open");
    // open.keyboard_accelerator = Some("CmdOrControl+O".to_string());
    // let mut save = CustomMenuItem::new("save".to_string(), "Save Project");
    // save.keyboard_accelerator = Some("CmdOrControl+S".to_string());
    
    // let filemenu = Submenu::new("File", Menu::new()
    //     .add_item(new)
    //     .add_item(open)
    //     .add_native_item(MenuItem::Separator)
    //     .add_item(save)
    //     .add_native_item(MenuItem::Separator)
    //     .add_native_item(MenuItem::CloseWindow)
    // );
    
    let editmenu = Submenu::new("Edit", Menu::new()
        .add_native_item(MenuItem::Undo)
        .add_native_item(MenuItem::Redo)
        .add_native_item(MenuItem::Cut)
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
    );

let menu = Menu::new()
.add_submenu(appmenu)
// .add_submenu(filemenu)
.add_submenu(editmenu);

tauri::Builder::default()
.plugin(PluginBuilder::default().build())
.plugin(FsExtra::default())
.menu(menu)
.on_menu_event(|event| {
    match event.menu_item_id() {
        "quit" => {
            std::process::exit(0);
        }
        _ => {}
    }
})
.invoke_handler(tauri::generate_handler![
    init_dir, 
    write_file, 
    read_file
])
.run(tauri::generate_context!())
.expect("error while running tauri application");
}
