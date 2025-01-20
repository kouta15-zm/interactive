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
    home.style.display = 'none';
    questionsDiv.style.display = 'flex';

    questionsDiv.innerHTML = questions[category].map(q => `
        <button class="question" data-video="${q.video}">${q.question}</button>
    `).join('');

    questionsDiv.innerHTML += '<button class="back-button" onclick="goBackToMenu()">Volver al Menú Principal</button>';

    document.querySelectorAll('.question').forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('highlight');
            showVideo(question.dataset.video);
        });
    });
}

function goBackToMenu() {
    questionsDiv.style.display = 'none';
    home.style.display = 'flex';
    videoContainer.style.display = 'none';
    videoFrame.src = ''; // Stop the video
}

function showVideo(videoUrl) {
    videoContainer.style.display = 'block';
    videoFrame.src = `${videoUrl}?controls=0`; // Add controls=0 to hide controls
    enterFullScreen(videoContainer);
}

function exitVideo() {
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