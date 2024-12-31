// Импортируем функции для авторизации и регистрации
import { loginUser, registerUser } from '/smart-home-frontend/src/modals/auth-modal/auth-request';


console.log("Initializing modal script");

// Проверка, есть ли элементы
const loginForm = document.getElementById("loginForm");
console.log(loginForm);  // Убедитесь, что элемент найден

const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

showRegister?.addEventListener('click', function (event) {
    console.log('Show Register clicked');
    event.preventDefault();
});

showLogin?.addEventListener('click', function (event) {
    console.log('Show Login clicked');
    event.preventDefault();
});


document.addEventListener("DOMContentLoaded", function () {
    // Функция для переключения вкладок
    function toggleTabs(event, targetTab, currentTab) {
        event.preventDefault();
        currentTab.classList.remove('show', 'active');
        targetTab.classList.add('show', 'active');
    }

    // Переключение между вкладками "Вход" и "Регистрация"
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (showRegister) {
        showRegister.addEventListener('click', function (event) {
            toggleTabs(event, registerTab, loginTab);
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function (event) {
            toggleTabs(event, loginTab, registerTab);
        });
    }

    // Обработчик логина
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;

            // Вызываем функцию для входа
            loginUser(loginEmail, loginPassword).then(response => {
                if (response && response.success) {
                    alert('Вход успешен!');
                    $('#authModal').modal('hide');
                } else {
                    alert('Ошибка при входе');
                }
            });
        });
    }

    // Обработчик регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const address = document.getElementById('registerAddress').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }

            // Вызываем функцию для регистрации
            registerUser(firstName, lastName, email, phone, address, username, password).then(response => {
                if (response && response.success) {
                    alert('Регистрация успешна!');
                    $('#authModal').modal('hide');
                } else {
                    alert('Ошибка при регистрации');
                }
            });
        });
    }
});
