import { loadNavbar } from '/smart-home-frontend/src/navbar/navbar.js';
import { showSuccessNotification, showErrorNotification } from '/smart-home-frontend/src/notifications/toast-notifications.js';

const PRICES = {
    basePerSquareMeter: 5000,
    roomBase: 50000,
    options: {
        lighting: 50000,
        security: 80000,
        climate: 70000,
        multimedia: 100000,
        automation: 150000
    },
    levelMultiplier: {
        basic: 0.8,
        standard: 1.0,
        premium: 1.5
    }
};

let calculationData = {
    area: 50,
    rooms: 3,
    options: {
        lighting: true,
        security: true,
        climate: true,
        multimedia: false,
        automation: false
    },
    level: 'standard'
};

export function initializeCalculator() {
    loadNavbar();
    setupEventListeners();
    calculate();
}

function setupEventListeners() {
    document.getElementById('area').addEventListener('input', (e) => {
        calculationData.area = parseInt(e.target.value) || 0;
        calculate();
    });

    document.getElementById('rooms').addEventListener('input', (e) => {
        calculationData.rooms = parseInt(e.target.value) || 0;
        calculate();
    });

    document.getElementById('level').addEventListener('change', (e) => {
        calculationData.level = e.target.value;
        calculate();
    });

    ['lighting', 'security', 'climate', 'multimedia', 'automation'].forEach(option => {
        document.getElementById(option).addEventListener('change', (e) => {
            calculationData.options[option] = e.target.checked;
            calculate();
        });
    });

    document.getElementById('saveCalculation').addEventListener('click', saveCalculation);
}

function calculate() {
    const area = calculationData.area || 0;
    const rooms = calculationData.rooms || 0;
    const level = calculationData.level || 'standard';
    
    // Базовая стоимость за м²
    const basePricePerM2 = PRICES.basePerSquareMeter;
    
    // Стоимость по площади
    const areaPrice = basePricePerM2 * area;
    
    // Стоимость по комнатам
    const roomsPrice = PRICES.roomBase * rooms;
    
    // Стоимость опций
    let optionsPrice = 0;
    Object.keys(calculationData.options).forEach(option => {
        if (calculationData.options[option] && PRICES.options[option]) {
            optionsPrice += PRICES.options[option];
        }
    });
    
    // Множитель уровня комплектации
    const levelMultiplier = PRICES.levelMultiplier[level] || 1.0;
    const levelPrice = (areaPrice + roomsPrice + optionsPrice) * (levelMultiplier - 1);
    
    // Итоговая стоимость
    const totalPrice = (areaPrice + roomsPrice + optionsPrice) * levelMultiplier;
    
    // Обновление UI
    document.getElementById('basePrice').textContent = formatCurrency(basePricePerM2);
    document.getElementById('areaPrice').textContent = formatCurrency(areaPrice);
    document.getElementById('roomsPrice').textContent = formatCurrency(roomsPrice);
    document.getElementById('optionsPrice').textContent = formatCurrency(optionsPrice);
    document.getElementById('levelPrice').textContent = formatCurrency(levelPrice);
    document.getElementById('totalPrice').innerHTML = `<strong>${formatCurrency(totalPrice)}</strong>`;
    
    // Разбивка по категориям
    updateBreakdown({
        areaPrice,
        roomsPrice,
        optionsPrice,
        levelPrice,
        totalPrice
    });
}

function updateBreakdown(prices) {
    const breakdown = document.getElementById('breakdown');
    const items = [
        { label: 'По площади', value: prices.areaPrice },
        { label: 'По комнатам', value: prices.roomsPrice },
        { label: 'Опции', value: prices.optionsPrice },
        { label: 'Уровень комплектации', value: prices.levelPrice }
    ];
    
    breakdown.innerHTML = items.map(item => `
        <div class="breakdown-item">
            <span>${item.label}:</span>
            <span>${formatCurrency(item.value)}</span>
        </div>
    `).join('');
}

function saveCalculation() {
    const calculation = {
        area: calculationData.area,
        rooms: calculationData.rooms,
        options: calculationData.options,
        level: calculationData.level,
        totalPrice: parseFloat(document.getElementById('totalPrice').textContent.replace(/[^\d]/g, '')),
        date: new Date().toISOString()
    };
    
    // Сохранение в localStorage
    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    savedCalculations.push(calculation);
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
    
    showSuccessNotification('Расчет сохранен!');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(value);
}

