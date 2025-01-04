import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

const customersPerPage = 15;
let currentCustomerId = null;
let customers = [];

export function initializeCustomersModule() {
    console.log('Инициализация модуля управления заказчиками');
    bindEventListeners();
    loadCustomers();
}

function bindEventListeners() {
    const addCustomerButton = document.getElementById('showAddCustomerBtn');
    if (addCustomerButton) {
        addCustomerButton.addEventListener('click', () => {
            toggleVisibility('customerForm', true);
            toggleVisibility('showAddCustomerBtn', false);
            clearCustomerForm();
        });
    }

    const saveCustomerButton = document.getElementById('saveCustomerBtn');
    if (saveCustomerButton) {
        saveCustomerButton.addEventListener('click', () => {
            saveCustomer();
        });
    }
}

function toggleVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerDescription').value = '';
    document.getElementById('customerImage').value = '';
    currentCustomerId = null;
}

async function saveCustomer() {
    const name = document.getElementById('customerName').value;
    const description = document.getElementById('customerDescription').value;
    const image = document.getElementById('customerImage').value;

    const newCustomer = { name, description, logo: image };

    try {
        const response = await sendRequest('http://localhost:3000/portfolio/customer/create', {
            method: 'POST',
            body: JSON.stringify(newCustomer),
        });

        if (response) {
            console.log('Заказчик добавлен успешно');
            toggleVisibility('customerForm', false);
            toggleVisibility('showAddCustomerBtn', true);
            loadCustomers();
        } else {
            console.error('Ошибка при добавлении заказчика:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при добавлении заказчика:', error);
    }
}

async function deleteCustomer(customerId) {
    try {
        const response = await sendRequest(`http://localhost:3000/portfolio/customer?id=${customerId}`, {
            method: 'DELETE',
        });

        if (response) {
            console.log('Заказчик удален успешно');
            loadCustomers(1); // Перезагружаем список лотов
        } else {
            console.error('Ошибка при удалении заказчика:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при удалении заказчика:', error);
    }
}

async function loadCustomers(page = 1) {
    const requestData = { page: { size: customersPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/portfolio/customer/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        customers = data.customers;
        const totalPages = Math.ceil(data.total / customersPerPage);

        const customersTable = document.getElementById('customersTable');
        customersTable.innerHTML = `
            <table class="table">
                <thead><tr><th>ID</th><th>Название</th><th>Описание</th><th>Логотип</th><th>Действия</th></tr></thead>
                <tbody id="customersTableBody">
                    ${customers.map(customer => `
                        <tr data-customer-id="${customer.id}">
                            <td>${customer.id}</td>
                            <td>${customer.name}</td>
                            <td>${customer.description}</td>
                            <td><img src="${customer.logo}" alt="${customer.logo}" width="50"></td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-customer-btn">Редактировать</button>
                                <button class="btn btn-danger btn-sm delete-customer-btn">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Привязываем события к кнопкам
        document.querySelectorAll('.delete-customer-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerId = e.target.closest('tr').dataset.customerId;
                deleteCustomer(customerId);
            });
        });

        document.querySelectorAll('.edit-customer-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerId = e.target.closest('tr').dataset.customerId;
                showEditCustomerModal(customerId); // Функция редактирования
            });
        });

        loadPagination('customersPagination', page, totalPages, loadCustomers);
    } catch (error) {
        console.error('Ошибка при загрузке заказчиков:', error);
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

async function showEditCustomerModal(customerId) {
    const customerData = customers.find(customer => customer.id === Number(customerId));
    if (!customerData) {
        console.error(`Заказчик с ID ${customerId} не найден в памяти.`);
        throw new Error(`Заказчик с ID ${customerId} не найден.`);
    }

    // Заполнение полей модального окна
    document.getElementById('editCustomerName').value = customerData.name || '';
    document.getElementById('editCustomerDescription').value = customerData.description || '';
    document.getElementById('editCustomerImage').value = customerData.logo || '';

    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    modal.show();

    // Сохраняем текущий ID лота для использования при сохранении изменений
    currentCustomerId = +customerId;
}

document.getElementById('saveEditedCustomerBtn').addEventListener('click', async () => {
    const name = document.getElementById('editCustomerName').value;
    const description = document.getElementById('editCustomerDescription').value;
    const image = document.getElementById('editCustomerImage').value;

    // Если продукты изменились, создаем объект для отправки
    const updatedCustomer = {
        id: currentCustomerId,
        name,
        description,
        logo: image,
    };

    try {
        const response = await sendRequest('http://localhost:3000/portfolio/customer/update', {
            method: 'PATCH',
            body: JSON.stringify(updatedCustomer),
        });

        if (response) {
            console.log('Заказчик обновлен успешно');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
            modal.hide();
            loadCustomers(); // Перезагружаем список заказчиков
        } else {
            console.error('Ошибка при обновлении заказчика:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении заказчика:', error);
    }
});
