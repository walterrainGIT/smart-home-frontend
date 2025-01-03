import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

const productsPerPage = 15;
const lotsPerPage = 15;
let currentProductId = null;
let currentLotId = null;

export function initializeServicesModule() {
    console.log('Инициализация модуля управления услугами');
    bindEventListeners();
    loadProducts();
    loadLots();
}

function bindEventListeners() {
    const addProductButton = document.getElementById('showAddProductBtn');
    if (addProductButton) {
        addProductButton.addEventListener('click', () => {
            toggleVisibility('productForm', true);
            toggleVisibility('showAddProductBtn', false);
            clearProductForm();
        });
    }

    const addLotButton = document.getElementById('showAddLotBtn');
    if (addLotButton) {
        addLotButton.addEventListener('click', () => {
            toggleVisibility('lotForm', true);
            toggleVisibility('showAddLotBtn', false);
            clearLotForm();
        });
    }

    // Обработчик для кнопки "Сохранить" продукт
    const saveProductButton = document.getElementById('saveProductBtn');
    if (saveProductButton) {
        saveProductButton.addEventListener('click', () => {
            if (currentProductId) {
                updateProduct(currentProductId);
            } else {
                saveProduct();
            }
        });
    }

    // Обработчик для кнопки "Сохранить" лот
    const saveLotButton = document.getElementById('saveLotBtn');
    if (saveLotButton) {
        saveLotButton.addEventListener('click', () => {
            if (currentLotId) {
                updateLot(currentLotId);
            } else {
                saveLot();
            }
        });
    }
}

function toggleVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productShortDescription').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productPrice').value = '';
    currentProductId = null;
}

function clearLotForm() {
    document.getElementById('lotName').value = '';
    document.getElementById('lotShortDescription').value = '';
    document.getElementById('lotDescription').value = '';
    document.getElementById('lotImage').value = '';
    document.getElementById('lotProducts').value = '';
    currentLotId = null;
}

