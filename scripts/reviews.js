// ===== ОТЗЫВЫ — данные из БД (GET/POST /api/reviews) =====

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.reviews__grid');
    if (!grid) return;

    const form = document.querySelector('.reviews__form form');
    const ratingInput = form ? form.querySelector('input[name="rating"]') : null;
    const starsEls = form ? form.querySelectorAll('.reviews__form-rating .star') : [];

    function stars(rating) {
        const r = Math.max(1, Math.min(5, Number(rating) || 5));
        return '★'.repeat(r) + '☆'.repeat(5 - r);
    }

    async function loadReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const items = await response.json();

            if (!items.length) {
                grid.innerHTML = '<div class="reviews__item"><div class="reviews__item-text">Отзывов пока нет. Будьте первым!</div></div>';
                return;
            }

            grid.innerHTML = items.map((item) => `
                <div class="reviews__item">
                    <div class="reviews__item-header">
                        <span class="reviews__item-name">${escapeHtml(item.author)}</span>
                        <span class="reviews__item-date">${escapeHtml(item.date)}</span>
                    </div>
                    <div class="reviews__item-rating">${stars(item.rating)}</div>
                    <div class="reviews__item-text">${escapeHtml(item.text)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            grid.innerHTML = '<div class="reviews__item"><div class="reviews__item-text">Не удалось загрузить отзывы из базы данных.</div></div>';
        }
    }

    // Выбор оценки звёздами
    starsEls.forEach((star) => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value, 10);
            if (ratingInput) ratingInput.value = value;
            starsEls.forEach((s) => {
                s.classList.toggle('active', parseInt(s.dataset.value, 10) <= value);
            });
        });
    });

    // Отправка нового отзыва
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const author = form.querySelector('#review-name').value.trim();
            const text = form.querySelector('#review-text').value.trim();
            const rating = ratingInput ? ratingInput.value : 5;

            if (!author || !text) {
                alert('Заполните имя и текст отзыва');
                return;
            }

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author, rating, text })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка отправки');

                form.reset();
                if (ratingInput) ratingInput.value = 5;
                starsEls.forEach((s) => s.classList.toggle('active', parseInt(s.dataset.value, 10) <= 5));
                loadReviews();
            } catch (error) {
                alert('Не удалось отправить отзыв: ' + error.message);
            }
        });
    }

    loadReviews();
});
