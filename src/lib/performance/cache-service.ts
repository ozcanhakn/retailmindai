/**
 * Advanced Caching Service for Performance Optimization
 * Implements multi-layer caching with TTL, memory management, and background refresh
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
  size: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  maxMemory?: number; // Maximum memory usage in bytes
  tags?: string[]; // Tags for cache invalidation
  background?: boolean; // Whether to refresh in background
  refreshCallback?: () => Promise<any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
  maxMemory: number;
  oldestEntry: number;
  newestEntry: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0
  };
  private maxSize: number = 1000;
  private maxMemory: number = 50 * 1024 * 1024; // 50MB
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;
  private backgroundTasks = new Map<string, NodeJS.Timeout>();

  constructor(options: Partial<CacheOptions> = {}) {
    this.maxSize = options.maxSize || this.maxSize;
    this.maxMemory = options.maxMemory || this.maxMemory;
    this.defaultTTL = options.ttl || this.defaultTTL;
    
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Set cache entry with automatic memory management
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || this.defaultTTL;
    const tags = options.tags || [];
    const size = this.estimateSize(data);

    // Check memory limits
    if (this.shouldEvict(size)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      hits: 0,
      lastAccessed: now,
      tags,
      size
    };

    this.cache.set(key, entry);

    // Setup background refresh if needed
    if (options.background && options.refreshCallback) {
      this.setupBackgroundRefresh(key, options.refreshCallback, ttl);
    }

    // Cleanup if we exceed max size
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Get cache entry with hit tracking
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Get or set cache entry (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, options);
    return data;
  }

  /**
   * Invalidate cache entries by key or tags
   */
  invalidate(keyOrTag: string, byTag: boolean = false): number {
    let removed = 0;

    if (byTag) {
      for (const [key, entry] of this.cache) {
        if (entry.tags.includes(keyOrTag)) {
          this.cache.delete(key);
          this.clearBackgroundTask(key);
          removed++;
        }
      }
    } else {
      if (this.cache.delete(keyOrTag)) {
        this.clearBackgroundTask(keyOrTag);
        removed = 1;
      }
    }

    return removed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.clearAllBackgroundTasks();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    let memoryUsage = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      memoryUsage += entry.size;
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
      newestEntry = Math.max(newestEntry, entry.timestamp);
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalEntries: this.cache.size,
      memoryUsage,
      maxMemory: this.maxMemory,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Prefetch data for commonly accessed keys
   */
  async prefetch<T>(
    keys: Array<{ key: string; factory: () => Promise<T>; options?: CacheOptions }>
  ): Promise<void> {
    const promises = keys.map(async ({ key, factory, options }) => {
      try {
        const data = await factory();
        this.set(key, data, options);
      } catch (error) {
        console.warn(`Prefetch failed for key: ${key}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Warm up cache with initial data
   */
  async warmUp(warmupConfig: Array<{
    key: string;
    factory: () => Promise<any>;
    options?: CacheOptions;
  }>): Promise<void> {
    console.log('Cache warmup started...');
    const start = Date.now();
    
    await this.prefetch(warmupConfig);
    
    const duration = Date.now() - start;
    console.log(`Cache warmup completed in ${duration}ms. Cached ${warmupConfig.length} entries.`);
  }

  // Private methods

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
    }
  }

  private shouldEvict(newEntrySize: number): boolean {
    const currentMemory = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    return currentMemory + newEntrySize > this.maxMemory;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.clearBackgroundTask(oldestKey);
    }
  }

  private setupBackgroundRefresh(
    key: string,
    refreshCallback: () => Promise<any>,
    ttl: number
  ): void {
    // Clear existing task
    this.clearBackgroundTask(key);

    // Setup new refresh task slightly before expiry
    const refreshTime = ttl * 0.8; // Refresh at 80% of TTL
    
    const timeoutId = setTimeout(async () => {
      try {
        const newData = await refreshCallback();
        this.set(key, newData, { ttl, background: true, refreshCallback });
      } catch (error) {
        console.warn(`Background refresh failed for key: ${key}`, error);
      }
    }, refreshTime);

    this.backgroundTasks.set(key, timeoutId);
  }

  private clearBackgroundTask(key: string): void {
    const timeoutId = this.backgroundTasks.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.backgroundTasks.delete(key);
    }
  }

  private clearAllBackgroundTasks(): void {
    for (const timeoutId of this.backgroundTasks.values()) {
      clearTimeout(timeoutId);
    }
    this.backgroundTasks.clear();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.clearBackgroundTask(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAllBackgroundTasks();
    this.clear();
  }
}

// Singleton instance
export const cacheService = new CacheService({
  maxSize: 1000,
  maxMemory: 100 * 1024 * 1024, // 100MB
  ttl: 10 * 60 * 1000 // 10 minutes
});

// Cache decorators and utilities
export function Cached(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      
      return cacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        options
      );
    };
  };
}

export function InvalidateCache(tagOrKey: string, byTag: boolean = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      cacheService.invalidate(tagOrKey, byTag);
      return result;
    };
  };
}

// Utility functions
export const cacheUtils = {
  // Create cache key with consistent formatting
  createKey: (...parts: (string | number)[]): string => {
    return parts.map(part => String(part)).join(':');
  },

  // Cache for React components
  withCache: <T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> => {
    return cacheService.getOrSet(key, factory, options);
  },

  // Cache API responses
  cacheApiCall: async <T>(
    endpoint: string,
    options?: RequestInit & CacheOptions
  ): Promise<T> => {
    const cacheKey = `api:${endpoint}:${JSON.stringify(options)}`;
    
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      options
    );
  },

  // Cache heavy computations
  memoize: <T extends (...args: any[]) => any>(
    fn: T,
    options?: CacheOptions
  ): T => {
    return ((...args: Parameters<T>) => {
      const cacheKey = `memoize:${fn.name}:${JSON.stringify(args)}`;
      return cacheService.getOrSet(cacheKey, () => fn(...args), options);
    }) as T;
  }
};

export default cacheService;