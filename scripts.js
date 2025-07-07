const home = document.getElementById('home');
const questionsDiv = document.getElementById('questions');

// Variable global para resaltar la pregunta seleccionada
let lastHighlightedQuestion = null;

function showQuestions(category, index) {
    // Ocultar el contenedor de imágenes
    document.querySelector('.container-fluid').style.display = 'none';
    
    // Mostrar el contenedor de preguntas
    questionsDiv.style.display = 'block';
    
    // Obtener las preguntas de la categoría seleccionada
    const selectedQuestions = questionsData[category] || [];
    
    // Crear la lista de preguntas con eventos para reproducir videos y numeración
    const questionsList = selectedQuestions.map((q, idx) => 
        `<li><button class="question-btn" data-video="${q.video}" data-idx="${idx}"><span class='question-number'>${idx+1}</span> ${q.question}</button></li>`
    ).join('');

    // Mostrar las preguntas en el contenedor
    questionsDiv.innerHTML = `
        <h2>Preguntas sobre ${category}</h2>
        <ul>${questionsList}</ul>
        <button class="back-button" onclick="goBackToMenu()">Volver al Menú Principal</button>
    `;

    questionsDiv.addEventListener('click', function(e) {
        if (e.target.classList.contains('question-btn')) {
            showVideo(e.target.dataset.video);
            highlightQuestionButton(e.target);
        }
    });

    // Emitir estado playing:false a controles (en submenú)
    if (socket) socket.emit('video-status', { playing: false });

    // Si se pasa un índice, simular el click en la pregunta correspondiente y resaltar
    if (typeof index === 'number' && selectedQuestions[index]) {
        const btns = questionsDiv.querySelectorAll('.question-btn');
        if (btns[index]) {
            highlightQuestionButton(btns[index]);
            showVideo(selectedQuestions[index].video);
        }
    }
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
    // Emitir estado playing:false a controles
    if (socket) socket.emit('video-status', { playing: false });
}

let audioFadeInInterval = null;
let audioFadeOutInterval = null;
let videosBasePath = null;
let controlsOpened = false;

async function setVideosBasePath() {
  if (window.electronAPI) {
    videosBasePath = await window.electronAPI.getVideosFolder();
  }
}

function getVideoPath(relativePath) {
  if (videosBasePath && relativePath.startsWith('VIDEOS/')) {
    // Quitar 'VIDEOS/' y unir con la ruta base
    return videosBasePath + '/' + relativePath.substring(7);
  }
  return relativePath;
}

function showVideo(videoUrl) {
    if (!controlsOpened && window.electronAPI && window.electronAPI.openControlsWindow) {
        window.electronAPI.openControlsWindow();
        controlsOpened = true;
    }
    // Mostrar controles de video solo cuando se reproduce un video
    const customControls = document.getElementById('custom-controls');
    if (customControls) customControls.style.display = 'flex';
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    const videoOverlay = document.getElementById('video-overlay');

    // Restaurar el display y la opacidad del video por si fue ocultado
    videoFrame.style.display = 'block';
    videoFrame.style.opacity = '1';
    videoContainer.style.opacity = '1';
    videoOverlay.classList.remove('overlay-in', 'overlay-out');

    // Limpiar intervalos previos
    if (audioFadeInInterval) { clearInterval(audioFadeInInterval); audioFadeInInterval = null; }
    if (audioFadeOutInterval) { clearInterval(audioFadeOutInterval); audioFadeOutInterval = null; }

    // Quitar animaciones previas
    videoContainer.classList.remove('fade-in', 'fade-out');
    videoOverlay.style.background = 'rgba(0,0,0,0)';

    videoContainer.style.display = 'block';
    videoFrame.pause();
    videoFrame.currentTime = 0;
    videoFrame.src = getVideoPath(videoUrl);

    // Pantalla completa al iniciar
    videoFrame.onplay = () => {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
    };

    videoFrame.onloadeddata = () => {
        // Fade in de audio
        videoFrame.volume = 0.5;
        videoFrame.play();
        let fadeInStep = 0;
        const fadeInSteps = 15; // 1.5 segundos (15 pasos de 100ms)
        audioFadeInInterval = setInterval(() => {
            fadeInStep++;
            videoFrame.volume = Math.min(0.5 + (fadeInStep / fadeInSteps) * 0.5, 1);
            if (fadeInStep >= fadeInSteps) {
                clearInterval(audioFadeInInterval);
                audioFadeInInterval = null;
            }
        }, 100);
    };

    // Fade out de audio en los últimos 3 segundos
    videoFrame.ontimeupdate = () => {
        if (!audioFadeOutInterval && videoFrame.duration && videoFrame.currentTime > 0 && (videoFrame.duration - videoFrame.currentTime <= 3)) {
            let fadeOutStep = 0;
            audioFadeOutInterval = setInterval(() => {
                fadeOutStep++;
                videoFrame.volume = Math.max(1 - (fadeOutStep / 30), 0); // 30 pasos en 3 segundos
                if (fadeOutStep >= 30) {
                    clearInterval(audioFadeOutInterval);
                    audioFadeOutInterval = null;
                }
            }, 100);
        }
    };

    // Al terminar el video, aplicar fade out visual y luego volver al menú
    videoFrame.onended = () => {
        if (audioFadeInInterval) { clearInterval(audioFadeInInterval); audioFadeInInterval = null; }
        if (audioFadeOutInterval) { clearInterval(audioFadeOutInterval); audioFadeOutInterval = null; }
        hideVideoWithFade(true); // true = automático por finalización
    };

    // Emitir estado playing:true a controles
    if (socket) socket.emit('video-status', { playing: true });
}

