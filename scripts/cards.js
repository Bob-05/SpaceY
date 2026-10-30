// ===== ОТРИСОВКА КАРТОЧЕК МАРШРУТОВ ИЗ БАЗЫ ДАННЫХ =====
// Данные подгружаются через GET /api/trips (Express + MySQL).

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const trips = await response.json();

        // Кэш для модального окна (scripts/modal.js)
        window.__tripData = {};
        trips.forEach((t) => { window.__tripData[t.slug] = t; });

        grid.innerHTML = trips.map((t) => `
            <div class="card">
                <div class="card__badge">${escapeHtml(t.badge)}</div>
                <div class="card__image">${t.icon}</div>
                <h3 class="card__title">${escapeHtml(t.title)}</h3>
                <p class="card__description">${escapeHtml(t.description)}</p>
                <div class="card__footer">
                    <span class="card__price">${escapeHtml(t.priceLabel)}</span>
                    <a href="#" class="card__link" data-modal="${escapeHtml(t.slug)}">ДЕТАЛИ →</a>
                </div>
            </div>
        `).join('');

        // Перепривязываем кнопки «Детали» к модальному окну
        if (typeof window.initModalButtons === 'function') {
            window.initModalButtons();
        }
    } catch (error) {
        console.error('Ошибка загрузки маршрутов:', error);
        grid.innerHTML = '<p class="cards-error">Не удалось загрузить маршруты из базы данных.<br>Убедитесь, что сервер запущен (<b>node app.js</b>) и сайт открыт через <b>http://localhost:3000</b>.</p>';
    }
});
