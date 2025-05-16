import CartStore from '../store/CartStore';
import { CartActions } from '../actions/CartActions';

export class Cart {
    private container: HTMLElement;
    private isOpen: boolean = false;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'cart-container';
        this.render();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        CartStore.on('change', () => this.render());
    }

    private toggleCart(): void {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('open', this.isOpen);
    }

    private render(): void {
        const items = CartStore.getItems();
        const total = CartStore.getTotal();

        this.container.innerHTML = `
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

        // Add event listeners
        this.container.querySelector('.close-cart')?.addEventListener('click', () => this.toggleCart());
        
        items.forEach(item => {
            const itemElement = this.container.querySelector(`[data-id="${item.id}"]`);
            if (itemElement) {
                itemElement.querySelector('.minus')?.addEventListener('click', () => {
                    CartActions.updateQuantity(item.id, item.quantity - 1);
                });
                
                itemElement.querySelector('.plus')?.addEventListener('click', () => {
                    CartActions.updateQuantity(item.id, item.quantity + 1);
                });
                
                itemElement.querySelector('.remove-item')?.addEventListener('click', () => {
                    CartActions.removeItem(item.id);
                });
            }
        });

        this.container.querySelector('.checkout-btn')?.addEventListener('click', () => {
            if (items.length > 0) {
                alert('Proceeding to checkout...');
                CartActions.clearCart();
                this.toggleCart();
            }
        });
    }

    public mount(): void {
        document.body.appendChild(this.container);
        
        // Add cart toggle button to navbar
        const cartIcon = document.querySelector('.nav-icons .fa-shopping-cart')?.parentElement;
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
            });
        }
    }
} 