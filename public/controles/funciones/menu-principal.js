// Lógica del menú principal de categorías
import { syncToMenuPrincipal } from './socket-sync.js';

export function showMenuPrincipal() {
    const categoryMenuControles = document.getElementById('category-menu-controles');
    const submenuControles = document.getElementById('submenu-controles');
    if (categoryMenuControles) categoryMenuControles.style.display = 'block';
    if (submenuControles) submenuControles.style.display = 'none';
    syncToMenuPrincipal();
}

export function setupMenuPrincipalHandlers(onCategorySelected) {
    const categoryMenuControles = document.getElementById('category-menu-controles');
    if (categoryMenuControles) {
        categoryMenuControles.addEventListener('click', (e) => {
            const box = e.target.closest('.imagebox-controles');
            if (box) {
                const category = box.getAttribute('data-category');
                onCategorySelected(category);
            }
        });
    }
} 