function hideVideoWithFade(auto = false) {
    if (window.electronAPI && window.electronAPI.closeControlsWindow) {
        window.electronAPI.closeControlsWindow();
    }
    // Restaurar controles locales al salir del video
    const customControls = document.getElementById('custom-controls');
    if (customControls) customControls.style.display = '';
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    const videoOverlay = document.getElementById('video-overlay');
    // Ocultar la sección de preguntas antes del fade out visual
    const questionsSection = document.getElementById('questions');
    if (questionsSection) questionsSection.style.display = 'none';
    videoContainer.classList.remove('fade-in');
    void videoContainer.offsetWidth;
    // Cambiar color del overlay para el parpadeo
    videoOverlay.style.background = 'rgb(24, 26, 27)';
    videoOverlay.classList.remove('overlay-out');
    videoOverlay.classList.add('overlay-in');
    // Esperar a que el overlay esté completamente negro (0.2s)
    setTimeout(() => {
        // Ahora ocultamos visualmente el video y el contenedor (opacity: 0)
        videoFrame.pause();
        videoFrame.src = '';
        videoFrame.style.opacity = '0';
        videoContainer.style.opacity = '0';
        // Salir de pantalla completa si está activo
        exitFullScreen();
        // Siempre mostrar el menú principal al salir del video
        document.querySelector('.container-fluid').style.display = 'flex';
        // Retraso para ocultar el overlay después de mostrar el menú
        setTimeout(() => {
            videoOverlay.classList.remove('overlay-in');
            videoOverlay.classList.add('overlay-out');
            // Restaurar el color transparente del overlay
            videoOverlay.style.background = 'rgba(0,0,0,0)';
            // Ahora sí, ocultamos el video y el contenedor
            videoFrame.style.display = 'none';
            videoContainer.style.display = 'none';
            videoFrame.style.opacity = '1';
            videoContainer.style.opacity = '1';
        }, 10);
    }, 10);
}

function enterFullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Variables globales y carga dinámica de datos ---
let questionsData = {};
let currentCategory = null;
let currentSubcategory = null;

const categoryMenu = document.getElementById('category-menu');
const questionsSection = document.getElementById('questions');
const questionsContent = document.getElementById('questions-content');
const backToMenuBtn = document.getElementById('back-to-menu');

// --- Cargar preguntas y videos desde data.json ---
async function loadQuestionsData() {
    try {
        const response = await fetch('data.json');
        questionsData = await response.json();
    } catch (e) {
        questionsData = {};
        alert('No se pudo cargar el contenido interactivo.');
    }
}

// --- Mostrar subcategorías de una categoría ---
function showSubcategories(category) {
    currentCategory = category;
    currentSubcategory = null;
    categoryMenu.style.display = 'none';
    questionsSection.style.display = 'block';
    backToMenuBtn.style.display = 'block';
    renderSubcategories(category);
    // Emitir estado playing:false a controles (en subcategoría)
    if (socket) socket.emit('video-status', { playing: false });
}

