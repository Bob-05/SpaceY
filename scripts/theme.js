// ===== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (упрощённая версия) =====

console.log('✅ theme.js загружен'); // Проверяем, что скрипт вообще загрузился

// Ждём, пока страница загрузится
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM загружен, ищем кнопку...');
    
    const themeToggle = document.getElementById('themeToggle');

    // Проверяем, найдена ли кнопка
    if (!themeToggle) {
        console.error('❌ Кнопка #themeToggle не найдена! Проверьте HTML.');
        return;
    } else {
        console.log('✅ Кнопка найдена!', themeToggle);
    }

    const themeIcon = themeToggle.querySelector('.theme-toggle__icon');
    console.log('✅ Иконка найдена?', themeIcon);

    // Загружаем сохранённую тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    console.log('💾 Сохранённая тема:', savedTheme);

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        console.log('☀️ Светлая тема применена');
    }

    // Обработчик клика
    themeToggle.addEventListener('click', function() {
        console.log('🖱️ Клик по кнопке!');
        document.body.classList.toggle('light-theme');

        if (document.body.classList.contains('light-theme')) {
            if (themeIcon) themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
            console.log('🌞 Включена светлая тема');
        } else {
            if (themeIcon) themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
            console.log('🌚 Включена тёмная тема');
        }
    });
});