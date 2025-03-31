// tests/contexts/KeyboardShortcutsContext.test.js
// -----------------------------------------------------------------------------
// Tests for the KeyboardShortcutsContext provider and hook using dependency injection pattern

import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KeyboardShortcutsProvider, useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';

// Create a mock keyboard service for testing
const createMockKeyboardService = () => {
  // Added display name
  createMockKeyboardService.displayName = 'createMockKeyboardService';

  // Added display name
  createMockKeyboardService.displayName = 'createMockKeyboardService';

  // Added display name
  createMockKeyboardService.displayName = 'createMockKeyboardService';

  // Added display name
  createMockKeyboardService.displayName = 'createMockKeyboardService';

  // Added display name
  createMockKeyboardService.displayName = 'createMockKeyboardService';


  // Track registered event listeners for simulating events
  const eventListeners = {};

  return {
    // Mock event listener registration
    addEventListener: jest.fn((eventType, handler) => {
      if (!eventListeners[eventType]) {
        eventListeners[eventType] = [];
      }
      eventListeners[eventType].push(handler);
    }),

    // Mock event listener removal
    removeEventListener: jest.fn((eventType, handler) => {
      if (eventListeners[eventType]) {
        const index = eventListeners[eventType].indexOf(handler);
        if (index > -1) {
          eventListeners[eventType].splice(index, 1);
        }
      }
    }),

    // Mock active element getter
    getActiveElement: jest.fn(() => {
      return { 
        tagName: 'DIV',
        isContentEditable: false
      };
    }),

    // Mock ID generator
    generateId: jest.fn(() => `mock-id-${Math.random().toString(36).substring(2, 7)}`),

    // Helper to simulate a keyboard event
    simulateKeyDown: (key, modifiers = {}) => {
      const mockEvent = {
        key,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        ctrlKey: !!modifiers.ctrlKey,
        altKey: !!modifiers.altKey,
        shiftKey: !!modifiers.shiftKey,
        metaKey: !!modifiers.metaKey,
      };

      if (eventListeners.keydown) {
        eventListeners.keydown.forEach(handler => handler(mockEvent));
      }

      return mockEvent;
    },

    // Mock text input element
    mockInputElement: () => {
      // Override the active element to simulate an input field
      const originalGetActiveElement = eventListeners.getActiveElement;
      
      eventListeners.getActiveElement = jest.fn(() => ({
        tagName: 'INPUT',
        isContentEditable: false
      }));
      
      return () => {
        // Restore original function
        eventListeners.getActiveElement = originalGetActiveElement;
      };
    },

    // Get event listeners for inspection
    getEventListeners: () => eventListeners
  };
};

// Test component with optional callback to expose context values
const TestComponent = ({ onContextLoad = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

} }) => {
  const context = useKeyboardShortcuts();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);
  
  const {
    registerShortcut,
    unregisterShortcut,
    toggleShortcuts,
    shortcutsEnabled,
    getRegisteredShortcuts,
    shortcutsHelpText,
  } = context;
  
  // Mock shortcuts for testing
  useEffect(() => {
    const saveShortcutId = registerShortcut({
      key: 's',
      ctrlKey: true,
      description: 'Save document',
      handler: jest.fn(),
    });
    
    const helpShortcutId = registerShortcut({
      key: 'h',
      ctrlKey: true,
      description: 'Show help',
      handler: jest.fn(),
      global: true,
    });
    
    // Cleanup on unmount
    return () => {
      unregisterShortcut(saveShortcutId);
      unregisterShortcut(helpShortcutId);
    };
  }, [registerShortcut, unregisterShortcut]);
  
  return (
    <div>
      <div data-testid="shortcuts-enabled">{shortcutsEnabled ? 'Enabled' : 'Disabled'}</div>
      <div data-testid="shortcuts-count">{getRegisteredShortcuts().length}</div>
      <div data-testid="shortcuts-help">{shortcutsHelpText.length > 0 ? 'Help Available' : 'No Help'}</div>
      
      <button data-testid="toggle-shortcuts" onClick={() => toggleShortcuts()}>
        Toggle Shortcuts
      </button>
      
      <button 
        data-testid="register-shortcut" 
        onClick={() => 
          registerShortcut({
            key: 'f',
            description: 'Find text',
            handler: jest.fn(),
          })
        }
      >
        Register New Shortcut
      </button>
    </div>
  );
};

