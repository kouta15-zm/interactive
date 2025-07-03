const { app, BrowserWindow, ipcMain, dialog, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let controlsWindow = null;
let configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.htm');
}

function openControlsWindow() {
  shell.openExternal('http://localhost:3000/controles/controles.html');
}

function closeControlsWindow() {
  if (controlsWindow) {
    controlsWindow.close();
    controlsWindow = null;
  }
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

// IPC para abrir/cerrar ventana de controles
ipcMain.on('open-controls-window', () => {
  openControlsWindow();
});
ipcMain.on('close-controls-window', () => {
  closeControlsWindow();
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