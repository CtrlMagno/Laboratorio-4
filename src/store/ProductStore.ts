import { EventEmitter } from 'events';
import { CacheManager } from '../cache/CacheManager';

export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
}

class ProductStore extends EventEmitter {
    private static instance: ProductStore;
    private products: Product[] = [];
    private cacheManager: CacheManager;
    private readonly CACHE_KEY = 'products';
    private readonly CACHE_CONFIG = {
        ttl: 30 * 60 * 1000, // 30 minutes for product data
        maxSize: 100 // 100 products in cache
    };

    private constructor() {
        super();
        this.cacheManager = CacheManager.getInstance(this.CACHE_CONFIG);
    }

    static getInstance(): ProductStore {
        if (!ProductStore.instance) {
            ProductStore.instance = new ProductStore();
        }
        return ProductStore.instance;
    }

    private async loadProducts(): Promise<void> {
        // Try to get products from cache first
        const cachedProducts = this.cacheManager.get<Product[]>(this.CACHE_KEY);
        if (cachedProducts) {
            this.products = cachedProducts;
            this.emit('change');
            return;
        }

        // If not in cache, load from API
        await this.fetchProducts();
    }

    private async fetchProducts(): Promise<void> {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            this.products = await response.json();
            
            // Save to cache
            this.cacheManager.set<Product[]>(this.CACHE_KEY, this.products);
            this.emit('change');
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    getProducts(): Product[] {
        return this.products;
    }

    getProductById(id: number): Product | undefined {
        return this.products.find(product => product.id === id);
    }

    async refreshProducts(): Promise<void> {
        // Clear cache and reload products
        this.cacheManager.clear();
        await this.fetchProducts();
    }
}

export default ProductStore.getInstance(); 