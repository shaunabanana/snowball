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

ipcMain.handle('get-packaged', () => app.isPackaged);

ipcMain.handle('check-open-project', () => {
    // Handle file opening. Need to be done before app is ready.
    if (app.isPackaged) {
        // workaround for missing executable argument)
        process.argv.unshift(null);
    }
    // Parameters are now an array containing any files/folders
    // that your OS will pass to your application
    const filesToOpen = process.argv.slice(2);
    console.log(filesToOpen);
    return filesToOpen;
});

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
