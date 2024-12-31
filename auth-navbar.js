document.addEventListener("DOMContentLoaded", function () {
    // Функция для проверки авторизации
    function checkAuthStatus() {
        // Проверяем наличие токена в cookies
        const token = getCookie('access_token');
        if (!token) {
            // Если токен отсутствует, сразу возвращаем
            toggleAuthElements(false);
            return;
        }

        // Если токен есть, отправляем запрос
        fetch('http://localhost:3000/user/me', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // Отправляем токен в заголовках
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Ошибка авторизации');
                }
            })
            .then(data => {
                // Если авторизован, показываем имя пользователя и кнопку "Выйти"
                toggleAuthElements(true, data.username);
            })
            .catch(error => {
                // Если авторизация не удалась, показываем ссылку "Войти / Регистрация"
                toggleAuthElements(false);
            });
    }

    // Функция для отображения/скрытия элементов навбара
    function toggleAuthElements(isLoggedIn, username = '') {
        const authNavItem = document.getElementById('authNavItem');
        const userNavItem = document.getElementById('userNavItem');
        const logoutNavItem = document.getElementById('logoutNavItem');
        const usernameElem = document.getElementById('username');

        if (isLoggedIn) {
            // Скрываем ссылку "Войти / Регистрация"
            authNavItem.classList.add('d-none');
            // Показываем имя пользователя
            usernameElem.textContent = username;
            userNavItem.classList.remove('d-none');
            // Показываем кнопку "Выйти"
            logoutNavItem.classList.remove('d-none');
        } else {
            // Показываем ссылку "Войти / Регистрация"
            authNavItem.classList.remove('d-none');
            // Скрываем имя пользователя и кнопку "Выйти"
            userNavItem.classList.add('d-none');
            logoutNavItem.classList.add('d-none');
        }
    }

    // Функция для выхода
    function logout() {
        // Удаляем токен из cookies
        document.cookie = 'access_token=; max-age=0';
        toggleAuthElements(false); // Обновляем navbar после выхода
    }

    // Обработчик для кнопки "Выйти"
    document.getElementById('logoutLink')?.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
    });

    // Проверяем статус авторизации сразу при загрузке страницы
    checkAuthStatus();
});
