import { Product } from '../store/ProductStore';
import ProductStore from '../store/ProductStore';

export class ProductGrid extends HTMLElement {
    private products: Product[] = [];
    private isLoading: boolean = true;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.loadProducts();
        // Listen for changes in the store
        ProductStore.on('change', () => {
            this.products = ProductStore.getProducts();
            this.isLoading = false;
            this.render();
        });
    }

    disconnectedCallback() {
        // Clean up event listener
        ProductStore.removeAllListeners('change');
    }

    private async loadProducts() {
        try {
            this.isLoading = true;
            this.render();
            
            // Wait for products to be loaded
            await ProductStore.refreshProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.isLoading = false;
            this.render();
        }
    }

    private render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                padding: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 2rem;
                padding: 1rem;
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #7f8c8d;
                font-size: 1.2rem;
            }

            .error {
                text-align: center;
                padding: 2rem;
                color: #e74c3c;
                font-size: 1.2rem;
            }

            @media (max-width: 768px) {
                :host {
                    padding: 1rem;
                }

                .grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
            }

            @media (max-width: 480px) {
                .grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
            }
        `;

        const template = document.createElement('div');
        
        if (this.isLoading) {
            template.innerHTML = `
                <div class="loading">Loading products...</div>
            `;
        } else if (this.products.length === 0) {
            template.innerHTML = `
                <div class="error">No products found. Please try again later.</div>
            `;
        } else {
            const grid = document.createElement('div');
            grid.className = 'grid';

            this.products.forEach(product => {
                const card = document.createElement('product-card');
                card.setAttribute('product', JSON.stringify(product));
                grid.appendChild(card);
            });

            template.appendChild(grid);
        }

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = '';
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(template);
        }
    }
}

customElements.define('product-grid', ProductGrid); 