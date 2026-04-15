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
                    e.preventDefault();
                    this.handleSearch(true); // true = scroll to results
                }
            });

            // Debounced live search
            this.searchInputElement.addEventListener('input', this.debounce(() => {
                this.handleSearch(false); // don't auto-scroll while typing
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

        const priceValue = Number(product.price);
        const displayPrice = Number.isFinite(priceValue) ? priceValue : 0;

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
                <p class="product-price">$${displayPrice.toLocaleString()}</p>
                <a href="?product=${product.id}" class="add-to-cart" style="text-decoration: none; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">
                    Explore & Purchase
                </a>
            </div>
        `;

        return card;
    }

    displayLoadError(message) {
        if (!this.productsGridElement) return;
        this.productsGridElement.innerHTML = `<div class="loading">Unable to load featured products. ${message}</div>`;
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

    handleSearch(fromButton = false) {
        if (!this.searchInputElement) return;

        const searchTerm = this.searchInputElement.value;
        const productsSectionTitle = document.querySelector('#products .section-title');

        if (searchTerm.trim() === '') {
            if (productsSectionTitle) productsSectionTitle.textContent = 'Featured Products';
            this.displayProducts();
        } else {
            if (productsSectionTitle) productsSectionTitle.textContent = `Search Results for "${searchTerm}"`;
            const products = this.productManager.searchProducts(searchTerm);

            // Remove active state from collection categories since we are viewing a search
            document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));

            this.displayProducts(products);

            // Auto-scroll to results if triggered explicitly or if they hit Enter/Click
            // We use fromButton or check if the event was a keypress
            if (fromButton && this.productsGridElement) {
                // Determine the parent section to scroll to nicely
                const section = document.getElementById('products');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
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

    // --- Product Details Methods ---
    openProductDetails(productId) {
        const product = this.productManager.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('productDetailsModal');
        const imgContainer = document.getElementById('productDetailsImage');
        const nameEl = document.getElementById('productDetailsName');
        const categoryEl = document.getElementById('productDetailsCategory');
        const descEl = document.getElementById('productDetailsDescription');
        const priceEl = document.getElementById('productDetailsPrice');
        const addBtn = document.getElementById('productDetailsAddToCart');

        if (product.image) {
            imgContainer.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            imgContainer.innerHTML = `<span style="font-size: 5rem; opacity: 0.1;">${product.icon}</span>`;
        }

        nameEl.textContent = product.name;
        categoryEl.textContent = product.category;
        descEl.textContent = product.description;
        priceEl.textContent = `$${product.price.toLocaleString()}`;

        // Set up the Add to Cart button
        addBtn.onclick = (event) => {
            app.addToCart(productId, event);
        };

        modal.style.display = 'flex';
    }

    closeProductDetails() {
        const modal = document.getElementById('productDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // --- Authentication UI Methods ---

    toggleAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            if (modal.style.display === 'none' || modal.style.display === '') {
                modal.style.display = 'flex';
                this.switchAuthMode('login'); // Default to login view
            } else {
                modal.style.display = 'none';
            }
        }
    }

    switchAuthMode(mode) {
        const loginContainer = document.getElementById('loginFormContainer');
        const registerContainer = document.getElementById('registerFormContainer');
        const loginError = document.getElementById('loginError');
        const registerError = document.getElementById('registerError');

        if (mode === 'login') {
            loginContainer.style.display = 'block';
            registerContainer.style.display = 'none';
        } else {
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
        }

        // Clear errors when switching
        if (loginError) loginError.textContent = '';
        if (registerError) registerError.textContent = '';
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginSubmitBtn');
        const errorEl = document.getElementById('loginError');

        btn.disabled = true;
        btn.textContent = 'Signing in...';
        errorEl.textContent = '';

        const result = await app.auth.login(email, password);

        if (result.success) {
            this.toggleAuthModal();
            document.getElementById('userLoginForm').reset();
        } else {
            errorEl.textContent = result.error;
        }

        btn.disabled = false;
        btn.textContent = 'Sign In';
    }

    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const btn = document.getElementById('registerSubmitBtn');
        const errorEl = document.getElementById('registerError');

        btn.disabled = true;
        btn.textContent = 'Creating account...';
        errorEl.textContent = '';

        const result = await app.auth.register(name, email, password);

        if (result.success) {
            this.toggleAuthModal();
            document.getElementById('userRegisterForm').reset();
        } else {
            errorEl.textContent = result.error;
        }

        btn.disabled = false;
        btn.textContent = 'Create Account';
    }

    updateAuthUI(isLoggedIn, userEmail = '') {
        const loggedOutView = document.getElementById('loggedOutView');
        const loggedInView = document.getElementById('loggedInView');

        // Fallbacks for older pages if they still use the old auth button structure
        const authStatusText = document.getElementById('authStatusText');
        const authBtnIcon = document.querySelector('#authBtn i');
        const authBtn = document.getElementById('authBtn');

        if (loggedOutView && loggedInView) {
            if (isLoggedIn) {
                loggedOutView.style.display = 'none';
                loggedInView.style.display = 'flex';
            } else {
                loggedOutView.style.display = 'flex';
                loggedInView.style.display = 'none';
            }
        } else if (authBtn) {
            // Legacy handling
            if (isLoggedIn) {
                authStatusText.textContent = 'Sign Out';
                authBtnIcon.className = 'fas fa-sign-out-alt';
                authBtn.onclick = async () => {
                    await app.auth.logout();
                };
            } else {
                authStatusText.textContent = 'Sign In';
                authBtnIcon.className = 'fas fa-user';
                authBtn.onclick = () => {
                    this.toggleAuthModal();
                };
            }
        }
    }

    // --- Profile Modal UI ---
    openProfileModal() {
        if (!app.auth.currentUser) return;
        
        const modal = document.getElementById('profileModal');
        const userData = app.auth.currentUserData || {};
        
        // Populate form
        document.getElementById('profileName').value = userData.name || '';
        document.getElementById('profileEmail').value = app.auth.currentUser.email || '';
        document.getElementById('profilePhone').value = userData.phone || '';
        document.getElementById('profileAddress').value = userData.address || '';
        
        const msgEl = document.getElementById('profileMessage');
        if (msgEl) msgEl.textContent = '';
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const btn = document.getElementById('profileSubmitBtn');
        const msgEl = document.getElementById('profileMessage');
        
        const profileData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value
        };

        btn.disabled = true;
        btn.textContent = 'Saving...';
        msgEl.textContent = 'Updating profile...';
        msgEl.style.color = 'var(--text-muted)';

        const result = await app.auth.updateUserProfile(profileData);

        if (result.success) {
            msgEl.textContent = 'Profile updated successfully!';
            msgEl.style.color = '#28a745';
            setTimeout(() => {
                this.closeProfileModal();
            }, 1000);
        } else {
            msgEl.textContent = result.error;
            msgEl.style.color = 'red';
        }

        btn.disabled = false;
        btn.textContent = 'Save Changes';
    }
}
