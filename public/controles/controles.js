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

// Estado de reproducción local para alternar play/pause
let isPlaying = false;

const playPauseBtn = document.getElementById('playPauseBtn');
if (playPauseBtn) {
    playPauseBtn.onclick = () => {
        if (isPlaying) {
            socket.emit('control', { action: 'pause' });
            playPauseBtn.textContent = '▶️';
        } else {
            socket.emit('control', { action: 'play' });
            playPauseBtn.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    };
}

document.getElementById('volumeControl').oninput = (e) => {
    socket.emit('control', { action: 'volume', value: e.target.value });
};

// Función para mostrar/ocultar y asignar acción al botón Volver SOLO en menú de preguntas
function showBackBtnInQuestions(show, onClick) {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.style.display = show ? 'inline-block' : 'none';
        backBtn.onclick = show && typeof onClick === 'function' ? onClick : null;
    }
}

// En menú principal y submenú de subcategorías: ocultar botón Volver
function showCategoryMenuControles() {
    const categoryMenuControles = document.getElementById('category-menu-controles');
    const submenuControles = document.getElementById('submenu-controles');
    const homeRow = document.getElementById('home-row');
    if (categoryMenuControles) categoryMenuControles.style.display = 'block';
    if (submenuControles) {
        submenuControles.style.display = 'none';
        submenuControles.innerHTML = '';
    }
    // Ocultar la barra de botones arriba en el menú principal
    if (homeRow) homeRow.style.display = 'none';
    showBackBtnInQuestions(false);
    // Emitir estado para sincronizar con el reproductor
    socket.emit('control', { action: 'backToMenu' });
    socket.emit('video-status', { playing: false });
}

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
      fetch('../../data.json')
        .then(res => res.json())
        .then(data => {
          subcategories = Object.keys(data[category] || {});
          if (submenuControles) {
            submenuControles.innerHTML = `<div class="submenu-row">${subcategories.map((sub, idx) => `<button class="submenu-btn" data-index="${idx}">${idx+1}</button>`).join('')}</div>`;
            submenuControles.style.display = 'block';
            const homeRow = document.getElementById('home-row');
            if (homeRow) homeRow.style.display = 'flex';
            // Ocultar botón Volver en submenú de subcategorías
            showBackBtnInQuestions(false);
          }
        });
      categoryMenuControles.style.display = 'none';
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
        videoFrame.currentTime = 0;
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

// Sincronizar el estado del botón con el estado real del video
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
        // Actualizar botón a play
        if (playPauseBtn) playPauseBtn.textContent = '▶️';
        isPlaying = false;
    } else if (data.playing === true) {
        document.querySelector('.main-controls').style.display = 'flex';
        document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
        if (videoControlsTitle) videoControlsTitle.style.display = 'block';
        // Ocultar submenú al reproducir video
        if (submenuControles) {
            submenuControles.style.display = 'none';
            submenuControles.dataset.forceHide = 'true';
        }
        // Actualizar botón a pause
        if (playPauseBtn) playPauseBtn.textContent = '⏸️';
        isPlaying = true;
    }
});

socket.emit('video-status', { playing: true });

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.main-controls').style.display = 'none';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'none';
    // Ocultar el botón homeBtn al inicio
    const homeRow = document.getElementById('home-row');
    if (homeRow) homeRow.style.display = 'none';
});

// --- Controles de video (unificado de reproductor-controles.js) ---
function showReproductorControles() {
    document.querySelector('.main-controls').style.display = 'flex';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'block';
    // Si hay lógica de sincronización adicional, agregar aquí
}

function hideReproductorControles() {
    document.querySelector('.main-controls').style.display = 'none';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'none';
}

