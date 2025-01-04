document.addEventListener('DOMContentLoaded', () => {
    const projectsList = document.getElementById('projectsList');

    // Пример данных для проектов
    const projects = [
        { id: 1, name: 'Проект 1', description: 'Описание проекта 1' },
        { id: 2, name: 'Проект 2', description: 'Описание проекта 2' }
    ];

    // Функция для рендеринга проектов
    function renderProjects() {
        projectsList.innerHTML = projects.map(project => `
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${project.name}</h5>
                        <p class="card-text">${project.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderProjects();  // Рендерим проекты
});
