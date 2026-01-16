/**
 * OrderStore - Módulo de gerenciamento de estado do pedido
 * Centraliza todas as informações do carrinho e checkout
 */
const OrderStore = (function() {
    'use strict';

    // Chaves do localStorage
    const KEYS = {
        PRODUCT: 'checkoutProduct',
        ADDRESS: 'checkoutAddress',
        ORDER: 'checkoutOrder',
        CART: 'checkoutCart'
    };

    // Configurações do produto
    const PRODUCT_CONFIG = {
        nome: 'Blackview BV9300 Pro 5G',
        precoUnitario: 128.90,
        frete: 0,
        cores: ['Preto', 'Verde', 'Laranja'],
        imagens: {
            'Preto': 'images/blackview-preto.webp',
            'Verde': 'images/blackview-verde.webp',
            'Laranja': 'images/blackview-laranja.webp'
        }
    };

    // Chave Pix EVP
    const PIX_KEY = '3b416fd5-5c73-44fe-bf4f-18166f429844';

    /**
     * Gera um ID único para o pedido
     */
    function generateOrderId() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return 'PED' + timestamp + random.slice(0, 4);
    }

    /**
     * Formata valor para moeda brasileira
     */
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    /**
     * Formata valor para Pix (duas casas decimais, ponto como separador)
     */
    function formatPixValue(value) {
        return value.toFixed(2);
    }

    /**
     * Obtém dados do carrinho
     */
    function getCart() {
        const saved = localStorage.getItem(KEYS.CART);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erro ao ler carrinho:', e);
            }
        }
        return {
            cor: 'Preto',
            quantidade: 0,
            precoUnitario: PRODUCT_CONFIG.precoUnitario
        };
    }

    /**
     * Salva dados do carrinho
     */
    function saveCart(cart) {
        localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    }

    /**
     * Adiciona item ao carrinho
     */
    function addToCart(cor, quantidade = 1) {
        const cart = getCart();
        cart.cor = cor;
        cart.quantidade += quantidade;
        cart.precoUnitario = PRODUCT_CONFIG.precoUnitario;
        saveCart(cart);
        return cart;
    }

    /**
     * Define quantidade no carrinho
     */
    function setCartQuantity(quantidade) {
        const cart = getCart();
        cart.quantidade = Math.max(1, Math.min(10, quantidade)); // Min 1, Max 10
        saveCart(cart);
        return cart;
    }

    /**
     * Obtém quantidade do carrinho
     */
    function getCartQuantity() {
        return getCart().quantidade;
    }

    /**
     * Obtém cor selecionada
     */
    function getSelectedColor() {
        const cart = getCart();
        if (cart.cor) return cart.cor;
        
        // Fallback para checkoutProduct
        const product = localStorage.getItem(KEYS.PRODUCT);
        if (product) {
            try {
                const data = JSON.parse(product);
                return data.cor || 'Preto';
            } catch (e) {}
        }
        return 'Preto';
    }

    /**
     * Define cor selecionada
     */
    function setSelectedColor(cor) {
        const cart = getCart();
        cart.cor = cor;
        saveCart(cart);
        
        // Também salva no formato antigo para compatibilidade
        const productData = {
            cor: cor,
            corIndex: PRODUCT_CONFIG.cores.indexOf(cor),
            imagem: PRODUCT_CONFIG.imagens[cor],
            produto: PRODUCT_CONFIG.nome,
            preco: PRODUCT_CONFIG.precoUnitario.toFixed(2),
            precoFormatado: formatCurrency(PRODUCT_CONFIG.precoUnitario),
            timestamp: Date.now()
        };
        localStorage.setItem(KEYS.PRODUCT, JSON.stringify(productData));
    }

    /**
     * Calcula subtotal
     */
    function getSubtotal() {
        const cart = getCart();
        return cart.precoUnitario * cart.quantidade;
    }

    /**
     * Calcula total (subtotal + frete)
     */
    function getTotal() {
        return getSubtotal() + PRODUCT_CONFIG.frete;
    }

    /**
     * Obtém imagem do produto pela cor
     */
    function getProductImage(cor) {
        return PRODUCT_CONFIG.imagens[cor] || PRODUCT_CONFIG.imagens['Preto'];
    }

    /**
     * Obtém ou cria ID do pedido
     */
    function getOrderId() {
        const order = localStorage.getItem(KEYS.ORDER);
        if (order) {
            try {
                const data = JSON.parse(order);
                if (data.orderId) return data.orderId;
            } catch (e) {}
        }
        return null;
    }

    /**
     * Cria novo pedido
     */
    function createOrder() {
        const cart = getCart();
        const orderId = generateOrderId();
        const total = getTotal();
        
        const orderData = {
            orderId: orderId,
            orderNumber: orderId,
            cor: cart.cor,
            quantidade: cart.quantidade,
            precoUnitario: cart.precoUnitario,
            subtotal: getSubtotal(),
            frete: PRODUCT_CONFIG.frete,
            total: total,
            totalFormatado: formatCurrency(total),
            produto: PRODUCT_CONFIG.nome,
            paymentMethod: 'Pix',
            status: 'pending',
            createdAt: Date.now()
        };
        
        localStorage.setItem(KEYS.ORDER, JSON.stringify(orderData));
        return orderData;
    }

    /**
     * Atualiza pedido existente
     */
    function updateOrder(updates) {
        const order = localStorage.getItem(KEYS.ORDER);
        let orderData = {};
        
        if (order) {
            try {
                orderData = JSON.parse(order);
            } catch (e) {}
        }
        
        Object.assign(orderData, updates);
        localStorage.setItem(KEYS.ORDER, JSON.stringify(orderData));
        return orderData;
    }

    /**
     * Obtém dados do pedido
     */
    function getOrder() {
        const order = localStorage.getItem(KEYS.ORDER);
        if (order) {
            try {
                return JSON.parse(order);
            } catch (e) {}
        }
        return null;
    }

    /**
     * Salva dados do endereço
     */
    function saveAddress(addressData) {
        const cpfDigits = addressData.cpf.replace(/\D/g, '');
        const data = {
            nomeCompleto: addressData.nomeCompleto,
            cpf: addressData.cpf,
            cpfMasked: `***.***.**${cpfDigits.slice(-3, -2)}-${cpfDigits.slice(-2)}`,
            cep: addressData.cep,
            endereco: addressData.endereco,
            numero: addressData.numero,
            complemento: addressData.complemento || '',
            bairro: addressData.bairro,
            cidade: addressData.cidade,
            estado: addressData.estado,
            timestamp: Date.now()
        };
        localStorage.setItem(KEYS.ADDRESS, JSON.stringify(data));
        return data;
    }

    /**
     * Obtém dados do endereço
     */
    function getAddress() {
        const address = localStorage.getItem(KEYS.ADDRESS);
        if (address) {
            try {
                return JSON.parse(address);
            } catch (e) {}
        }
        return null;
    }

    /**
     * Inicializa o fluxo de compra
     */
    function initCheckout(cor) {
        // Garante que há pelo menos 1 item no carrinho
        const cart = getCart();
        if (cart.quantidade < 1) {
            cart.quantidade = 1;
        }
        cart.cor = cor;
        saveCart(cart);
        
        // Cria o pedido se não existir
        if (!getOrderId()) {
            createOrder();
        } else {
            // Atualiza pedido existente com nova cor/quantidade
            const total = getTotal();
            updateOrder({
                cor: cor,
                quantidade: cart.quantidade,
                subtotal: getSubtotal(),
                total: total,
                totalFormatado: formatCurrency(total)
            });
        }
        
        return getOrder();
    }

    /**
     * Confirma pagamento
     */
    function confirmPayment() {
        const cart = getCart();
        const total = getTotal();
        
        updateOrder({
            status: 'paid',
            paidAt: Date.now(),
            cor: cart.cor,
            quantidade: cart.quantidade,
            total: total,
            totalFormatado: formatCurrency(total),
            value: formatCurrency(total)
        });
        
        return getOrder();
    }

    /**
     * Limpa todos os dados do checkout
     */
    function clearAll() {
        localStorage.removeItem(KEYS.PRODUCT);
        localStorage.removeItem(KEYS.ADDRESS);
        localStorage.removeItem(KEYS.ORDER);
        localStorage.removeItem(KEYS.CART);
    }

    /**
     * Obtém configurações do produto
     */
    function getProductConfig() {
        return { ...PRODUCT_CONFIG };
    }

    /**
     * Obtém chave Pix
     */
    function getPixKey() {
        return PIX_KEY;
    }

    // API pública
    return {
        // Carrinho
        getCart,
        addToCart,
        setCartQuantity,
        getCartQuantity,
        
        // Cor
        getSelectedColor,
        setSelectedColor,
        
        // Valores
        getSubtotal,
        getTotal,
        formatCurrency,
        formatPixValue,
        
        // Produto
        getProductImage,
        getProductConfig,
        
        // Pedido
        getOrderId,
        createOrder,
        updateOrder,
        getOrder,
        initCheckout,
        confirmPayment,
        generateOrderId,
        
        // Endereço
        saveAddress,
        getAddress,
        
        // Pix
        getPixKey,
        
        // Utilitários
        clearAll
    };
})();

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.OrderStore = OrderStore;
}
