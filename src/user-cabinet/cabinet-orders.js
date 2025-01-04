// /smart-home-frontend/src/user-cabinet/orders.js
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';
import { sendRequest } from '/smart-home-frontend/src/utils/request.js';  // Импортируем универсальную функцию для запросов

export async function loadOrders(userId) {
    try {
        const data = await sendRequest('http://localhost:3000/market/order/get', {
            method: 'POST',
            body: JSON.stringify({
                usersIds: [userId],
                page: {
                    size: 100,
                    number: 1,
                }
            })
        });

        const orders = data.orders;

        const ordersTableBody = document.getElementById('ordersTableBody');
        ordersTableBody.innerHTML = ''; // Очищаем таблицу перед добавлением новых данных

        // Добавляем заказы в таблицу
        orders.forEach((order, index) => {
            const orderRow = document.createElement('tr');

            // Создаем строку с данными заказа
            let cancelButton = '';
            if (order.status !== 'canceled') {
                cancelButton = `<button class="btn btn-danger cancel-btn" data-order-id="${order.id}">Отменить</button>`;
            }

            orderRow.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src="${order.lot.image}" alt="lot image" style="width: 50px; height: 50px; object-fit: cover;">
                    ${order.lot.name}
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.status}</td>
                <td>${cancelButton}</td>
            `;
            ordersTableBody.appendChild(orderRow);
        });

        // Привязываем обработчик к кнопкам отмены заказа
        const cancelButtons = document.querySelectorAll('.cancel-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                cancelOrder(orderId);
            });
        });

    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
    }
}

async function cancelOrder(orderId) {
    try {
        const data = await sendRequest(`http://localhost:3000/market/order?id=${orderId}`, {
            method: 'DELETE',
        });

        if (data) {
            showSuccessNotification('Заказ отменен');
            loadOrders(JSON.parse(sessionStorage.getItem('user')).id); // Перезагружаем заказы
        } else {
            showErrorNotification('Не удалось отменить заказ');
        }
    } catch (error) {
        console.error('Ошибка при отмене заказа:', error);
    }
}
