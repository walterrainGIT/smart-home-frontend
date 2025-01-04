import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

const productsPerPage = 15;
let currentProductId = null;
let products = [];

export function initializeProductsModule() {
    console.log('Инициализация модуля управления услугами');
    bindEventListeners();
    loadProducts();
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

    const saveProductButton = document.getElementById('saveProductBtn');
    if (saveProductButton) {
        saveProductButton.addEventListener('click', () => {
            saveProduct();
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
    document.getElementById('productProducts').innerHTML = '';
    currentProductId = null;
}

async function saveProduct() {
    const name = document.getElementById('productName').value;
    const shortDescription = document.getElementById('productShortDescription').value;
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    const price = document.getElementById('productPrice').value;

    const newProduct = { name, shortDescription, description, image, price };

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

async function deleteProduct(productId) {
    try {
        const response = await sendRequest(`http://localhost:3000/market/product?id=${productId}`, {
            method: 'DELETE',
        });

        if (response) {
            console.log('Прдукт удален успешно');
            loadProducts(1); // Перезагружаем список лотов
        } else {
            console.error('Ошибка при удалении продукта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
    }
}

async function loadProducts(page = 1) {
    const requestData = { page: { size: productsPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/market/product/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        products = data.products;
        const totalPages = Math.ceil(data.total / productsPerPage);

        const productsTable = document.getElementById('productsTable');
        productsTable.innerHTML = `
            <table class="table">
                <thead><tr><th>ID</th><th>Название</th><th>Описание</th><th>Цена</th><th>Изображение</th><th>Действия</th></tr></thead>
                <tbody id="productsTableBody">
                    ${products.map(product => `
                        <tr data-product-id="${product.id}">
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>${product.shortDescription}</td>
                            <td>${product.price}</td>
                            <td><img src="${product.image}" alt="${product.name}" width="50"></td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-product-btn">Редактировать</button>
                                <button class="btn btn-danger btn-sm delete-product-btn">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Привязываем события к кнопкам
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('tr').dataset.productId;
                deleteProduct(productId);
            });
        });

        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('tr').dataset.productId;
                showEditProductModal(productId); // Функция редактирования
            });
        });

        loadPagination('productsPagination', page, totalPages, loadProducts);
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
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

async function showEditProductModal(productId) {
    const productData = products.find(product => product.id === Number(productId));
    if (!productData) {
        console.error(`Продукт с ID ${productId} не найден в памяти.`);
        throw new Error(`Продукт с ID ${productId} не найден.`);
    }

    // Заполнение полей модального окна
    document.getElementById('editProductName').value = productData.name || '';
    document.getElementById('editProductShortDescription').value = productData.shortDescription || '';
    document.getElementById('editProductDescription').value = productData.description || '';
    document.getElementById('editProductImage').value = productData.image || '';
    document.getElementById('editProductPrice').value = productData.price || '';

    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();

    // Сохраняем текущий ID лота для использования при сохранении изменений
    currentProductId = +productId;
}

document.getElementById('saveEditedProductBtn').addEventListener('click', async () => {
    const name = document.getElementById('editProductName').value;
    const shortDescription = document.getElementById('editProductShortDescription').value;
    const description = document.getElementById('editProductDescription').value;
    const image = document.getElementById('editProductImage').value;
    const price = document.getElementById('editProductPrice').value;

    // Если продукты изменились, создаем объект для отправки
    const updatedProduct = {
        id: currentProductId,
        name,
        shortDescription,
        description,
        image,
        price,
    };

    try {
        const response = await sendRequest('http://localhost:3000/market/product/update', {
            method: 'PATCH',
            body: JSON.stringify(updatedProduct),
        });

        if (response) {
            console.log('Продукт обновлен успешно');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            modal.hide();
            loadProducts(); // Перезагружаем список лотов
        } else {
            console.error('Ошибка при обновлении продукта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
    }
});
