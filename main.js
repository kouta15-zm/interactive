const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const io = require('socket.io-client');

let mainWindow = null;
let controlsWindow = null;
let configPath = path.join(app.getPath('userData'), 'config.json');
let socket = null;

function createControlsWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const secondaryDisplay = displays.length > 1 ? displays.find(d => d.id !== primaryDisplay.id) : primaryDisplay;

  controlsWindow = new BrowserWindow({
    x: secondaryDisplay.bounds.x + 50,
    y: secondaryDisplay.bounds.y + 50,
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  controlsWindow.loadFile(path.join(__dirname, 'public/controles/controles.html'));
  controlsWindow.on('closed', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
    controlsWindow = null;
  });
}

function createReproductorWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }
  const primaryDisplay = screen.getPrimaryDisplay();
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
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (controlsWindow && !controlsWindow.isDestroyed()) {
      controlsWindow.close();
    }
  });
}

function closeReproductorWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
    mainWindow = null;
  }
}

function setupSocketListener() {
  socket = io('http://localhost:3000');
  socket.on('reproductor', (data) => {
    // Si se recibe un comando de reproducir video, abrir la ventana del reproductor
    if (data.action === 'play' || data.action === 'selectCategory' || data.action === 'selectSubmenu' || data.action === 'seek' || data.action === 'volume' || data.action === 'next') {
      createReproductorWindow();
    }
    // Si se recibe el comando de volver al menú, cerrar la ventana del reproductor
    if (data.action === 'backToMenu' || data.action === 'stop') {
      closeReproductorWindow();
    }
  });
}

app.whenReady().then(() => {
  createControlsWindow();
  setupSocketListener();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createControlsWindow();
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