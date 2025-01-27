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
        { question: '¿Cuál es tu asignatura favorita?', video: 'src/VIDEO/3.mp4' },
        { question: '¿Cuántos estudiantes hay en tu clase?', video: 'src/VIDEO/3.mp4' },
        { question: '¿Qué actividades extracurriculares te gustan?', video: 'src/VIDEO/3.mp4' }
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
    const questionsContainer = document.getElementById('questions');
    questionsContainer.style.display = 'block';
    
    const selectedQuestions = questions[category] || [];
    const questionsList = selectedQuestions.map(q => `
        <li onclick="showVideo('${q.video}')">
            ${q.question}
        </li>
    `).join('');

    questionsContainer.innerHTML = `
        <h2>Preguntas sobre ${category}</h2>
        <ul>${questionsList}</ul>
        <button class="back-button" onclick="goBackToMenu()">Volver al Menú Principal</button>
    `;
}

function goBackToMenu() {
    // Mostrar el contenedor de imágenes
    document.querySelector('.container-fluid').style.display = 'flex';
    
    // Ocultar el contenedor de preguntas
    const questionsContainer = document.getElementById('questions');
    questionsContainer.style.display = 'none';
    
    // Ocultar el contenedor de video si está visible
    const videoContainer = document.getElementById('video-container');
    videoContainer.style.display = 'none';
    
    // Detener el video
    const videoFrame = document.getElementById('video-frame');
    videoFrame.src = '';
}

function showVideo(videoUrl) {
    // Ocultar el contenedor de preguntas
    document.getElementById('questions').style.display = 'none';
    
    // Mostrar el contenedor de video
    const videoContainer = document.getElementById('video-container');
    videoContainer.style.display = 'block';
    
    // Establecer la URL del video
    const videoFrame = document.getElementById('video-frame');
    videoFrame.src = videoUrl;
}

function exitVideo() {
    // Ocultar el contenedor de video
    const videoContainer = document.getElementById('video-container');
    videoContainer.style.display = 'none';
    
    // Detener el video
    const videoFrame = document.getElementById('video-frame');
    videoFrame.src = '';
    
    // Mostrar el contenedor de preguntas
    document.getElementById('questions').style.display = 'block';
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