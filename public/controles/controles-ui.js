// Funciones de UI para controles

export function showMenuPrincipal() {
    const categoryMenuControles = document.getElementById('category-menu-controles');
    const submenuControles = document.getElementById('submenu-controles');
    if (categoryMenuControles) categoryMenuControles.style.display = 'block';
    if (submenuControles) submenuControles.style.display = 'none';
}

export function showSubmenu() {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) submenuControles.style.display = 'block';
}

export function hideSubmenu() {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) submenuControles.style.display = 'none';
}

export function showPreguntas(preguntas, onPreguntaSelected) {
    const preguntasDiv = document.getElementById('preguntas-controles');
    if (!preguntasDiv) return;
    preguntasDiv.innerHTML = preguntas.map((q, i) =>
        `<li><button class="pregunta-btn" data-video="${q.video}" data-idx="${i}">${q.question}</button></li>`
    ).join('');
    preguntasDiv.style.display = 'block';
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