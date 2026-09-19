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
                <button class="gallery__nav gallery__nav--prev" data-dir="-1" aria-label="Предыдущее фото">‹</button>
                <button class="gallery__nav gallery__nav--next" data-dir="1" aria-label="Следующее фото">›</button>
            </div>
            <div class="gallery__thumbs">
                ${data.images.map((img, i) => `
                    <button class="gallery__thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                        <img src="${img}" alt="Миниатюра ${i + 1}">
                    </button>
                `).join('')}
            </div>
            <div class="gallery__dots">
                ${data.images.map((_, i) => `
                    <button class="gallery__dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Фото ${i + 1}"></button>
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

    // ===== ГАЛЕРЕЯ =====
    const galleryMain = document.getElementById('galleryMain');
    const thumbs = document.querySelectorAll('.gallery__thumb');
    const dots = document.querySelectorAll('.gallery__dot');
    const navButtons = document.querySelectorAll('.gallery__nav');
    let currentIndex = 0;
    const totalImages = data.images.length;

    function showImage(index) {
        if (index < 0) index = totalImages - 1;
        if (index >= totalImages) index = 0;

        currentIndex = index;

        galleryMain.style.opacity = '0';
        setTimeout(() => {
            galleryMain.src = data.images[currentIndex];
            galleryMain.style.opacity = '1';
        }, 150);

        thumbs.forEach(t => t.classList.remove('active'));
        if (thumbs[currentIndex]) thumbs[currentIndex].classList.add('active');

        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            showImage(parseInt(thumb.dataset.index));
        });
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            showImage(parseInt(dot.dataset.index));
        });
    });

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + parseInt(btn.dataset.dir));
        });
    });

    // Свайп
    let touchStartX = 0;
    let touchEndX = 0;

    galleryMain.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryMain.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                showImage(currentIndex + 1);
            } else {
                showImage(currentIndex - 1);
            }
        }
    }, { passive: true });

    // ===== ФОРМА =====
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