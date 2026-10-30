// ===== FAQ (АККОРДЕОН) — данные из БД через GET /api/faq =====

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
    const faqContainer = document.querySelector('.faq');
    if (!faqContainer) return;

    // ЗАГРУЗКА ВОПРОСОВ ИЗ БАЗЫ ДАННЫХ
    async function loadFaq() {
        try {
            const response = await fetch('/api/faq');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const items = await response.json();

            faqContainer.innerHTML = items.map((item) => `
                <div class="faq__item" data-id="faq-${item.id}">
                    <button class="faq__question" aria-expanded="false">
                        <span>${escapeHtml(item.question)}</span>
                        <span class="faq__icon">+</span>
                    </button>
                    <div class="faq__answer">
                        <p>${escapeHtml(item.answer)}</p>
                    </div>
                </div>
            `).join('');

            initAccordion();
        } catch (error) {
            console.error('Ошибка загрузки FAQ:', error);
            faqContainer.innerHTML = '<p style="color: var(--button-danger, #ff3b5c); padding: 12px; text-align:center;">Не удалось загрузить FAQ из базы данных.</p>';
        }
    }

    // ЛОГИКА АККОРДЕОНА
    function initAccordion() {
        const faqItems = document.querySelectorAll('.faq__item');

        faqItems.forEach((item) => {
            const question = item.querySelector('.faq__question');
            question.removeEventListener('click', handleClick);
            question.addEventListener('click', handleClick);
        });
    }

    function handleClick(e) {
        const question = e.currentTarget;
        const item = question.closest('.faq__item');
        const isActive = item.classList.contains('active');

        // Закрываем все остальные вопросы
        document.querySelectorAll('.faq__item').forEach((otherItem) => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            }
        });

        // Переключаем текущий вопрос
        item.classList.toggle('active');
        question.setAttribute('aria-expanded', !isActive);
    }

    loadFaq();
});