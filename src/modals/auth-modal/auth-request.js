// auth-request.js
import { sendRequest } from '/smart-home-frontend/src/utils/request.js';  // Импортируем универсальную функцию
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

// Функция для отправки запроса на вход
export function loginUser(loginParam, password) {
    return sendRequest('http://localhost:3000/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginParam, password }),
    })
        .then(data => {
            // Если запрос успешен, показываем успешное уведомление
            showSuccessNotification('Логин выполнен успешно!');
            return data; // возвращаем данные пользователя
        })
        .catch(error => {
            console.error('Ошибка при входе:', error);
            // Уведомления об ошибке обрабатываются в request
            throw error; // пробрасываем ошибку дальше
        });
}

// Функция для отправки запроса на регистрацию
export function registerUser(firstName, lastName, email, phone, address, username, password) {
    return sendRequest('http://localhost:3000/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, phone, address, username, password }),
    })
        .then(data => {
            // Показываем успешное уведомление
            showSuccessNotification('Регистрация выполнена успешно!');
            return data; // возвращаем данные пользователя
        })
        .catch(error => {
            console.error('Ошибка при регистрации:', error);
            // Уведомления об ошибке обрабатываются в request
            throw error; // пробрасываем ошибку дальше
        });
}
