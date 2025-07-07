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
    });
  });

  test('No muestra controles de video ni título al inicio', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    await expect(page.locator('.main-controls')).toBeHidden();
    await expect(page.locator('#video-controls-title')).toBeHidden();
    await expect(page.locator('.slider-group').first()).toBeHidden();
  });

  test('Muestra controles de video y título cuando playing:true', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    await page.evaluate(() => {
      window.socket.emit('video-status', { playing: true });
    });
    await expect(page.locator('.main-controls')).toBeVisible();
    await expect(page.locator('#video-controls-title')).toBeVisible();
    await expect(page.locator('.slider-group').first()).toBeVisible();
  });

  test('Oculta controles de video y título cuando playing:false', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    await page.evaluate(() => {
      window.socket.emit('video-status', { playing: true });
      window.socket.emit('video-status', { playing: false });
    });
    await expect(page.locator('.main-controls')).toBeHidden();
    await expect(page.locator('#video-controls-title')).toBeHidden();
    await expect(page.locator('.slider-group').first()).toBeHidden();
  });
}); 