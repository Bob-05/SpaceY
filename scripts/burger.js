// ===== БУРГЕР-МЕНЮ =====

document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const nav = document.querySelector('.header__nav');

    if (!burger || !nav) return;

    // Сохраняем позицию скролла при блокировке
    let savedScrollY = 0;

    function lockScroll() {
        savedScrollY = window.scrollY || window.pageYOffset;
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
        // Возвращаем позицию скролла
        window.scrollTo(0, savedScrollY);
    }

    function closeMenu() {
        burger.classList.remove('active');
        nav.classList.remove('active');
        unlockScroll();
    }

    function openMenu() {
        burger.classList.add('active');
        nav.classList.add('active');
        lockScroll();
    }

    // При загрузке страницы — сбрасываем «залипшее» состояние
    if (document.body.classList.contains('no-scroll')) {
        unlockScroll();
    }
    closeMenu();

    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.contains('active') ? closeMenu() : openMenu();
    });

    nav.querySelectorAll('.header__link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('active')) return;
        if (!nav.contains(e.target) && !burger.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            closeMenu();
        }
    });
});