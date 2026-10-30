// ===== МОДАЛЬНОЕ ОКНО (данные карточек — из БД) =====

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
        window.scrollTo(0, savedScrollY);
    }

    // ===== ДАННЫЕ КАРТОЧКИ: кэш (cards.js) или запрос к API =====
    async function getTripData(cardId) {
        if (window.__tripData && window.__tripData[cardId]) {
            return window.__tripData[cardId];
        }
        const response = await fetch('/api/trips/' + encodeURIComponent(cardId));
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return await response.json();
    }

    // ===== ОТКРЫТИЕ =====
    async function openModal(cardId) {
        let data;
        try {
            data = await getTripData(cardId);
        } catch (error) {
            console.warn('Не удалось загрузить маршрут:', error.message);
            return;
        }

        const galleryHtml = (data.images && data.images.length)
            ? `
            <div class="gallery">
                <div class="gallery__main">
                    <img src="${escapeHtml(data.images[0])}" alt="${escapeHtml(data.title)}" class="gallery__main-image" id="galleryMain">
                    <button class="gallery__nav gallery__nav--prev" data-dir="-1" aria-label="Предыдущее фото">‹</button>
                    <button class="gallery__nav gallery__nav--next" data-dir="1" aria-label="Следующее фото">›</button>
                </div>
                <div class="gallery__thumbs">
                    ${data.images.map((img, i) => `
                        <button class="gallery__thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                            <img src="${escapeHtml(img)}" alt="Миниатюра ${i + 1}">
                        </button>
                    `).join('')}
                </div>
                <div class="gallery__dots">
                    ${data.images.map((_, i) => `
                        <button class="gallery__dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Фото ${i + 1}"></button>
                    `).join('')}
                </div>
            </div>`
            : '';

        modalBody.innerHTML = `
            <h2 class="modal__title">${data.icon ? data.icon + ' ' : ''}${escapeHtml(data.title)}</h2>
            <p class="modal__price">${escapeHtml(data.priceLabel)}</p>
            <p class="modal__duration">⏱ ${escapeHtml(data.durationLabel)}</p>
            <p class="modal__description">${escapeHtml(data.description)}</p>

            ${galleryHtml}

            <div class="modal__includes">
                <h4>Включено:</h4>
                <ul>
                    ${data.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
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
        if (galleryMain) {
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
        }

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

    // ===== ПРИВЯЗКА КНОПОК [data-modal] =====
    function handleCardClick(e) {
        e.preventDefault();
        openModal(this.dataset.modal);
    }

    // Публичная функция для повторной привязки кнопок (нужна cards.js)
    window.initModalButtons = function () {
        document.querySelectorAll('[data-modal]').forEach((button) => {
            button.removeEventListener('click', handleCardClick);
            button.addEventListener('click', handleCardClick);
        });
    };

    // ===== ОБРАБОТЧИКИ =====
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    window.initModalButtons();

    // ===== СБРОС «ЗАЛИПШЕГО» СОСТОЯНИЯ ПРИ ЗАГРУЗКЕ =====
    if (document.body.classList.contains('no-scroll')) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.classList.remove('no-scroll');
    }
});