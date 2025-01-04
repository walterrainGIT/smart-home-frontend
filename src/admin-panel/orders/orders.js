import { sendRequest } from '/smart-home-frontend/src/utils/request.js';
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

const ordersPerPage = 15;
let currentOrderId = null;
let orders = [];

export function initializeOrdersModule() {
    console.log('Инициализация модуля управления заказами');
    bindEventListeners();
    loadOrders();
}

function bindEventListeners() {
    const addOrderButton = document.getElementById('showAddOrderBtn');
    if (addOrderButton) {
        addOrderButton.addEventListener('click', () => {
            toggleVisibility('orderForm', true);
            toggleVisibility('showAddOrderBtn', false);
        });
    }

    const saveOrderButton = document.getElementById('saveOrderBtn');
    if (saveOrderButton) {
        saveOrderButton.addEventListener('click', () => {
            saveOrder();
        });
    }
}

function toggleVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

async function loadOrders(page = 1) {
    const requestData = { page: { size: ordersPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/market/order/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        orders = data.orders;
        const totalPages = Math.ceil(data.total / ordersPerPage);

        const ordersTable = document.getElementById('ordersTable');
        ordersTable.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Статус</th>
                        <th>Лот</th>
                        <th>Дата создания</th>
                    </tr>
                </thead>
                <tbody id="ordersTableBody">
                    ${orders.map(order => `
                        <tr data-order-id="${order.id}">
                            <td>${order.id}</td>
                            <td>
                                ${order.user ? `
                                    <div>
                                        <strong>ID:</strong> ${order.user.id}<br>
                                        <strong>Имя:</strong> ${order.user.firstName} ${order.user.lastName}<br>
                                        <strong>Email:</strong> ${order.user.email}
                                    </div>
                                ` : `<div>Нет данных о пользователе</div>`}
                            </td>
                            <td>
                                <select class="form-select status-select" data-order-id="${order.id}">
                                    <option value="created" ${order.status === 'created' ? 'selected' : ''}>Создан</option>
                                    <option value="progress" ${order.status === 'progress' ? 'selected' : ''}>В процессе</option>
                                    <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Отменен</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершен</option>
                                </select>
                            </td>
                            <td>
                                ${order.lot ? `
                                    <div>
                                        <strong>Lot ID:</strong> ${order.lot.id} 
                                        <strong>Name:</strong> ${order.lot.name}
                                    </div>
                                ` : '<div>Нет данных о лоте</div>'}
                            </td>
                            <td>${new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Привязываем обработчики для изменения статуса
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = +e.target.dataset.orderId;
                const newStatus = e.target.value;
                updateOrderStatus(orderId, newStatus);
            });
        });

        loadPagination('ordersPagination', page, totalPages, loadOrders);
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
    }
}

function loadPagination(elementId, currentPage, totalPages, onPageChange) {
    const pagination = document.getElementById(elementId);
    pagination.innerHTML = '';

    if (currentPage > 1) {
        const prevPage = document.createElement('li');
        prevPage.classList.add('page-item');
        prevPage.innerHTML = `<a class="page-link" href="#">Предыдущая</a>`;
        prevPage.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(currentPage - 1);
        });
        pagination.appendChild(prevPage);
    }

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === currentPage) li.classList.add('active');
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(i);
        });
        pagination.appendChild(li);
    }

    if (currentPage < totalPages) {
        const nextPage = document.createElement('li');
        nextPage.classList.add('page-item');
        nextPage.innerHTML = `<a class="page-link" href="#">Следующая</a>`;
        nextPage.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(currentPage + 1);
        });
        pagination.appendChild(nextPage);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await sendRequest('http://localhost:3000/market/order', {
            method: 'PATCH',
            body: JSON.stringify({ id: orderId, status: newStatus }),
        });

        if (response) {
            showSuccessNotification(`Статус заказа ${orderId} успешно обновлен на ${newStatus}`);
            loadOrders(); // Перезагружаем список заказов
        } else {
            console.error('Ошибка при обновлении статуса заказа:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        showErrorNotification(`Ошибка при обновлении статуса заказа: ${error}`);
    }
}

