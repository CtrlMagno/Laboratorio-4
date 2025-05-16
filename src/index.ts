import './styles/main.css';
import './styles/components.css';
import ProductStore from './store/ProductStore';
import CartStore, { CartItem } from './store/CartStore';
import AppDispatcher from './dispatcher/AppDispatcher';
import './components/ProductCard';
import './components/ProductGrid';
import { Cart } from './components/Cart';
import { CartActionTypes } from './actions/CartActions';

// Initialize stores
ProductStore.refreshProducts();
// CartStore will load from cache automatically in its constructor

// Create main app structure
const app = document.createElement('div');
app.className = 'app';

// Create header
const header = document.createElement('header');
header.className = 'header';
header.innerHTML = `
    <div class="header-content">
        <h1>E-Commerce Store</h1>
        <div class="cart-icon">
            <span class="cart-count">${CartStore.getItems().length}</span>
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
        </div>
    </div>
`;

// Create main content
const main = document.createElement('main');
main.className = 'main';
main.innerHTML = '<product-grid></product-grid>';

// Create cart sidebar
const cartSidebar = document.createElement('aside');
cartSidebar.className = 'cart-sidebar';
cartSidebar.innerHTML = `
    <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="close-cart">×</button>
    </div>
    <div class="cart-items"></div>
    <div class="cart-footer">
        <div class="total-amount">$0.00</div>
        <button class="checkout-btn">Checkout</button>
    </div>
`;

// Add elements to app
app.appendChild(header);
app.appendChild(main);
app.appendChild(cartSidebar);

// Add app to body
document.body.appendChild(app);

// Cart functionality
const cartIcon = header.querySelector('.cart-icon');
const cartSidebarElement = document.querySelector('.cart-sidebar');
const closeCartButton = cartSidebarElement?.querySelector('.close-cart');
const cartItemsContainer = cartSidebarElement?.querySelector('.cart-items');
const totalAmountElement = cartSidebarElement?.querySelector('.total-amount');
const cartCountElement = header.querySelector('.cart-count');

function updateCart() {
    if (!cartItemsContainer || !totalAmountElement || !cartCountElement) return;

    const items = CartStore.getItems();
    cartCountElement.textContent = items.length.toString();
    
    if (items.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        totalAmountElement.textContent = '$0.00';
        return;
    }

    cartItemsContainer.innerHTML = items.map((item: CartItem) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">×</button>
        </div>
    `).join('');

    totalAmountElement.textContent = `$${CartStore.getTotal().toFixed(2)}`;
}

// Event Listeners
cartIcon?.addEventListener('click', () => {
    cartSidebarElement?.classList.add('active');
});

closeCartButton?.addEventListener('click', () => {
    cartSidebarElement?.classList.remove('active');
});

cartItemsContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;

    if (target.classList.contains('remove-item') && id) {
        CartStore.removeItem(id);
    } else if (target.classList.contains('quantity-btn') && id) {
        const action = target.dataset.action as 'increase' | 'decrease';
        const item = CartStore.getItems().find(item => item.id === id);
        if (item) {
            if (action === 'increase') {
                CartStore.updateQuantity(id, item.quantity + 1);
            } else if (action === 'decrease') {
                CartStore.updateQuantity(id, item.quantity - 1);
            }
        }
    }
});

// Listen for cart changes
CartStore.on('change', updateCart);

// Initial cart update
updateCart();

// Connect store with dispatcher
AppDispatcher.on('action', (action) => {
    switch (action.type) {
        case CartActionTypes.ADD_ITEM:
            CartStore.addItem(action.payload);
            break;
        case CartActionTypes.REMOVE_ITEM:
            CartStore.removeItem(action.payload);
            break;
        case CartActionTypes.UPDATE_QUANTITY:
            CartStore.updateQuantity(action.payload.id, action.payload.quantity);
            break;
        case CartActionTypes.CLEAR_CART:
            CartStore.clearCart();
            break;
    }
});

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const productCard = target.closest('.product-card');
        if (productCard) {
            const productName = productCard.querySelector('h3')?.textContent || '';
            const productPrice = parseFloat(productCard.querySelector('.price')?.textContent?.replace('$', '') || '0');
            const productImage = productCard.querySelector('img')?.getAttribute('src') || '';
            const productId = productName.toLowerCase().replace(/\s+/g, '-');

            AppDispatcher.dispatch({
                type: CartActionTypes.ADD_ITEM,
                payload: {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                }
            });
        }
    });
});

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form') as HTMLFormElement;
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]') as HTMLInputElement;
        const email = emailInput.value;

        if (email) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'notification success';
            successMessage.textContent = 'Thank you for subscribing!';
            document.body.appendChild(successMessage);

            // Clear input
            emailInput.value = '';

            // Remove notification after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }
    });
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2c3e50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        background-color: #2ecc71;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);