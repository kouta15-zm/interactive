// Lógica para mostrar preguntas y seleccionar video
import { syncToPregunta } from './socket-sync.js';

export function showPreguntas(preguntas, onPreguntaSelected) {
    const preguntasDiv = document.getElementById('preguntas-controles');
    if (!preguntasDiv) return;
    preguntasDiv.innerHTML = preguntas.map((q, i) =>
        `<li><button class="pregunta-btn" data-video="${q.video}" data-idx="${i}">${q.question}</button></li>`
    ).join('');
    preguntasDiv.style.display = 'block';
    syncToPregunta();
    preguntasDiv.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('pregunta-btn')) {
            onPreguntaSelected(e.target.dataset.video, parseInt(e.target.dataset.idx, 10));
            preguntasDiv.removeEventListener('click', handler);
        }
    });
}

export function hidePreguntas() {
    const preguntasDiv = document.getElementById('preguntas-controles');
    if (preguntasDiv) preguntasDiv.style.display = 'none';
} 