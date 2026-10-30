// ===== СТРАНИЦА БИЛЕТОВ: маршруты из БД (GET /api/trips) =====

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
    const form = document.querySelector('.tickets__form');
    if (!form) return;

    const submitBtn = form.querySelector('.tickets__submit-btn');
    // "$3.5M / место" -> "$3.5M"
    const shortPrice = (label) => String(label).split(' ')[0];

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const trips = await response.json();

        trips.forEach((trip, index) => {
            const card = document.createElement('div');
            card.className = 'tickets__route-card';
            card.innerHTML = `
                <input type="radio" name="route" id="route-${escapeHtml(trip.slug)}" value="${escapeHtml(trip.slug)}" ${index === 0 ? 'checked' : ''}>
                <label for="route-${escapeHtml(trip.slug)}" class="tickets__route-label">
                    <span class="tickets__route-icon">${trip.icon}</span>
                    <span class="tickets__route-info">
                        <span class="tickets__route-name">${escapeHtml(trip.title)}</span>
                        <span class="tickets__route-desc">${escapeHtml(trip.description)}</span>
                    </span>
                    <span class="tickets__route-price">${escapeHtml(shortPrice(trip.priceLabel))}</span>
                </label>
            `;
            form.insertBefore(card, submitBtn);
        });
    } catch (error) {
        console.error('Ошибка загрузки маршрутов:', error);
        const err = document.createElement('p');
        err.style.cssText = 'color: var(--button-danger, #ff3b5c); padding: 12px; text-align: center;';
        err.textContent = 'Не удалось загрузить маршруты из базы данных.';
        form.insertBefore(err, submitBtn);
    }
});
