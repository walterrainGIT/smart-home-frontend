import { showErrorNotification } from "/smart-home-frontend/src/notifications/toast-notifications.js";

let ordersChart, statusChart, revenueChart, popularLotsChart;

// Моки данных для демонстрации
function generateMockData() {
  const now = new Date();
  const periods = [];
  const periodType = document.getElementById("period")?.value || "month";

  // Генерируем данные за последние 6 месяцев
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let periodLabel;

    if (periodType === "month") {
      periodLabel = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    } else if (periodType === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      periodLabel = `${weekStart.getFullYear()}-${String(
        weekStart.getMonth() + 1
      ).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
    } else {
      periodLabel = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    periods.push({
      period: periodLabel,
      count: Math.floor(Math.random() * 50) + 30 + i * 5,
      revenue: Math.floor(Math.random() * 2000000) + 3000000 + i * 500000,
    });
  }

  return {
    summary: {
      totalOrders: 342,
      ordersByStatus: {
        created: 98,
        progress: 67,
        completed: 145,
        canceled: 32,
      },
      totalRevenue: 18750000,
      averageOrderValue: 129310,
    },
    periodData: {
      data: periods,
    },
    popularLots: {
      lots: [
        {
          lotId: 1,
          lotName: "Умный дом премиум",
          orderCount: 45,
          revenue: 6750000,
          conversionRate: 0.1316,
        },
        {
          lotId: 2,
          lotName: "Базовый комплект автоматизации",
          orderCount: 38,
          revenue: 3040000,
          conversionRate: 0.1111,
        },
        {
          lotId: 3,
          lotName: "Система безопасности",
          orderCount: 32,
          revenue: 3840000,
          conversionRate: 0.0936,
        },
        {
          lotId: 4,
          lotName: "Умное освещение",
          orderCount: 28,
          revenue: 1960000,
          conversionRate: 0.0819,
        },
        {
          lotId: 5,
          lotName: "Климат-контроль",
          orderCount: 25,
          revenue: 2500000,
          conversionRate: 0.0731,
        },
        {
          lotId: 6,
          lotName: "Мультимедиа система",
          orderCount: 22,
          revenue: 3300000,
          conversionRate: 0.0643,
        },
        {
          lotId: 7,
          lotName: "Управление шторами",
          orderCount: 18,
          revenue: 1440000,
          conversionRate: 0.0526,
        },
        {
          lotId: 8,
          lotName: "Система видеонаблюдения",
          orderCount: 15,
          revenue: 2250000,
          conversionRate: 0.0439,
        },
        {
          lotId: 9,
          lotName: "Умные розетки",
          orderCount: 12,
          revenue: 480000,
          conversionRate: 0.0351,
        },
        {
          lotId: 10,
          lotName: "Голосовое управление",
          orderCount: 10,
          revenue: 1500000,
          conversionRate: 0.0292,
        },
      ],
    },
    topCustomers: {
      customers: [
        { userId: 15, orderCount: 12, totalSpent: 1850000 },
        { userId: 8, orderCount: 10, totalSpent: 1500000 },
        { userId: 23, orderCount: 9, totalSpent: 1350000 },
        { userId: 5, orderCount: 8, totalSpent: 1200000 },
        { userId: 31, orderCount: 7, totalSpent: 1050000 },
        { userId: 12, orderCount: 6, totalSpent: 900000 },
        { userId: 19, orderCount: 6, totalSpent: 850000 },
        { userId: 27, orderCount: 5, totalSpent: 750000 },
        { userId: 3, orderCount: 5, totalSpent: 700000 },
        { userId: 41, orderCount: 4, totalSpent: 600000 },
      ],
    },
  };
}

export function initializeAnalytics() {
  // Устанавливаем даты по умолчанию (последние 30 дней)
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30);

  document.getElementById("dateFrom").value = dateFrom
    .toISOString()
    .split("T")[0];
  document.getElementById("dateTo").value = dateTo.toISOString().split("T")[0];

  // Инициализация графиков
  initializeCharts();

  // Загрузка данных
  loadAnalytics();

  // Обработчик кнопки применения фильтров
  document.getElementById("applyFilters").addEventListener("click", () => {
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
          color: "#ffffff",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255, 110, 199, 0.1)" },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255, 110, 199, 0.1)" },
      },
    },
  };

  // График динамики заказов
  const ordersCtx = document.getElementById("ordersChart");
  ordersChart = new Chart(ordersCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Количество заказов",
          data: [],
          borderColor: "#ff6ec7",
          backgroundColor: "rgba(255, 110, 199, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: chartOptions,
  });

  // Круговая диаграмма статусов
  const statusCtx = document.getElementById("statusChart");
  statusChart = new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: ["Создан", "В процессе", "Завершен", "Отменен"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: ["#ff6ec7", "#4b2e83", "#00ff88", "#ff4444"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#ffffff" },
        },
      },
    },
  });

  // График динамики доходов
  const revenueCtx = document.getElementById("revenueChart");
  revenueChart = new Chart(revenueCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Доход (₽)",
          data: [],
          backgroundColor: "rgba(255, 110, 199, 0.6)",
          borderColor: "#ff6ec7",
          borderWidth: 2,
        },
      ],
    },
    options: chartOptions,
  });

  // График популярных лотов
  const popularCtx = document.getElementById("popularLotsChart");
  popularLotsChart = new Chart(popularCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Количество заказов",
          data: [],
          backgroundColor: "rgba(255, 110, 199, 0.6)",
          borderColor: "#ff6ec7",
          borderWidth: 2,
        },
      ],
    },
    options: {
      ...chartOptions,
      indexAxis: "y",
    },
  });
}

async function loadAnalytics() {
  try {
    // Имитация загрузки данных
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Используем моки данных для демонстрации
    const mockData = generateMockData();

    const summary = mockData.summary;
    const periodData = mockData.periodData;
    const popularLots = mockData.popularLots;
    const topCustomers = mockData.topCustomers;

    // Обновление метрик
    document.getElementById("totalOrders").textContent =
      summary.totalOrders || 0;
    document.getElementById("totalRevenue").textContent = formatCurrency(
      summary.totalRevenue || 0
    );
    document.getElementById("averageOrderValue").textContent = formatCurrency(
      summary.averageOrderValue || 0
    );

    const totalCompleted = summary.ordersByStatus?.completed || 0;
    const totalOrders = summary.totalOrders || 1;
    const conversionRate = ((totalCompleted / totalOrders) * 100).toFixed(1);
    document.getElementById(
      "conversionRate"
    ).textContent = `${conversionRate}%`;

    // Обновление графика статусов
    statusChart.data.datasets[0].data = [
      summary.ordersByStatus?.created || 0,
      summary.ordersByStatus?.progress || 0,
      summary.ordersByStatus?.completed || 0,
      summary.ordersByStatus?.canceled || 0,
    ];
    statusChart.update();

    // Обновление графиков динамики
    const periods = periodData.data.map((d) => d.period);
    const counts = periodData.data.map((d) => d.count);
    const revenues = periodData.data.map((d) => d.revenue);

    ordersChart.data.labels = periods;
    ordersChart.data.datasets[0].data = counts;
    ordersChart.update();

    revenueChart.data.labels = periods;
    revenueChart.data.datasets[0].data = revenues;
    revenueChart.update();

    // Обновление графика и таблицы популярных лотов
    const lotNames = popularLots.lots.map((l) => l.lotName);
    const lotCounts = popularLots.lots.map((l) => l.orderCount);

    popularLotsChart.data.labels = lotNames;
    popularLotsChart.data.datasets[0].data = lotCounts;
    popularLotsChart.update();

    const popularLotsTable = document.getElementById("popularLotsTable");
    popularLotsTable.innerHTML = popularLots.lots
      .map(
        (lot) => `
            <tr>
                <td>${lot.lotName}</td>
                <td>${lot.orderCount}</td>
                <td>${formatCurrency(lot.revenue)}</td>
                <td>${(lot.conversionRate * 100).toFixed(1)}%</td>
            </tr>
        `
      )
      .join("");

    // Обновление таблицы топ клиентов
    const topCustomersTable = document.getElementById("topCustomersTable");
    topCustomersTable.innerHTML = topCustomers.customers
      .map(
        (customer) => `
            <tr>
                <td>${customer.userId}</td>
                <td>${customer.orderCount}</td>
                <td>${formatCurrency(customer.totalSpent)}</td>
            </tr>
        `
      )
      .join("");
  } catch (error) {
    console.error("Ошибка загрузки аналитики:", error);
    showErrorNotification("Ошибка загрузки данных аналитики");
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(value);
}
