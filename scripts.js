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
    const questionsContainer = document.getElementById('questions');
    questionsContainer.style.display = 'block';
    
    // Aquí puedes agregar lógica para cargar las preguntas correspondientes a la categoría
    const questions = {
        casa: [
            "¿Cuál es tu habitación favorita?",
            "¿Cuántas personas viven en tu casa?",
            "¿Tienes jardín en tu casa?"
        ],
        construccion: [
            "¿Qué materiales se usan en la construcción?",
            "¿Cuál es el edificio más alto que conoces?",
            "¿Qué herramientas se necesitan para construir una casa?"
        ],
        escuela: [
            "¿Cuál es tu asignatura favorita?",
            "¿Cuántos estudiantes hay en tu clase?",
            "¿Qué actividades extracurriculares te gustan?"
        ]
    };

    const selectedQuestions = questions[category] || [];
    const questionsList = selectedQuestions.map(question => `<li>${question}</li>`).join('');

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
}

function showVideo(videoUrl) {
    videoContainer.style.display = 'block';
    videoFrame.src = `${videoUrl}?controls=0`; // Add controls=0 to hide controls
    enterFullScreen(videoContainer); // Request full screen for the video container
}

function exitVideo() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        exitFullScreen();
    }
    videoContainer.style.display = 'none';
    videoFrame.src = ''; // Stop the video
    questionsDiv.style.display = 'flex';
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