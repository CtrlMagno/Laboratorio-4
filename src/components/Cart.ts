import CartStore from '../store/CartStore';
import { CartActions } from '../actions/CartActions';

export class Cart extends HTMLElement {
    private isOpen: boolean = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Make sure the cart is visible when items are added
        this.isOpen = true;
        this.classList.add('open');
    }

    private setupEventListeners(): void {
        // Ensure we're properly listening for cart changes
        CartStore.removeAllListeners('change');
        CartStore.on('change', () => {
            console.log('Cart: Received change event');
            const items = CartStore.getItems();
            console.log('Cart: Current items', items);
            this.render();
        });
        
        // Listen for custom toggle event
        this.addEventListener('toggle', () => {
            this.isOpen = !this.isOpen;
            this.classList.toggle('open', this.isOpen);
        });
    }

    private render(): void {
        console.log('Cart: Rendering cart');
        const items = CartStore.getItems();
        console.log('Cart: Items to render', items);
        const total = CartStore.getTotal();

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background: white;
                box-shadow: -2px 0 5px rgba(0,0,0,0.1);
                transition: right 0.3s ease;
                z-index: 1000;
            }

            :host(.open) {
                right: 0;
            }

            .cart-header {
                padding: 1rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .cart-items {
                padding: 1rem;
                overflow-y: auto;
                max-height: calc(100vh - 200px);
            }

            .cart-item {
                display: flex;
                gap: 1rem;
                padding: 1rem 0;
                border-bottom: 1px solid #eee;
                position: relative;
            }

            .cart-item img {
                width: 80px;
                height: 80px;
                object-fit: contain;
            }

            .item-details {
                flex: 1;
            }

            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .quantity-btn {
                padding: 0.25rem 0.5rem;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
            }

            .remove-item {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #e74c3c;
            }

            .cart-footer {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 1rem;
                background: white;
                border-top: 1px solid #eee;
            }

            .cart-total {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
                font-weight: bold;
            }

            .checkout-btn {
                width: 100%;
                padding: 0.8rem;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .checkout-btn:disabled {
                background: #bdc3c7;
                cursor: not-allowed;
            }

            .close-cart {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #7f8c8d;
            }

            .empty-cart {
                text-align: center;
                color: #7f8c8d;
                padding: 2rem;
            }
        `;

        const template = document.createElement('div');
        template.innerHTML = `
            <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button class="close-cart">&times;</button>
            </div>
            <div class="cart-items">
                ${items.length === 0 ? '<p class="empty-cart">Your cart is empty</p>' : ''}
                ${items.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="price">$${item.price.toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus">+</button>
                            </div>
                        </div>
                        <button class="remove-item">&times;</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <button class="checkout-btn" ${items.length === 0 ? 'disabled' : ''}>
                    Checkout
                </button>
            </div>
        `;

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = '';
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(template);

            // Add event listeners
            const closeButton = this.shadowRoot.querySelector('.close-cart');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.isOpen = false;
                    this.classList.remove('open');
                });
            }
            
            items.forEach(item => {
                const itemElement = this.shadowRoot?.querySelector(`[data-id="${item.id}"]`);
                if (itemElement) {
                    const minusButton = itemElement.querySelector('.minus');
                    const plusButton = itemElement.querySelector('.plus');
                    const removeButton = itemElement.querySelector('.remove-item');

                    if (minusButton) {
                        minusButton.addEventListener('click', () => {
                            CartActions.updateQuantity(item.id, item.quantity - 1);
                        });
                    }
                    
                    if (plusButton) {
                        plusButton.addEventListener('click', () => {
                            CartActions.updateQuantity(item.id, item.quantity + 1);
                        });
                    }
                    
                    if (removeButton) {
                        removeButton.addEventListener('click', () => {
                            CartActions.removeItem(item.id);
                        });
                    }
                }
            });

            const checkoutButton = this.shadowRoot.querySelector('.checkout-btn');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', () => {
                    if (items.length > 0) {
                        alert('Proceeding to checkout...');
                        CartActions.clearCart();
                        this.isOpen = false;
                        this.classList.remove('open');
                    }
                });
            }
        }
    }
}

customElements.define('shopping-cart', Cart); 