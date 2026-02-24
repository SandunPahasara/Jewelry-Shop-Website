# Component Architecture Diagram

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Homepage.html                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Header (Navigation, Logo, Cart Icon)                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Hero Section                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  About Section (Shop Details)                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Search Bar                                            │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Categories (All, Rings, Necklaces, Earrings, etc)    │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Products Grid (Dynamically Generated)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Contact Form                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Footer                                                │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Cart Sidebar (Overlay)                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ Component Scripts
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                        App.js                                 │
│              (Main Application Controller)                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  init()         - Initialize application               │  │
│  │  addToCart()    - Add product to cart                  │  │
│  │  filterProducts() - Filter by category                 │  │
│  │  searchProducts() - Search functionality               │  │
│  │  toggleCart()   - Show/hide cart                       │  │
│  │  checkout()     - Process checkout                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │                │                │               │
         │                │                │               │
    ┌────▼────┐    ┌─────▼──────┐   ┌────▼────┐   ┌──────▼──────┐
    │ Product │    │    Cart    │   │   UI    │   │    Form     │
    │ Manager │    │  Manager   │   │ Manager │   │   Manager   │
    └────┬────┘    └─────┬──────┘   └────┬────┘   └──────┬──────┘
         │                │               │               │
         │                │               │               │
┌────────▼────────┐ ┌────▼──────────┐ ┌──▼─────────┐ ┌──▼───────────┐
│ Product Data    │ │ Cart State    │ │ DOM        │ │ Form         │
│ - products[]    │ │ - cart[]      │ │ Rendering  │ │ Submission   │
│ - categories    │ │ - totals      │ │ - Products │ │ - Contact    │
│                 │ │               │ │ - Search   │ │ - Checkout   │
│ Methods:        │ │ Methods:      │ │ - Cart     │ │              │
│ - getAll()      │ │ - addItem()   │ │            │ │ Methods:     │
│ - getById()     │ │ - update()    │ │ Methods:   │ │ - submit()   │
│ - filter()      │ │ - remove()    │ │ - display()│ │ - validate() │
│ - search()      │ │ - clear()     │ │ - filter() │ │ - handle()   │
└─────────────────┘ └───────────────┘ └────────────┘ └──────────────┘
```

## Data Flow

### 1. Product Display Flow
```
User visits page
    → App.init()
    → ProductManager.getAllProducts()
    → UIManager.displayProducts()
    → Render to DOM (#productsGrid)
```

### 2. Add to Cart Flow
```
User clicks "Add to Cart"
    → addToCart(productId) [Legacy function]
    → App.addToCart()
    → ProductManager.getProductById()
    → CartManager.addItem()
    → CartManager.updateDisplay()
    → UIManager.showAddToCartFeedback()
```

### 3. Category Filter Flow
```
User clicks category
    → filterProducts(category) [Legacy function]
    → App.filterProducts()
    → ProductManager.filterByCategory()
    → UIManager.displayProducts()
    → Update UI (active states)
```

### 4. Search Flow
```
User types in search
    → searchProducts() [Legacy function or debounced]
    → App.searchProducts()
    → ProductManager.searchProducts()
    → UIManager.displayProducts()
    → Render filtered results
```

### 5. Checkout Flow
```
User clicks checkout
    → checkout() [Legacy function]
    → App.checkout()
    → FormManager.handleCheckout()
    → CartManager.clear()
    → UIManager.toggleCart()
```

## Component Responsibilities

| Component       | Responsibility                  | State Management        |
|-----------------|---------------------------------|-------------------------|
| ProductManager  | Product data & filtering        | products[], currentFilter |
| CartManager     | Cart operations & display       | cart[]                   |
| UIManager       | DOM manipulation & events       | DOM references           |
| FormManager     | Form handling & validation      | None (stateless)         |
| App             | Orchestration & initialization  | Component instances      |

## Event Flow

```
DOM Events (onclick, onsubmit, etc.)
    ↓
Legacy Wrapper Functions (backward compatibility)
    ↓
App Methods (app.addToCart, app.filterProducts, etc.)
    ↓
Component Methods (ProductManager, CartManager, etc.)
    ↓
State Updates & DOM Rendering
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single responsibility
2. **Maintainability**: Easy to locate and fix bugs
3. **Scalability**: Simple to add new features
4. **Testability**: Components can be tested independently
5. **Reusability**: Components can be used in other projects
6. **Readability**: Clear structure and organization

## Future Improvements

- Add state management library (Redux pattern)
- Implement TypeScript for type safety
- Add unit tests for each component
- Create build process with module bundler
- Implement lazy loading and code splitting
- Add service layer for API calls
- Create reactive data binding system
