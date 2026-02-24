// UIManager.js - Manages UI interactions and rendering
class UIManager {
    constructor(productManager, cartManager) {
        this.productManager = productManager;
        this.cartManager = cartManager;
        this.productsGridElement = null;
        this.searchInputElement = null;
    }

    init(productsGridEl, searchInputEl) {
        this.productsGridElement = productsGridEl;
        this.searchInputElement = searchInputEl;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        if (this.searchInputElement) {
            this.searchInputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });

            // Debounced search
            this.searchInputElement.addEventListener('input', this.debounce(() => {
                this.handleSearch();
            }, 300));
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartIcon = document.querySelector('.cart-icon');

            if (cartSidebar && cartSidebar.classList.contains('open') &&
                !cartSidebar.contains(e.target) &&
                !cartIcon.contains(e.target)) {
                this.toggleCart();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close cart
            if (e.key === 'Escape') {
                const cartSidebar = document.getElementById('cartSidebar');
                if (cartSidebar && cartSidebar.classList.contains('open')) {
                    this.toggleCart();
                }
            }

            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInputElement) {
                    this.searchInputElement.focus();
                }
            }
        });
    }

    displayProducts(productsToShow = null) {
        if (!this.productsGridElement) return;

        const products = productsToShow || this.productManager.filterByCategory(this.productManager.getCurrentFilter());
        this.productsGridElement.innerHTML = '';

        if (products.length === 0) {
            this.productsGridElement.innerHTML = '<div class="loading">No products found matching your criteria.</div>';
            return;
        }

        products.forEach((product, index) => {
            const productCard = this.createProductCard(product);
            productCard.style.animationDelay = `${index * 0.1}s`;
            this.productsGridElement.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);

        const imageHtml = product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<span style="font-size: 5rem; opacity: 0.1;">${product.icon}</span>`;

        card.innerHTML = `
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toLocaleString()}</p>
                <button class="add-to-cart" onclick="app.addToCart(${product.id})">
                    Explore & Purchase
                </button>
            </div>
        `;

        return card;
    }

    filterProducts(category) {
        const products = this.productManager.filterByCategory(category);

        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = document.querySelector(`[data-category="${category}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        this.displayProducts(products);
    }

    handleSearch() {
        if (!this.searchInputElement) return;

        const searchTerm = this.searchInputElement.value;
        if (searchTerm.trim() === '') {
            this.displayProducts();
        } else {
            const products = this.productManager.searchProducts(searchTerm);
            this.displayProducts(products);
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    }

    showAddToCartFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = '#4CAF50';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
