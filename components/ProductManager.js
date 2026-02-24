// ProductManager.js - Manages product data and display
class ProductManager {
    constructor() {
        this.products = [
            {
                id: 1,
                name: "The Royal Diamond Solitaire",
                price: 4500.00,
                category: "Rings",
                description: "A breathtaking 2-carat diamond set in 18k white gold. Part of our Heritage Collection.",
                icon: "💎"
            },
            {
                id: 2,
                name: "Ocean Blue Sapphire Pendant",
                price: 2800.00,
                category: "Necklaces",
                description: "Vibrant Sri Lankan blue sapphire surrounded by a halo of brilliant-cut diamonds.",
                icon: "📿"
            },
            {
                id: 3,
                name: "Celestial Pearl Earrings",
                price: 1200.00,
                category: "Earrings",
                description: "Lustrous South Sea pearls hanging from delicate diamond-encrusted gold studs.",
                icon: "✨"
            },
            {
                id: 4,
                name: "Eternal Gold Bangle",
                price: 3200.00,
                category: "Bracelets",
                description: "Hand-engraved 22k yellow gold bangle featuring traditional Sri Lankan motifs.",
                icon: "📿"
            },
            {
                id: 5,
                name: "Imperial Emerald Ring",
                price: 5500.00,
                category: "Rings",
                description: "A rare Colombian emerald masterfully set with tapered baguette diamonds.",
                icon: "💍"
            },
            {
                id: 6,
                description: "Classic 0.5-carat diamond stud earrings in 14K white gold",
                image: "images/diamond-stud-earrings.jpg"
            },
            {
                id: 8,
                name: "Charm Bracelet",
                category: "bracelets",
                price: 149.99,
                description: "Sterling silver charm bracelet with heart and star charms",
                image: "images/charm-bracelet.jpg"
            }
        ];
        this.currentFilter = 'all';
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
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    }

    getCurrentFilter() {
        return this.currentFilter;
    }
}
