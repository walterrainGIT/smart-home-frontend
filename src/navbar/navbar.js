import { getCookie } from '/smart-home-frontend/src/js/cookies.js';  // Импортируем getCookie

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

                // Инициализация модалки Bootstrap после вставки HTML
                const modalInstance = new bootstrap.Modal(document.getElementById("authModal"));

                // При клике на ссылку для модалки, показываем модальное окно
                const loginLink = document.querySelector('.nav-link[data-bs-toggle="modal"]');
                if (loginLink) {
                    loginLink.addEventListener("click", function () {
                        modalInstance.show();
                    });
                }
            })
            .catch((error) => {
                console.error("Не удалось загрузить модальное окно:", error);
            });
    }
}

// Функция для проверки состояния пользователя (вошел ли он в систему)
function checkUserAuthentication() {
    const token = getCookie("token");  // Получаем токен из куки

    if (!token) {
        // Если токен не найден, считаем, что пользователь не авторизован
        displayLoginButton();
        return;
    }

    // Если токен есть, проверяем данные пользователя
    fetch("http://localhost:3000/user/me", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  // Добавляем токен в заголовки
        }
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Пользователь не авторизован");
        })
        .then((user) => {
            // Если пользователь авторизован, показываем имя и кнопку "Выйти"
            displayUserInfo(user);
        })
        .catch((error) => {
            console.log("Ошибка при получении данных о пользователе:", error);
            displayLoginButton();
        });
}

// Функция для отображения кнопки "Войти / Регистрация"
function displayLoginButton() {
    const authLink = document.querySelector('.nav-link[data-bs-toggle="modal"]');
    authLink.textContent = "Войти / Регистрация";
    authLink.href = "#"; // Ссылка для модалки
}

// Функция для отображения информации о пользователе
function displayUserInfo(user) {
    const authLink = document.querySelector('.nav-link[data-bs-toggle="modal"]');
    authLink.textContent = `${user.username}`;
    authLink.href = "#"; // отключаем ссылку

    // Добавляем кнопку "Выйти"
    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Выйти";
    logoutButton.classList.add("btn", "btn-danger");
    authLink.parentNode.appendChild(logoutButton);

    // При клике на кнопку "Выйти" выполняем выход
    logoutButton.addEventListener("click", function () {
        logoutUser();
    });
}

// Функция для выхода из системы
function logoutUser() {
    const token = getCookie("token");  // Получаем токен из куки

    fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  // Добавляем токен в заголовки
        }
    })
        .then((response) => {
            if (response.ok) {
                // Удаляем токен из куки (или можем выполнить редирект)
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                displayLoginButton();
            } else {
                console.error("Ошибка при выходе");
            }
        })
        .catch((error) => {
            console.error("Ошибка при запросе выхода:", error);
        });
}
