document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('ordersList');

    // Пример данных для заказов
    const orders = [
        { id: 1, status: 'В ожидании', description: 'Заказ 1' },
        { id: 2, status: 'В процессе', description: 'Заказ 2' }
    ];

    // Функция для рендеринга заказов
    function renderOrders() {
        ordersList.innerHTML = orders.map(order => `
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Статус: ${order.status}</h5>
                        <p class="card-text">${order.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderOrders();  // Рендерим заказы
});
