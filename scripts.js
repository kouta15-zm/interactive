const boxes = document.querySelectorAll('.box');
const home = document.getElementById('home');
const questionsDiv = document.getElementById('questions');
const videoContainer = document.getElementById('video-container');
const videoFrame = document.getElementById('video-frame');

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
        `<li onclick="showVideo('${q.video}')">${q.question}</li>`
    ).join('');

    // Mostrar las preguntas en el contenedor
    questionsDiv.innerHTML = `
        <h2>Preguntas sobre ${category}</h2>
        <ul>${questionsList}</ul>
        <button class="back-button" onclick="goBackToMenu()">Volver al Menú Principal</button>
    `;
}

function goBackToMenu() {
    // Mostrar el contenedor de imágenes
    document.querySelector('.container-fluid').style.display = 'flex';
    
    // Ocultar el contenedor de preguntas
    questionsDiv.style.display = 'none';
    
    // Detener y ocultar el video si está reproduciéndose
    exitVideo();
}

function showVideo(videoUrl) {
    // Mostrar el contenedor de video
    videoContainer.style.display = 'block';
    
    // Establecer la URL del video
    videoFrame.src = videoUrl;
    
    // Reproducir el video automáticamente
    videoFrame.play();
    
    // Escuchar el evento de finalización del video
    videoFrame.addEventListener('ended', goBackToMenu);
    
    // Crear los botones de control
    const controlsHTML = `
        <div class="video-controls">
            <button class="back-button" onclick="exitVideo()">←</button>
            <button class="home-button" onclick="goBackToMenu()">🏠</button>
        </div>
    `;
    
    // Insertar los botones en el contenedor de video
    videoContainer.innerHTML = controlsHTML + `<iframe id="video-frame" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
    
    // Ajustar el video para que ocupe toda la amplitud de la página
    videoFrame.style.width = '100%';
    videoFrame.style.height = '100%';
}

function exitVideo() {
    // Ocultar el contenedor de video
    videoContainer.style.display = 'none';
    
    // Detener el video
    videoFrame.src = '';
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