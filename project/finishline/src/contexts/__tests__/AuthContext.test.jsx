/**
 * AuthContext Tests
 * 
 * Tests for the AuthContext provider and hook.
 */

import React from 'react';
import { render, screen, fireEvent, renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component that uses auth
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div data-testid="auth-test">
      <span data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </span>
      {user && (
        <span data-testid="user-email">{user.email}</span>
      )}
      <button 
        onClick={() => login({ email: 'test@example.com', password: 'password123' })} 
        data-testid="login-button"
      >
        Login
      </button>
      <button 
        onClick={logout} 
        data-testid="logout-button"
      >
        Logout
      </button>
    </div>
  );
};

// Wrapper for testing hooks
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage mocks
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });
  
  // Provider tests
  describe('AuthProvider', () => {
    it('initializes with unauthenticated state', async () => {
      render(<TestComponent />, { wrapper: AuthProvider });
      
      // Initially loading, then resolves to unauthenticated
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });
    
    it('initializes with authenticated state when there is a user in localStorage', async () => {
      // Setup localStorage with a user
      const mockUser = { id: '123', email: 'stored@example.com', name: 'Stored User' };
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify(mockUser));
      
      render(<TestComponent />, { wrapper: AuthProvider });
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com');
      });
    });
    
    it('can authenticate a user via login', async () => {
      render(<TestComponent />, { wrapper: AuthProvider });
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
      
      // Trigger login
      fireEvent.click(screen.getByTestId('login-button'));
      
      // Wait for login to complete and check state
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
      
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
    
    it('can log out a user', async () => {
      // Start with an authenticated user
      const mockUser = { id: '123', email: 'user@example.com', name: 'Test User' };
      
      render(
        <AuthProvider initialUser={mockUser}>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });
      
      // Trigger logout
      fireEvent.click(screen.getByTestId('logout-button'));
      
      // Wait for logout to complete and check state
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
      
      // Verify localStorage item was removed
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
  
  // Hook tests
  describe('useAuth', () => {
    it('returns the auth properties and functions', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
    });
    
    it('can register a new user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      
      await act(async () => {
        const registerResult = await result.current.register(userData);
        expect(registerResult.success).toBe(true);
      });
      
      expect(result.current.user).not.toBeNull();
      expect(result.current.user.email).toBe('newuser@example.com');
      expect(result.current.user.name).toBe('New User');
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    it('handles registration with invalid data', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Missing required fields
      const invalidUserData = {
        email: 'newuser@example.com',
        // missing password and name
      };
      
      let registerResult;
      
      await act(async () => {
        registerResult = await result.current.register(invalidUserData);
      });
      
      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('Email, password and name are required');
      expect(result.current.isAuthenticated).toBe(false);
    });
    
    it('can update user profile', async () => {
      // Start with authenticated user
      const initialUser = {
        id: '123',
        email: 'user@example.com',
        name: 'Initial Name',
      };
      
      const { result } = renderHook(() => useAuth(), { 
        wrapper: ({ children }) => (
          <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
        )
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Update profile
      const profileUpdate = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };
      
      await act(async () => {
        const updateResult = await result.current.updateProfile(profileUpdate);
        expect(updateResult.success).toBe(true);
      });
      
      // Check that profile was updated
      expect(result.current.user.name).toBe('Updated Name');
      expect(result.current.user.avatar).toBe('https://example.com/avatar.jpg');
      expect(result.current.user.email).toBe('user@example.com'); // unchanged
    });
    
    it('throws an error when used outside of AuthProvider', () => {
      // Suppress console.error for this test to avoid noisy output
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });
});