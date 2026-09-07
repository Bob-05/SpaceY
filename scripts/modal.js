// МОДАЛЬНОЕ ОКНО

const modal = document.getElementById('cardModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');

function openModal(cardId) {
    const data = cardData[cardId];
    if (!data) return;

    modalBody.innerHTML = `
        <h2 class="modal__title">${data.title}</h2>
        <p class="modal__price">${data.price}</p>
        <p class="modal__duration">⏱ ${data.duration}</p>
        <p class="modal__description">${data.description}</p>
        
        <div class="modal__includes">
            <h4>Включено:</h4>
            <ul>
                ${data.includes.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>

        <form class="modal__form" id="bookingForm">
            <div class="modal__form-group">
                <label for="modal-name">Ваше имя</label>
                <input type="text" id="modal-name" placeholder="Иван Петров" required>
            </div>
            <div class="modal__form-group">
                <label for="modal-phone">Номер телефона</label>
                <input type="tel" id="modal-phone" placeholder="+7 (999) 123-45-67" required>
            </div>
            <button type="submit" class="modal__book-btn">Забронировать</button>
        </form>
    `;

    // Заглушка: просто показываем alert
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('✅ Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
            closeModal();
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие по крестику
modalClose.addEventListener('click', closeModal);

// Закрытие по клику на фон
modalOverlay.addEventListener('click', closeModal);

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Открытие по кнопкам "ДЕТАЛИ →"
document.querySelectorAll('[data-modal]').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const cardId = button.dataset.modal;
        openModal(cardId);
    });
});