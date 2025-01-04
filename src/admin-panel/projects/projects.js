import { sendRequest } from '/smart-home-frontend/src/utils/request.js';

const productsPerPage = 100;
const projectsPerPage = 15;
let currentProjectId = null;
let projects = [];

export function initializeProjectsModule() {
    console.log('Инициализация модуля управления услугами');
    bindEventListeners();
    loadProjects();
}

function bindEventListeners() {
    const addProjectButton = document.getElementById('showAddProjectBtn');
    if (addProjectButton) {
        addProjectButton.addEventListener('click', () => {
            toggleVisibility('projectForm', true);
            toggleVisibility('showAddProjectBtn', false);
            clearProjectForm();
            loadCustomers('projectCustomer'); // Загружаем продукты в форму добавления
        });
    }

    const saveProjectButton = document.getElementById('saveProjectBtn');
    if (saveProjectButton) {
        saveProjectButton.addEventListener('click', () => {
            saveProject();
        });
    }
}

function toggleVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

function clearProjectForm() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectImages').value = '';
    document.getElementById('projectCustomer').innerHTML = '';
    currentProjectId = null;
}

async function saveProject() {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const images = document.getElementById('projectImages').value.split(',').map(url => url.trim());
    const customer = document.getElementById('projectCustomer').value;

    const newProject = { name, description, images, customerId: +customer, };

    try {
        const response = await sendRequest('http://localhost:3000/portfolio/create', {
            method: 'POST',
            body: JSON.stringify(newProject),
        });

        if (response) {
            console.log('Проект добавлен успешно');
            toggleVisibility('projectForm', false);
            toggleVisibility('showAddProjectBtn', true);
            loadProjects();
        } else {
            console.error('Ошибка при добавлении проекта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при добавлении проекта:', error);
    }
}

async function deleteProject(projectId) {
    try {
        const response = await sendRequest(`http://localhost:3000/portfolio?id=${projectId}`, {
            method: 'DELETE',
        });

        if (response) {
            console.log('Проект удален успешно');
            loadProjects(1); // Перезагружаем список проектов
        } else {
            console.error('Ошибка при удалении проекта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при удалении проекта:', error);
    }
}

async function loadProjects(page = 1) {
    const requestData = { page: { size: projectsPerPage, number: page } };

    try {
        const data = await sendRequest('http://localhost:3000/portfolio/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        projects = data.portfolios;
        const totalPages = Math.ceil(data.total / projectsPerPage);

        const projectsTable = document.getElementById('projectsTable');
        projectsTable.innerHTML = `
            <table class="table">
                <thead><tr><th>ID</th><th>Название</th><th>Описание</th><th>Изображения</th><th>Заказчик</th><th>Действия</th></tr></thead>
                <tbody id="projectsTableBody">
                    ${projects.map(project => `
                        <tr data-project-id="${project.id}">
                            <td>${project.id}</td>
                            <td>${project.name}</td>
                            <td>${project.description}</td>
                            <td>
                                ${project.images.map(imageUrl => `
                                    <img src="${imageUrl}" alt="${project.name}" width="50" style="margin-right: 5px;">
                                `).join('')}
                            </td>
                            <td>${project.customer.name}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-project-btn">Редактировать</button>
                                <button class="btn btn-danger btn-sm delete-project-btn">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Привязываем события к кнопкам
        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = e.target.closest('tr').dataset.projectId;
                deleteProject(projectId);
            });
        });

        document.querySelectorAll('.edit-project-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = e.target.closest('tr').dataset.projectId;
                showEditProjectModal(projectId); // Функция редактирования
            });
        });

        loadPagination('projectsPagination', page, totalPages, loadProjects);
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
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

async function loadCustomers(selectElementId) {
    const requestData = { page: { size: 100, number: 1 } };

    try {
        const data = await sendRequest('http://localhost:3000/portfolio/customer/get', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        const customers = data.customers;
        const selectElement = document.getElementById(selectElementId);

        if (selectElement) {
            selectElement.innerHTML = ''; // Очищаем текущие опции
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке заказчиков:', error);
    }
}

async function showEditProjectModal(projectId) {
    const projectData = projects.find(project => project.id === Number(projectId));
    if (!projectData) {
        console.error(`Проект с ID ${projectId} не найден в памяти.`);
        throw new Error(`Проект с ID ${projectId} не найден.`);
    }

    // Заполнение полей модального окна
    document.getElementById('editProjectName').value = projectData.name || '';
    document.getElementById('editProjectDescription').value = projectData.description || '';
    document.getElementById('editProjectImages').value = projectData.images || '';

    // Получаем ID заказчика для проекта
    const customerId = projectData.customerId || null;

    // Подгружаем список заказчиков
    await loadCustomers('editProjectCustomer', customerId);

    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();

    // Сохраняем текущий ID лота для использования при сохранении изменений
    currentProjectId = +projectId;
}

document.getElementById('saveEditedProjectBtn').addEventListener('click', async () => {
    const name = document.getElementById('editProjectName').value;
    const description = document.getElementById('editProjectDescription').value;
    const imagesInput = document.getElementById('editProjectImages').value;
    const customerSelect = document.getElementById('editProjectCustomer');

    // Преобразуем строку изображений в массив
    const images = imagesInput
        .split(',') // Разделяем по запятой
        .map(img => img.trim()) // Убираем пробелы вокруг каждого URL
        .filter(img => img.length > 0); // Исключаем пустые строки

    // Получаем значение выбранного заказчика (его ID)
    const customerId = +customerSelect.value;

    // Создаем объект для отправки
    const updatedProject = {
        id: currentProjectId,
        name,
        description,
        images, // Отправляем массив
        customerId, // Здесь будет ID выбранного заказчика
    };

    try {
        const response = await sendRequest('http://localhost:3000/portfolio/update', {
            method: 'PATCH',
            body: JSON.stringify(updatedProject),
        });

        if (response) {
            console.log('Проект обновлен успешно');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
            modal.hide();
            loadProjects(); // Перезагружаем список проектов
        } else {
            console.error('Ошибка при обновлении проекта:', response.message);
        }
    } catch (error) {
        console.error('Ошибка при обновлении проекта:', error);
    }
});
