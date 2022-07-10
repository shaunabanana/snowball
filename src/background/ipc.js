// eslint-disable-next-line import/no-extraneous-dependencies
import {
    app, ipcMain, BrowserWindow, dialog, shell,
} from 'electron';

ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
});

ipcMain.on('open-link', (event, link) => {
    shell.openExternal(link);
});

ipcMain.on('show-file', (event, file) => {
    shell.showItemInFolder(file);
});

ipcMain.handle('get-version', () => app.getVersion());

ipcMain.handle('new-project', () => {
    const projectPath = dialog.showSaveDialogSync({
        filters: [{ name: 'Snowball Project', extensions: ['snowball'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
    });
    return projectPath;
});

ipcMain.handle('open-project', () => {
    const projectPath = dialog.showOpenDialogSync({
        filters: [{ name: 'Snowball Project', extensions: ['snowball'] }],
        properties: ['openDirectory', 'openFile'],
    });
    return projectPath;
});

ipcMain.handle('export', (event, format) => {
    const filePath = dialog.showSaveDialogSync({
        filters: [{ name: 'Export file', extensions: [format] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
    });
    return filePath;
});
