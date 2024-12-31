// toast-notifications.js

// Функция для создания уведомлений
function createToast(message, isSuccess = true) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', 'align-items-center', 'border-0', 'mb-3');
    if (isSuccess) {
        toast.classList.add('bg-success', 'text-white');
    } else {
        toast.classList.add('bg-danger', 'text-white');
    }

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Инициализация и показ уведомления
    const toastInstance = new bootstrap.Toast(toast);
    toastInstance.show();

    // Удаление уведомления через несколько секунд
    setTimeout(() => {
        toastContainer.removeChild(toast);
    }, 5000); // Уведомление исчезает через 5 секунд
}

// Функция для показа уведомлений об ошибке
export function showErrorNotification(message) {
    createToast(message, false);  // false означает, что это ошибка
}

// Функция для показа успешных уведомлений
export function showSuccessNotification(message) {
    createToast(message, true);   // true означает, что это успех
}
