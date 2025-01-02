document.addEventListener('DOMContentLoaded', () => {
    const servicesTab = document.getElementById('servicesTab');
    const projectsTab = document.getElementById('projectsTab');
    const ordersTab = document.getElementById('ordersTab');

    const tabContentContainer = document.getElementById('tabContentContainer');

    // Функция для загрузки контента в зависимости от выбранной вкладки
    function loadTabContent(tab) {
        // Очищаем контейнер
        tabContentContainer.innerHTML = '';

        // Загружаем соответствующий HTML в контейнер
        switch(tab) {
            case 'services':
                fetch('/smart-home-frontend/src/admin-panel/services/services.html')
                    .then(response => response.text())
                    .then(html => {
                        tabContentContainer.innerHTML = html;
                        import('/smart-home-frontend/src/admin-panel/services/services.js');
                    });
                break;
            case 'projects':
                fetch('/smart-home-frontend/src/admin-panel/projects/projects.html')
                    .then(response => response.text())
                    .then(html => {
                        tabContentContainer.innerHTML = html;
                        import('/smart-home-frontend/src/admin-panel/projects/projects.js');
                    });
                break;
            case 'orders':
                fetch('/smart-home-frontend/src/admin-panel/orders/orders.html')
                    .then(response => response.text())
                    .then(html => {
                        tabContentContainer.innerHTML = html;
                        import('/smart-home-frontend/src/admin-panel/orders/orders.js');
                    });
                break;
        }
    }

    // Инициализация - загружаем вкладку "Услуги" по умолчанию
    loadTabContent('services');

    // Обработчики кликов по вкладкам
    servicesTab.addEventListener('click', () => {
        loadTabContent('services');
    });

    projectsTab.addEventListener('click', () => {
        loadTabContent('projects');
    });

    ordersTab.addEventListener('click', () => {
        loadTabContent('orders');
    });
});
