export async function loadUserOrders() {
    try {
        const response = await fetch('/api/orders'); // Путь к API для получения заказов пользователя
        const orders = await response.json();
        const ordersTableBody = document.getElementById('ordersTableBody');
        ordersTableBody.innerHTML = orders
            .map(
                (order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.serviceName}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.status}</td>
                </tr>`
            )
            .join('');
    } catch (error) {
        console.error('Ошибка загрузки заказов пользователя:', error);
    }
}
