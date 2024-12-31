// notification.js
export class NotificationSystem {
    constructor() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.classList.add('toast-container');
        this.toastContainer.style.position = 'fixed';
        this.toastContainer.style.top = '20px';
        this.toastContainer.style.right = '20px';
        this.toastContainer.style.zIndex = '1050'; // to be above other elements
        document.body.appendChild(this.toastContainer);
    }

    show(message, type = 'danger') {
        const toastElement = document.createElement('div');
        toastElement.classList.add('toast', 'fade', 'show');
        toastElement.classList.add(type === 'danger' ? 'bg-danger' : 'bg-success');
        toastElement.style.minWidth = '250px';

        toastElement.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Уведомление</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        this.toastContainer.appendChild(toastElement);

        // Автоматическое скрытие уведомления через 5 секунд
        setTimeout(() => {
            toastElement.classList.remove('show');
            toastElement.classList.add('hide');
            setTimeout(() => {
                this.toastContainer.removeChild(toastElement);
            }, 300); // wait for fade-out effect
        }, 5000);
    }
}
