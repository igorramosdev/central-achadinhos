/**
 * ========================================
 * NOTIFICATION-MODULE.JS
 * ========================================
 * Sistema de notificações de compras
 * Exibe popups simulando compras recentes
 */

(function() {
    'use strict';

    const names = [
        'Fernando', 'Maria', 'João', 'Ana', 'Carlos', 'Juliana', 
        'Pedro', 'Camila', 'Lucas', 'Beatriz', 'Rafael', 'Larissa',
        'Gustavo', 'Mariana', 'Bruno', 'Patricia', 'Diego', 'Amanda'
    ];

    const cities = [
        'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
        'Curitiba, PR', 'Porto Alegre, RS', 'Salvador, BA',
        'Brasília, DF', 'Fortaleza, CE', 'Recife, PE', 'Manaus, AM',
        'Goiânia, GO', 'Campinas, SP', 'Florianópolis, SC', 'Vitória, ES'
    ];

    const images = [
        'images/blackview-preto.webp',
        'images/blackview-verde.webp',
        'images/blackview-laranja.webp'
    ];

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function showNotification() {
        const popup = document.getElementById('notify-popup');
        const nameEl = document.getElementById('n-name');
        const cityEl = document.getElementById('n-city');
        const imgEl = document.getElementById('n-img');

        if (!popup || !nameEl || !cityEl || !imgEl) return;

        nameEl.textContent = getRandomItem(names);
        cityEl.textContent = getRandomItem(cities);
        imgEl.src = getRandomItem(images);

        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 5000);
    }

    // Primeira notificação após 8 segundos
    setTimeout(showNotification, 8000);

    // Notificações a cada 25-45 segundos
    setInterval(() => {
        const delay = Math.random() * 20000 + 25000;
        setTimeout(showNotification, delay);
    }, 45000);

})();
