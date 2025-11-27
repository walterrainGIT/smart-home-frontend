import { sendRequest } from "/smart-home-frontend/src/utils/request.js";
import {
  showSuccessNotification,
  showErrorNotification,
} from "/smart-home-frontend/src/notifications/toast-notifications.js";
import { loadNavbar } from "/smart-home-frontend/src/navbar/navbar.js";
import { checkServerAvailability, getServerStatus } from '/smart-home-frontend/src/utils/server-status.js';  // Импортируем проверку доступности сервера
import { mockProducts } from '/smart-home-frontend/src/utils/mock-data.js';  // Импортируем мок-данные

let products = [];
let rooms = [];
let draggedProduct = null;

export function initializeConfigurator() {
  loadNavbar();
  loadProducts();
  setupEventListeners();
  updateStats();
}

function setupEventListeners() {
  document.getElementById("addRoom").addEventListener("click", addRoom);
  document
    .getElementById("saveConfig")
    .addEventListener("click", saveConfiguration);
  document
    .getElementById("loadConfigs")
    .addEventListener("click", loadSavedConfigurations);
  document.getElementById("createOrder").addEventListener("click", createOrder);
}

async function loadProducts() {
  try {
    // Проверяем доступность сервера
    let serverAvailable = getServerStatus();
    if (serverAvailable === null) {
      // Если статус еще не проверен, проверяем
      serverAvailable = await checkServerAvailability();
    }

    // Если сервер недоступен, используем моки
    if (!serverAvailable) {
      console.log("Сервер недоступен, используем мок-данные для конфигуратора");
      products = mockProducts;
      renderProductsCatalog();
      return;
    }

    const response = await sendRequest(
      "http://localhost:3000/market/product/get",
      {
        method: "POST",
        body: JSON.stringify({
          page: { size: 100, number: 1 },
        }),
      }
    );

    products = response.products || [];
    renderProductsCatalog();
  } catch (error) {
    console.error("Ошибка загрузки продуктов:", error);
    // В случае ошибки используем моки
    console.log("Используем мок-данные из-за ошибки");
    products = mockProducts;
    renderProductsCatalog();
  }
}

function renderProductsCatalog() {
  const catalog = document.getElementById("productsCatalog");
  catalog.innerHTML = products
    .map(
      (product) => `
        <div class="product-catalog-item" 
             draggable="true" 
             data-product-id="${product.id}"
             data-product-name="${product.name}"
             data-product-price="${product.price || 0}">
            <h6>${product.name}</h6>
            <div class="price">${formatCurrency(product.price || 0)}</div>
        </div>
    `
    )
    .join("");

  // Настройка drag and drop для продуктов
  document.querySelectorAll(".product-catalog-item").forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedProduct = {
    id: parseInt(e.target.dataset.productId),
    name: e.target.dataset.productName,
    price: parseFloat(e.target.dataset.productPrice),
  };
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  draggedProduct = null;
}

function addRoom() {
  const roomId = Date.now();
  rooms.push({
    id: roomId,
    type: "room",
    name: `Комната ${rooms.length + 1}`,
    products: [],
  });
  renderRooms();
  updateStats();
}

function renderRooms() {
  const container = document.getElementById("roomsContainer");
  container.innerHTML = rooms
    .map(
      (room) => `
        <div class="room">
            <div class="room-header">
                <input type="text" class="form-control room-title-input" 
                       value="${room.name}" 
                       data-room-id="${room.id}"
                       style="width: auto; display: inline-block;">
                <button class="btn btn-sm btn-danger" onclick="removeRoom(${
                  room.id
                })">×</button>
            </div>
            <div class="room-products room-drop-zone" 
                 data-room-id="${room.id}"
                 ondrop="handleDrop(event, ${room.id})"
                 ondragover="handleDragOver(event)"
                 ondragleave="handleDragLeave(event)">
                ${room.products
                  .map((productId) => {
                    const product = products.find((p) => p.id === productId);
                    if (!product) return "";
                    return `
                        <div class="product-item" data-product-id="${
                          product.id
                        }">
                            ${product.name} (${formatCurrency(
                      product.price || 0
                    )})
                            <button class="btn btn-sm btn-danger ms-2" 
                                    onclick="removeProductFromRoom(${
                                      room.id
                                    }, ${product.id})">×</button>
                        </div>
                    `;
                  })
                  .join("")}
                ${
                  room.products.length === 0
                    ? '<p class="text-muted">Перетащите продукты сюда</p>'
                    : ""
                }
            </div>
        </div>
    `
    )
    .join("");

  // Настройка обработчиков для переименования комнат
  document.querySelectorAll(".room-title-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const roomId = parseInt(e.target.dataset.roomId);
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        room.name = e.target.value;
      }
    });
  });
}

window.handleDrop = function (event, roomId) {
  event.preventDefault();
  event.target.classList.remove("drag-over");

  if (draggedProduct) {
    const room = rooms.find((r) => r.id === roomId);
    if (room && !room.products.includes(draggedProduct.id)) {
      room.products.push(draggedProduct.id);
      renderRooms();
      updateStats();
    }
  }
};

window.handleDragOver = function (event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.target.classList.add("drag-over");
};

window.handleDragLeave = function (event) {
  event.target.classList.remove("drag-over");
};

window.removeRoom = function (roomId) {
  rooms = rooms.filter((r) => r.id !== roomId);
  renderRooms();
  updateStats();
};

