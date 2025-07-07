// Lógica del submenú para index.htm
export function showSubmenu(subcats, onSubcatSelected) {
    const questionsContent = document.getElementById('questions-content');
    if (!questionsContent) return;
    questionsContent.innerHTML = `
        <ul class="list-unstyled">
            ${subcats.map(sub => `<li><button class="subcategory-btn" data-subcat="${sub}" tabindex="0">${sub.charAt(0).toUpperCase() + sub.slice(1)}</button></li>`).join('')}
        </ul>
    `;
    questionsContent.style.display = 'block';
    questionsContent.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('subcategory-btn')) {
            onSubcatSelected(e.target.dataset.subcat);
            questionsContent.removeEventListener('click', handler);
        }
    });
}

export function hideSubmenu() {
    const questionsContent = document.getElementById('questions-content');
    if (questionsContent) questionsContent.style.display = 'none';
} 