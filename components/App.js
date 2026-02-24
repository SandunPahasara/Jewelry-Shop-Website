// App.js - Main application controller that connects all components
class App {
    constructor() {
        this.productManager = new ProductManager();
        this.cart = new CartManager();
        this.ui = new UIManager(this.productManager, this.cart);
        this.formManager = new FormManager();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize Cart Manager
        const cartCountEl = document.getElementById('cartCount');
        const cartItemsEl = document.getElementById('cartItems');
        const totalAmountEl = document.getElementById('totalAmount');
        this.cart.init(cartCountEl, cartItemsEl, totalAmountEl);

        // Initialize UI Manager
        const productsGridEl = document.getElementById('productsGrid');
        const searchInputEl = document.getElementById('searchInput');
        this.ui.init(productsGridEl, searchInputEl);

        // Initialize Form Manager
        const contactFormEl = document.getElementById('contactForm');
        this.formManager.init(contactFormEl);

        // Display initial products
        this.ui.displayProducts();

        // Initialize interactivity
        this.initializeInteractivity();
    }

    addToCart(productId, event) {
        const product = this.productManager.getProductById(productId);
        if (product) {
            this.cart.addItem(product);
            if (event && event.target) {
                this.ui.showAddToCartFeedback(event.target);
            }
        }
    }

    filterProducts(category) {
        this.ui.filterProducts(category);
    }

    searchProducts() {
        this.ui.handleSearch();
    }

    toggleCart() {
        this.ui.toggleCart();
    }

    checkout() {
        const success = this.formManager.handleCheckout(this.cart);
        if (success) {
            this.ui.toggleCart();
        }
    }

    initializeInteractivity() {
        // Add hover effects to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // Add ripple effect to category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function(e) {
                const ripple = document.createElement('div');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    pointer-events: none;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create global app instance
const app = new App();
app.init();
