import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

window.ProductManager = class ProductManager {
    constructor() {
        this.products = [];
        this.currentFilter = 'all';
    }

    async loadProducts() {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            this.products = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Ensure image paths are resolved correctly
                let imgSrc = data.image || '';
                if (!imgSrc.startsWith('http') && !imgSrc.includes('images/')) {
                    imgSrc = 'images/' + imgSrc;
                }

                this.products.push({
                    id: doc.id,
                    name: data.name,
                    price: data.price,
                    category: data.category,
                    description: data.description,
                    image: imgSrc,
                    icon: "💎", // Default icon
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : null
                });
            });

            console.log("Loaded products from Firebase:", this.products);
        } catch (error) {
            console.error("Error loading products:", error);
        }
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    filterByCategory(category) {
        this.currentFilter = category;
        if (category === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === category);
    }

    searchProducts(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.products.filter(product =>
            (product.name || '').toLowerCase().includes(term) ||
            (product.description || '').toLowerCase().includes(term) ||
            (product.category || '').toLowerCase().includes(term)
        );
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    // --- Reviews & Ratings ---
    async getReviews(productId) {
        try {
            const querySnapshot = await getDocs(collection(db, `products/${productId}/reviews`));
            const reviews = [];
            let totalRating = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reviews.push({ id: doc.id, ...data });
                totalRating += data.rating;
            });

            // Sort by date descending
            reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            return { reviews, averageRating };
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return { reviews: [], averageRating: 0 };
        }
    }

    async addReview(productId, reviewData) {
        const { addDoc } = await import("https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js");
        try {
            await addDoc(collection(db, `products/${productId}/reviews`), {
                ...reviewData,
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error("Error adding review:", error);
            return { success: false, error: error.message };
        }
    }
}
