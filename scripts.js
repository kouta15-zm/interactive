const boxes = document.querySelectorAll('.box');
const home = document.getElementById('home');
const questionsDiv = document.getElementById('questions');

const questions = {
    casa: [
        { question: '¿Cuál es tu habitación favorita?', video: 'src/VIDEO/1.mp4' },
        { question: '¿Qué mejoras harías en tu casa?', video: 'src/VIDEO/1.mp4' },
        { question: '¿Prefieres un estilo moderno o clásico?', video: 'src/VIDEO/1.mp4' }
    ],
    construccion: [
        { question: '¿Qué tipo de edificio te interesa construir?', video: 'src/VIDEO/2.mp4' },
        { question: '¿Qué materiales prefieres usar?', video: 'src/VIDEO/2.mp4' },
        { question: '¿Cuál es tu presupuesto?', video: 'src/VIDEO/2.mp4' }
    ],
    escuela: [
        { question: '¿Cuál es tu materia favorita?', video: 'src/VIDEO/3.mp4' },
        { question: '¿Qué mejorarías en tu escuela?', video: 'src/VIDEO/3.mp4' },
        { question: '¿Prefieres clases presenciales o virtuales?', video: 'src/VIDEO/3.mp4' }
    ]
};

boxes.forEach(box => {
    box.addEventListener('click', () => {
        const category = box.dataset.category;
        showQuestions(category);
    });
});

function showQuestions(category) {
    // Ocultar el contenedor de imágenes
    document.querySelector('.container-fluid').style.display = 'none';
    
    // Mostrar el contenedor de preguntas
    questionsDiv.style.display = 'block';
    
    // Obtener las preguntas de la categoría seleccionada
    const selectedQuestions = questions[category] || [];
    
    // Crear la lista de preguntas con eventos para reproducir videos
    const questionsList = selectedQuestions.map((q, index) => 
        `<li><button class="question-btn" data-video="${q.video}">${q.question}</button></li>`
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
        }
    });
}

function goBackToMenu() {
    // Solo se usa para salidas manuales
    document.querySelector('.container-fluid').style.display = 'flex';
    const questionsSection = document.getElementById('questions');
    if (questionsSection) questionsSection.style.display = 'none';
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) videoContainer.style.display = 'none';
    const videoFrame = document.getElementById('video-frame');
    if (videoFrame) videoFrame.src = '';
}

let audioFadeInInterval = null;
let audioFadeOutInterval = null;
let videosBasePath = null;

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

    // Mostrar el botón de salir/volver al menú
    let exitBtn = document.getElementById('exit-video-btn');
    if (!exitBtn) {
        exitBtn = document.createElement('button');
        exitBtn.id = 'exit-video-btn';
        exitBtn.textContent = 'Volver al menú anterior';
        exitBtn.className = 'exit-button';
        exitBtn.style.position = 'absolute';
        exitBtn.style.top = '20px';
        exitBtn.style.right = '20px';
        exitBtn.style.zIndex = '3000';
        exitBtn.onclick = exitVideo;
        videoContainer.appendChild(exitBtn);
    } else {
        exitBtn.style.display = 'block';
    }
}

function exitVideo() {
    // Salir de pantalla completa si está activo
    exitFullScreen();
    // Oculta el video y vuelve al menú anterior
    hideVideoWithFade(false);
    // Oculta el botón de salir
    let exitBtn = document.getElementById('exit-video-btn');
    if (exitBtn) exitBtn.style.display = 'none';
}

function hideVideoWithFade(auto = false) {
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

// --- Eventos para subcategorías y preguntas ---
questionsContent.addEventListener('click', function(e) {
    if (e.target.classList.contains('subcategory-btn')) {
        showQuestionsOfSubcategory(e.target.dataset.subcat);
    }
    if (e.target.classList.contains('question-btn')) {
        showVideo(e.target.dataset.video);
    }
});

// --- Inicialización ---
window.addEventListener('DOMContentLoaded', async () => {
    await loadQuestionsData();
    backToMenuBtn.style.display = 'none';
    setVideosBasePath();
});

// --- CONTROLES PERSONALIZADOS DE VIDEO ---
(function(){
    const video = document.getElementById('video-frame');
    const controls = document.getElementById('custom-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const timeIndicator = document.getElementById('time-indicator');
    let controlsTimeout = null;

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
    function updateTimeIndicator() {
        const current = formatTime(video.currentTime);
        const total = formatTime(video.duration);
        timeIndicator.textContent = `${current} / ${total}`;
    }
    function showControls() {
        controls.style.display = 'flex';
        controls.style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(hideControls, 3000);
    }
    function hideControls() {
        controls.style.opacity = '0';
        setTimeout(()=>{ controls.style.display = 'none'; }, 300);
    }
    function togglePlayPause() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
    function updatePlayPauseIcon() {
        playPauseBtn.textContent = video.paused ? '▶️' : '⏸️';
    }
    function updateVolume() {
        video.volume = volumeSlider.value;
    }
    function updateProgress() {
        if (!isNaN(video.duration)) {
            progressBar.value = (video.currentTime / video.duration) * 100;
        }
        updateTimeIndicator();
    }
    function seek(e) {
        if (!isNaN(video.duration)) {
            video.currentTime = (progressBar.value / 100) * video.duration;
        }
    }
    // Mostrar controles al inicio
    video.addEventListener('play', showControls);
    // Mostrar controles al tocar/click en el video
    video.addEventListener('click', function(e) {
        showControls();
        // Solo pausar/reanudar si el click/touch es en el centro (30% central)
        const rect = video.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        if (Math.abs(x - centerX) < rect.width * 0.15 && Math.abs(y - centerY) < rect.height * 0.15) {
            togglePlayPause();
        }
    });
    video.addEventListener('touchstart', function(e) {
        showControls();
        // Solo pausar/reanudar si el touch es en el centro (30% central)
        const rect = video.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        if (Math.abs(x - centerX) < rect.width * 0.15 && Math.abs(y - centerY) < rect.height * 0.15) {
            togglePlayPause();
        }
    });
    // Ocultar controles si no hay interacción
    ['mousemove','touchmove'].forEach(evt => video.addEventListener(evt, showControls));
    // Play/Pause
    playPauseBtn.addEventListener('click', ()=>{ togglePlayPause(); showControls(); });
    video.addEventListener('play', updatePlayPauseIcon);
    video.addEventListener('pause', updatePlayPauseIcon);
    // Volumen
    volumeSlider.addEventListener('input', updateVolume);
    // Progreso
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateTimeIndicator);
    progressBar.addEventListener('input', seek);
    // Inicializar icono, volumen y tiempo
    updatePlayPauseIcon();
    updateVolume();
    updateTimeIndicator();
    // Ocultar controles al salir del video
    document.getElementById('exit-video-btn')?.addEventListener('click', hideControls);
})();