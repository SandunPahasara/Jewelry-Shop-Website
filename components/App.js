// App.js - Main application controller that connects all components
class App {
    constructor() {
        this.productManager = new window.ProductManager();
        this.cart = new CartManager();
        this.ui = new UIManager(this.productManager, this.cart);
        this.formManager = new FormManager();
        this.auth = new window.AuthManager();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            await this.initializeComponents();
        }
    }

    async initializeComponents() {
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

        // Await the loading of products from Firebase
        const loadResult = await this.productManager.loadProducts();

        if (loadResult && loadResult.success === false) {
            const errorMessage = loadResult.error && loadResult.error.message
                ? loadResult.error.message
                : 'Failed to load products from the database.';
            this.ui.displayLoadError(errorMessage);
        } else {
            // Display initial products
            this.ui.displayProducts();
        }

        // Initialize interactivity
        this.initializeInteractivity();
    }

    addToCart(productId, event) {
        if (!this.auth || !this.auth.isLoggedIn()) {
            alert("For add to cart this item you need to sign in or sign up.");
            // If they are in the product details modal, we can leave it open, but we should open auth modal on top
            this.ui.toggleAuthModal();
            return;
        }

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
        this.ui.handleSearch(true);
    }

    toggleCart() {
        this.ui.toggleCart();
    }

    checkout() {
        if (!this.auth || !this.auth.isLoggedIn()) {
            this.ui.toggleAuthModal();
            return;
        }

        const success = this.formManager.handleCheckout(this.cart);
        if (success) {
            this.ui.toggleCart();
        }
    }

    initializeInteractivity() {
        // Add hover effects to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.02)';
            });

            button.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
            });
        });

        // Add ripple effect to category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function (e) {
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

        // Header scroll effect
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = navLinks.classList.toggle('open');
                mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
                mobileMenuToggle.innerHTML = isOpen
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            });

            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navLinks.classList.remove('open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }

        // Initialize Header Golden Rain
        this.initHeaderRain();
    }

    initHeaderRain() {
        const canvas = document.getElementById('headerRainCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resizeCanvas = () => {
            const header = document.querySelector('header');
            canvas.width = header.offsetWidth;
            canvas.height = header.offsetHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 1 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.y += this.speedY;
                if (this.y > canvas.height) {
                    this.y = 0;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // Gold color
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            // Amount of particles based on header width
            const numParticles = Math.floor(canvas.width / 20);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };

        animate();
    }
}

// Create global app instance
window.app = new App();
window.app.init();
