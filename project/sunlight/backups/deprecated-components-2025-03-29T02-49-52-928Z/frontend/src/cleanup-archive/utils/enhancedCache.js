// enhancedCache.js
// -----------------------------------------------------------------------------
// Enhanced caching system with persistent storage, cache analytics, and advanced invalidation strategies

/**
 * Cache entry interface:
 * {
 *   data: any,            // The cached response data
 *   timestamp: number,    // When the entry was created
 *   expiry: number,       // When the entry expires
 *   lastAccessed: number, // When the entry was last accessed
 *   accessCount: number,  // How many times the entry has been accessed
 *   size: number          // Approximate size of the data in bytes
 * }
 */

// Cache storage types
export const STORAGE_TYPES = {
  MEMORY: 'memory',
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  HYBRID: 'hybrid', // Uses memory for fast access but persists to localStorage
};

// Cache strategies
export const CACHE_STRATEGIES = {
  TTL: 'ttl', // Time-based expiration
  LRU: 'lru', // Least Recently Used
  LFU: 'lfu', // Least Frequently Used
  ADAPTIVE: 'adaptive', // Mix of TTL and usage patterns
};

/**
 * Creates a new cache instance with advanced features
 */
export class EnhancedCache {
  constructor(options = {}) {
    // Cache configuration
    this.config = {
      name: options.name || 'api-cache',
      storageType: options.storageType || STORAGE_TYPES.MEMORY,
      strategy: options.strategy || CACHE_STRATEGIES.TTL,
      defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
      maxEntries: options.maxEntries || 1000,
      persistInterval: options.persistInterval || 30 * 1000, // 30 seconds
      debug: options.debug || false,
      onEvict: options.onEvict || null, // Callback when item is evicted
    };

    // Cache storage
    this.memoryCache = new Map();
    this.totalSize = 0;
    this.entryCount = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;

    // Initialize cache
    this._initialize();
  }