// Helper function for simpler test setup with dependency injection
const renderWithKeyboardContext = (
  keyboardService = createMockKeyboardService(),
  initialEnabled = true
) => {
  let contextValues = null;
  
  render(
    <KeyboardShortcutsProvider enabled={initialEnabled} keyboardService={keyboardService}>
      <TestComponent
        onContextLoad={(values) => {
          contextValues = values;
        }}
      />
    </KeyboardShortcutsProvider>
  );
  
  // Helper to get the latest context values
  const getContextValues = () => contextValues;
  
  return {
    getContextValues,
    keyboardService,
  };
};

describe('KeyboardShortcutsContext using dependency injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });
  
  it('initializes with default enabled state', () => {
    renderWithKeyboardContext();
    expect(screen.getByTestId('shortcuts-enabled')).toHaveTextContent('Enabled');
  });
  
  it('initializes with disabled state when provided', () => {
    renderWithKeyboardContext(createMockKeyboardService(), false);
    expect(screen.getByTestId('shortcuts-enabled')).toHaveTextContent('Disabled');
  });
  
  it('registers event listeners during initialization', () => {
    const { keyboardService } = renderWithKeyboardContext();
    expect(keyboardService.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('registers shortcuts and shows correct count', () => {
    renderWithKeyboardContext();
    // The test component registers 2 shortcuts in its useEffect
    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('2');
  });
  
  it('allows toggling shortcuts on and off', () => {
    renderWithKeyboardContext();
    
    // Initially enabled
    expect(screen.getByTestId('shortcuts-enabled')).toHaveTextContent('Enabled');
    
    // Toggle off
    fireEvent.click(screen.getByTestId('toggle-shortcuts'));
    expect(screen.getByTestId('shortcuts-enabled')).toHaveTextContent('Disabled');
    
    // Toggle back on
    fireEvent.click(screen.getByTestId('toggle-shortcuts'));
    expect(screen.getByTestId('shortcuts-enabled')).toHaveTextContent('Enabled');
  });
  
  it('adds a new shortcut when requested', () => {
    renderWithKeyboardContext();
    
    // Initially has 2 shortcuts
    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('2');
    
    // Register another shortcut
    fireEvent.click(screen.getByTestId('register-shortcut'));
    
    // Should now have 3 shortcuts
    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('3');
  });
  
  it('provides help text for all registered shortcuts', () => {
    renderWithKeyboardContext();
    expect(screen.getByTestId('shortcuts-help')).toHaveTextContent('Help Available');
    
    const { getContextValues } = renderWithKeyboardContext();
    const contextValues = getContextValues();
    
    // Should have 2 help entries
    expect(contextValues.shortcutsHelpText).toHaveLength(2);
    
    // Check format of help text
    const helpEntry = contextValues.shortcutsHelpText[0];
    expect(helpEntry).toHaveProperty('combo');
    expect(helpEntry).toHaveProperty('description');
    expect(helpEntry).toHaveProperty('global');
  });
  
  it('triggers shortcut handler when matching key is pressed', () => {
    const mockKeyboardService = createMockKeyboardService();
    renderWithKeyboardContext(mockKeyboardService);
    
    // Get the context values to access the handlers
    const { getContextValues } = renderWithKeyboardContext(mockKeyboardService);
    const contextValues = getContextValues();
    
    // Create a test shortcut with a mock handler
    const mockHandler = jest.fn();
    const shortcutId = contextValues.registerShortcut({
      key: 't',
      description: 'Test shortcut',
      handler: mockHandler,
    });
    
    // Simulate pressing the shortcut key
    const event = mockKeyboardService.simulateKeyDown('t');
    
    // Handler should have been called
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({ key: 't' }));
    expect(event.preventDefault).toHaveBeenCalled();
    
    // Cleanup
    contextValues.unregisterShortcut(shortcutId);
  });
  
  it('does not trigger shortcuts when disabled', () => {
    const mockKeyboardService = createMockKeyboardService();
    const { getContextValues } = renderWithKeyboardContext(mockKeyboardService);
    const contextValues = getContextValues();
    
    // Create a test shortcut with a mock handler
    const mockHandler = jest.fn();
    const shortcutId = contextValues.registerShortcut({
      key: 't',
      description: 'Test shortcut',
      handler: mockHandler,
    });
    
    // Disable shortcuts
    contextValues.toggleShortcuts(false);
    
    // Simulate pressing the shortcut key
    mockKeyboardService.simulateKeyDown('t');
    
    // Handler should not have been called
    expect(mockHandler).not.toHaveBeenCalled();
    
    // Cleanup
    contextValues.unregisterShortcut(shortcutId);
  });
  
  it('respects global flag for shortcuts in input fields', () => {
    const mockKeyboardService = createMockKeyboardService();
    
    // Override active element to simulate input field
    mockKeyboardService.getActiveElement.mockReturnValue({
      tagName: 'INPUT',
      isContentEditable: false
    });
    
    const { getContextValues } = renderWithKeyboardContext(mockKeyboardService);
    const contextValues = getContextValues();
    
    // Create regular (non-global) shortcut
    const regularHandler = jest.fn();
    const regularId = contextValues.registerShortcut({
      key: 'r',
      description: 'Regular shortcut',
      handler: regularHandler,
      global: false
    });
    
    // Create global shortcut
    const globalHandler = jest.fn();
    const globalId = contextValues.registerShortcut({
      key: 'g',
      description: 'Global shortcut',
      handler: globalHandler,
      global: true
    });
    
    // Simulate pressing both keys
    mockKeyboardService.simulateKeyDown('r');
    mockKeyboardService.simulateKeyDown('g');
    
    // Only global handler should be called
    expect(regularHandler).not.toHaveBeenCalled();
    expect(globalHandler).toHaveBeenCalledTimes(1);
    
    // Cleanup
    contextValues.unregisterShortcut(regularId);
    contextValues.unregisterShortcut(globalId);
  });
  
  it('unregisters shortcuts correctly', () => {
    const { getContextValues } = renderWithKeyboardContext();
    const contextValues = getContextValues();
    
    // Create a test shortcut
    const handler = jest.fn();
    const shortcutId = contextValues.registerShortcut({
      key: 'x',
      description: 'Test shortcut',
      handler,
    });
    
    // Should have at least 3 shortcuts now (2 from test component + new one)
    expect(contextValues.getRegisteredShortcuts().length).toBeGreaterThanOrEqual(3);
    
    // Unregister the shortcut
    contextValues.unregisterShortcut(shortcutId);
    
    // Should have 2 shortcuts again (our new one was removed)
    expect(contextValues.getRegisteredShortcuts().length).toBe(2);
    
    // Shortcut ID should not exist in the list anymore
    const remainingIds = contextValues.getRegisteredShortcuts().map(s => s.id);
    expect(remainingIds).not.toContain(shortcutId);
  });
  
  it('handles modifier keys correctly', () => {
    const mockKeyboardService = createMockKeyboardService();
    const { getContextValues } = renderWithKeyboardContext(mockKeyboardService);
    const contextValues = getContextValues();
    
    // Create a shortcut with modifiers
    const handler = jest.fn();
    const shortcutId = contextValues.registerShortcut({
      key: 'm',
      ctrlKey: true,
      altKey: true,
      description: 'Shortcut with modifiers',
      handler,
    });
    
    // Simulate pressing key without modifiers - should not trigger
    mockKeyboardService.simulateKeyDown('m');
    expect(handler).not.toHaveBeenCalled();
    
    // Simulate pressing key with only one modifier - should not trigger
    mockKeyboardService.simulateKeyDown('m', { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
    
    // Simulate pressing key with both required modifiers - should trigger
    mockKeyboardService.simulateKeyDown('m', { ctrlKey: true, altKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
    
    // Cleanup
    contextValues.unregisterShortcut(shortcutId);
  });
  
  it('directly exposes context methods through getContextValues helper', () => {
    const { getContextValues } = renderWithKeyboardContext();
    const contextValues = getContextValues();
    
    // Verify context has expected structure and values
    expect(typeof contextValues.registerShortcut).toBe('function');
    expect(typeof contextValues.unregisterShortcut).toBe('function');
    expect(typeof contextValues.toggleShortcuts).toBe('function');
    expect(typeof contextValues.getRegisteredShortcuts).toBe('function');
    expect(typeof contextValues.shortcutsEnabled).toBe('boolean');
    expect(Array.isArray(contextValues.shortcutsHelpText)).toBe(true);
  });
  
  it('throws error when hook is used outside provider', () => {
    // Using a custom render function to catch the expected error
    const renderWithoutProvider = () => {
  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';


      const TestHookComponent = () => {
  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';


        useKeyboardShortcuts();
        return <div>Should not render</div>;
      };
      
      return render(<TestHookComponent />);
    };
    
    // Expect the render to throw
    expect(renderWithoutProvider).toThrow('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  });
  
  it('handles invalid shortcut registration gracefully', () => {
    const { getContextValues } = renderWithKeyboardContext();
    const contextValues = getContextValues();
    
    // Register with invalid data
    const id1 = contextValues.registerShortcut(null);
    const id2 = contextValues.registerShortcut({});
    const id3 = contextValues.registerShortcut({ description: 'No key' });
    
    // Should log errors but not crash
    expect(console.error).toHaveBeenCalled();
    
    // Should return null for invalid registrations
    expect(id1).toBeNull();
    expect(id2).toBeNull();
    expect(id3).toBeNull();
  });
});