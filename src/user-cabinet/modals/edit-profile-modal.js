// /smart-home-frontend/src/user-cabinet/modals/edit-profile-modal.js
import { getUserData } from '/smart-home-frontend/src/utils/user-data.js';
import { checkUserAuthentication } from '/smart-home-frontend/src/navbar/navbar.js';
import { showErrorNotification, showSuccessNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';
import { getCookie } from '/smart-home-frontend/src/js/cookies.js';

export function openEditProfileModal() {
    const userData = getUserData();  // Получаем данные пользователя

    // Заполняем форму текущими данными пользователя
    document.getElementById('firstName').value = userData.firstName;
    document.getElementById('lastName').value = userData.lastName;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone;
    document.getElementById('address').value = userData.address;

    // Убедитесь, что элемент существует
    const modalElement = document.getElementById('editProfileModal');
    if (!modalElement) {
        console.error('Modal element not found!');
        return;
    }

    // Показываем модалку
    const editModal = new bootstrap.Modal(modalElement);
    editModal.show();

    // Обработчик отправки формы
    document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        // Получаем обновленные данные из формы
        const updatedData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
        };

        try {
            const token = getCookie('token');
            const response = await fetch('http://localhost:3000/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const updatedUser = await response.json();

                // Обновляем данные в sessionStorage
                sessionStorage.setItem('user', JSON.stringify(updatedUser));

                // Обновляем данные на странице (cabinet.html)
                document.getElementById('userName').textContent = `${updatedUser.firstName} ${updatedUser.lastName}`;
                document.getElementById('userEmail').textContent = `Email: ${updatedUser.email}`;
                document.getElementById('userPhone').textContent = `Телефон: ${updatedUser.phone}`;
                document.getElementById('userAddress').textContent = `Адрес: ${updatedUser.address}`;

                // Закрываем модалку
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                editModal.hide();

                showSuccessNotification('Данные успешно обновлены!');
                // Перерисовываем Navbar
                checkUserAuthentication();
            } else {
                showErrorNotification('Не удалось обновить данные');
            }
        } catch (error) {
            console.error(error);
            showErrorNotification('Ошибка при обновлении данных');
        }
    });
}
