const { test, expect } = require('@playwright/test');

// Ruta local a controles.html (ajustar si es necesario)
const CONTROLES_URL = 'file://' + require('path').resolve(__dirname, './public/controles/controles.html');

test.describe('Flujo de visibilidad de controles de video', () => {
  test.beforeEach(async ({ page }) => {
    // Mockear window.io y window.socket ANTES de que cargue cualquier script
    await page.addInitScript(() => {
      // Mock de socket
      const mockSocket = {
        on: () => {},
        emit: (event, data) => {
          if (event === 'video-status') {
            const evt = new CustomEvent('mock-video-status', { detail: data });
            window.dispatchEvent(evt);
          }
        }
      };
      // Mock de window.io para que io() devuelva nuestro mock
      window.io = () => mockSocket;
      window.socket = mockSocket;

      // Lógica de visibilidad centralizada
      window.addEventListener('mock-video-status', (e) => {
        const videoControlsTitle = document.getElementById('video-controls-title');
        if (e.detail.playing === false) {
          document.querySelector('.main-controls').style.display = 'none';
          document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
          if (videoControlsTitle) videoControlsTitle.style.display = 'none';
        } else if (e.detail.playing === true) {
          document.querySelector('.main-controls').style.display = 'flex';
          document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
          if (videoControlsTitle) videoControlsTitle.style.display = 'block';
        }
      });

      if (socket) {
        socket.on('reproductor', (data) => {
          if (data.action === 'selectSubmenu' && data.category && data.subcat) {
            showQuestions(data.category, data.subcat); // Esto asegura que siempre se emite showQuestionsMenu
          }
          // ...otros eventos...
        });
      }

      socket.on('showQuestionsMenu', (data) => {
        const submenuControles = document.getElementById('submenu-controles');
        if (submenuControles) {
          submenuControles.innerHTML = ''; // Limpiar antes de renderizar
          submenuControles.innerHTML = `<div class="submenu-row">${
            data.questions.map((q, idx) =>
              `<button class="question-btn" data-question-index="${idx}">${q.question}</button>`
            ).join('')
          }</div>`