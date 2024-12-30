fetch('modals/auth.html')
    .then(response => response.text())
    .then(data => {
        // Вставляем HTML модалки в контейнер
        document.getElementById('modalContainer').innerHTML = data;

        // Проверка на наличие модалки в DOM
        const authModalElement = document.getElementById('authModal');
        if (authModalElement) {
            // Инициализация модального окна Bootstrap
            const authModal = new bootstrap.Modal(authModalElement);

            // Добавляем обработчик для показа модального окна
            document.querySelector('.nav-link[data-bs-toggle="modal"]').addEventListener('click', function () {
                authModal.show();
            });

            // Обработчики переключения вкладок в модалке
            const showRegister = document.getElementById('showRegister');
            const showLogin = document.getElementById('showLogin');

            if (showRegister && showLogin) {
                showRegister.addEventListener('click', function (event) {
                    event.preventDefault();
                    document.getElementById('loginTab').classList.remove('show', 'active');
                    document.getElementById('registerTab').classList.add('show', 'active');
                });

                showLogin.addEventListener('click', function (event) {
                    event.preventDefault();
                    document.getElementById('registerTab').classList.remove('show', 'active');
                    document.getElementById('loginTab').classList.add('show', 'active');
                });
            }
        } else {
            console.error('Модальное окно не найдено!');
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки модалки:', error);
    });
