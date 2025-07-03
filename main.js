const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let controlsWindow = null;
let configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const secondaryDisplay = displays.length > 1 ? displays.find(d => d.id !== primaryDisplay.id) : primaryDisplay;

  // Ventana del reproductor en el monitor principal
  mainWindow = new BrowserWindow({
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.htm');

  // Ventana de controles en el segundo monitor (o en el mismo si solo hay uno)
  openControlsWindow(secondaryDisplay);
}

function openControlsWindow(display) {
  if (controlsWindow && !controlsWindow.isDestroyed()) {
    controlsWindow.focus();
    return;
  }
  // Si no se pasa display, usar el principal
  const targetDisplay = display || screen.getPrimaryDisplay();
  controlsWindow = new BrowserWindow({
    x: targetDisplay.bounds.x + 50,
    y: targetDisplay.bounds.y + 50,
    width: 600,
    height: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  controlsWindow.loadFile(path.join(__dirname, 'public/controles/controles.html'));
  controlsWindow.on('closed', () => {
    controlsWindow = null;
  });
}

function closeControlsWindow() {
  if (controlsWindow && !controlsWindow.isDestroyed()) {
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
  // Siempre abrir en el segundo monitor si existe
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const secondaryDisplay = displays.length > 1 ? displays.find(d => d.id !== primaryDisplay.id) : primaryDisplay;
  openControlsWindow(secondaryDisplay);
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