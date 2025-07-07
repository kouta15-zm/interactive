const { test, expect } = require('@playwright/test');

// Ruta local a controles.html (ajustar si es necesario)
const CONTROLES_URL = 'file://' + require('path').resolve(__dirname, './controles.html');

test.describe('Flujo de visibilidad de controles de video', () => {
  test('No muestra controles de video ni título al inicio', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    await expect(page.locator('.main-controls')).toBeHidden();
    await expect(page.locator('#video-controls-title')).toBeHidden();
    await expect(page.locator('.slider-group').first()).toBeHidden();
  });

  test('Muestra controles de video y título cuando playing:true', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    // Simular recepción de evento playing:true
    await page.evaluate(() => {
      window.dispatchEvent(new Event('DOMContentLoaded'));
      window.socket.emit('video-status', { playing: true });
    });
    await expect(page.locator('.main-controls')).toBeVisible();
    await expect(page.locator('#video-controls-title')).toBeVisible();
    await expect(page.locator('.slider-group').first()).toBeVisible();
  });

  test('Oculta controles de video y título cuando playing:false', async ({ page }) => {
    await page.goto(CONTROLES_URL);
    // Simular recepción de evento playing:true y luego playing:false
    await page.evaluate(() => {
      window.dispatchEvent(new Event('DOMContentLoaded'));
      window.socket.emit('video-status', { playing: true });
      window.socket.emit('video-status', { playing: false });
    });
    await expect(page.locator('.main-controls')).toBeHidden();
    await expect(page.locator('#video-controls-title')).toBeHidden();
    await expect(page.locator('.slider-group').first()).toBeHidden();
  });
}); 