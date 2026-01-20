/**
 * Main Cart - Funcionalidades de carrinho para a página principal
 * VERSÃO DECORATIVA: Carrinho apenas visual, sem contabilização
 */
(function() {
    'use strict';

    // Aguarda o DOM estar pronto
    document.addEventListener('DOMContentLoaded', function() {
        initCartFunctionality();
    });

    /**
     * Função para obter a cor atualmente selecionada no DOM
     */
    function getSelectedColorFromDOM() {
        const selectedColorNameEl = document.getElementById('selectedColorName');
        if (selectedColorNameEl && selectedColorNameEl.innerText) {
            const cor = selectedColorNameEl.innerText.trim();
            if (cor && cor !== '') {
                return cor;
            }
        }
        
        const selectedBtn = document.querySelector('.color-btn.selected');
        if (selectedBtn) {
            const dataColor = selectedBtn.getAttribute('data-color') || selectedBtn.dataset.color;
            if (dataColor) return dataColor;
        }
        
        if (typeof window.selectedColor !== 'undefined' && window.selectedColor) {
            return window.selectedColor;
        }
        
        return 'Preto';
    }

    function initCartFunctionality() {
        // Inicializa o carrinho com valor fixo decorativo
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = '1';
            cartCountEl.style.display = 'block';
        }

        // Sobrescreve função de adicionar ao carrinho - APENAS VISUAL
        window.adicionarAoCarrinho = function(event) {
            event.preventDefault();

            const cor = getSelectedColorFromDOM();
            
            // Salva cor selecionada para checkout
            if (typeof salvarCorSelecionada === 'function') {
                salvarCorSelecionada();
            }

            // Anima o ícone do carrinho (apenas visual)
            const cartContainer = document.querySelector('.cart-container');
            if (cartContainer) {
                cartContainer.classList.add('cart-animating');
                setTimeout(() => cartContainer.classList.remove('cart-animating'), 300);
            }

            // Feedback visual no botão
            const btn = event.currentTarget;
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
            btn.style.backgroundColor = '#dff0d8';
            btn.style.borderColor = '#d6e9c6';
            btn.style.color = '#3c763d';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        };

        // Sobrescreve função de iniciar compra
        window.iniciarCompra = function() {
            const cor = getSelectedColorFromDOM();
            
            if (typeof salvarCorSelecionada === 'function') {
                salvarCorSelecionada();
            }

            // Dispara evento do Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'InitiateCheckout');
            }

            // Redireciona para a página de endereço
            window.location.href = 'https://pay.yampi.com.br/r/TQL4LAMM2Q';
        };

        // Função decorativa - não atualiza mais o badge
        window.updateCartBadge = function() {
            // Mantém valor fixo decorativo
            const cartCountEl = document.querySelector('.cart-count');
            if (cartCountEl) {
                cartCountEl.textContent = '1';
                cartCountEl.style.display = 'block';
            }
        };
    }
})();
