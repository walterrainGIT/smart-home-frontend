document.addEventListener('DOMContentLoaded', () => {
    const servicesTab = document.getElementById('servicesTab');
    const projectsTab = document.getElementById('projectsTab');
    const ordersTab = document.getElementById('ordersTab');

    const tabContentContainer = document.getElementById('tabContentContainer');

    // Функция для загрузки контента в зависимости от выбранной вкладки
    function loadTabContent(tab) {
        tabContentContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой нового содержимого

        switch(tab) {
            case 'services':
                loadModule('/smart-home-frontend/src/admin-panel/services/services.html', '/smart-home-frontend/src/admin-panel/services/services.js');
                break;

            case 'projects':
                loadModule('/smart-home-frontend/src/admin-panel/projects/projects.html', '/smart-home-frontend/src/admin-panel/projects/projects.js');
                break;

            case 'orders':
                loadModule('/smart-home-frontend/src/admin-panel/orders/orders.html', '/smart-home-frontend/src/admin-panel/orders/orders.js');
                break;

            default:
                console.error(`Неизвестная вкладка: ${tab}`);
        }
    }

    // Функция для загрузки модуля (HTML + JS)
    function loadModule(htmlUrl, jsUrl) {
        fetch(htmlUrl)
            .then(response => response.text())
            .then(html => {
                tabContentContainer.innerHTML = html;

                // Загружаем и инициализируем скрипты для модуля
                import(jsUrl)
                    .then(module => {
                        if (module.initialize) {
                            module.initialize(); // Инициализация после вставки HTML
                        }
                    })
                    .catch(err => console.error(`Ошибка при импорте скрипта: ${err}`));
            })
            .catch(err => console.error('Ошибка при загрузке HTML:', err));
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
