/**
 * useAsync Tests
 * 
 * Tests for the useAsync hook.
 */

import { renderHook, act } from '@testing-library/react';
import useAsync from '../useAsync';

// Mock async functions
const mockAsyncSuccess = jest.fn(() => Promise.resolve('success result'));
const mockAsyncError = jest.fn(() => Promise.reject(new Error('test error')));

// Wait for next event loop tick (promises to resolve)
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAsync(mockAsyncSuccess));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('accepts initialData option', () => {
    const initialData = { foo: 'bar' };
    const { result } = renderHook(() => useAsync(mockAsyncSuccess, { initialData }));
    
    expect(result.current.data).toEqual(initialData);
  });

  it('executes immediately when immediate is true', async () => {
    const { result } = renderHook(() => useAsync(mockAsyncSuccess, { immediate: true }));
    
    // Initially loading is true
    expect(result.current.loading).toBe(true);
    
    // After the promise resolves
    await flushPromises();
    
    expect(mockAsyncSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('success result');
    expect(result.current.error).toBeNull();
  });

  it('does not execute immediately by default', () => {
    renderHook(() => useAsync(mockAsyncSuccess));
    
    expect(mockAsyncSuccess).not.toHaveBeenCalled();
  });

  it('executes function and updates state on success', async () => {
    const { result } = renderHook(() => useAsync(mockAsyncSuccess));
    
    // Execute the async function
    act(() => {
      result.current.execute();
    });
    
    // Loading should be true
    expect(result.current.loading).toBe(true);
    
    // After the promise resolves
    await act(async () => {
      await flushPromises();
    });
    
    expect(mockAsyncSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('success result');
    expect(result.current.error).toBeNull();
  });

  it('handles errors properly', async () => {
    const { result } = renderHook(() => useAsync(mockAsyncError));
    
    // Execute the async function
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected error, ignore in test
      }
    });
    
    expect(mockAsyncError).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('test error');
  });

  it('passes arguments to the async function', async () => {
    const mockAsyncWithArgs = jest.fn((arg1, arg2) => Promise.resolve([arg1, arg2]));
    const { result } = renderHook(() => useAsync(mockAsyncWithArgs));
    
    await act(async () => {
      await result.current.execute('first', 'second');
    });
    
    expect(mockAsyncWithArgs).toHaveBeenCalledWith('first', 'second');
    expect(result.current.data).toEqual(['first', 'second']);
  });

  it('calls onSuccess callback when execution succeeds', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncSuccess, { onSuccess }));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(onSuccess).toHaveBeenCalledWith('success result');
  });

  it('calls onError callback when execution fails', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncError, { onError }));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected error, ignore in test
      }
    });
    
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('test error');
  });

  it('calls onSettled callback after success', async () => {
    const onSettled = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncSuccess, { onSettled }));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(onSettled).toHaveBeenCalledWith('success result', null);
  });

  it('calls onSettled callback after error', async () => {
    const onSettled = jest.fn();
    const { result } = renderHook(() => useAsync(mockAsyncError, { onSettled }));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected error, ignore in test
      }
    });
    
    expect(onSettled).toHaveBeenCalled();
    expect(onSettled.mock.calls[0][0]).toBeNull();
    expect(onSettled.mock.calls[0][1]).toBeInstanceOf(Error);
  });

  it('re-executes when dependencies change', async () => {
    const dependency = { value: 1 };
    const { result, rerender } = renderHook(
      ({ dependency }) => useAsync(mockAsyncSuccess, { 
        immediate: true, 
        dependencies: [dependency] 
      }),
      { initialProps: { dependency } }
    );
    
    // First execution on mount
    await act(async () => {
      await flushPromises();
    });
    
    expect(mockAsyncSuccess).toHaveBeenCalledTimes(1);
    
    // Change dependency
    rerender({ dependency: { value: 2 } });
    
    // Should execute again
    await act(async () => {
      await flushPromises();
    });
    
    expect(mockAsyncSuccess).toHaveBeenCalledTimes(2);
  });

  it('resets state correctly', async () => {
    const initialData = 'initial';
    const { result } = renderHook(() => useAsync(mockAsyncSuccess, { initialData }));
    
    // First, execute to change the state
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toBe('success result');
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe(initialData);
  });
});