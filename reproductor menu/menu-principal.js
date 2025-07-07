// Lógica del menú principal de categorías para index.htm
export function showMenuPrincipal() {
    const categoryMenu = document.getElementById('category-menu');
    const questionsSection = document.getElementById('questions');
    if (categoryMenu) categoryMenu.style.display = 'flex';
    if (questionsSection) questionsSection.style.display = 'none';
}

export function setupMenuPrincipalHandlers(onCategorySelected) {
    const categoryMenu = document.getElementById('category-menu');
    if (categoryMenu) {
        categoryMenu.addEventListener('click', (e) => {
            const box = e.target.closest('.imagebox');
            if (box) {
                const category = box.querySelector('a').getAttribute('onclick').match(/showSubcategories\('(.+?)'\)/)[1];
                onCategorySelected(category);
            }
        });
    }
} 