import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

// Основные контейнеры
const projectListContainer = document.getElementById('projectList');
const carouselImagesContainer = document.getElementById('carouselImages');
const projectName = document.getElementById('projectName');
const projectDescription = document.getElementById('projectDescription');
const customerName = document.getElementById('customerName');
const customerDescription = document.getElementById('customerDescription');
const customerLogo = document.getElementById('customerLogo');

// Функция загрузки данных портфолио
async function loadPortfolios() {
    const requestData = {
        page: {
            size: 10, // Задаём количество проектов на запрос
            number: 1,
        },
    };

    try {
        const response = await sendRequest('http://localhost:3000/portfolio/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const portfolios = response.portfolios;
        renderProjectList(portfolios);
        if (portfolios.length > 0) {
            updateSelectedProject(portfolios[0]);
        }
    } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
    }
}

// Функция отрисовки списка проектов
function renderProjectList(portfolios) {
    projectListContainer.innerHTML = '';

    portfolios.forEach(portfolio => {
        const projectItem = document.createElement('li');
        projectItem.className = 'list-group-item list-group-item-action';
        projectItem.textContent = portfolio.name;
        projectItem.addEventListener('click', () => updateSelectedProject(portfolio));
        projectListContainer.appendChild(projectItem);
    });
}

// Функция обновления выбранного проекта
function updateSelectedProject(portfolio) {
    // Обновление карусели изображений
    carouselImagesContainer.innerHTML = portfolio.images.map((image, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${image}" class="d-block w-100" alt="Project Image">
        </div>
    `).join('');

    // Обновление информации о проекте
    projectName.textContent = portfolio.name;
    projectDescription.textContent = portfolio.description;

    // Обновление данных заказчика
    customerName.textContent = portfolio.customer.name;
    customerDescription.textContent = portfolio.customer.description;
    if (portfolio.customer.logo) {
        customerLogo.src = portfolio.customer.logo;
        customerLogo.classList.remove('d-none');
    } else {
        customerLogo.classList.add('d-none');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolios();
});
