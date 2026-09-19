// ===== МОДАЛЬНОЕ ОКНО =====

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cardModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    // Если модалки нет на странице — выходим
    if (!modal || !modalBody) return;

    // ===== БЛОКИРОВКА СКРОЛЛА (мгновенная) =====
    let savedScrollY = 0;

    function lockScroll() {
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.classList.add('no-scroll');
    }

    function unlockScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.classList.remove('no-scroll');
        // Возвращаем пользователя на то же место
        window.scrollTo(0, savedScrollY);
    }

    // ===== ОТКРЫТИЕ =====
    function openModal(cardId) {
        // Проверяем, что данные карточек загружены
        if (typeof cardData === 'undefined') {
            console.warn('⚠️ cardData не найден. Проверьте подключение scripts/data.js');
            return;
        }

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
        galleryMain.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryMain.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                showImage(currentIndex + (diff > 0 ? 1 : -1));
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

        // ===== ПОКАЗЫВАЕМ МОДАЛКУ + БЛОКИРУЕМ СКРОЛЛ =====
        modal.classList.add('active');
        lockScroll();
    }

    // ===== ЗАКРЫТИЕ =====
    function closeModal() {
        modal.classList.remove('active');
        unlockScroll();
    }

    // ===== ОБРАБОТЧИКИ =====
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Кнопки с data-modal
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(button.dataset.modal);
        });
    });

    // ===== СБРОС «ЗАЛИПШЕГО» СОСТОЯНИЯ ПРИ ЗАГРУЗКЕ =====
    // Если пользователь обновил страницу, когда было открыто модальное окно,
    // body мог остаться с position: fixed и top: -XXXpx
    if (document.body.classList.contains('no-scroll')) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.classList.remove('no-scroll');
    }
});