// Lógica para mostrar preguntas y seleccionar video en index.htm
export function showPreguntas(preguntas, onPreguntaSelected) {
    const questionsContent = document.getElementById('questions-content');
    if (!questionsContent) return;
    questionsContent.innerHTML = preguntas.map((q, i) =>
        `<li><button class="question-btn" data-video="${q.video}" tabindex="0">${q.question}</button></li>`
    ).join('');
    questionsContent.style.display = 'block';
    questionsContent.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('question-btn')) {
            onPreguntaSelected(e.target.dataset.video, i);
            questionsContent.removeEventListener('click', handler);
        }
    });
}

export function hidePreguntas() {
    const questionsContent = document.getElementById('questions-content');
    if (questionsContent) questionsContent.style.display = 'none';
} 