// /smart-home-frontend/src/utils/userData.js

export function getUserData() {
    // Проверяем, есть ли данные о пользователе в локальном хранилище или в глобальном объекте
    // Допустим, данные о пользователе хранятся в sessionStorage или глобальной переменной после авторизации

    const userData = JSON.parse(sessionStorage.getItem('user'));  // или глобальная переменная, если использовали другой способ

    if (userData) {
        return userData;
    } else {
        throw new Error("Данные пользователя не найдены");
    }
}