function renderSubcategories(category) {
    const subcats = Object.keys(questionsData[category] || {});
    if (subcats.length === 0) {
        questionsContent.innerHTML = '<p>No hay subcategorías disponibles.</p>';
        return;
    }
    questionsContent.innerHTML = `
        <h2>Preguntas sobre la ${capitalize(category)}</h2>
        <ul class="list-unstyled">
            ${subcats.map(sub => `<li><button class="subcategory-btn" data-subcat="${sub}" tabindex="0">${capitalize(sub)}</button></li>`).join('')}
        </ul>
    `;
}

function showQuestionsOfSubcategory(subcat) {
    currentSubcategory = subcat;
    renderQuestions(currentCategory, subcat);
}

function renderQuestions(category, subcat) {
    const selected = (questionsData[category] && questionsData[category][subcat]) || [];
    if (selected.length === 0) {
        questionsContent.innerHTML = '<p>No hay preguntas disponibles.</p>';
        return;
    }
    questionsContent.innerHTML = `
        <h2>${capitalize(subcat)} de la ${capitalize(category)}</h2>
        <ul class="list-unstyled">
            ${selected.map((q, i) => `<li><button class="question-btn" data-video="${q.video}" tabindex="0">${q.question}</button></li>`).join('')}
        </ul>
        <button class="back-button mt-3" id="back-to-submenu">Volver a Subcategorías</button>
    `;
    document.getElementById('back-to-submenu').onclick = () => renderSubcategories(currentCategory);
}

// --- Eventos para subcategorías y preguntas ---
questionsContent.addEventListener('click', function(e) {
    if (e.target.classList.contains('subcategory-btn')) {
        showQuestionsOfSubcategory(e.target.dataset.subcat);
    }
    if (e.target.classList.contains('question-btn')) {
        showVideo(e.target.dataset.video);
        highlightQuestionButton(e.target);
    }
});

// --- Inicialización ---
window.addEventListener('DOMContentLoaded', async () => {
    await loadQuestionsData();
    backToMenuBtn.style.display = 'none';
    setVideosBasePath();
});

// --- SOCKET.IO CONTROL REMOTO ---
let socket = null;
if (typeof io !== 'undefined') {
  socket = io('http://localhost:3000');
}

if (socket) {
  const videoFrame = document.getElementById('video-frame');
  // Actualizar barra de progreso y tiempo en controles
  videoFrame.addEventListener('timeupdate', () => {
    socket.emit('video-status', {
      current: videoFrame.currentTime,
      total: videoFrame.duration || 0
    });
  });
  videoFrame.addEventListener('loadedmetadata', () => {
    socket.emit('video-status', {
      current: videoFrame.currentTime,
      total: videoFrame.duration || 0
    });
  });
  socket.on('reproductor', (data) => {
    console.log('Comando recibido en reproductor:', data);
    if (!videoFrame) return;
    if (data.action === 'play') {
      videoFrame.play();
    }
    if (data.action === 'pause') {
      videoFrame.pause();
    }
    if (data.action === 'stop') {
      videoFrame.pause();
      videoFrame.currentTime = 0;
    }
    if (data.action === 'next') {
      videoFrame.src = 'VIDEOS/betel/betel historia -1.mp4';
      videoFrame.play();
    }
    if (data.action === 'volume') {
      videoFrame.volume = parseFloat(data.value);
    }
    if (data.action === 'seek') {
      if (videoFrame.duration) {
        videoFrame.currentTime = (parseFloat(data.value) / 100) * videoFrame.duration;
      }
    }
    if (data.action === 'backToMenu') {
      goBackToMenu();
    }
    if (data.action === 'selectCategory' && data.category) {
      showSubcategories(data.category);
    }
    if (data.action === 'selectSubmenu' && data.category && typeof data.index === 'number') {
      showQuestions(data.category, data.index);
    }
  });
}

// Función para resaltar la pregunta seleccionada
function highlightQuestionButton(btn) {
    if (lastHighlightedQuestion) {
        lastHighlightedQuestion.classList.remove('highlighted-question');
    }
    btn.classList.add('highlighted-question');
    lastHighlightedQuestion = btn;
}