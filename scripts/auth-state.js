// ===== СОСТОЯНИЕ АВТОРИЗАЦИИ В ШАПКЕ =====
// Если у пользователя есть JWT (localStorage 'spacey_token') — вместо
// кнопки «Вход» показывается его имя и кнопка «Выйти».
// Если токена нет — остаётся обычная кнопка «Вход», ведущая на auth.html.

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('spacey_token');
    if (!token) return; // не авторизован — ничего не меняем

    // Имя пользователя из сохранённых данных (или «Профиль»)
    let userName = 'Профиль';
    try {
        const user = JSON.parse(localStorage.getItem('spacey_user') || 'null');
        if (user && (user.first_name || user.last_name)) {
            userName = user.last_name + ' ' + user.first_name;
        }
    } catch (e) { /* игнорируем */ }

    // Главная страница: из pages/*.html ведём на ../index.html, иначе на index.html
    const inPages = location.pathname.indexOf('/pages/') !== -1;
    const homeHref = inPages ? '../index.html' : 'index.html';

    document.querySelectorAll('.header__auth').forEach((el) => {
        const isLink = el.tagName.toLowerCase() === 'a';
        if (isLink) el.setAttribute('href', '#');
        el.classList.add('header__auth--active');
        el.title = 'Выйти из профиля';
        el.innerHTML = '👤 ' + escapeHtml(userName) + ' · Выйти';
        el.style.cursor = 'pointer';

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.removeItem('spacey_token');
            localStorage.removeItem('spacey_user');
            window.location.href = homeHref;
        });
    });
});

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}
