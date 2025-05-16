import { EventEmitter } from 'events';
import { CacheManager } from '../cache/CacheManager';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

class CartStore extends EventEmitter {
    private items: CartItem[] = [];
    private static instance: CartStore;
    private cacheManager: CacheManager;
    private readonly CACHE_KEY = 'shopping_cart';

    private constructor() {
        super();
        this.cacheManager = CacheManager.getInstance({
            ttl: 24 * 60 * 60 * 1000, // 24 hours for cart data
            maxSize: 1000 // Larger size for cart items
        });
        this.loadFromCache();
        // Ensure the store is ready to receive events
        this.setMaxListeners(20);
    }

    static getInstance(): CartStore {
        if (!CartStore.instance) {
            CartStore.instance = new CartStore();
        }
        return CartStore.instance;
    }

    private loadFromCache(): void {
        const cachedItems = this.cacheManager.get<CartItem[]>(this.CACHE_KEY);
        if (cachedItems) {
            this.items = cachedItems;
            this.emit('change');
        }
    }

    private saveToCache(): void {
        this.cacheManager.set<CartItem[]>(this.CACHE_KEY, this.items);
    }

    getItems(): CartItem[] {
        console.log('CartStore: Getting items', this.items);
        return [...this.items];
    }

    getTotal(): number {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    addItem(item: Omit<CartItem, 'quantity'>): void {
        console.log('CartStore: Adding item', item);
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('CartStore: Updated existing item quantity to', existingItem.quantity);
        } else {
            this.items.push({ ...item, quantity: 1 });
            console.log('CartStore: Added new item');
        }
        
        this.saveToCache();
        console.log('CartStore: Current items', this.items);
        this.emit('change');
    }

    removeItem(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToCache();
        this.emit('change');
    }

    updateQuantity(id: string, quantity: number): void {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(id);
            } else {
                this.saveToCache();
                this.emit('change');
            }
        }
    }

    clearCart(): void {
        this.items = [];
        this.saveToCache();
        this.emit('change');
    }
}

export default CartStore.getInstance(); 