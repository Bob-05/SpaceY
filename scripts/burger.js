// ===== БУРГЕР-МЕНЮ =====

document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const nav = document.querySelector('.header__nav');

    if (!burger || !nav) return;

    // Закрытие меню (универсальная функция)
    function closeMenu() {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Открытие/закрытие меню
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Закрытие меню при клике на ссылку
    nav.querySelectorAll('.header__link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Закрытие при клике вне меню (на затемнённую область)
    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('active')) return;

        const isClickInsideNav = nav.contains(e.target);
        const isClickOnBurger = burger.contains(e.target);

        if (!isClickInsideNav && !isClickOnBurger) {
            closeMenu();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });
});