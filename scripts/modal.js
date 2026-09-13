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

        <!-- ГАЛЕРЕЯ -->
        <div class="gallery">
            <div class="gallery__main">
                <img src="${data.images[0]}" alt="${data.title}" class="gallery__main-image" id="galleryMain">
            </div>
            <div class="gallery__thumbs">
                ${data.images.map((img, i) => `
                    <button class="gallery__thumb ${i === 0 ? 'active' : ''}" data-image="${img}">
                        <img src="${img}" alt="Миниатюра ${i + 1}">
                    </button>
                `).join('')}
            </div>
        </div>

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

    // ЛОГИКА ГАЛЕРЕИ
    const galleryMain = document.getElementById('galleryMain');
    const thumbs = document.querySelectorAll('.gallery__thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            galleryMain.style.opacity = '0';
            setTimeout(() => {
                galleryMain.src = thumb.dataset.image;
                galleryMain.style.opacity = '1';
            }, 150);

            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // ОТПРАВКА ФОРМЫ (заглушка)
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

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

document.querySelectorAll('[data-modal]').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const cardId = button.dataset.modal;
        openModal(cardId);
    });
});