// Lógica del submenú de controles
import { syncToSubmenu } from './socket-sync.js';

export function showSubmenu() {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) submenuControles.style.display = 'block';
    syncToSubmenu();
}

export function hideSubmenu() {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) submenuControles.style.display = 'none';
}

export function setupSubmenuHandlers(onSubmenuSelected) {
    const submenuControles = document.getElementById('submenu-controles');
    if (submenuControles) {
        submenuControles.addEventListener('click', (e) => {
            const btn = e.target.closest('.submenu-btn');
            if (btn) {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                onSubmenuSelected(index);
            }
        });
    }
} 