// ===== ВХОД / РЕГИСТРАЦИЯ (практическая работа №10) =====
// Обращение к API: POST /register, POST /login

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.auth__tab');
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginResult = document.getElementById('loginResult');
    const registerResult = document.getElementById('registerResult');
    const tokenBox = document.getElementById('jwtToken');
    const tokenWrap = document.getElementById('tokenWrap');

    // Переключение вкладок «Вход / Регистрация»
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            if (loginPanel) loginPanel.classList.toggle('hidden', target !== 'login');
            if (registerPanel) registerPanel.classList.toggle('hidden', target !== 'register');
            if (loginResult) loginResult.classList.add('auth__result--hidden');
            if (registerResult) registerResult.classList.add('auth__result--hidden');
        });
    });

    // Ссылки «Нет аккаунта? Зарегистрироваться» / «Уже есть аккаунт? Войти»
    document.querySelectorAll('[data-switch]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.switch;
            tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === target));
            if (loginPanel) loginPanel.classList.toggle('hidden', target !== 'login');
            if (registerPanel) registerPanel.classList.toggle('hidden', target !== 'register');
            if (loginResult) loginResult.classList.add('auth__result--hidden');
            if (registerResult) registerResult.classList.add('auth__result--hidden');
        });
    });

    function showMessage(el, text, type) {
        if (!el) return;
        el.textContent = text;
        el.classList.remove('auth__result--hidden');
        el.classList.toggle('auth__result--ok', type === 'ok');
        el.classList.toggle('auth__result--error', type === 'error');
    }

    // ---------- РЕГИСТРАЦИЯ ----------
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(registerResult, '', '');

            const payload = {
                last_name: registerForm.querySelector('#reg-last-name').value.trim(),
                first_name: registerForm.querySelector('#reg-first-name').value.trim(),
                middle_name: registerForm.querySelector('#reg-middle-name').value.trim(),
                phone: registerForm.querySelector('#reg-phone').value.replace(/\D/g, '').slice(0, 11),
                email: registerForm.querySelector('#reg-email').value.trim(),
                password: registerForm.querySelector('#reg-password').value
            };
            const password2 = registerForm.querySelector('#reg-password2').value;

            // Проверка данных при регистрации (дополнительное задание)
            if (!payload.first_name || !payload.last_name || !payload.email || !payload.password) {
                showMessage(registerResult, 'Заполните все обязательные поля', 'error');
                return;
            }
            if (payload.password.length < 6) {
                showMessage(registerResult, 'Пароль должен быть не короче 6 символов', 'error');
                return;
            }
            if (payload.password !== password2) {
                showMessage(registerResult, 'Пароли не совпадают', 'error');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка регистрации');

                showMessage(registerResult, '✅ ' + result.message, 'ok');
                registerForm.reset();
            } catch (error) {
                showMessage(registerResult, '❌ ' + error.message, 'error');
            }
        });
    }

    // ---------- АВТОРИЗАЦИЯ ----------
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(loginResult, '', '');

            const payload = {
                email: loginForm.querySelector('#login-email').value.trim(),
                password: loginForm.querySelector('#login-password').value
            };

            if (!payload.email || !payload.password) {
                showMessage(loginResult, 'Заполните все поля', 'error');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка авторизации');

                // Токен JWT и данные пользователя сохраняем в localStorage
                localStorage.setItem('spacey_token', result.token || '');
                localStorage.setItem('spacey_user', JSON.stringify(result.user || {}));

                showMessage(loginResult, '✅ ' + result.message, 'ok');

                if (tokenWrap) tokenWrap.classList.remove('hidden');
                if (tokenBox) tokenBox.textContent = result.token || '';

                // Демонстрация использования JWT: защищённый маршрут GET /profile
                // (токен передаётся в заголовке Authorization: Bearer <token>)
                try {
                    const profileRes = await fetch('/profile', {
                        headers: { 'Authorization': 'Bearer ' + result.token }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        const profileData = document.getElementById('profileData');
                        const profileWrap = document.getElementById('profileWrap');
                        if (profileData) {
                            profileData.textContent =
                                (profile.last_name || '') + ' ' +
                                (profile.first_name || '') + ' — ' +
                                (profile.email || '');
                        }
                        if (profileWrap) profileWrap.classList.remove('hidden');
                    }
                } catch (e) { /* информационный блок — ошибки не критичны */ }

                setTimeout(() => { window.location.href = 'index.html'; }, 2500);
            } catch (error) {
                showMessage(loginResult, '❌ ' + error.message, 'error');
            }
        });
    }
});
