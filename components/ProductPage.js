class ProductPage {
    constructor() {
        this.productId = new URLSearchParams(window.location.search).get('product');
        this.product = null;
        this.reviewsData = { reviews: [], averageRating: 0 };
        this.currentRating = 0;
    }

    async init() {
        if (!this.productId) {
            return; // Not on the product view
        }

        // Switch to Product View
        const homeView = document.getElementById('homeView');
        const productPageView = document.getElementById('productPageView');
        if (homeView) homeView.style.display = 'none';
        if (productPageView) productPageView.style.display = 'block';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Wait for products to load in the global app state
        await this.waitForProducts();

        this.product = window.app.productManager.getProductById(this.productId);

        if (!this.product) {
            document.getElementById('productPageContent').innerHTML = `
                <div style="text-align: center; padding: 5rem 0;">
                    <h2>Product not found.</h2>
                    <a href="?" style="color: var(--accent-color);">Return to Store</a>
                </div>`;
            return;
        }

        await this.loadReviews();
        this.renderProduct();
        this.renderReviews();
        this.setupEventListeners();
        this.renderRelatedProducts();
    }

    async waitForProducts() {
        return new Promise(resolve => {
            const check = () => {
                if (window.app && window.app.productManager && window.app.productManager.products.length > 0) {
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }

    async loadReviews() {
        this.reviewsData = await window.app.productManager.getReviews(this.productId);
    }

    isNewItem(createdAtStr) {
        // If we have a creation date, check if it's within the last 14 days
        if (!createdAtStr) return false;
        try {
            const createdAt = new Date(createdAtStr);
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 14;
        } catch {
            return false;
        }
    }

    renderProduct() {
        const container = document.getElementById('productPageContent');
        const isNew = this.isNewItem(this.product.createdAt) || this.product.isNew;

        const imageHtml = this.product.image
            ? `<img src="${this.product.image}" alt="${this.product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<span style="font-size: 8rem; opacity: 0.1;">${this.product.icon}</span>`;

        container.innerHTML = `
            <div class="product-main">
                <div class="product-image-container">
                    ${isNew ? '<div class="new-badge">New Arrival</div>' : ''}
                    ${imageHtml}
                </div>
                <div class="product-details">
                    <h1 class="product-title">${this.product.name}</h1>
                    <div class="product-category">${this.product.category}</div>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                        <span class="stars">${this.generateStarsHtml(this.reviewsData.averageRating)}</span>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">${this.reviewsData.averageRating} / 5 (${this.reviewsData.reviews.length} reviews)</span>
                    </div>

                    <div class="product-price">$${this.product.price.toLocaleString()}</div>
                    <p class="product-description">${this.product.description}</p>
                    
                    <button class="submit-btn" id="addToCartBtn" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; padding: 1rem; font-size: 1.1rem; margin-top: 1rem;">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    
                    <div style="margin-top: 3rem; font-size: 0.9rem; color: var(--text-muted); display: grid; gap: 1rem;">
                        <div style="display: flex; gap: 1rem; align-items: center;"><i class="fas fa-shield-alt"></i> Lifetime Authenticity Guarantee</div>
                        <div style="display: flex; gap: 1rem; align-items: center;"><i class="fas fa-box"></i> Free Insured Shipping</div>
                        <div style="display: flex; gap: 1rem; align-items: center;"><i class="fas fa-undo"></i> 30-Day Returns</div>
                    </div>
                </div>
            </div>

            <div class="reviews-section" id="reviewsSection">
                <!-- Reviews rendered here -->
            </div>
        `;

        document.getElementById('addToCartBtn').addEventListener('click', (e) => {
            window.app.addToCart(this.product.id, e);
        });
    }

    generateStarsHtml(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star star-empty"></i>';
            }
        }
        return stars;
    }

    renderReviews() {
        const section = document.getElementById('reviewsSection');

        let reviewsListHtml = '';
        if (this.reviewsData.reviews.length === 0) {
            reviewsListHtml = '<p style="color: var(--text-muted);">No reviews yet. Be the first to review this exquisite piece.</p>';
        } else {
            reviewsListHtml = this.reviewsData.reviews.map(review => `
                <div class="review-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div class="review-author">${review.userName || 'Anonymous Client'}</div>
                            <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div class="stars">${this.generateStarsHtml(review.rating)}</div>
                    </div>
                    <div class="review-text">${review.comment}</div>
                </div>
            `).join('');
        }

        section.innerHTML = `
            <div class="reviews-header">
                <div>
                    <h2 style="font-size: 2.5rem; color: var(--primary-color);">Ratings & Reviews</h2>
                </div>
                <div class="average-rating">
                    <h3>${this.reviewsData.averageRating}</h3>
                    <div>
                        <div class="stars">${this.generateStarsHtml(this.reviewsData.averageRating)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem;">Based on ${this.reviewsData.reviews.length} reviews</div>
                    </div>
                </div>
            </div>

            <div class="review-form" id="reviewFormContainer">
                <h4>Leave a Review</h4>
                <div id="reviewAuthMessage" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                    Please <a href="#" onclick="app.ui.toggleAuthModal(); return false;" style="color: var(--accent-color);">Sign In</a> to share your thoughts.
                </div>
                <form id="submitReviewForm" style="display: none;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem;">Your Rating</label>
                        <div id="ratingSelector" style="font-size: 1.5rem; color: #ddd; cursor: pointer; display: flex; gap: 0.5rem;">
                            <i class="fas fa-star" data-rating="1"></i>
                            <i class="fas fa-star" data-rating="2"></i>
                            <i class="fas fa-star" data-rating="3"></i>
                            <i class="fas fa-star" data-rating="4"></i>
                            <i class="fas fa-star" data-rating="5"></i>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="reviewComment">Your Review</label>
                        <textarea id="reviewComment" rows="4" required placeholder="Share your experience..."></textarea>
                    </div>
                    <button type="submit" class="submit-btn" id="submitReviewBtn">Post Review</button>
                    <div id="reviewError" style="color: red; font-size: 0.8rem; margin-top: 1rem;"></div>
                </form>
            </div>

            <div class="review-list">
                ${reviewsListHtml}
            </div>
        `;

        this.updateReviewFormVisibility();
        this.setupRatingSelector();

        document.getElementById('submitReviewForm').addEventListener('submit', (e) => this.handleReviewSubmit(e));
    }

    updateReviewFormVisibility() {
        const authMessage = document.getElementById('reviewAuthMessage');
        const reviewForm = document.getElementById('submitReviewForm');

        if (window.app && window.app.auth && window.app.auth.isLoggedIn()) {
            authMessage.style.display = 'none';
            reviewForm.style.display = 'block';
        } else {
            authMessage.style.display = 'block';
            reviewForm.style.display = 'none';
        }
    }

    setupRatingSelector() {
        const stars = document.querySelectorAll('#ratingSelector .fa-star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.currentRating = rating;

                // Update UI visually
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.style.color = '#FFD700'; // Gold
                    } else {
                        s.style.color = '#ddd'; // Empty
                    }
                });
            });

            // Hover effects
            star.addEventListener('mouseover', (e) => {
                const hoverRating = parseInt(e.target.getAttribute('data-rating'));
                stars.forEach((s, index) => {
                    if (index < hoverRating) s.style.color = '#FFD700';
                    else if (index >= this.currentRating) s.style.color = '#ddd';
                });
            });

            star.addEventListener('mouseout', () => {
                stars.forEach((s, index) => {
                    if (index < this.currentRating) s.style.color = '#FFD700';
                    else s.style.color = '#ddd';
                });
            });
        });
    }

    async handleReviewSubmit(e) {
        e.preventDefault();
        if (this.currentRating === 0) {
            document.getElementById('reviewError').textContent = "Please select a rating.";
            return;
        }

        const comment = document.getElementById('reviewComment').value;
        const btn = document.getElementById('submitReviewBtn');
        const user = window.app.auth.currentUser;
        const userData = window.app.auth.currentUserData;

        btn.disabled = true;
        btn.textContent = "Posting...";

        const reviewData = {
            userId: user.uid,
            userName: userData ? userData.name : user.email.split('@')[0],
            rating: this.currentRating,
            comment: comment
        };

        const result = await window.app.productManager.addReview(this.productId, reviewData);

        if (result.success) {
            // Reload reviews and re-render
            await this.loadReviews();
            this.currentRating = 0;
            this.renderProduct(); // Re-render to update the top summary
            this.renderReviews();

            document.getElementById('reviewsSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.getElementById('reviewError').textContent = result.error;
            btn.disabled = false;
            btn.textContent = "Post Review";
        }
    }

    renderRelatedProducts() {
        const relatedSection = document.getElementById('relatedProductsSection');
        const relatedGrid = document.getElementById('relatedProductsGrid');

        // Find other products in the same category
        const related = window.app.productManager.products.filter(p =>
            p.category === this.product.category && p.id !== this.product.id
        ).slice(0, 3); // Max 3

        if (related.length === 0) {
            relatedSection.style.display = 'none';
            return;
        }

        relatedSection.style.display = 'block';
        relatedGrid.innerHTML = '';

        related.forEach(prod => {
            const card = window.app.ui.createProductCard(prod);
            relatedGrid.appendChild(card);
        });
    }

    setupEventListeners() {
        // Listen for auth state changes globally so the review form appears dynamically
        // Because App.js is handling AuthManager, we can hook into an event or just poll
        // But the easiest is checking it when auth changes. 
        // We'll just listen to the main auth state change that updates the UI:
        const observer = new MutationObserver(() => {
            this.updateReviewFormVisibility();
        });

        const authStatusTarget = document.getElementById('authStatusText');
        if (authStatusTarget) {
            observer.observe(authStatusTarget, { characterData: true, childList: true, subtree: true });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.productPage = new ProductPage();
    window.productPage.init();
});
