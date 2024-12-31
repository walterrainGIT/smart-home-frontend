// Функция для отображения индикатора загрузки
export function showLoader() {
    const loader = document.getElementById('loading');

    if (loader) {
        loader.style.display = 'block';  // Показываем индикатор
    }
}

// Функция для скрытия индикатора загрузки
export function hideLoader() {
    const loader = document.getElementById('loading');

    if (loader) {
        loader.style.display = 'none';  // Скрываем индикатор
    }
}
