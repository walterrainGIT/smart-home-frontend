// Функция для отправки запроса на вход
export function loginUser(loginParam, password) {
    return fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginParam, password }),
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Ошибка при авторизации:', error);
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
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Ошибка при регистрации:', error);
        });
}
