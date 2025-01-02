// services.js
import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

// Загрузка продуктов
export async function loadProducts(page = 1, size = 10) {
    const requestData = {
        page: {
            size,
            number: page
        }
    };

    try {
        const data = await sendRequest('http://localhost:3000/market/product/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
        const products = data.products;

        const productsTable = document.getElementById('productsTable');
        productsTable.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Цена</th>
                        <th>Изображение</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.shortDescription}</td>
                            <td>${product.price}</td>
                            <td><img src="${product.image}" alt="${product.name}" width="50"></td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">Редактировать</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
    }
}

// Загрузка лотов
export async function loadLots(page = 1, size = 10) {
    const requestData = {
        page: {
            size,
            number: page
        },
        types: ['product'],  // Пример фильтрации, можно расширить по типам лотов
        statuses: ['created'], // Например, только активные лоты
    };

    try {
        const data = await sendRequest('http://localhost:3000/market/lot/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const lots = data.lots;

        const lotsTable = document.getElementById('lotsTable');
        lotsTable.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Цена</th>
                        <th>Продукты</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${lots.map(lot => `
                        <tr>
                            <td>${lot.name}</td>
                            <td>${lot.shortDescription}</td>
                            <td>${lot.price}</td>
                            <td>${lot.products.map(p => p.name).join(', ')}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editLot(${lot.id})">Редактировать</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLot(${lot.id})">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Ошибка при загрузке лотов:', error);
    }
}

// Функции для добавления, редактирования и удаления продуктов и лотов

// Добавить продукт
export async function createProduct(data) {
    try {
        const product = await sendRequest('http://localhost:3000/market/product/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        loadProducts(); // Перезагружаем список продуктов
    } catch (error) {
        console.error('Ошибка при добавлении продукта:', error);
    }
}

// Добавить лот
export async function createLot(data) {
    try {
        const lot = await sendRequest('http://localhost:3000/market/lot/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        loadLots(); // Перезагружаем список лотов
    } catch (error) {
        console.error('Ошибка при добавлении лота:', error);
    }
}

// Удалить продукт
export async function deleteProduct(productId) {
    try {
        await sendRequest(`http://localhost:3000/market/product/delete/${productId}`, {
            method: 'DELETE',
        });
        loadProducts(); // Перезагружаем список продуктов
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
    }
}

// Удалить лот
export async function deleteLot(lotId) {
    try {
        await sendRequest(`http://localhost:3000/market/lot/delete/${lotId}`, {
            method: 'DELETE',
        });
        loadLots(); // Перезагружаем список лотов
    } catch (error) {
        console.error('Ошибка при удалении лота:', error);
    }
}

// Функции редактирования
export function editProduct(productId) {
    // Реализовать редактирование продукта (например, открыть форму с данными продукта)
    console.log(`Редактировать продукт с ID: ${productId}`);
}

export function editLot(lotId) {
    // Реализовать редактирование лота (например, открыть форму с данными лота)
    console.log(`Редактировать лот с ID: ${lotId}`);
}
