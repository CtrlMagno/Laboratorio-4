import './styles/main.css';
import './styles/components.css';
import ProductStore from './store/ProductStore';
import CartStore from './store/CartStore';
import AppDispatcher from './dispatcher/AppDispatcher';
import './components/ProductCard';
import './components/ProductGrid';
import './components/Cart';
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

// Add elements to app
app.appendChild(header);
app.appendChild(main);

// Add app to body
document.body.appendChild(app);

// Add shopping cart
const shoppingCart = document.createElement('shopping-cart');
document.body.appendChild(shoppingCart);

// Add cart toggle functionality
const cartIcon = header.querySelector('.cart-icon');
const cartCount = header.querySelector('.cart-count');

// Update cart count
function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = CartStore.getItems().length.toString();
    }
}

// Listen for cart changes
CartStore.on('change', updateCartCount);

cartIcon?.addEventListener('click', () => {
    shoppingCart.dispatchEvent(new Event('toggle'));
});

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