/**
 * useLocalStorage Tests
 * 
 * Tests for the useLocalStorage hook.
 */

import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock storage event
const createStorageEvent = (key, newValue) => {
  return new StorageEvent('storage', {
    key,
    newValue,
    oldValue: localStorageMock.getItem(key),
    storageArea: localStorageMock,
  });
};

// Setup and cleanup
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('useLocalStorage', () => {
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('initial'));
  });

  it('retrieves existing value from localStorage', () => {
    // Pre-set a value in localStorage
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored value');
  });

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new value'));
  });

  it('accepts a function to update the value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]((prev) => prev + ' updated');
    });
    
    expect(result.current[0]).toBe('initial updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key', 
      JSON.stringify('initial updated')
    );
  });

  it('removes value from localStorage when removeValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[2]();
    });
    
    expect(result.current[0]).toBeUndefined();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('accepts a function as initialValue', () => {
    const initialFn = jest.fn(() => 'function initial');
    
    const { result } = renderHook(() => useLocalStorage('test-key', initialFn));
    
    expect(initialFn).toHaveBeenCalled();
    expect(result.current[0]).toBe('function initial');
  });

  it('handles objects correctly', () => {
    const testObject = { name: 'test', value: 123 };
    
    const { result } = renderHook(() => useLocalStorage('test-key', testObject));
    
    expect(result.current[0]).toEqual(testObject);
    
    act(() => {
      result.current[1]({ ...testObject, updated: true });
    });
    
    expect(result.current[0]).toEqual({ name: 'test', value: 123, updated: true });
  });

  it('handles arrays correctly', () => {
    const testArray = [1, 2, 3];
    
    const { result } = renderHook(() => useLocalStorage('test-key', testArray));
    
    expect(result.current[0]).toEqual(testArray);
    
    act(() => {
      result.current[1]([...testArray, 4]);
    });
    
    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('handles errors gracefully', () => {
    // Mock errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('respects the serialize option', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial', { serialize: false })
    );
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'new value');
  });

  it('uses custom serializer and deserializer', () => {
    const customSerializer = jest.fn((value) => `SERIALIZED:${value}`);
    const customDeserializer = jest.fn((value) => value.replace('SERIALIZED:', 'DESERIALIZED:'));
    
    // Setup localStorage with a value using our custom format
    localStorageMock.getItem.mockReturnValueOnce('SERIALIZED:initial');
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'fallback', {
        serializer: customSerializer,
        deserializer: customDeserializer,
      })
    );
    
    // Check that the deserializer was used
    expect(result.current[0]).toBe('DESERIALIZED:initial');
    expect(customDeserializer).toHaveBeenCalled();
    
    // Update the value
    act(() => {
      result.current[1]('new value');
    });
    
    // Check that the serializer was used
    expect(customSerializer).toHaveBeenCalledWith('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'SERIALIZED:new value');
  });

  it('syncs state with localStorage changes in other tabs/windows', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    // Simulate storage event from another tab
    act(() => {
      window.dispatchEvent(
        createStorageEvent('test-key', JSON.stringify('updated from another tab'))
      );
    });
    
    expect(result.current[0]).toBe('updated from another tab');
  });

  it('does not sync when sync option is false', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial', { sync: false })
    );
    
    // Simulate storage event from another tab
    act(() => {
      window.dispatchEvent(
        createStorageEvent('test-key', JSON.stringify('updated from another tab'))
      );
    });
    
    // Value should not change
    expect(result.current[0]).toBe('initial');
  });
});