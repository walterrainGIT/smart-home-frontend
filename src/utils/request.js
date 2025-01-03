// request.js (общая библиотека для обработки fetch запросов)
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';
import { getCookie } from '/smart-home-frontend/src/js/cookies.js';  // Импортируем getCookie

/**
 * Универсальная функция для отправки fetch запросов с обработкой ошибок.
 * @param {string} url - URL для запроса.
 * @param {object} options - Параметры запроса, такие как метод, тело, заголовки.
 * @returns {Promise<object>} - Данные ответа.
 */
export function sendRequest(url, options = {}) {
    const token = getCookie('token');

    // Дефолтные настройки для запроса
    const defaultOptions = {
        method: 'GET',  // по умолчанию GET
        headers: {
            "Content-Type": "application/json",  // Если нужно передавать данные в JSON
            "Authorization": `Bearer ${token}`,  // Добавляем токен в заголовок Authorization
        },
        credentials: 'include',  // для работы с куками
    };

    // Слияние дефолтных параметров с переданными
    const finalOptions = { ...defaultOptions, ...options };

    return fetch(url, finalOptions)
        .then(response => {
            // Если ответ от сервера не успешен (например, ошибка 400, 500)
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.json();  // возвращаем данные, если запрос успешен
        })
        .then(data => {
            // Если запрос успешен, показываем успешное уведомление
            if (finalOptions.method === 'POST' || finalOptions.method === 'PATCH') {
                //showSuccessNotification('Запрос выполнен успешно!');
            }
            return data; // возвращаем данные
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
            // Обработка ошибок
            if (error.message === 'Failed to fetch') {
                showErrorNotification('Ошибка соединения. Пожалуйста, проверьте интернет-соединение.');
            } else {
                showErrorNotification('Ошибка при выполнении запроса. Пожалуйста, проверьте данные или соединение.');
            }
            throw error; // пробрасываем ошибку для дальнейшей обработки
        });
}
