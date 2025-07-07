const socket = io('http://localhost:3000');

// --- NUEVO: sincronización de progreso y tiempo ---
const progressControl = document.getElementById('progressControl');
const timeIndicator = document.getElementById('timeIndicator');

// Recibir actualizaciones de tiempo desde el reproductor
socket.on('video-status', ({ current, total }) => {
    progressControl.value = total > 0 ? (current / total) * 100 : 0;
    timeIndicator.textContent = `${formatTime(current)} / ${formatTime(total)}`;
});

progressControl.oninput = (e) => {
    socket.emit('control', { action: 'seek', value: e.target.value });
};

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
// --- FIN NUEVO ---

document.getElementById('playBtn').onclick = () => {
    socket.emit('control', { action: 'play' });
};

document.getElementById('pauseBtn').onclick = () => {
    socket.emit('control', { action: 'pause' });
};

document.getElementById('stopBtn').onclick = () => {
    socket.emit('control', { action: 'stop' });
};

document.getElementById('nextBtn').onclick = () => {
    socket.emit('control', { action: 'next' });
};

document.getElementById('volumeControl').oninput = (e) => {
    socket.emit('control', { action: 'volume', value: e.target.value });
};

// Mostrar menú principal de categorías solo cuando corresponde
function showCategoryMenuControles() {
    const categoryMenuControles = document.getElementById('category-menu-controles');
    const submenuControles = document.getElementById('submenu-controles');
    if (categoryMenuControles) categoryMenuControles.style.display = 'block';
    if (submenuControles) submenuControles.style.display = 'none';
    // Emitir estado para sincronizar con el reproductor
    socket.emit('control', { action: 'backToMenu' });
    socket.emit('video-status', { playing: false });
}

// Modificar el homeBtn para usar la función
const homeBtn = document.getElementById('homeBtn');
homeBtn.onclick = showCategoryMenuControles;

// Manejar clic en las cajas del menú principal de controles
const categoryMenuControles = document.getElementById('category-menu-controles');
const submenuControles = document.getElementById('submenu-controles');
let currentCategory = null;
let subcategories = [];
if (categoryMenuControles) {
  categoryMenuControles.addEventListener('click', (e) => {
    const box = e.target.closest('.imagebox-controles');
    if (box) {
      const category = box.getAttribute('data-category');
      currentCategory = category;
      // Cargar subcategorías dinámicamente desde data.json
      fetch('../../data.json')
        .then(res => res.json())
        .then(data => {
          subcategories = Object.keys(data[category] || {});
          // Actualizar los botones del submenú con los números
          if (submenuControles) {
            submenuControles.innerHTML = `<div class="submenu-row">${subcategories.map((sub, idx) => `<button class="submenu-btn" data-index="${idx}">${idx+1}</button>`).join('')}</div>`;
            submenuControles.style.display = 'block';
          }
        });
      // Ocultar menú de cajas
      categoryMenuControles.style.display = 'none';
      // Emitir selección de categoría
      socket.emit('control', { action: 'selectCategory', category });
    }
  });
}
// Manejar clic en los botones del submenú
if (submenuControles) {
  submenuControles.addEventListener('click', (e) => {
    const btn = e.target.closest('.submenu-btn');
    if (btn && currentCategory) {
      const index = parseInt(btn.getAttribute('data-index'), 10);
      const subcat = subcategories[index];
      // Resaltar el botón seleccionado
      submenuControles.querySelectorAll('.submenu-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // Asegurar conexión socket antes de emitir
      if (socket && socket.connected) {
        socket.emit('control', { action: 'selectSubmenu', category: currentCategory, subcat, index });
      } else {
        // Intentar reconectar si está desconectado
        if (socket && typeof socket.connect === 'function') socket.connect();
        setTimeout(() => {
          if (socket && socket.connected) {
            socket.emit('control', { action: 'selectSubmenu', category: currentCategory, subcat, index });
          }
        }, 300);
      }
    }
  });
}

function goBackToMenu() {
    // Salir de pantalla completa si está activo
    exitFullScreen();
    // Mostrar menú principal
    document.querySelector('.container-fluid').style.display = 'flex';
    // Ocultar preguntas y video
    const questionsSection = document.getElementById('questions');
    if (questionsSection) questionsSection.style.display = 'none';
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) videoContainer.style.display = 'none';
    const videoFrame = document.getElementById('video-frame');
    if (videoFrame) {
        videoFrame.pause();
        videoFrame.src = '';
        videoFrame.style.display = 'none';
    }
    // Ocultar controles de video personalizados
    const customControls = document.getElementById('custom-controls');
    if (customControls) customControls.style.display = 'none';
    // Quitar overlays si existen
    const videoOverlay = document.getElementById('video-overlay');
    if (videoOverlay) {
        videoOverlay.classList.remove('overlay-in', 'overlay-out');
        videoOverlay.style.background = 'rgba(0,0,0,0)';
    }
}

socket.on('video-status', (data) => {
    const videoControlsTitle = document.getElementById('video-controls-title');
    const submenuControles = document.getElementById('submenu-controles');
    if (data.playing === false) {
        document.querySelector('.main-controls').style.display = 'none';
        document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
        if (videoControlsTitle) videoControlsTitle.style.display = 'none';
        // Mostrar submenú solo si corresponde (no video)
        if (submenuControles && submenuControles.dataset.forceHide !== 'true') {
            submenuControles.style.display = 'block';
        }
    } else if (data.playing === true) {
        document.querySelector('.main-controls').style.display = 'flex';
        document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
        if (videoControlsTitle) videoControlsTitle.style.display = 'block';
        // Ocultar submenú al reproducir video
        if (submenuControles) {
            submenuControles.style.display = 'none';
            submenuControles.dataset.forceHide = 'true';
        }
    }
});

socket.emit('video-status', { playing: true });

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.main-controls').style.display = 'none';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'none';
});