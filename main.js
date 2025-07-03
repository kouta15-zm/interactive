const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.htm');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC para seleccionar carpeta de videos
ipcMain.handle('select-videos-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    saveConfig({ videosPath: result.filePaths[0] });
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-videos-folder', async () => {
  let config = loadConfig();
  if (config && config.videosPath && fs.existsSync(config.videosPath)) {
    return config.videosPath;
  }
  // Por defecto, carpeta VIDEOS al lado del ejecutable
  const defaultPath = path.join(path.dirname(app.getPath('exe')), 'VIDEOS');
  if (fs.existsSync(defaultPath)) {
    saveConfig({ videosPath: defaultPath });
    return defaultPath;
  }
  return null;
});

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data));
}
function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath));
  }
  return null;
} 