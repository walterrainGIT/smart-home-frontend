import { sendRequest } from '/smart-home-frontend/src/utils/request.js';
import { showErrorNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

let ordersChart, statusChart, revenueChart, popularLotsChart;

export function initializeAnalytics() {
    // Устанавливаем даты по умолчанию (последние 30 дней)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);

    document.getElementById('dateFrom').value = dateFrom.toISOString().split('T')[0];
    document.getElementById('dateTo').value = dateTo.toISOString().split('T')[0];

    // Инициализация графиков
    initializeCharts();

    // Загрузка данных
    loadAnalytics();

    // Обработчик кнопки применения фильтров
    document.getElementById('applyFilters').addEventListener('click', () => {
        loadAnalytics();
    });
}

function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#ffffff'
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255, 110, 199, 0.1)' }
            },
            y: {
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255, 110, 199, 0.1)' }
            }
        }
    };

    // График динамики заказов
    const ordersCtx = document.getElementById('ordersChart');
    ordersChart = new Chart(ordersCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Количество заказов',
                data: [],
                borderColor: '#ff6ec7',
                backgroundColor: 'rgba(255, 110, 199, 0.1)',
                tension: 0.4
            }]
        },
        options: chartOptions
    });

    // Круговая диаграмма статусов
    const statusCtx = document.getElementById('statusChart');
    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Создан', 'В процессе', 'Завершен', 'Отменен'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#ff6ec7',
                    '#4b2e83',
                    '#00ff88',
                    '#ff4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            }
        }
    });

    // График динамики доходов
    const revenueCtx = document.getElementById('revenueChart');
    revenueChart = new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Доход (₽)',
                data: [],
                backgroundColor: 'rgba(255, 110, 199, 0.6)',
                borderColor: '#ff6ec7',
                borderWidth: 2
            }]
        },
        options: chartOptions
    });

    // График популярных лотов
    const popularCtx = document.getElementById('popularLotsChart');
    popularLotsChart = new Chart(popularCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Количество заказов',
                data: [],
                backgroundColor: 'rgba(255, 110, 199, 0.6)',
                borderColor: '#ff6ec7',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            indexAxis: 'y'
        }
    });
}

async function loadAnalytics() {
    try {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const period = document.getElementById('period').value;

        // Загрузка summary
        const summaryParams = new URLSearchParams();
        if (dateFrom) summaryParams.append('dateFrom', dateFrom);
        if (dateTo) summaryParams.append('dateTo', dateTo);

        const summary = await sendRequest(
            `http://localhost:3000/market/analytics/orders-summary?${summaryParams}`,
            { method: 'GET' }
        );

        // Обновление метрик
        document.getElementById('totalOrders').textContent = summary.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = formatCurrency(summary.totalRevenue || 0);
        document.getElementById('averageOrderValue').textContent = formatCurrency(summary.averageOrderValue || 0);
        
        const totalCompleted = summary.ordersByStatus?.completed || 0;
        const totalOrders = summary.totalOrders || 1;
        const conversionRate = ((totalCompleted / totalOrders) * 100).toFixed(1);
        document.getElementById('conversionRate').textContent = `${conversionRate}%`;

        // Обновление графика статусов
        statusChart.data.datasets[0].data = [
            summary.ordersByStatus?.created || 0,
            summary.ordersByStatus?.progress || 0,
            summary.ordersByStatus?.completed || 0,
            summary.ordersByStatus?.canceled || 0
        ];
        statusChart.update();

        // Загрузка данных по периодам
        const periodParams = new URLSearchParams();
        periodParams.append('dateFrom', dateFrom);
        periodParams.append('dateTo', dateTo);
        periodParams.append('period', period);

        const periodData = await sendRequest(
            `http://localhost:3000/market/analytics/orders-by-period?${periodParams}`,
            { method: 'GET' }
        );

        // Обновление графиков динамики
        const periods = periodData.data.map(d => d.period);
        const counts = periodData.data.map(d => d.count);
        const revenues = periodData.data.map(d => d.revenue);

        ordersChart.data.labels = periods;
        ordersChart.data.datasets[0].data = counts;
        ordersChart.update();

        revenueChart.data.labels = periods;
        revenueChart.data.datasets[0].data = revenues;
        revenueChart.update();

        // Загрузка популярных лотов
        const popularParams = new URLSearchParams();
        if (dateFrom) popularParams.append('dateFrom', dateFrom);
        if (dateTo) popularParams.append('dateTo', dateTo);
        popularParams.append('limit', '10');

        const popularLots = await sendRequest(
            `http://localhost:3000/market/analytics/popular-lots?${popularParams}`,
            { method: 'GET' }
        );

        // Обновление графика и таблицы популярных лотов
        const lotNames = popularLots.lots.map(l => l.lotName);
        const lotCounts = popularLots.lots.map(l => l.orderCount);

        popularLotsChart.data.labels = lotNames;
        popularLotsChart.data.datasets[0].data = lotCounts;
        popularLotsChart.update();

        const popularLotsTable = document.getElementById('popularLotsTable');
        popularLotsTable.innerHTML = popularLots.lots.map(lot => `
            <tr>
                <td>${lot.lotName}</td>
                <td>${lot.orderCount}</td>
                <td>${formatCurrency(lot.revenue)}</td>
                <td>${(lot.conversionRate * 100).toFixed(1)}%</td>
            </tr>
        `).join('');

        // Загрузка топ клиентов
        const topCustomers = await sendRequest(
            `http://localhost:3000/market/analytics/top-customers?${popularParams}`,
            { method: 'GET' }
        );

        const topCustomersTable = document.getElementById('topCustomersTable');
        topCustomersTable.innerHTML = topCustomers.customers.map(customer => `
            <tr>
                <td>${customer.userId}</td>
                <td>${customer.orderCount}</td>
                <td>${formatCurrency(customer.totalSpent)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
        showErrorNotification('Ошибка загрузки данных аналитики');
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(value);
}