socket.on('showQuestionsMenu', (data) => {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) {
        submenuControles.innerHTML = '';
        submenuControles.innerHTML = `
            <div style='height:32px;'></div>
            <div class="submenu-row" style="justify-content:center; margin-top:24px;">${
                data.questions.map((q, idx) =>
                    `<button class="question-btn" data-question-index="${idx}">${idx + 1}</button>`
                ).join('')
            }</div>
        `;
        submenuControles.style.display = 'block';
        showHomeBtn();
        // Mostrar botón Volver SOLO en menú de preguntas
        showBackBtnInQuestions(true, () => {
            if (typeof currentCategory !== 'undefined' && currentCategory) {
                fetch('../../data.json')
                    .then(res => res.json())
                    .then(data => {
                        const subcategories = Object.keys(data[currentCategory] || {});
                        submenuControles.innerHTML = `<div class='submenu-row'>${subcategories.map((sub, idx) => `<button class='submenu-btn' data-index='${idx}'>${idx+1}</button>`).join('')}</div>`;
                        submenuControles.style.display = 'block';
                        const homeRow = document.getElementById('home-row');
                        if (homeRow) homeRow.style.display = 'flex';
                        // Ocultar botón Volver en submenú de subcategorías
                        showBackBtnInQuestions(false);
                        submenuControles.querySelectorAll('.submenu-btn').forEach(btn => {
                            btn.onclick = () => {
                                const index = parseInt(btn.getAttribute('data-index'), 10);
                                const subcat = subcategories[index];
                                if (socket && socket.connected) {
                                    socket.emit('control', { action: 'selectSubmenu', category: currentCategory, subcat, index });
                                }
                            };
                        });
                        if (socket && socket.connected) {
                            socket.emit('control', { action: 'selectCategory', category: currentCategory });
                        }
                    });
            }
        });
        // Asignar eventos a los botones de preguntas
        submenuControles.querySelectorAll('.question-btn').forEach(qbtn => {
            qbtn.onclick = () => {
                const qIdx = parseInt(qbtn.getAttribute('data-question-index'), 10);
                const question = data.questions[qIdx];
                if (socket && socket.connected) {
                    socket.emit('control', {
                        action: 'selectQuestion',
                        category: data.category,
                        subcat: data.subcat,
                        questionIndex: qIdx,
                        question: question.question,
                        video: question.video
                    });
                }
                submenuControles.style.display = 'none';
                document.querySelector('.main-controls').style.display = 'flex';
                document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
                const videoControlsTitle = document.getElementById('video-controls-title');
                if (videoControlsTitle) videoControlsTitle.style.display = 'block';
                // Ocultar botón Volver durante la reproducción de video
                showBackBtnInQuestions(false);
            };
        });
    }
});

socket.on('control', (data) => {
    console.log('Recibido en reproductor:', data);
    if (data.action === 'selectQuestion' && data.video) {
        showVideo(data.video);
        // Resalta la pregunta si está visible
        const questionBtns = document.querySelectorAll('.question-btn');
        questionBtns.forEach((btn, idx) => {
            btn.classList.remove('highlighted-question');
            if (btn.dataset.video === data.video) {
                btn.classList.add('highlighted-question');
            }
        });
    }
});

function showVideo(videoUrl) {
    const finalPath = getVideoPath(videoUrl);
    console.log('Ruta final del video:', finalPath);
    // ... el resto igual ...
    videoFrame.src = finalPath;
    videoFrame.onended = () => {
        if (audioFadeInInterval) { clearInterval(audioFadeInInterval); audioFadeInInterval = null; }
        if (audioFadeOutInterval) { clearInterval(audioFadeOutInterval); audioFadeOutInterval = null; }
        // Solo ocultar si terminó naturalmente, no por stop
        if (!videoFrame.paused && videoFrame.currentTime === videoFrame.duration) {
            hideVideoWithFade(true);
        }
    };
    // ...
}

// Restaurar funcionalidad del botón homeBtn
const homeBtn = document.getElementById('homeBtn');
if (homeBtn) {
    homeBtn.onclick = showCategoryMenuControles;
}

// Mostrar el botón homeBtn solo en submenús
function showHomeBtn() {
    const homeRow = document.getElementById('home-row');
    if (homeRow) homeRow.style.display = 'flex';
}