window.removeProductFromRoom = function (roomId, productId) {
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    room.products = room.products.filter((id) => id !== productId);
    renderRooms();
    updateStats();
  }
};

function updateStats() {
  const allProductIds = rooms.flatMap((room) => room.products);
  const uniqueProductIds = [...new Set(allProductIds)];
  const totalPrice = uniqueProductIds.reduce((sum, productId) => {
    const product = products.find((p) => p.id === productId);
    return sum + (product?.price || 0);
  }, 0);

  document.getElementById("totalPrice").textContent =
    formatCurrency(totalPrice);
  document.getElementById("roomsCount").textContent = rooms.length;
  document.getElementById("productsCount").textContent =
    uniqueProductIds.length;
}

async function saveConfiguration() {
  // Проверяем доступность сервера
  const serverAvailable = getServerStatus();
  if (serverAvailable === false) {
    showErrorNotification("Сервер недоступен. Сохранение конфигурации невозможно в демо-режиме.");
    return;
  }

  try {
    const name =
      document.getElementById("configName").value ||
      "Конфигурация " + new Date().toLocaleDateString();

    await sendRequest("http://localhost:3000/market/configurator/save", {
      method: "POST",
      body: JSON.stringify({
        rooms: rooms,
        name: name,
      }),
    });

    showSuccessNotification("Конфигурация сохранена успешно!");
  } catch (error) {
    console.error("Ошибка сохранения конфигурации:", error);
    showErrorNotification("Ошибка сохранения конфигурации");
  }
}

async function loadSavedConfigurations() {
  // Проверяем доступность сервера
  const serverAvailable = getServerStatus();
  if (serverAvailable === false) {
    showErrorNotification("Сервер недоступен. Загрузка сохраненных конфигураций невозможна в демо-режиме.");
    return;
  }

  try {
    const response = await sendRequest(
      "http://localhost:3000/market/configurator/list",
      {
        method: "GET",
      }
    );

    // Извлекаем массив конфигураций из ответа
    const configs = response.configurations || response || [];

    const card = document.getElementById("savedConfigsCard");
    const list = document.getElementById("savedConfigsList");

    if (!Array.isArray(configs) || configs.length === 0) {
      list.innerHTML = '<p class="text-muted">Нет сохраненных конфигураций</p>';
    } else {
      list.innerHTML = configs
        .map(
          (config) => `
                <div class="mb-2 p-2 border rounded">
                    <strong>${config.name || "Без названия"}</strong><br>
                    <small>${formatCurrency(config.totalPrice)} | ${new Date(
            config.createdAt
          ).toLocaleDateString()}</small><br>
                    <button class="btn btn-sm btn-primary mt-1" onclick="loadConfiguration(${
                      config.id
                    })">Загрузить</button>
                    <button class="btn btn-sm btn-danger mt-1" onclick="deleteConfiguration(${
                      config.id
                    })">Удалить</button>
                </div>
            `
        )
        .join("");
    }

    card.style.display = "block";
  } catch (error) {
    console.error("Ошибка загрузки конфигураций:", error);
    showErrorNotification("Ошибка загрузки сохраненных конфигураций");
  }
}

window.loadConfiguration = async function (configId) {
  // Проверяем доступность сервера
  const serverAvailable = getServerStatus();
  if (serverAvailable === false) {
    showErrorNotification("Сервер недоступен. Загрузка конфигурации невозможна в демо-режиме.");
    return;
  }

  try {
    const response = await sendRequest(
      "http://localhost:3000/market/configurator/list",
      {
        method: "GET",
      }
    );

    // Извлекаем массив конфигураций из ответа
    const configs = response.configurations || response || [];

    const config = Array.isArray(configs)
      ? configs.find((c) => c.id === configId)
      : null;
    if (config) {
      rooms = config.rooms.map((room, index) => ({
        ...room,
        id: Date.now() + index,
        name: room.name || `Комната ${index + 1}`,
      }));
      document.getElementById("configName").value = config.name || "";
      renderRooms();
      updateStats();
      showSuccessNotification("Конфигурация загружена!");
    }
  } catch (error) {
    console.error("Ошибка загрузки конфигурации:", error);
    showErrorNotification("Ошибка загрузки конфигурации");
  }
};

window.deleteConfiguration = async function (configId) {
  // Проверяем доступность сервера
  const serverAvailable = getServerStatus();
  if (serverAvailable === false) {
    showErrorNotification("Сервер недоступен. Удаление конфигурации невозможно в демо-режиме.");
    return;
  }

  try {
    await sendRequest(
      `http://localhost:3000/market/configurator/delete?id=${configId}`,
      {
        method: "DELETE",
      }
    );

    showSuccessNotification("Конфигурация удалена");
    loadSavedConfigurations();
  } catch (error) {
    console.error("Ошибка удаления конфигурации:", error);
    showErrorNotification("Ошибка удаления конфигурации");
  }
};

async function createOrder() {
  if (rooms.length === 0) {
    showErrorNotification("Добавьте хотя бы одну комнату с продуктами");
    return;
  }

  // Проверяем доступность сервера
  const serverAvailable = getServerStatus();
  if (serverAvailable === false) {
    showErrorNotification("Сервер недоступен. Создание заказа невозможно в демо-режиме.");
    return;
  }

  // Здесь можно создать заказ из конфигурации
  // Пока просто показываем сообщение
  showSuccessNotification(
    "Функция создания заказа из конфигурации будет реализована"
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(value);
}
