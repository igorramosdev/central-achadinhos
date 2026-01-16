/**
 * Main Cart - Funcionalidades de carrinho para a página principal
 * Integra com OrderStore para gerenciamento de estado
 */
(function() {
    'use strict';

    // Aguarda o DOM e OrderStore estarem prontos
    document.addEventListener('DOMContentLoaded', function() {
        initCartFunctionality();
    });

    /**
     * CORREÇÃO PROBLEMA 1: Função para obter a cor atualmente selecionada no DOM
     * Lê diretamente do botão de cor com classe 'selected' ou do texto exibido
     */
    function getSelectedColorFromDOM() {
        // Tenta ler do elemento que exibe a cor selecionada
        const selectedColorNameEl = document.getElementById('selectedColorName');
        if (selectedColorNameEl && selectedColorNameEl.innerText) {
            const cor = selectedColorNameEl.innerText.trim();
            if (cor && cor !== '') {
                return cor;
            }
        }
        
        // Fallback: tenta ler do botão de cor com classe 'selected'
        const selectedBtn = document.querySelector('.color-btn.selected');
        if (selectedBtn) {
            // Preferência: usa data-color do botão selecionado (evita mapeamento incorreto)
            const dataColor = selectedBtn.getAttribute('data-color') || selectedBtn.dataset.color;
            if (dataColor) return dataColor;

            // Verifica data-color ou usa o índice para mapear
            const colorButtons = document.querySelectorAll('.color-btn');
            const colorNames = ['Preto', 'Verde', 'Laranja'];
            let index = -1;
            colorButtons.forEach((btn, idx) => {
                if (btn.classList.contains('selected')) {
                    index = idx;
                }
            });
            if (index >= 0 && index < colorNames.length) {
                return colorNames[index];
            }
        }
        
        // Fallback: usa a variável global selectedColor se existir
        if (typeof window.selectedColor !== 'undefined' && window.selectedColor) {
            return window.selectedColor;
        }
        
        // Último fallback: Preto
        return 'Preto';
    }

    function initCartFunctionality() {
        // Atualiza contador do carrinho ao carregar
        updateCartBadge();

        // Sobrescreve função de adicionar ao carrinho
        window.adicionarAoCarrinho = function(event) {
            event.preventDefault();

            // CORREÇÃO: Obtém cor selecionada DIRETAMENTE do DOM no momento do clique
            const cor = getSelectedColorFromDOM();
            
            // Adiciona ao carrinho usando OrderStore
            if (typeof OrderStore !== 'undefined') {
                OrderStore.addToCart(cor, 1);
                OrderStore.setSelectedColor(cor);
            } else {
                // Fallback se OrderStore não estiver disponível
                if (typeof salvarCorSelecionada === 'function') {
                    salvarCorSelecionada();
                }
            }

            // Atualiza badge do carrinho
            updateCartBadge();

            // Anima o ícone do carrinho
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
            // CORREÇÃO: Obtém cor selecionada DIRETAMENTE do DOM no momento do clique
            const cor = getSelectedColorFromDOM();
            
            // Inicializa checkout usando OrderStore
            if (typeof OrderStore !== 'undefined') {
                OrderStore.initCheckout(cor);
            } else {
                if (typeof salvarCorSelecionada === 'function') {
                    salvarCorSelecionada();
                }
            }

            // Dispara evento do Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'InitiateCheckout');
            }

            // Redireciona para a página de endereço
            window.location.href = 'endereco/index.html';
        };

        // Função para atualizar badge do carrinho
        window.updateCartBadge = updateCartBadge;
    }

    function updateCartBadge() {
        const cartCountEl = document.querySelector('.cart-count');
        if (!cartCountEl) return;

        let quantidade = 0;
        
        if (typeof OrderStore !== 'undefined') {
            quantidade = OrderStore.getCartQuantity();
        } else {
            // Fallback
            const cart = localStorage.getItem('checkoutCart');
            if (cart) {
                try {
                    const data = JSON.parse(cart);
                    quantidade = data.quantidade || 0;
                } catch (e) {}
            }
        }

        cartCountEl.textContent = quantidade;
        
        // Mostra/esconde badge baseado na quantidade
        if (quantidade > 0) {
            cartCountEl.style.display = 'block';
        } else {
            cartCountEl.style.display = 'none';
        }
    }

    // Atualiza badge quando a página ganha foco (caso tenha sido alterado em outra aba)
    window.addEventListener('focus', updateCartBadge);
})();
