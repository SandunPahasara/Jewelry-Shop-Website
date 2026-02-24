// CartManager.js - Manages shopping cart functionality
class CartManager {
    constructor() {
        this.cart = [];
        this.cartCountElement = null;
        this.cartItemsElement = null;
        this.totalAmountElement = null;
    }

    init(cartCountEl, cartItemsEl, totalAmountEl) {
        this.cartCountElement = cartCountEl;
        this.cartItemsElement = cartItemsEl;
        this.totalAmountElement = totalAmountEl;
        this.loadFromLocalStorage();
        this.updateDisplay();
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('jewelry_cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                console.error("Error loading cart from localStorage:", e);
                this.cart = [];
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('jewelry_cart', JSON.stringify(this.cart));
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveToLocalStorage();
        this.updateDisplay();
        return true;
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== productId);
            }
            this.saveToLocalStorage();
            this.updateDisplay();
        }
    }

    getCart() {
        return this.cart;
    }

    getTotalItems() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clear() {
        this.cart = [];
        this.saveToLocalStorage();
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.cartCountElement || !this.cartItemsElement || !this.totalAmountElement) {
            return;
        }

        // Update cart count
        const totalItems = this.getTotalItems();
        this.cartCountElement.textContent = totalItems;
        this.cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';

        // Update cart items
        this.cartItemsElement.innerHTML = '';

        if (this.cart.length === 0) {
            this.cartItemsElement.innerHTML = '<div class="loading">Your cart is empty</div>';
        } else {
            this.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">${item.icon || '💎'}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="app.cart.updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.cart.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                `;
                this.cartItemsElement.appendChild(cartItem);
            });
        }

        // Update total amount
        this.totalAmountElement.textContent = `$${this.getTotal().toFixed(2)}`;
    }
}
