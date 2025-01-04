document.addEventListener('DOMContentLoaded', () => {
    const lotsTab = document.getElementById('lotsTab');
    const productsTab = document.getElementById('productsTab');
    const ordersTab = document.getElementById('ordersTab');
    const customersTab = document.getElementById('customersTab');
    const projectsTab = document.getElementById('projectsTab');

    const tabContentContainer = document.getElementById('tabContentContainer');

    // Функция для загрузки контента в зависимости от выбранной вкладки
    function loadTabContent(tab) {
        tabContentContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой нового содержимого

        switch(tab) {
            case 'lots':
                loadModule('/smart-home-frontend/src/admin-panel/lots/lots.html', '/smart-home-frontend/src/admin-panel/lots/lots.js');
                break;
            case 'products':
                loadModule('/smart-home-frontend/src/admin-panel/products/products.html', '/smart-home-frontend/src/admin-panel/products/products.js');
                break;
            case 'orders':
                loadModule('/smart-home-frontend/src/admin-panel/order/order.html', '/smart-home-frontend/src/admin-panel/order/order.js');
                break;
            case 'customers':
                loadModule('/smart-home-frontend/src/admin-panel/customers/customers.html', '/smart-home-frontend/src/admin-panel/customers/customers.js');
                break;
            case 'projects':
                loadModule('/smart-home-frontend/src/admin-panel/projects/projects.html', '/smart-home-frontend/src/admin-panel/projects/projects.js');
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
    loadTabContent('lots');

    // Обработчики кликов по вкладкам
    lotsTab.addEventListener('click', () => {
        loadTabContent('lots');
    });

    // Обработчики кликов по вкладкам
    productsTab.addEventListener('click', () => {
        loadTabContent('products');
    });

    ordersTab.addEventListener('click', () => {
        loadTabContent('orders');
    });

    // Обработчики кликов по вкладкам
    customersTab.addEventListener('click', () => {
        loadTabContent('customers');
    });

    projectsTab.addEventListener('click', () => {
        loadTabContent('projects');
    });
});
