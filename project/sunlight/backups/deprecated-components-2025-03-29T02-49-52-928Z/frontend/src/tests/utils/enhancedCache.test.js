// enhancedCache.test.js
import { EnhancedCache, CacheGroup, CACHE_STRATEGIES, STORAGE_TYPES, apiCacheGroup, referenceCache, userDataCache } from '@utils/enhancedCache';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';


  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

const sessionStorageMock = (() => {
  // Added display name
  sessionStorageMock.displayName = 'sessionStorageMock';

  // Added display name
  sessionStorageMock.displayName = 'sessionStorageMock';

  // Added display name
  sessionStorageMock.displayName = 'sessionStorageMock';

  // Added display name
  sessionStorageMock.displayName = 'sessionStorageMock';

  // Added display name
  sessionStorageMock.displayName = 'sessionStorageMock';


  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock timers
jest.useFakeTimers();

describe('Enhanced Cache', () => {
  // Setup environment
  beforeAll(() => {
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
    
    // Mock console
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  // Cleanup environment
  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.useRealTimers();
  });
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });
  
  // Test EnhancedCache
  describe('EnhancedCache', () => {
    let cache;
    
    beforeEach(() => {
      cache = new EnhancedCache({
        name: 'test-cache',
        storageType: STORAGE_TYPES.MEMORY,
        strategy: CACHE_STRATEGIES.TTL,
        defaultTTL: 1000, // 1 second for faster testing
        maxSize: 10000,
        maxEntries: 100,
        debug: false,
      });
    });
    
    afterEach(() => {
      if (cache) {
        cache.destroy();
      }
    });
    
    it('initializes with correct options', () => {
      // Assert
      expect(cache.config.name).toBe('test-cache');
      expect(cache.config.storageType).toBe(STORAGE_TYPES.MEMORY);
      expect(cache.config.strategy).toBe(CACHE_STRATEGIES.TTL);
      expect(cache.config.defaultTTL).toBe(1000);
      expect(cache.memoryCache).toBeDefined();
      expect(cache.totalSize).toBe(0);
      expect(cache.entryCount).toBe(0);
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
      expect(cache.evictions).toBe(0);
    });
    
    it('sets and gets items correctly', () => {
      // Act
      cache.set('key1', { test: 'value' });
      const result = cache.get('key1');
      
      // Assert
      expect(result).toEqual({ test: 'value' });
      expect(cache.entryCount).toBe(1);
      expect(cache.hits).toBe(1);
      expect(cache.misses).toBe(0);
    });
    
    it('reports missing items correctly', () => {
      // Act
      const result = cache.get('nonexistent');
      
      // Assert
      expect(result).toBeNull();
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(1);
    });
    
    it('handles item expiration correctly', () => {
      // Arrange
      cache.set('expiring', { test: 'value' }, { ttl: 100 }); // 100ms TTL
      
      // Act - initially the item is available
      const beforeExpiry = cache.get('expiring');
      
      // Advance time past expiration
      jest.advanceTimersByTime(150);
      
      // Now the item should be expired
      const afterExpiry = cache.get('expiring');
      
      // Assert
      expect(beforeExpiry).toEqual({ test: 'value' });
      expect(afterExpiry).toBeNull();
      expect(cache.hits).toBe(1);
      expect(cache.misses).toBe(1);
      expect(cache.evictions).toBe(1);
    });
    
    it('handles automatic cleanup of expired items', () => {
      // Arrange
      cache.set('item1', 'value1', { ttl: 500 });
      cache.set('item2', 'value2', { ttl: 1500 });
      
      // Act - advance time past first item's expiration
      jest.advanceTimersByTime(1000);
      
      // Trigger cleanup (normally done by interval)
      cache._cleanup();
      
      // Check both items
      const item1 = cache.get('item1');
      const item2 = cache.get('item2');
      
      // Assert
      expect(item1).toBeNull(); // Should be expired and removed
      expect(item2).toBe('value2'); // Should still be valid
      expect(cache.entryCount).toBe(1); // Only one item left
      expect(cache.evictions).toBe(1); // One item evicted during cleanup
    });
    
    it('respects maxEntries limit with LRU strategy', () => {
      // Arrange - create cache with LRU strategy and small maxEntries
      const lruCache = new EnhancedCache({
        name: 'lru-test',
        strategy: CACHE_STRATEGIES.LRU,
        maxEntries: 2,
      });
      
      // Act - add 3 items, should evict the least recently used
      lruCache.set('item1', 'value1');
      lruCache.set('item2', 'value2');
      
      // Access item1 to make it more recently used than item2
      lruCache.get('item1');
      
      // Add third item, should evict item2 (least recently used)
      lruCache.set('item3', 'value3');
      
      // Check all items
      const item1 = lruCache.get('item1');
      const item2 = lruCache.get('item2');
      const item3 = lruCache.get('item3');
      
      // Assert
      expect(item1).toBe('value1'); // Should be kept
      expect(item2).toBeNull(); // Should be evicted
      expect(item3).toBe('value3'); // Should be kept
      expect(lruCache.entryCount).toBe(2); // Respect max entries
      expect(lruCache.evictions).toBe(1); // One eviction
      
      // Cleanup
      lruCache.destroy();
    });
    
    it('respects maxSize limit with size-based eviction', () => {
      // Arrange - create cache with small maxSize
      // Note: size estimation is approximate
      const sizeCache = new EnhancedCache({
        name: 'size-test',
        maxSize: 100, // Very small max size
      });
      
      // Act - add items with increasing sizes
      sizeCache.set('small', 'a');
      sizeCache.set('medium', 'abcdefghijklmnopqrstuvwxyz');
      
      // This should trigger size-based eviction
      sizeCache.set('large', 'a'.repeat(200));
      
      // Check all items
      const small = sizeCache.get('small');
      const medium = sizeCache.get('medium');
      const large = sizeCache.get('large');
      
      // Assert - depending on implementation details, smaller items might be evicted
      // to make room for the large one
      expect(large).toBe('a'.repeat(200)); // The most recent item should be kept
      
      // At least one eviction should have happened
      expect(sizeCache.evictions).toBeGreaterThan(0);
      
      // Cleanup
      sizeCache.destroy();
    });
    
    it('persists and loads from localStorage in hybrid mode', () => {
      // Arrange - create cache with hybrid storage
      const hybridCache = new EnhancedCache({
        name: 'hybrid-test',
        storageType: STORAGE_TYPES.HYBRID,
        persistInterval: 100, // Short interval for testing
      });
      
      // Act - add data
      hybridCache.set('persist-key', { test: 'persisted value' });
      
      // Advance time to trigger persistence
      jest.advanceTimersByTime(200);
      
      // Assert - check localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Create a new cache with the same name to test loading
      hybridCache.destroy();
      const reloadedCache = new EnhancedCache({
        name: 'hybrid-test',
        storageType: STORAGE_TYPES.HYBRID,
      });
      
      // Assert - loading should have been triggered
      expect(localStorageMock.getItem).toHaveBeenCalledWith('hybrid-test');
      
      // Cleanup
      reloadedCache.destroy();
    });
    
    it('deletes items by pattern', () => {
      // Arrange
      cache.set('user-1', { id: 1, name: 'Alice' });
      cache.set('user-2', { id: 2, name: 'Bob' });
      cache.set('product-1', { id: 1, name: 'Widget' });
      
      // Act - delete all user items
      const deletedCount = cache.deletePattern('user-');
      
      // Check remaining items
      const user1 = cache.get('user-1');
      const user2 = cache.get('user-2');
      const product1 = cache.get('product-1');
      
      // Assert
      expect(deletedCount).toBe(2); // Two items deleted
      expect(user1).toBeNull(); // Should be deleted
      expect(user2).toBeNull(); // Should be deleted
      expect(product1).toEqual({ id: 1, name: 'Widget' }); // Should remain
      expect(cache.entryCount).toBe(1); // Only one item left
    });
    
    it('generates accurate cache statistics', () => {
      // Arrange
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('missing'); // Miss
      
      // Act
      const stats = cache.getStats();
      
      // Assert
      expect(stats.entries).toBe(2);
      expect(stats.hits).toBe(3); // 3 hits
      expect(stats.misses).toBe(1); // 1 miss
      expect(stats.hitRate).toBeCloseTo(0.75); // 3 hits / 4 total accesses
      expect(stats.evictions).toBe(0);
      expect(stats.name).toBe('test-cache');
      expect(stats.strategy).toBe(CACHE_STRATEGIES.TTL);
    });
    
    it('clears all items', () => {
      // Arrange
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Act
      cache.clear();
      
      // Check if items still exist
      const key1 = cache.get('key1');
      const key2 = cache.get('key2');
      
      // Assert
      expect(key1).toBeNull();
      expect(key2).toBeNull();
      expect(cache.entryCount).toBe(0);
      expect(cache.totalSize).toBe(0);
    });
  });
  
  // Test CacheGroup
  describe('CacheGroup', () => {
    let cacheGroup;
    
    beforeEach(() => {
      cacheGroup = new CacheGroup({
        prefix: 'test-group',
        defaultTTL: 5000,
        storageType: STORAGE_TYPES.MEMORY,
        strategy: CACHE_STRATEGIES.TTL,
      });
    });
    
    afterEach(() => {
      if (cacheGroup) {
        cacheGroup.destroyAll();
      }
    });
    
    it('creates and retrieves caches by name', () => {
      // Act
      const cache1 = cacheGroup.getCache('cache1');
      const cache2 = cacheGroup.getCache('cache2');
      
      // Get the same cache again - should return the existing instance
      const cache1Again = cacheGroup.getCache('cache1');
      
      // Assert
      expect(cache1).toBeDefined();
      expect(cache2).toBeDefined();
      expect(cache1Again).toBe(cache1); // Same instance
      
      // Check if cache names were set correctly
      expect(cache1.config.name).toBe('test-group-cache1');
      expect(cache2.config.name).toBe('test-group-cache2');
    });
    
    it('creates caches with custom options that override defaults', () => {
      // Act
      const customCache = cacheGroup.getCache('custom', {
        strategy: CACHE_STRATEGIES.LRU,
        defaultTTL: 10000, // Override default TTL
      });
      
      // Assert
      expect(customCache.config.strategy).toBe(CACHE_STRATEGIES.LRU); // Overridden
      expect(customCache.config.defaultTTL).toBe(10000); // Overridden
      expect(customCache.config.storageType).toBe(STORAGE_TYPES.MEMORY); // Inherited
    });
    
    it('clears all caches in the group', () => {
      // Arrange
      const cache1 = cacheGroup.getCache('cache1');
      const cache2 = cacheGroup.getCache('cache2');
      
      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');
      
      // Spy on the clear method
      const spy1 = jest.spyOn(cache1, 'clear');
      const spy2 = jest.spyOn(cache2, 'clear');
      
      // Act
      cacheGroup.clearAll();
      
      // Assert
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      
      // Manually verify cache contents
      expect(cache1.get('key1')).toBeNull();
      expect(cache2.get('key2')).toBeNull();
    });
    
    it('gets stats for all caches in the group', () => {
      // Arrange
      const cache1 = cacheGroup.getCache('cache1');
      const cache2 = cacheGroup.getCache('cache2');
      
      // Add some data and operations to generate stats
      cache1.set('key1', 'value1');
      cache1.get('key1'); // Hit
      cache1.get('missing'); // Miss
      
      cache2.set('key2', 'value2');
      cache2.get('key2'); // Hit
      
      // Act
      const stats = cacheGroup.getAllStats();
      
      // Assert
      expect(stats.length).toBe(2); // Two caches
      
      // Find stats for each cache
      const cache1Stats = stats.find(s => s.name === 'test-group-cache1');
      const cache2Stats = stats.find(s => s.name === 'test-group-cache2');
      
      expect(cache1Stats).toBeDefined();
      expect(cache2Stats).toBeDefined();
      
      expect(cache1Stats.hits).toBe(1);
      expect(cache1Stats.misses).toBe(1);
      expect(cache1Stats.entries).toBe(1);
      
      expect(cache2Stats.hits).toBe(1);
      expect(cache2Stats.misses).toBe(0);
      expect(cache2Stats.entries).toBe(1);
    });
  });
  
  // Test Exported Cache Instances
  describe('Exported Cache Instances', () => {
    it('exports correctly configured cache instances', () => {
      // We can't easily test the implementation, but we can verify interfaces
      
      // Check apiCacheGroup
      expect(apiCacheGroup).toBeInstanceOf(CacheGroup);
      
      // Check referenceCache
      expect(referenceCache).toBeDefined();
      expect(referenceCache.get).toBeDefined();
      expect(referenceCache.set).toBeDefined();
      
      // Check userDataCache
      expect(userDataCache).toBeDefined();
      expect(userDataCache.get).toBeDefined();
      expect(userDataCache.set).toBeDefined();
    });
  });
});