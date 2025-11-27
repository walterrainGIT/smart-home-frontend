// Утилита для проверки доступности сервера
import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

let serverAvailable = null; // null - еще не проверено, true - доступен, false - недоступен
let checkPromise = null; // Promise для избежания множественных одновременных проверок

/**
 * Проверяет доступность сервера через запрос /user/me
 * @returns {Promise<boolean>} true если сервер доступен, false если нет
 */
export async function checkServerAvailability() {
    // Если уже проверяем, возвращаем существующий промис
    if (checkPromise) {
        return checkPromise;
    }

    // Если уже знаем результат, возвращаем его
    if (serverAvailable !== null) {
        return Promise.resolve(serverAvailable);
    }

    // Создаем промис для проверки с таймаутом
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000);
    });

    const fetchPromise = sendRequest("http://localhost:3000/user/me", { 
        method: "GET"
    });

    checkPromise = Promise.race([fetchPromise, timeoutPromise])
        .then(() => {
            serverAvailable = true;
            checkPromise = null;
            return true;
        })
        .catch((error) => {
            // Если ошибка сети, таймаут или ошибка соединения - сервер недоступен
            if (error.message === 'Timeout' || 
                error.message === 'Failed to fetch' || 
                error.message.includes('network') ||
                error.message.includes('соединения') ||
                error.name === 'TypeError') {
                serverAvailable = false;
                checkPromise = null;
                return false;
            }
            // Если сервер ответил (даже с ошибкой авторизации), значит он доступен
            serverAvailable = true;
            checkPromise = null;
            return true;
        });

    return checkPromise;
}

/**
 * Возвращает текущий статус сервера (без проверки)
 * @returns {boolean|null} true/false если проверено, null если еще не проверено
 */
export function getServerStatus() {
    return serverAvailable;
}

/**
 * Сбрасывает статус сервера (для повторной проверки)
 */
export function resetServerStatus() {
    serverAvailable = null;
    checkPromise = null;
}

/**
 * Устанавливает статус сервера вручную
 * @param {boolean} status - статус сервера
 */
export function setServerStatus(status) {
    serverAvailable = status;
}

