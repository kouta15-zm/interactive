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

  // Usar el tamaño completo del área de trabajo de la pantalla secundaria
  const { x, y, width, height } = secondaryDisplay.workArea;

  controlsWindow = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
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
  controlsWindow.maximize();
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
    // Solo abrir la ventana del reproductor al recibir comandos de reproducción
    if (data.action === 'play' || data.action === 'seek' || data.action === 'volume' || data.action === 'next') {
      createReproductorWindow();
    }
    // Si se recibe el comando de stop, cerrar la ventana del reproductor
    if (data.action === 'stop') {
      closeReproductorWindow();
    }
  });
}

app.whenReady().then(() => {
  createControlsWindow();
  createReproductorWindow();
  setupSocketListener();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createControlsWindow();
      createReproductorWindow();
    }
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

// --- Menú principal ---
function showMenuPrincipal() {
    const categoryMenu = document.getElementById('category-menu');
    const questionsSection = document.getElementById('questions');
    if (categoryMenu) categoryMenu.style.display = 'flex';
    if (questionsSection) questionsSection.style.display = 'none';
}

function setupMenuPrincipalHandlers(onCategorySelected) {
    const categoryMenu = document.getElementById('category-menu');
    if (categoryMenu) {
        categoryMenu.addEventListener('click', (e) => {
            const box = e.target.closest('.imagebox');
            if (box) {
                const category = box.querySelector('a').getAttribute('onclick').match(/showSubcategories\('(.+?)'\)/)[1];
                onCategorySelected(category);
            }
        });
    }
}

// --- Submenú ---
function showSubmenu(subcats, onSubcatSelected) {
    const questionsContent = document.getElementById('questions-content');
    if (!questionsContent) return;
    questionsContent.innerHTML = `
        <ul class="list-unstyled">
            ${subcats.map(sub => `<li><button class="subcategory-btn" data-subcat="${sub}" tabindex="0">${sub.charAt(0).toUpperCase() + sub.slice(1)}</button></li>`).join('')}
        </ul>
    `;
    questionsContent.style.display = 'block';
    questionsContent.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('subcategory-btn')) {
            onSubcatSelected(e.target.dataset.subcat);
            questionsContent.removeEventListener('click', handler);
        }
    });
}
function hideSubmenu() {
    const questionsContent = document.getElementById('questions-content');
    if (questionsContent) questionsContent.style.display = 'none';
}

// --- Preguntas ---
function showPreguntas(preguntas, onPreguntaSelected) {
    const questionsContent = document.getElementById('questions-content');
    if (!questionsContent) return;
    questionsContent.innerHTML = preguntas.map((q, i) =>
        `<li><button class="question-btn" data-video="${q.video}" tabindex="0">${q.question}</button></li>`
    ).join('');
    questionsContent.style.display = 'block';
    questionsContent.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('question-btn')) {
            onPreguntaSelected(e.target.dataset.video, i);
            questionsContent.removeEventListener('click', handler);
        }
    });
}
function hidePreguntas() {
    const questionsContent = document.getElementById('questions-content');
    if (questionsContent) questionsContent.style.display = 'none';
}

// --- Reproductor de video ---
function showVideo(videoUrl) {
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    if (!videoContainer || !videoFrame) return;
    videoContainer.style.display = 'block';
    videoFrame.src = videoUrl;
    videoFrame.play();
}
function hideVideo() {
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    if (videoContainer) videoContainer.style.display = 'none';
    if (videoFrame) {
        videoFrame.pause();
        videoFrame.src = '';
    }
} 