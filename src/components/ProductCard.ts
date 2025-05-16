import { Product } from '../store/ProductStore';
import { CartActions } from '../actions/CartActions';

export class ProductCard extends HTMLElement {
    private product: Product | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['product'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'product' && oldValue !== newValue) {
            this.product = JSON.parse(newValue);
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    private handleAddToCart = () => {
        if (this.product) {
            CartActions.addItem({
                id: this.product.id.toString(),
                name: this.product.title,
                price: this.product.price,
                image: this.product.image
            });
        }
    }

    private render() {
        if (!this.product) return;

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }

            :host(:hover) {
                transform: translateY(-5px);
            }

            .product-image {
                position: relative;
                width: 100%;
                height: 300px;
                padding: 1rem;
                background: white;
            }

            .product-image img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .product-info {
                padding: 1.5rem;
            }

            .product-info h3 {
                margin: 0 0 0.5rem;
                color: #2c3e50;
                font-size: 1.2rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .price {
                color: #3498db;
                font-weight: 600;
                font-size: 1.2rem;
                margin-bottom: 1rem;
            }

            .add-to-cart {
                width: 100%;
                padding: 0.8rem;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .add-to-cart:hover {
                background-color: #2980b9;
            }

            .description {
                color: #7f8c8d;
                font-size: 0.9rem;
                margin-bottom: 1rem;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .rating {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1rem;
                color: #f1c40f;
            }

            .rating-count {
                color: #7f8c8d;
                font-size: 0.8rem;
            }
        `;

        const template = document.createElement('div');
        template.innerHTML = `
            <div class="product-image">
                <img src="${this.product.image}" alt="${this.product.title}">
            </div>
            <div class="product-info">
                <h3>${this.product.title}</h3>
                <div class="rating">
                    ${'★'.repeat(Math.round(this.product.rating.rate))}${'☆'.repeat(5 - Math.round(this.product.rating.rate))}
                    <span class="rating-count">(${this.product.rating.count})</span>
                </div>
                <p class="description">${this.product.description}</p>
                <p class="price">$${this.product.price.toFixed(2)}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        `;

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = '';
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(template);

            // Add event listener to the button in the shadow DOM
            const addToCartButton = this.shadowRoot.querySelector('.add-to-cart');
            if (addToCartButton) {
                addToCartButton.addEventListener('click', this.handleAddToCart);
            }
        }
    }
}

customElements.define('product-card', ProductCard); 