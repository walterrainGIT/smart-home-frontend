// auth-modal.js
import { loginUser, registerUser } from '/smart-home-frontend/src/modals/auth-modal/auth-request.js';
import { checkUserAuthentication } from '/smart-home-frontend/src/navbar/navbar.js';

export function initializeAuthModalEvents() {
    console.log("Initializing modal script");

    // Элементы
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // Логика переключения вкладок
    if (showRegister) {
        showRegister.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById("loginTab").classList.remove('show', 'active');
            document.getElementById("registerTab").classList.add('show', 'active');
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById("registerTab").classList.remove('show', 'active');
            document.getElementById("loginTab").classList.add('show', 'active');
        });
    }

    // Логика логина
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const loginParam = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                // Отправка запроса на логин
                const user = await loginUser(loginParam, password);

                // Закрываем модалку
                bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();

                // Перерисовываем панель навигации
                checkUserAuthentication();
            } catch (error) {
                // Ошибка уже обработана внутри loginUser
            }
        });
    }

    // Логика регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
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
                showErrorNotification("Пароли не совпадают!");
                return;
            }

            try {
                // Отправка запроса на регистрацию
                const user = await registerUser(firstName, lastName, email, phone, address, username, password);

                // Закрываем модалку
                bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();

                // Перерисовываем панель навигации
                checkUserAuthentication();
            } catch (error) {
                // Ошибка уже обработана внутри registerUser
            }
        });
    }
}
