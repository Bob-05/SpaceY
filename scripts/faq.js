// АККОРДЕОН (FAQ) — рендеринг из данных

document.addEventListener('DOMContentLoaded', () => {
    const faqContainer = document.querySelector('.faq');
    if (!faqContainer) return;

    // ОТРИСОВКА ИЗ ДАННЫХ 
    function renderFaq() {
        faqContainer.innerHTML = faqData.map(item => `
            <div class="faq__item" data-id="${item.id}">
                <button class="faq__question" aria-expanded="false">
                    <span>${item.question}</span>
                    <span class="faq__icon">+</span>
                </button>
                <div class="faq__answer">
                    <p>${item.answer}</p>
                </div>
            </div>
        `).join('');

        // Инициализируем обработчики после отрисовки
        initAccordion();
    }

    // ЛОГИКА АККОРДЕОНА
    function initAccordion() {
        const faqItems = document.querySelectorAll('.faq__item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq__question');

            // Удаляем старые обработчики, чтобы не было дублирования
            question.removeEventListener('click', handleClick);
            question.addEventListener('click', handleClick);
        });
    }

    function handleClick(e) {
        const question = e.currentTarget;
        const item = question.closest('.faq__item');
        const isActive = item.classList.contains('active');

        // Закрываем все остальные вопросы
        document.querySelectorAll('.faq__item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            }
        });

        // Переключаем текущий вопрос
        item.classList.toggle('active');
        question.setAttribute('aria-expanded', !isActive);
    }

    // ЗАГРУЗКА С ДАННЫМИ ИЗ БД (заглушка для будущего)
    // В будущем здесь можно заменить на fetch('/api/faq')
    // fetch('/api/faq')
    //     .then(res => res.json())
    //     .then(data => {
    //         // Если пришли данные из БД, обновляем faqData и перерисовываем
    //         // faqData = data;
    //         // renderFaq();
    //     })
    //     .catch(err => console.error('Ошибка загрузки FAQ:', err));

    // Стартуем
    renderFaq();
});