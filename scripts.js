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

    // Asegurarse de que los botones de "Volver" y "Menú Principal" estén visibles y habilitados
    const backButton = document.querySelector('.back-button');
    const homeButton = document.querySelector('.home-button');
    
    backButton.style.display = 'block'; // Mostrar el botón "Volver"
    homeButton.style.display = 'block'; // Mostrar el botón "Menú Principal"

    backButton.disabled = false; // Asegurarse de que no estén deshabilitados
    homeButton.disabled = false; // Asegurarse de que no estén deshabilitados
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

        // Asegurarse de que los botones de "Volver" y "Menú Principal" sigan visibles
            const backButton = document.querySelector('.back-button');
            const homeButton = document.querySelector('.home-button');

        // Asegurarse de eliminar cualquier listener anterior y añadir uno nuevo
        videoFrame.removeEventListener('ended', exitVideo); // Eliminar cualquier evento anterior
        videoFrame.addEventListener('ended', exitVideo); // Agregar evento para cuando el video termine

        // Reproducir el video inmediatamente después de cargarlo
        videoFrame.play();

        // Usar setTimeout para asegurar que el navegador permita pantalla completa
        setTimeout(() => {
            enterFullScreen(videoFrame); // Activar pantalla completa para el video
        }, 100);  // 100ms de retraso, suficiente para que el video comience a reproducirse  

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
    
        // Asegurarse de eliminar cualquier listener anterior y añadir uno nuevo
        videoFrame.removeEventListener('ended', exitVideo); // Eliminar cualquier evento anterior
        videoFrame.addEventListener('ended', exitVideo); // Agregar evento para cuando el video termine
    
        // Reproducir el video inmediatamente después de cargarlo
        videoFrame.play();
    
        // No es necesario poner el video en pantalla completa, ya que usa todo el espacio de la ventana
    }

    
    function exitVideo() {
        // Ocultar el contenedor de video
        const videoContainer = document.getElementById('video-container');
        videoContainer.style.display = 'none';
        
        // Detener el video
        const videoFrame = document.getElementById('video-frame');
        videoFrame.src = '';
    
        // Mostrar el contenedor de preguntas
        const questionsContainer = document.getElementById('questions');
        questionsContainer.style.display = 'block';
    
        // Asegurarse de que los botones de "Volver" y "Menú Principal" sigan visibles
        const backButton = document.querySelector('.back-button');
        const homeButton = document.querySelector('.home-button');
        
        // Reestablecer el estado de los botones
        backButton.style.display = 'block'; // Asegurarse de que el botón "Volver" esté visible
        homeButton.style.display = 'block'; // Asegurarse de que el botón "Menú Principal" esté visible
    
        // Asegurarse de que los botones no estén bloqueados
        backButton.disabled = false; // Asegúrese de que no estén deshabilitados
        homeButton.disabled = false; // Asegúrese de que no estén deshabilitados
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
    // Ocultar el contenedor de video
    const videoContainer = document.getElementById('video-container');
    videoContainer.style.display = 'none';
    
    // Detener el video
    const videoFrame = document.getElementById('video-frame');
    videoFrame.src = '';

    // Mostrar el contenedor de preguntas
    const questionsContainer = document.getElementById('questions');
    questionsContainer.style.display = 'block';

    // Asegurarse de que los botones de "Volver" y "Menú Principal" sigan visibles
    const backButton = document.querySelector('.back-button');
    const homeButton = document.querySelector('.home-button');
    
    backButton.style.display = 'block'; // Asegurarse de que el botón "Volver" esté visible
    homeButton.style.display = 'block'; // Asegurarse de que el botón "Menú Principal" esté visible
}