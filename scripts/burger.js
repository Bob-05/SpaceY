// ===== БУРГЕР-МЕНЮ =====

const burger = document.getElementById('burger');
const nav = document.querySelector('.header__nav');

// Открытие/закрытие меню
burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.header__nav .header__link').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Закрытие при клике вне меню (на затемнённую область)
document.addEventListener('click', (e) => {
    if (nav.classList.contains('active')) {
        const isClickInsideNav = nav.contains(e.target);
        const isClickOnBurger = burger.contains(e.target);
        if (!isClickInsideNav && !isClickOnBurger) {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
});