import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

const productsPerPage = 100;
const lotsPerPage = 15;
let currentLotId = null;
let lots = [];

export function initializeLotsModule() {
    console.log('Инициализация модуля управления услугами');
    bindEventListeners();
    loadLots();
}

function bindEventListeners() {
    const addLotButton = document.getElementById('showAddLotBtn');
    if (addLotButton) {
        addLotButton.addEventListener('click', () => {
            toggleVisibility('lotForm', true);
            toggleVisibility('showAddLotBtn', false);
            clearLotForm();
            loadProducts('lotProducts'); // Загружаем продукты в форму добавления
        });
    }

    const saveLotButton = document.getElementById('saveLotBtn');
    if (saveLotButton) {
        saveLotButton.addEventListener('click', () => {
            saveLot();
        });
    }
}

function toggleVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

function clearLotForm() {
    document.getElementById('lotName').value = '';
    document.getElementById('lotShortDescription').value = '';
    document.getElementById('lotDescription').value = '';
    document.getElementById('lotImage').value = '';
    document.getElementById('lotProducts').innerHTML = '';
    currentLotId = null;
}

async function saveLot() {
    const name = document.getElementById('lotName').value;
    const shortDescription = document.getElementById('lotShortDescription').value;
    const description = document.getElementById('lotDescription').value;
    const image = document.getElementById('lotImage').value;
    const products = Array.from(document.getElementById('lotProducts').selectedOptions).map(option => parseInt(option.value));
    const type = document.getElementById('lotType').value; // Получаем выбранный тип

    const newLot = { name, shortDescription, description, image, productsIds: products, type };

    try {
        const response = await sendRequest('http://localhost:3000/market/lot/create', {
            method: 'POST',
            body: JSON.stringify(newLot),
        });

        if (response) {
            console.log('Лот добавлен успешно');
            toggleVisibility('lotForm', false);
            toggleVisibility('showAddLotBtn', true);
            loadLots();
        } else {
            console.error('Ошибка при добавлении лота:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при добавлении лота:', error);
    }
}

async function deleteLot(lotId) {
    try {
        const response = await sendRequest(`http://localhost:3000/market/lot?id=${lotId}`, {
            method: 'DELETE',
        });

        if (response) {
            console.log('Лот удален успешно');
            loadLots(1); // Перезагружаем список лотов
        } else {
            console.error('Ошибка при удалении лота:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при удалении лота:', error);
    }
}

async function loadLots(page = 1) {
    const requestData = { page: { size: lotsPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/market/lot/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        lots = data.lots;
        const totalPages = Math.ceil(data.total / lotsPerPage);

        const lotsTable = document.getElementById('lotsTable');
        lotsTable.innerHTML = `
            <table class="table">
                <thead><tr><th>Название</th><th>Тип</th><th>Описание</th><th>Цена</th><th>Изображение</th><th>Продукты</th><th>Действия</th></tr></thead>
                <tbody id="lotsTableBody">
                    ${lots.map(lot => `
                        <tr data-lot-id="${lot.id}">
                            <td>${lot.name}</td>
                            <td>${lot.type}</td>
                            <td>${lot.shortDescription}</td>
                            <td>${lot.price}</td>
                            <td><img src="${lot.image}" alt="${lot.name}" width="50"></td>
                            <td>${lot.products.map(p => p.name).join(', ')}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-lot-btn">Редактировать</button>
                                <button class="btn btn-danger btn-sm delete-lot-btn">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Привязываем события к кнопкам
        document.querySelectorAll('.delete-lot-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const lotId = e.target.closest('tr').dataset.lotId;
                deleteLot(lotId);
            });
        });

        document.querySelectorAll('.edit-lot-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const lotId = e.target.closest('tr').dataset.lotId;
                showEditLotModal(lotId); // Функция редактирования
            });
        });

        loadPagination('lotsPagination', page, totalPages, loadLots);
    } catch (error) {
        console.error('Ошибка при загрузке лотов:', error);
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

async function loadProducts(selectElementId) {
    const requestData = { page: { size: 100, number: 1 } };

    try {
        const data = await sendRequest('http://localhost:3000/market/product/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const products = data.products;
        const selectElement = document.getElementById(selectElementId);

        if (selectElement) {
            selectElement.innerHTML = ''; // Очищаем текущие опции
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
    }
}

async function showEditLotModal(lotId) {
    const lotData = lots.find(lot => lot.id === Number(lotId));
    if (!lotData) {
        console.error(`Лот с ID ${lotId} не найден в памяти.`);
        throw new Error(`Лот с ID ${lotId} не найден.`);
    }

    // Заполнение полей модального окна
    document.getElementById('editLotName').value = lotData.name || '';
    document.getElementById('editLotShortDescription').value = lotData.shortDescription || '';
    document.getElementById('editLotDescription').value = lotData.description || '';
    document.getElementById('editLotImage').value = lotData.image || '';

    // Получаем список выбранных продуктов (если это массив)
    const productsIds = Array.isArray(lotData.productsIds) ? lotData.productsIds : [];

    // Подгружаем продукты
    await loadProducts('editLotProducts');

    // Заполняем продукты в модалке, подсвечивая те, которые уже выбраны
    const editLotProducts = document.getElementById('editLotProducts');
    Array.from(editLotProducts.options).forEach(option => {
        // Если продукт выбран, подсвечиваем его
        option.selected = productsIds.includes(Number(option.value));
    });

    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('editLotModal'));
    modal.show();

    // Сохраняем текущий ID лота для использования при сохранении изменений
    currentLotId = +lotId;
}

document.getElementById('saveEditedLotBtn').addEventListener('click', async () => {
    const name = document.getElementById('editLotName').value;
    const shortDescription = document.getElementById('editLotShortDescription').value;
    const description = document.getElementById('editLotDescription').value;
    const image = document.getElementById('editLotImage').value;
    const productsSelect = document.getElementById('editLotProducts');
    const selectedProducts = Array.from(productsSelect.selectedOptions).map(option => option.value);

    // Получаем текущие выбранные продукты для лота
    const previousSelectedProducts = lots.find(lot => lot.id === currentLotId).productsIds;

    // Сравниваем текущие и старые выбранные продукты
    const productsChanged = !arraysEqual(previousSelectedProducts, selectedProducts.map(Number));

    // Если продукты изменились, создаем объект для отправки
    const updatedLot = {
        id: currentLotId,
        name,
        shortDescription,
        description,
        image,
        ...(productsChanged && { productsIds: selectedProducts.map(Number) }), // Отправляем продукты только если они изменились
    };

    try {
        const response = await sendRequest('http://localhost:3000/market/lot/update', {
            method: 'PATCH',
            body: JSON.stringify(updatedLot),
        });

        if (response) {
            console.log('Лот обновлен успешно');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editLotModal'));
            modal.hide();
            loadLots(); // Перезагружаем список лотов
        } else {
            console.error('Ошибка при обновлении лота:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении лота:', error);
    }
});

// Функция для сравнения двух массивов
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
}