  /**
   * Initialize the cache system
   */
  _initialize() {
    // Load persisted cache if using localStorage or hybrid storage
    if (this._usesPersistentStorage()) {
      this._loadFromStorage();
    }

    // Set up automatic persistence if using hybrid storage
    if (this.config.storageType === STORAGE_TYPES.HYBRID) {
      this.persistInterval = setInterval(() => {
        this._saveToStorage();
      }, this.config.persistInterval);
    }

    // Set up automatic cache cleanup to remove expired items
    this.cleanupInterval = setInterval(
      () => {
        this._cleanup();
      },
      Math.min(60 * 1000, this.config.defaultTTL / 2)
    ); // Either every minute or half the TTL

    if (this.config.debug) {
        storageType: this.config.storageType,
        strategy: this.config.strategy,
        defaultTTL: this.config.defaultTTL,
        maxSize: this.config.maxSize,
        maxEntries: this.config.maxEntries,
      });
    }
  }

  /**
   * Determine if the cache uses persistent storage
   */
  _usesPersistentStorage() {
    return [
      STORAGE_TYPES.LOCAL_STORAGE,
      STORAGE_TYPES.SESSION_STORAGE,
      STORAGE_TYPES.HYBRID,
    ].includes(this.config.storageType);
  }

  /**
   * Get the storage object based on the cache configuration
   */
  _getStorage() {
    switch (this.config.storageType) {
      case STORAGE_TYPES.LOCAL_STORAGE:
      case STORAGE_TYPES.HYBRID:
        return localStorage;
      case STORAGE_TYPES.SESSION_STORAGE:
        return sessionStorage;
      default:
        return null;
    }
  }

  /**
   * Load persisted cache from storage
   */
  _loadFromStorage() {
    try {
      const storage = this._getStorage();
      if (!storage) return;

      const serialized = storage.getItem(this.config.name);
      if (!serialized) return;

      const { entries, metadata } = JSON.parse(serialized);

      if (entries && Array.isArray(entries)) {
        // Restore entries
        entries.forEach(([key, entry]) => {
          // Skip expired entries
          if (entry.expiry < Date.now()) return;
          this.memoryCache.set(key, entry);
        });

        // Restore metadata
        if (metadata) {
          this.totalSize = metadata.totalSize || 0;
          this.entryCount = metadata.entryCount || 0;
          this.hits = metadata.hits || 0;
          this.misses = metadata.misses || 0;
          this.evictions = metadata.evictions || 0;
        }

        if (this.config.debug) {
        }
      }
    } catch (error) {
      console.error('[EnhancedCache] Error loading cache from storage:', error);
      // Reset cache on error
      this.memoryCache.clear();
      this.totalSize = 0;
      this.entryCount = 0;
    }
  }

  /**
   * Save cache to persistent storage
   */
  _saveToStorage() {
    if (!this._usesPersistentStorage()) return;

    try {
      const storage = this._getStorage();
      if (!storage) return;

      // Convert Map to array for serialization
      const entries = Array.from(this.memoryCache.entries());

      // Add metadata
      const metadata = {
        totalSize: this.totalSize,
        entryCount: this.entryCount,
        hits: this.hits,
        misses: this.misses,
        evictions: this.evictions,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify({ entries, metadata });
      storage.setItem(this.config.name, serialized);

      if (this.config.debug) {
      }
    } catch (error) {
      console.error('[EnhancedCache] Error saving cache to storage:', error);
    }
  }

  /**
   * Remove expired entries from cache
   */
  _cleanup() {
    const now = Date.now();
    let removedCount = 0;
    let removedSize = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiry < now) {
        // Notify before eviction if a callback is provided
        if (this.config.onEvict) {
          this.config.onEvict(key, entry, 'expired');
        }

        this.memoryCache.delete(key);
        removedCount++;
        removedSize += entry.size || 0;
        this.evictions++;
      }
    }

    if (removedCount > 0) {
      this.totalSize -= removedSize;
      this.entryCount -= removedCount;

      if (this.config.debug) {
      }
    }
  }

  /**
   * Estimate the size of an object in bytes
   */
  _estimateSize(obj) {
    // For simple calculation, we'll stringify and count characters
    // This isn't perfect but gives a reasonable approximation
    try {
      const json = JSON.stringify(obj);
      return json.length * 2; // Unicode characters can take up to 2 bytes
    } catch (error) {
      // If we can't stringify, make a rough guess based on object complexity
      return Object.keys(obj).length * 100;
    }
  }

  /**
   * Make room in the cache according to the selected strategy
   */
  _makeRoom(requiredSize = 0) {
    // If we're under limits, no need to evict
    if (
      this.memoryCache.size < this.config.maxEntries &&
      this.totalSize + requiredSize < this.config.maxSize
    ) {
      return;
    }

    // Get all entries as an array for sorting
    const entries = Array.from(this.memoryCache.entries());
    let sortedEntries;

    // Sort based on the eviction strategy
    switch (this.config.strategy) {
      case CACHE_STRATEGIES.LRU:
        // Least Recently Used - sort by lastAccessed timestamp (oldest first)
        sortedEntries = entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        break;

      case CACHE_STRATEGIES.LFU:
        // Least Frequently Used - sort by accessCount (least accessed first)
        sortedEntries = entries.sort(([, a], [, b]) => a.accessCount - b.accessCount);
        break;

      case CACHE_STRATEGIES.ADAPTIVE:
        // Adaptive strategy - combine recency, frequency, and size into a score
        sortedEntries = entries.sort(([, a], [, b]) => {
          const now = Date.now();
          // Score formula: lower score = higher eviction priority
          // Consider recency, frequency, and size
          const scoreA =
            ((a.lastAccessed / now) * Math.log(a.accessCount + 1)) / Math.log(a.size + 1);
          const scoreB =
            ((b.lastAccessed / now) * Math.log(b.accessCount + 1)) / Math.log(b.size + 1);
          return scoreA - scoreB;
        });
        break;

      default:
        // TTL and default - sort by expiry (closest to expiration first)
        sortedEntries = entries.sort(([, a], [, b]) => a.expiry - b.expiry);
        break;
    }

    // Evict entries until we have enough room
    let evictedSize = 0;
    let evictedCount = 0;
    const entriesNeeded = Math.max(0, this.memoryCache.size + 1 - this.config.maxEntries);
    const sizeNeeded = Math.max(0, this.totalSize + requiredSize - this.config.maxSize);

    for (const [key, entry] of sortedEntries) {
      // Stop if we've made enough room
      if (evictedCount >= entriesNeeded && evictedSize >= sizeNeeded) {
        break;
      }

      // Notify before eviction if a callback is provided
      if (this.config.onEvict) {
        this.config.onEvict(key, entry, 'evicted');
      }

      // Evict the entry
      this.memoryCache.delete(key);
      evictedSize += entry.size || 0;
      evictedCount++;
      this.evictions++;
    }

    if (evictedCount > 0) {
      this.totalSize -= evictedSize;
      this.entryCount -= evictedCount;

      if (this.config.debug) {
      }
    }
  }

  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {Object} options - Cache options
   * @param {number} options.ttl - Time to live in milliseconds
   */
  set(key, data, options = {}) {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    const size = this._estimateSize(data);

    // Create cache entry
    const entry = {
      data,
      timestamp: now,
      expiry: now + ttl,
      lastAccessed: now,
      accessCount: 0,
      size,
    };

    // Check if we need to make room
    this._makeRoom(size);

    // Update cache size tracking
    const existingEntry = this.memoryCache.get(key);
    if (existingEntry) {
      this.totalSize -= existingEntry.size || 0;
      // Entry count stays the same for updates
    } else {
      this.entryCount++;
    }

    // Add to cache
    this.memoryCache.set(key, entry);
    this.totalSize += size;

    // For persistent storage, save immediately if not using hybrid mode
    if (this._usesPersistentStorage() && this.config.storageType !== STORAGE_TYPES.HYBRID) {
      this._saveToStorage();
    }

    return true;
  }

  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if not found/expired
   */
  get(key) {
    const entry = this.memoryCache.get(key);

    // Check if entry exists and is not expired
    if (entry && entry.expiry > Date.now()) {
      // Update access stats
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      this.hits++;

      return entry.data;
    }

    // Cache miss
    this.misses++;

    // Remove expired entry if present
    if (entry) {
      this.memoryCache.delete(key);
      this.totalSize -= entry.size || 0;
      this.entryCount--;
      this.evictions++;

      if (this.config.onEvict) {
        this.config.onEvict(key, entry, 'expired');
      }
    }

    return null;
  }

  /**
   * Check if an item exists in the cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - True if the item exists and is valid
   */
  has(key) {
    const entry = this.memoryCache.get(key);
    return entry && entry.expiry > Date.now();
  }

  /**
   * Remove an item from the cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if the item was removed
   */
  delete(key) {
    const entry = this.memoryCache.get(key);
    if (!entry) return false;

    this.memoryCache.delete(key);
    this.totalSize -= entry.size || 0;
    this.entryCount--;

    // For persistent storage, save immediately if not using hybrid mode
    if (this._usesPersistentStorage() && this.config.storageType !== STORAGE_TYPES.HYBRID) {
      this._saveToStorage();
    }

    return true;
  }

  /**
   * Remove all items that match a pattern
   * @param {RegExp|string} pattern - Pattern to match against keys
   * @returns {number} - Number of items removed
   */
  deletePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        this.totalSize -= entry.size || 0;
        count++;

        if (this.config.onEvict) {
          this.config.onEvict(key, entry, 'deleted');
        }
      }
    }

    this.entryCount -= count;

    // For persistent storage, save immediately if not using hybrid mode
    if (
      count > 0 &&
      this._usesPersistentStorage() &&
      this.config.storageType !== STORAGE_TYPES.HYBRID
    ) {
      this._saveToStorage();
    }

    return count;
  }

  /**
   * Remove all items matching a predicate function
   * @param {Function} predicate - Function that takes (key, entry) and returns boolean
   * @returns {number} - Number of items removed
   */
  deleteIf(predicate) {
    let count = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (predicate(key, entry.data)) {
        this.memoryCache.delete(key);
        this.totalSize -= entry.size || 0;
        count++;

        if (this.config.onEvict) {
          this.config.onEvict(key, entry, 'deleted');
        }
      }
    }

    this.entryCount -= count;

    // For persistent storage, save immediately if not using hybrid mode
    if (
      count > 0 &&
      this._usesPersistentStorage() &&
      this.config.storageType !== STORAGE_TYPES.HYBRID
    ) {
      this._saveToStorage();
    }

    return count;
  }

  /**
   * Update expiry time for an existing cache entry
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in milliseconds
   * @returns {boolean} - True if the item was updated
   */
  touch(key, ttl = null) {
    const entry = this.memoryCache.get(key);
    if (!entry) return false;

    // Update expiry
    const newTtl = ttl || this.config.defaultTTL;
    entry.expiry = Date.now() + newTtl;

    return true;
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.memoryCache.clear();
    this.totalSize = 0;
    this.entryCount = 0;

    // Clear from storage as well
    if (this._usesPersistentStorage()) {
      const storage = this._getStorage();
      if (storage) {
        storage.removeItem(this.config.name);
      }
    }

    if (this.config.debug) {
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      name: this.config.name,
      entries: this.entryCount,
      size: this.totalSize,
      maxEntries: this.config.maxEntries,
      maxSize: this.config.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.hits + this.misses === 0 ? 0 : this.hits / (this.hits + this.misses),
      strategy: this.config.strategy,
      storageType: this.config.storageType,
    };
  }

  /**
   * Destroy the cache instance and clean up resources
   */
  destroy() {
    // Clear intervals
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Save to storage if needed
    if (this._usesPersistentStorage()) {
      this._saveToStorage();
    }

    // Clear memory
    this.memoryCache.clear();
    this.totalSize = 0;
    this.entryCount = 0;

    if (this.config.debug) {
    }
  }
}

