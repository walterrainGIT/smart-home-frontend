// auth-request.js
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

// Функция для отправки запроса на вход
export function loginUser(loginParam, password) {
    return fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginParam, password }),
        credentials: 'include',
    })
        .then(response => {
            // Если ответ от сервера не успешен (например, ошибка 400, 500)
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Если запрос успешен, показываем успешное уведомление
            showSuccessNotification('Логин выполнен успешно!');
            return data; // возвращаем данные пользователя
        })
        .catch(error => {
            console.error(error);
            // Показать ошибку
            if (error.message === 'Failed to fetch') {
                showErrorNotification('Ошибка соединения. Пожалуйста, проверьте интернет-соединение.');
            } else {
                showErrorNotification('Ошибка при входе. Проверьте данные или соединение.');
            }
            throw error; // пробрасываем ошибку дальше, чтобы обработать её в вызывающем коде
        });
}

// Функция для отправки запроса на регистрацию
export function registerUser(firstName, lastName, email, phone, address, username, password) {
    return fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, phone, address, username, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Показываем успешное уведомление
            showSuccessNotification('Регистрация выполнена успешно!');
            return data; // возвращаем данные пользователя
        })
        .catch(error => {
            console.error('Ошибка при регистрации:', error);
            if (error.message === 'Failed to fetch') {
                showErrorNotification('Ошибка соединения. Пожалуйста, проверьте интернет-соединение.');
            } else {
                showErrorNotification('Ошибка при регистрации. Проверьте данные или соединение.');
            }
            throw error; // пробрасываем ошибку дальше
        });
}
