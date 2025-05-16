export interface CacheConfig {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
}

export class CacheManager {
    private static instance: CacheManager;
    private memoryCache: Map<string, { data: unknown; timestamp: number }> = new Map();
    private config: CacheConfig;

    private constructor(config: CacheConfig = {}) {
        this.config = {
            ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default TTL
            maxSize: config.maxSize || 100 // 100 items default max size
        };
    }

    static getInstance(config?: CacheConfig): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager(config);
        }
        return CacheManager.instance;
    }

    // Memory Cache Methods
    setMemoryCache<T>(key: string, data: T): void {
        if (this.memoryCache.size >= this.config.maxSize!) {
            // Remove oldest item if cache is full
            const oldestKey = this.memoryCache.keys().next().value;
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
            }
        }

        this.memoryCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getMemoryCache<T>(key: string): T | null {
        const item = this.memoryCache.get(key);
        if (!item) return null;

        // Check if item has expired
        if (Date.now() - item.timestamp > this.config.ttl!) {
            this.memoryCache.delete(key);
            return null;
        }

        return item.data as T;
    }

    clearMemoryCache(): void {
        this.memoryCache.clear();
    }

    // Local Storage Methods
    setLocalStorage<T>(key: string, data: T): void {
        try {
            const item = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getLocalStorage<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsedItem = JSON.parse(item);
            
            // Check if item has expired
            if (Date.now() - parsedItem.timestamp > this.config.ttl!) {
                localStorage.removeItem(key);
                return null;
            }

            return parsedItem.data as T;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    clearLocalStorage(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    // Combined Cache Methods
    set<T>(key: string, data: T): void {
        this.setMemoryCache(key, data);
        this.setLocalStorage(key, data);
    }

    get<T>(key: string): T | null {
        // Try memory cache first
        const memoryData = this.getMemoryCache<T>(key);
        if (memoryData) return memoryData;

        // If not in memory, try localStorage
        const localData = this.getLocalStorage<T>(key);
        if (localData) {
            // Update memory cache with data from localStorage
            this.setMemoryCache(key, localData);
            return localData;
        }

        return null;
    }

    clear(): void {
        this.clearMemoryCache();
        this.clearLocalStorage();
    }
} 