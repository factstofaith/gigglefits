// accessibilityUtils.test.js
// -----------------------------------------------------------------------------
// Tests for the accessibility utility functions

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getAriaAttributes,
  getFormControlProps,
  getKeyboardHandlers,
  announceToScreenReader,
  getContrastInfo,
  useSkipNav
} from '../../utils/accessibilityUtils';

// Mock component for focus trap testing
function MockModal({ isOpen, onClose }) {
  // Added display name
  MockModal.displayName = 'MockModal';

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" data-testid="mock-modal">
      <button data-testid="first-button">First</button>
      <button data-testid="middle-button">Middle</button>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// Mock component for keyboard handlers testing
function MockKeyboardComponent({ onEnter, onSpace, onArrowDown }) {
  // Added display name
  MockKeyboardComponent.displayName = 'MockKeyboardComponent';

  const handlers = getKeyboardHandlers({
    onEnter,
    onSpace,
    onArrowDown,
    preventDefaultKeys: [' ', 'ArrowDown'],
  });

  return (
    <div data-testid="keyboard-element" tabIndex={0} {...handlers}>
      Press a key
    </div>
  );
}

// Mock component for skip nav testing
function MockSkipNavComponent() {
  // Added display name
  MockSkipNavComponent.displayName = 'MockSkipNavComponent';

  useSkipNav('main-content');
  
  return (
    <>
      <a href="#main-content" data-testid="skip-link">Skip to content</a>
      <div>Header Content</div>
      <main id="main-content" tabIndex="-1" data-testid="main-content">
        Main Content
      </main>
    </>
  );
}

describe('accessibilityUtils', () => {
  describe('getAriaAttributes', () => {
    it('should return the correct ARIA attributes based on input', () => {
      const ariaAttrs = getAriaAttributes({
        isRequired: true,
        isInvalid: true,
        hasPopup: true,
        isExpanded: true,
        role: 'combobox',
        label: 'Test label',
      });

      expect(ariaAttrs).toEqual({
        'aria-required': true,
        'aria-invalid': true,
        'aria-haspopup': true,
        'aria-expanded': true,
        role: 'combobox',
        'aria-label': 'Test label',
      });
    });

    it('should only include specified attributes', () => {
      const ariaAttrs = getAriaAttributes({
        isRequired: true,
        role: 'button',
      });

      expect(ariaAttrs).toEqual({
        'aria-required': true,
        role: 'button',
      });

      expect(ariaAttrs['aria-invalid']).toBeUndefined();
    });
  });

  describe('getFormControlProps', () => {
    it('should return appropriate props for form controls', () => {
      const props = getFormControlProps({
        id: 'test-input',
        label: 'Test Input',
        error: 'This field is required',
        helperText: 'Enter your name',
        required: true,
      });

      expect(props.inputProps.id).toBe('test-input');
      expect(props.inputProps['aria-invalid']).toBe(true);
      expect(props.inputProps['aria-required']).toBe(true);
      expect(props.labelProps.htmlFor).toBe('test-input');
      expect(props.errorProps.role).toBe('alert');
    });
  });

  describe('getKeyboardHandlers', () => {
    it('should call the appropriate handler for keydown events', () => {
      const handleEnter = jest.fn();
      const handleSpace = jest.fn();
      const handleArrowDown = jest.fn();

      render(
        <MockKeyboardComponent
          onEnter={handleEnter}
          onSpace={handleSpace}
          onArrowDown={handleArrowDown}
        />
      );

      const element = screen.getByTestId('keyboard-element');

      // Test Enter key
      fireEvent.keyDown(element, { key: 'Enter' });
      expect(handleEnter).toHaveBeenCalledTimes(1);

      // Test Space key
      fireEvent.keyDown(element, { key: ' ' });
      expect(handleSpace).toHaveBeenCalledTimes(1);

      // Test Arrow Down key
      fireEvent.keyDown(element, { key: 'ArrowDown' });
      expect(handleArrowDown).toHaveBeenCalledTimes(1);
    });

    it('should prevent default on specified keys', () => {
      const handleSpace = jest.fn(e => {
        // If preventDefault was called, isDefaultPrevented will be true
        expect(e.defaultPrevented).toBe(true);
      });

      render(<MockKeyboardComponent onSpace={handleSpace} />);

      const element = screen.getByTestId('keyboard-element');
      fireEvent.keyDown(element, { key: ' ' });

      expect(handleSpace).toHaveBeenCalledTimes(1);
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      // Create the announcer element if it doesn't exist
      if (!document.getElementById('sr-announcer')) {
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        document.body.appendChild(announcer);
      }
    });

    afterEach(() => {
      // Clean up the announcer
      const announcer = document.getElementById('sr-announcer');
      if (announcer) {
        document.body.removeChild(announcer);
      }
    });

    it('should update the screen reader announcer with the provided message', () => {
      announceToScreenReader('Test announcement');

      // Allow time for the announcement to be made
      setTimeout(() => {
        const announcer = document.getElementById('sr-announcer');
        expect(announcer.textContent).toBe('Test announcement');
        expect(announcer.getAttribute('aria-live')).toBe('polite');
      }, 100);
    });

    it('should set assertive aria-live when specified', () => {
      announceToScreenReader('Important announcement', true);

      setTimeout(() => {
        const announcer = document.getElementById('sr-announcer');
        expect(announcer.getAttribute('aria-live')).toBe('assertive');
      }, 100);
    });
  });

  describe('useSkipNav', () => {
    it('should set up skip navigation functionality', () => {
      // Mock location.hash property
      const originalHash = window.location.hash;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hash: '#main-content' }
      });
      
      // Mock focus function
      const focusMock = jest.fn();
      
      // Render component with useSkipNav
      render(<MockSkipNavComponent />);
      
      // Get the main content element
      const mainContent = screen.getByTestId('main-content');
      
      // Mock the focus method
      mainContent.focus = focusMock;
      
      // Simulate hash change event to trigger the hook
      const hashChangeEvent = new Event('hashchange');
      window.dispatchEvent(hashChangeEvent);
      
      // Expect focus to be called on the main content
      expect(focusMock).toHaveBeenCalled();
      
      // Clean up
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hash: originalHash }
      });
    });
  });

  describe('getContrastInfo', () => {
    it('should correctly calculate contrast ratios', () => {
      // Black (#000000) has perfect contrast with white
      const blackInfo = getContrastInfo('#000000');
      expect(blackInfo.whiteContrast).toBeGreaterThan(20); // Actually 21
      expect(blackInfo.blackContrast).toBe(1.05);
      expect(blackInfo.whitePassesAA).toBe(true);
      expect(blackInfo.blackPassesAA).toBe(false);
      expect(blackInfo.suggestedTextColor).toBe('#FFFFFF');

      // White (#FFFFFF) has perfect contrast with black
      const whiteInfo = getContrastInfo('#FFFFFF');
      expect(whiteInfo.blackContrast).toBeGreaterThan(20); // Actually 21
      expect(whiteInfo.whiteContrast).toBe(1.05);
      expect(whiteInfo.blackPassesAA).toBe(true);
      expect(whiteInfo.whitePassesAA).toBe(false);
      expect(whiteInfo.suggestedTextColor).toBe('#000000');

      // Medium gray (#808080) should have decent contrast with both
      const grayInfo = getContrastInfo('#808080');
      expect(grayInfo.whiteContrast).toBeGreaterThan(3);
      expect(grayInfo.blackContrast).toBeGreaterThan(3);
    });
  });
});