/**
 * Creates a cache group - a collection of related caches with shared configuration
 */
export class CacheGroup {
  constructor(options = {}) {
    this.options = {
      prefix: options.prefix || 'cache-group',
      defaultTTL: options.defaultTTL || 5 * 60 * 1000,
      storageType: options.storageType || STORAGE_TYPES.MEMORY,
      strategy: options.strategy || CACHE_STRATEGIES.TTL,
      debug: options.debug || false,
    };

    // Map of cache instances
    this.caches = new Map();
  }

  /**
   * Get a cache instance, creating it if it doesn't exist
   * @param {string} name - Cache name
   * @param {Object} options - Override default options for this cache
   * @returns {EnhancedCache} - Cache instance
   */
  getCache(name, options = {}) {
    const cacheName = `${this.options.prefix}-${name}`;

    if (!this.caches.has(cacheName)) {
      // Merge default options with provided options
      const cacheOptions = {
        ...this.options,
        ...options,
        name: cacheName,
      };

      // Create cache
      const cache = new EnhancedCache(cacheOptions);
      this.caches.set(cacheName, cache);

      return cache;
    }

    return this.caches.get(cacheName);
  }

  /**
   * Clear all caches in the group
   */
  clearAll() {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Destroy all caches in the group
   */
  destroyAll() {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
  }

  /**
   * Get stats for all caches in the group
   */
  getAllStats() {
    const stats = [];
    for (const [name, cache] of this.caches.entries()) {
      stats.push({
        name,
        ...cache.getStats(),
      });
    }
    return stats;
  }
}

// Create default API cache group
export const apiCacheGroup = new CacheGroup({
  prefix: 'api',
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  storageType: STORAGE_TYPES.HYBRID,
  strategy: CACHE_STRATEGIES.ADAPTIVE,
});

// Create reference data cache with longer TTL
export const referenceCache = apiCacheGroup.getCache('reference', {
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  strategy: CACHE_STRATEGIES.LRU,
});

// Create user data cache with shorter TTL
export const userDataCache = apiCacheGroup.getCache('user-data', {
  defaultTTL: 2 * 60 * 1000, // 2 minutes
  storageType: STORAGE_TYPES.MEMORY,
});

// Export default caches and constructors
export default {
  apiCache: apiCacheGroup.getCache('default'),
  referenceCache,
  userDataCache,
  EnhancedCache,
  CacheGroup,
  STORAGE_TYPES,
  CACHE_STRATEGIES,
};
