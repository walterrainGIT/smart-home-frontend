import { showLoader, hideLoader } from '/smart-home-frontend/src/js/loader.js';  // Импортируем функции для управления лоадером
import { sendRequest } from '/smart-home-frontend/src/utils/request.js';  // Импортируем универсальную функцию для запросов

const pageSize = 50;  // Размер страницы
let currentPage = 1;  // Номер текущей страницы

const servicesContainer = document.getElementById('servicesContainer');  // Контейнер для карточек
let lotsData = [];  // Переменная для хранения данных о лотах

// Функция для получения выбранного типа
const getSelectedType = () => {
    const typeSlider = document.getElementById('typeSlider');
    return typeSlider.value == 0 ? 'product' : 'service';
};

// Обновление метки слайдера
const updateTypeLabel = () => {
    const typeLabel = document.getElementById('typeLabel');
    typeLabel.textContent = getSelectedType() === 'product' ? 'Товар' : 'Услуга';
};

// Обработчик изменения слайдера
const typeSlider = document.getElementById('typeSlider');
typeSlider.addEventListener('input', () => {
    updateTypeLabel();
    currentPage = 1;  // Сбросить номер страницы при изменении типа
    servicesContainer.innerHTML = '';  // Очистить текущие данные
    loadServices();  // Загрузить данные с новым типом
});

// Функция для загрузки услуг (или товаров)
export const loadServices = async () => {
    try {
        showLoader();  // Показываем индикатор загрузки перед запросом

        // Данные для запроса с учетом выбранного типа
        const requestData = {
            types: [getSelectedType()],
            page: {
                size: pageSize,
                number: currentPage
            }
        };

        // Отправляем запрос с использованием универсальной функции
        const data = await sendRequest('http://localhost:3000/market/lot/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        lotsData = data.lots;  // Сохраняем данные лотов в переменную

        // Добавляем новые карточки на страницу
        lotsData.forEach(lot => {
            const cardHTML = `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${lot.image}" class="card-img-top service-img" alt="${lot.name}">
                        <div class="card-body">
                            <h5 class="card-title">${lot.name}</h5>
                            <p class="card-text">${lot.shortDescription}</p>
                            <p class="card-text">Цена: ${lot.price} руб.</p>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#serviceModal" data-lot-id="${lot.id}">
                                Подробнее
                            </button>
                        </div>
                    </div>
                </div>
            `;
            servicesContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        currentPage++;  // Увеличиваем номер страницы для следующего запроса
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    } finally {
        hideLoader();  // Скрываем индикатор загрузки после завершения запроса
    }

    // Добавляем обработчик событий для открытия модалки
    const modalButton = document.querySelectorAll('[data-bs-toggle="modal"]');
    modalButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const lotId = +event.target.getAttribute('data-lot-id');
            openModal(lotId);  // Открываем модалку с данными из lotsData
        });
    });
};

// Функция для открытия модалки
const openModal = (lotId) => {
    const lot = lotsData.find(lot => lot.id === lotId);

    if (lot) {
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const modalDescription = document.getElementById('modalDescription');
        const modalServiceTitle = document.getElementById('serviceModalLabel');

        modalImage.src = lot.image;
        modalImage.classList.add('service-img');
        modalTitle.textContent = lot.shortDescription;
        modalPrice.textContent = `Цена: ${lot.price} руб.`;
        modalDescription.textContent = lot.description;
        modalServiceTitle.textContent = lot.name;

        const productsContainer = document.getElementById('modalProducts');
        productsContainer.innerHTML = '';

        lot.products.forEach(product => {
            const productHTML = `
                <div class="product-card">
                    <img src="${product.image}" class="product-img service-img" alt="${product.name}">
                    <div class="product-info">
                        <h6 class="product-name">${product.name}</h6>
                        <p class="product-description">${product.shortDescription}</p>
                        <p class="product-price">Цена: ${product.price} руб.</p>
                    </div>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    }
};