async function saveProduct() {
    const name = document.getElementById('productName').value;
    const shortDescription = document.getElementById('productShortDescription').value;
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    const price = document.getElementById('productPrice').value;

    const newProduct = {
        name,
        shortDescription,
        description,
        image,
        price
    };

    try {
        const response = await sendRequest('http://localhost:3000/market/product/create', {
            method: 'POST',
            body: JSON.stringify(newProduct),
        });

        if (response) {
            console.log('Продукт добавлен успешно');
            toggleVisibility('productForm', false);
            toggleVisibility('showAddProductBtn', true);
            loadProducts();
        } else {
            console.error('Ошибка при добавлении продукта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при добавлении продукта:', error);
    }
}

async function saveLot() {
    const name = document.getElementById('lotName').value;
    const shortDescription = document.getElementById('lotShortDescription').value;
    const description = document.getElementById('lotDescription').value;
    const image = document.getElementById('lotImage').value;
    const products = Array.from(document.getElementById('lotProducts').selectedOptions).map(option => option.value);

    const newLot = {
        name,
        shortDescription,
        description,
        image,
        products
    };

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

async function loadPagination(elementId, currentPage, totalPages, onPageChange) {
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

async function loadProducts(page = 1) {
    const requestData = { page: { size: productsPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/market/product/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const products = data.products;
        const totalPages = Math.ceil(data.total / productsPerPage);

        const productsTable = document.getElementById('productsTable');
        productsTable.innerHTML = `
            <table class="table">
                <thead><tr><th>Название</th><th>Описание</th><th>Цена</th><th>Изображение</th><th>Действия</th></tr></thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.shortDescription}</td>
                            <td>${product.price}</td>
                            <td><img src="${product.image}" alt="${product.name}" width="50"></td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">Редактировать</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        loadPagination('productsPagination', page, totalPages, loadProducts);
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
    }
}

async function loadLots(page = 1) {
    const requestData = { page: { size: lotsPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/market/lot/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const lots = data.lots;
        const totalPages = Math.ceil(data.total / lotsPerPage);

        const lotsTable = document.getElementById('lotsTable');
        lotsTable.innerHTML = `
            <table class="table">
                <thead><tr><th>Название</th><th>Описание</th><th>Цена</th><th>Продукты</th><th>Действия</th></tr></thead>
                <tbody>
                    ${lots.map(lot => `
                        <tr>
                            <td>${lot.name}</td>
                            <td>${lot.shortDescription}</td>
                            <td>${lot.price}</td>
                            <td>${lot.products.map(p => p.name).join(', ')}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editLot(${lot.id})">Редактировать</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLot(${lot.id})">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        loadPagination('lotsPagination', page, totalPages, loadLots);
    } catch (error) {
        console.error('Ошибка при загрузке лотов:', error);
    }
}

async function deleteProduct(productId) {
    try {
        const response = await sendRequest(`http://localhost:3000/market/product?id=${productId}`, {
            method: 'DELETE',
        });

        if (response) {
            console.log('Продукт удален успешно');
            loadProducts(1); // Перезагружаем список продуктов
        } else {
            console.error('Ошибка при удалении продукта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
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

async function editProduct(productId) {
    try {
        const product = await sendRequest(`http://localhost:3000/market/product?id=${productId}`, {
            method: 'GET',
        });

        if (product) {
            currentProductId = productId;
            document.getElementById('productName').value = product.name;
            document.getElementById('productShortDescription').value = product.shortDescription;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productPrice').value = product.price;
            toggleVisibility('productForm', true);
            toggleVisibility('showAddProductBtn', false);
        }
    } catch (error) {
        console.error('Ошибка при получении продукта:', error);
    }
}

async function editLot(lotId) {
    try {
        const lot = await sendRequest(`http://localhost:3000/market/lot?id=${lotId}`, {
            method: 'GET',
        });

        if (lot) {
            currentLotId = lotId;
            document.getElementById('lotName').value = lot.name;
            document.getElementById('lotShortDescription').value = lot.shortDescription;
            document.getElementById('lotDescription').value = lot.description;
            document.getElementById('lotImage').value = lot.image;
            // Загрузка продуктов в форму
            const lotProductsSelect = document.getElementById('lotProducts');
            lotProductsSelect.innerHTML = '';
            lot.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                lotProductsSelect.appendChild(option);
            });
            toggleVisibility('lotForm', true);
            toggleVisibility('showAddLotBtn', false);
        }
    } catch (error) {
        console.error('Ошибка при получении лота:', error);
    }
}

async function updateProduct(productId) {
    const name = document.getElementById('productName').value;
    const shortDescription = document.getElementById('productShortDescription').value;
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    const price = document.getElementById('productPrice').value;

    const updatedProduct = {
        name,
        shortDescription,
        description,
        image,
        price
    };

    try {
        const response = await sendRequest(`http://localhost:3000/market/product?id=${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedProduct),
        });

        if (response) {
            console.log('Продукт обновлен успешно');
            toggleVisibility('productForm', false);
            toggleVisibility('showAddProductBtn', true);
            loadProducts();
        } else {
            console.error('Ошибка при обновлении продукта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
    }
}

async function updateLot(lotId) {
    const name = document.getElementById('lotName').value;
    const shortDescription = document.getElementById('lotShortDescription').value;
    const description = document.getElementById('lotDescription').value;
    const image = document.getElementById('lotImage').value;
    const products = Array.from(document.getElementById('lotProducts').selectedOptions).map(option => option.value);

    const updatedLot = {
        name,
        shortDescription,
        description,
        image,
        products
    };

    try {
        const response = await sendRequest(`http://localhost:3000/market/lot?id=${lotId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedLot),
        });

        if (response) {
            console.log('Лот обновлен успешно');
            toggleVisibility('lotForm', false);
            toggleVisibility('showAddLotBtn', true);
            loadLots();
        } else {
            console.error('Ошибка при обновлении лота:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении лота:', error);
    }
}
