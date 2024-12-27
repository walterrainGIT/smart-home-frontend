// Динамическая загрузка панели навигации
document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar-container");

    if (navbarContainer) {
        fetch("navbar.html")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((html) => {
                navbarContainer.innerHTML = html;
            })
            .catch((error) => {
                console.error("Не удалось загрузить панель навигации:", error);
            });
    }
});
