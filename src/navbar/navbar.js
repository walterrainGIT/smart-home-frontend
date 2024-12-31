import { getCookie } from '/smart-home-frontend/src/js/cookies.js';  // Импортируем getCookie
import { initializeAuthModalEvents } from '/smart-home-frontend/src/modals/auth-modal/auth-modal.js';
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

// Динамическая загрузка панели навигации и инициализация модалки
export function loadNavbar() {
    // Динамическая загрузка панели навигации
    document.addEventListener("DOMContentLoaded", function () {
        const navbarContainer = document.getElementById("navbar");

        if (navbarContainer) {
            // Загружаем содержимое navbar.html
            fetch("/smart-home-frontend/src/navbar/navbar.html")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then((html) => {
                    navbarContainer.innerHTML = html;

                    // Инициализация модалки и обновление состояния навигации
                    initializeAuthModal();
                    checkUserAuthentication();
                })
                .catch((error) => {
                    console.error("Не удалось загрузить панель навигации:", error);
                });
        }
    });
}

// Функция для инициализации модалки в navbar.js
function initializeAuthModal() {
    const modalContainer = document.getElementById("modalContainer");

    if (modalContainer) {
        fetch("/smart-home-frontend/src/modals/auth-modal/auth-modal.html")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((html) => {
                modalContainer.innerHTML = html;

                // Проверьте наличие объекта bootstrap
                if (typeof bootstrap === "undefined") {
                    console.error("Bootstrap не загружен");
                    return;
                }

                // Инициализация модалки Bootstrap после вставки HTML
                const modalInstance = new bootstrap.Modal(document.getElementById("authModal"));

                const loginLink = document.querySelector('.nav-link[data-bs-toggle="modal"]');
                if (loginLink) {
                    loginLink.addEventListener("click", function () {
                        modalInstance.show();
                    });
                }

                // Инициализация логики модалки после вставки HTML
                initializeAuthModalEvents();
            })
            .catch((error) => {
                console.error("Не удалось загрузить модальное окно:", error);
            });
    }
}

// Функция для проверки состояния пользователя (вошел ли он в систему)
export function checkUserAuthentication() {
    // Получаем токен из куки
    const token = getCookie('token');

    // Если токен отсутствует, сразу показываем кнопку входа
    if (!token) {
        console.log("Пользователь не авторизован");
        displayLoginButton();  // Показать кнопку для входа
        return;
    }

    // Отправляем запрос с токеном в заголовке Authorization
    fetch("http://localhost:3000/user/me", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",  // Если нужно передавать данные в JSON
            "Authorization": `Bearer ${token}`,  // Добавляем токен в заголовок Authorization
        },
        credentials: 'include',
    })
        .then((response) => {
            if (!response.ok) {
                // Если ответ от сервера не успешен (например, неверный токен)
                console.log("Пользователь не авторизован");
                displayLoginButton();  // Показать кнопку для входа
                return Promise.reject("Пользователь не авторизован"); // Прерываем дальнейшую обработку
            }
            return response.json();  // Возвращаем данные пользователя
        })
        .then((user) => {
            // Если пользователь авторизован, показываем имя и кнопку "Выйти"
            console.log("Пользователь авторизован:", user);
            displayUserInfo(user);  // Отобразить информацию о пользователе
            // Не показывать кнопку для входа, так как пользователь авторизован
        })
        .catch((error) => {
            // Обработка ошибок: если запрос не удался или токен неверный
            console.log(error);
            // На случай, если ошибка произошла и `displayLoginButton` еще не был вызван
            displayLoginButton();  // Показать кнопку для входа
        });
}

// Функция для отображения кнопки "Войти / Регистрация"
function displayLoginButton() {
    const authContainer = document.getElementById("authContainer");

    if (authContainer) {
        // Очистить контейнер перед добавлением кнопки
        authContainer.innerHTML = `
            <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#authModal" id="authLink">Войти / Регистрация</a>
        `;
    } else {
        console.error("Контейнер authContainer не найден");
    }
}

// Функция для отображения информации о пользователе
function displayUserInfo(user) {
    const authContainer = document.getElementById("authContainer");
    if (!authContainer) return;

    // Очистим контейнер перед добавлением информации о пользователе
    authContainer.innerHTML = "";

    // Добавляем имя пользователя
    const userInfo = document.createElement("span");
    userInfo.textContent = `${user.username}`;
    userInfo.classList.add("nav-link", "text-light", "me-2"); // Имя пользователя с отступом
    userInfo.style.cursor = "default"; // Убираем видимость ссылки
    authContainer.appendChild(userInfo);

    // Добавляем кнопку "Выйти"
    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Выйти";
    logoutButton.classList.add("btn", "btn-danger", "btn-sm"); // Маленькая кнопка выхода
    authContainer.appendChild(logoutButton);

    // Добавляем обработчик события для выхода
    logoutButton.addEventListener("click", function () {
        logoutUser();
    });
}

// Функция для выхода из системы
function logoutUser() {
    const token = getCookie("token");

    fetch("http://localhost:3000/auth/logout", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: 'include',
    })
        .then((response) => {
            if (response.ok) {
                // Удаляем токен из куки
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                // Обновляем UI
                removeUserInfo(); // Удаляем информацию о пользователе
                displayLoginButton(); // Показываем кнопку входа
            } else {
                console.error("Ошибка при выходе");
            }
        })
        .catch((error) => {
            console.error("Ошибка при запросе выхода:", error);
        });
}

// Функция для удаления информации о пользователе
function removeUserInfo() {
    const authContainer = document.getElementById("authContainer");
    if (!authContainer) return;

    // Очистить контейнер и вернуть кнопку "Войти / Регистрация"
    authContainer.innerHTML = `
        <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#authModal" id="authLink">Войти / Регистрация</a>
    `;
}
