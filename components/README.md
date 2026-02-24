# Jewelry Shop Website - Component Architecture

## Overview

This project has been refactored into a component-based architecture for better code organization, maintainability, and reusability.

## Project Structure

```
Jewelry-Shop-Website/
│
├── Homepage.html           # Main HTML file
├── style.css              # Stylesheet
│
└── components/            # JavaScript components
    ├── ProductManager.js  # Manages product data and filtering
    ├── CartManager.js     # Handles shopping cart functionality
    ├── UIManager.js       # Controls UI rendering and interactions
    ├── FormManager.js     # Manages form submissions
    └── App.js             # Main application controller
```

## Components Description

### 1. ProductManager.js

**Purpose:** Manages all product-related data and operations

**Key Features:**

- Stores product catalog
- Filter products by category
- Search products by name, description, or category
- Get product by ID

**Methods:**

- `getAllProducts()` - Returns all products
- `getProductById(id)` - Returns a specific product
- `filterByCategory(category)` - Filters products by category
- `searchProducts(searchTerm)` - Searches products
- `getCurrentFilter()` - Returns current active filter

---

### 2. CartManager.js

**Purpose:** Handles all shopping cart functionality

**Key Features:**

- Add items to cart
- Update item quantities
- Calculate totals
- Update cart display

**Methods:**

- `init(cartCountEl, cartItemsEl, totalAmountEl)` - Initialize cart with DOM elements
- `addItem(product)` - Add product to cart
- `updateQuantity(productId, change)` - Update item quantity
- `getCart()` - Get current cart items
- `getTotalItems()` - Get total number of items
- `getTotal()` - Get cart total price
- `clear()` - Empty the cart
- `updateDisplay()` - Refresh cart UI

---

### 3. UIManager.js

**Purpose:** Manages UI rendering and user interactions

**Key Features:**

- Display products
- Handle search functionality
- Category filtering
- Event listeners setup
- Smooth scrolling
- Keyboard shortcuts

**Methods:**

- `init(productsGridEl, searchInputEl)` - Initialize UI manager
- `setupEventListeners()` - Set up all event listeners
- `displayProducts(productsToShow)` - Render products to the page
- `filterProducts(category)` - Filter and display products by category
- `handleSearch()` - Process search queries
- `toggleCart()` - Open/close cart sidebar
- `showAddToCartFeedback(button)` - Show visual feedback when adding to cart
- `debounce(func, wait)` - Debounce helper for search

---

### 4. FormManager.js

**Purpose:** Handles form submissions and validations

**Key Features:**

- Contact form submission
- Checkout process
- Form validation

**Methods:**

- `init(contactFormEl)` - Initialize form manager
- `setupFormListeners()` - Set up form event listeners
- `handleContactFormSubmit(e)` - Process contact form
- `handleCheckout(cart)` - Process checkout

---

### 5. App.js

**Purpose:** Main application controller that connects all components

**Key Features:**

- Component initialization
- Coordinate between components
- Global app instance
- Interactive effects (hover, ripple)

**Methods:**

- `init()` - Initialize the application
- `initializeComponents()` - Set up all components
- `addToCart(productId, event)` - Add product to cart
- `filterProducts(category)` - Filter products
- `searchProducts()` - Search products
- `toggleCart()` - Toggle cart sidebar
- `checkout()` - Process checkout
- `initializeInteractivity()` - Set up interactive effects

---

## How Components Work Together

```
┌─────────────────────────────────────────────┐
│              Homepage.html                   │
│  (User Interface & Component Integration)   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│                 App.js                       │
│        (Main Application Controller)        │
└──┬────────┬────────┬────────┬──────────┬───┘
   │        │        │        │          │
   ▼        ▼        ▼        ▼          ▼
┌──────┐ ┌──────┐ ┌────┐ ┌─────────┐ ┌──────┐
│Product│ │ Cart │ │ UI │ │  Form   │ │Event │
│Manager│ │Manager│ │Mgr │ │ Manager │ │Handlers│
└───────┘ └──────┘ └────┘ └─────────┘ └──────┘
```

## Usage

### Adding a New Product

Edit `components/ProductManager.js`:

```javascript
{
    id: 9,
    name: "New Product",
    category: "rings",
    price: 999.99,
    description: "Product description",
    image: "images/product.jpg"
}
```

### Customizing Cart Behavior

Edit `components/CartManager.js` to modify cart logic, display, or calculations.

### Adding New UI Features

Edit `components/UIManager.js` to add new interactions, animations, or display logic.

### Modifying Forms

Edit `components/FormManager.js` to change form handling, validation, or submission logic.

## Benefits of Component Architecture

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Maintainability**: Easier to find and fix bugs
3. **Reusability**: Components can be reused across different pages
4. **Testability**: Each component can be tested independently
5. **Scalability**: Easy to add new features without affecting existing code
6. **Readability**: Code is organized and easier to understand

## Browser Compatibility

The components use modern JavaScript (ES6+) features:

- Classes
- Arrow functions
- Template literals
- Destructuring
- Spread operator

Ensure browsers support ES6 or use a transpiler like Babel for older browsers.

## Future Enhancements

- Add unit tests for each component
- Implement state management (like Redux pattern)
- Add TypeScript for type safety
- Create build process with webpack/vite
- Add lazy loading for images
- Implement wishlist feature
- Add product comparison feature
- Social media integration

## Development

To modify the website:

1. Open `Homepage.html` in a browser
2. Edit components in the `components/` folder
3. Refresh browser to see changes
4. Check browser console for any errors

## Support

For issues or questions, contact: info@luxejewelry.com
