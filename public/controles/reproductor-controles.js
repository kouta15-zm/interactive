// Lógica de controles de video
import { syncToReproductor } from './funciones/socket-sync.js';

export function showReproductorControles() {
    document.querySelector('.main-controls').style.display = 'flex';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'flex');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'block';
    syncToReproductor();
}

export function hideReproductorControles() {
    document.querySelector('.main-controls').style.display = 'none';
    document.querySelectorAll('.slider-group').forEach(el => el.style.display = 'none');
    const videoControlsTitle = document.getElementById('video-controls-title');
    if (videoControlsTitle) videoControlsTitle.style.display = 'none';
} 