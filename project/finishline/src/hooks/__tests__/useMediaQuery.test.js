/**
 * useMediaQuery Tests
 * 
 * Tests for the useMediaQuery hook and related functionality.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import useMediaQuery, { useBreakpoint, useActiveBreakpoint, breakpoints } from '../useMediaQuery';

// Mock window.matchMedia
const mockMatchMedia = (matches) => {
  // Create a MediaQueryList mock
  const mediaQueryList = {
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
  
  // Create the mock function
  const matchMedia = jest.fn().mockImplementation((query) => {
    return mediaQueryList;
  });
  
  // Save the original window.matchMedia
  const originalMatchMedia = window.matchMedia;
  
  // Override window.matchMedia
  window.matchMedia = matchMedia;
  
  return {
    mediaQueryList,
    cleanup: () => {
      window.matchMedia = originalMatchMedia;
    },
  };
};

describe('useMediaQuery', () => {
  describe('Basic functionality', () => {
    it('returns false initially', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(false);
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      expect(result.current).toBe(false);
      
      cleanup();
    });
    
    it('returns the match state from mediaQueryList', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(true);
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      expect(result.current).toBe(true);
      
      cleanup();
    });
    
    it('adds event listener on mount', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(false);
      
      renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      cleanup();
    });
    
    it('removes event listener on unmount', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(false);
      
      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      unmount();
      
      expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      cleanup();
    });
    
    it('falls back to addListener for older browsers', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(false);
      
      // Remove addEventListener to simulate older browsers
      mediaQueryList.addEventListener = undefined;
      mediaQueryList.removeEventListener = undefined;
      
      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      expect(mediaQueryList.addListener).toHaveBeenCalledWith(expect.any(Function));
      
      unmount();
      
      expect(mediaQueryList.removeListener).toHaveBeenCalledWith(expect.any(Function));
      
      cleanup();
    });
    
    it('updates match state when media query changes', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(false);
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      
      expect(result.current).toBe(false);
      
      // Get the listener function
      const listener = mediaQueryList.addEventListener.mock.calls[0][1];
      
      // Simulate a media query change
      act(() => {
        listener({ matches: true });
      });
      
      expect(result.current).toBe(true);
      
      cleanup();
    });
  });
  
  describe('useBreakpoint', () => {
    it('returns the match state for a predefined breakpoint', () => {
      const { mediaQueryList, cleanup } = mockMatchMedia(true);
      
      const { result } = renderHook(() => useBreakpoint('md'));
      
      expect(window.matchMedia).toHaveBeenCalledWith(breakpoints.md);
      expect(result.current).toBe(true);
      
      cleanup();
    });
    
    it('logs an error and returns false for invalid breakpoint keys', () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const { cleanup } = mockMatchMedia(false);
      
      const { result } = renderHook(() => useBreakpoint('invalidKey'));
      
      expect(console.error).toHaveBeenCalledWith('Breakpoint key "invalidKey" is not defined');
      expect(result.current).toBe(false);
      
      console.error = originalConsoleError;
      cleanup();
    });
  });
  
  describe('useActiveBreakpoint', () => {
    it('returns the active breakpoint', () => {
      // Mock implementation for this specific test
      window.matchMedia = jest.fn().mockImplementation((query) => {
        // Return true only for md breakpoint
        if (query === breakpoints.md) {
          return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
        }
        return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      });
      
      const { result } = renderHook(() => useActiveBreakpoint());
      
      expect(result.current).toBe('md');
      
      // Reset window.matchMedia
      window.matchMedia.mockRestore();
    });
    
    it('returns xs as default when no breakpoints match', () => {
      // Mock implementation for this specific test
      window.matchMedia = jest.fn().mockImplementation(() => {
        // Return false for all breakpoints
        return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      });
      
      const { result } = renderHook(() => useActiveBreakpoint());
      
      expect(result.current).toBe('xs');
      
      // Reset window.matchMedia
      window.matchMedia.mockRestore();
    });
  });
});