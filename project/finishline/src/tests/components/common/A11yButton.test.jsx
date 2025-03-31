/**
 * A11yButton Tests
 * 
 * Tests for the accessibility-enhanced button component.
 * Verifies accessibility compliance, keyboard navigation,
 * and proper behavior across different states.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import A11yButton from '../../../components/common/A11yButton';
import { testA11y, AccessibilityTester, KeyboardTestSequence } from '../../../utils/accessibilityTesting';

// Set up custom matchers
expect.extend({
  toBeAccessible(received) {
    const { violations } = received;
    const pass = violations.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected component to not be accessible, but it was`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected component to be accessible, but found ${violations.length} violations:\n` +
          violations.map(v => ` - ${v.description} (${v.id}): impact ${v.impact}`).join('\n'),
        pass: false
      };
    }
  }
});

describe('A11yButton Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    test('renders a button element by default', () => {
      render(<A11yButton>Click Me</A11yButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
    
    test('renders an anchor element when href is provided', () => {
      render(<A11yButton href="https://example.com">Link Button</A11yButton>);
      const linkButton = screen.getByRole('button');
      expect(linkButton.tagName).toBe('A');
      expect(linkButton).toHaveAttribute('href', 'https://example.com');
    });
    
    test('renders with provided dataTestId', () => {
      render(<A11yButton dataTestId="test-button">Test Button</A11yButton>);
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });
    
    test('renders with provided ARIA attributes', () => {
      render(
        <A11yButton
          ariaLabel="Custom Label"
          ariaControls="menu-id"
          ariaExpanded={true}
          ariaHaspopup="menu"
        >
          Menu Button
        </A11yButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('aria-controls', 'menu-id');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });
    
    test('renders with start and end icons', () => {
      const startIcon = <span data-testid="start-icon">🔍</span>;
      const endIcon = <span data-testid="end-icon">🔎</span>;
      
      render(
        <A11yButton startIcon={startIcon} endIcon={endIcon}>
          Search
        </A11yButton>
      );
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
    
    test('renders with loading state', () => {
      render(<A11yButton loading>Loading</A11yButton>);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });
  
  // Behavior and interaction tests
  describe('Behavior', () => {
    test('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<A11yButton onClick={handleClick}>Click Me</A11yButton>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<A11yButton disabled onClick={handleClick}>Click Me</A11yButton>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
    
    test('calls onClick on Enter key press', () => {
      const handleClick = jest.fn();
      render(<A11yButton onClick={handleClick}>Press Enter</A11yButton>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    test('calls onClick on Space key press', () => {
      const handleClick = jest.fn();
      render(<A11yButton onClick={handleClick}>Press Space</A11yButton>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    test('does not call onClick on other key presses', () => {
      const handleClick = jest.fn();
      render(<A11yButton onClick={handleClick}>Press Other Keys</A11yButton>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'A' });
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(handleClick).not.toHaveBeenCalled();
    });
    
    test('does not trigger Enter/Space when disabled', () => {
      const handleClick = jest.fn();
      render(<A11yButton disabled onClick={handleClick}>Disabled Button</A11yButton>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(handleClick).not.toHaveBeenCalled();
    });
    
    test('calls custom onKeyDown handler', () => {
      const handleKeyDown = jest.fn();
      render(<A11yButton onKeyDown={handleKeyDown}>Key Handler</A11yButton>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'A' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });
  
  // Accessibility compliance tests
  describe('Accessibility', () => {
    test('meets WCAG AA standards', async () => {
      const { container } = render(<A11yButton>Accessible Button</A11yButton>);
      
      const results = await testA11y(<A11yButton>Accessible Button</A11yButton>);
      expect(results).toBeAccessible();
    });
    
    test('is keyboard navigable', () => {
      render(<A11yButton>Keyboard Navigable</A11yButton>);
      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Simulate keyboard interaction
      const tester = new AccessibilityTester();
      const sequence = new KeyboardTestSequence()
        .enter(button, null, 'Press Enter')
        .space(button, null, 'Press Space');
      
      const results = tester.testKeyboardNavigation(document.body, sequence.getSequence());
      expect(results.passed).toBe(true);
    });
    
    test('has proper disabled state', () => {
      render(<A11yButton disabled>Disabled Button</A11yButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
    
    test('has proper focus management', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<A11yButton loading>Loading Button</A11yButton>);
      
      const loadingButton = screen.getByRole('button');
      
      // Button should be focusable even when loading
      await user.tab();
      expect(document.activeElement).toBe(loadingButton);
      
      // When loading completes, button should maintain focus
      rerender(<A11yButton>Loaded Button</A11yButton>);
      
      expect(document.activeElement).toBe(screen.getByRole('button'));
    });
    
    test('works with screen readers', () => {
      render(<A11yButton ariaLabel="Screen Reader Label">SR Button</A11yButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Screen Reader Label');
    });
    
    test('anchor buttons have proper role', () => {
      render(<A11yButton href="https://example.com">Link Button</A11yButton>);
      
      // Should have role="button" for proper screen reader announcement
      expect(screen.getByRole('button')).toHaveAttribute('href', 'https://example.com');
    });
    
    test('disabled anchor has no href attribute', () => {
      render(<A11yButton href="https://example.com" disabled>Disabled Link</A11yButton>);
      
      // When disabled, an anchor shouldn't have an href to prevent navigation
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('href');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
  
  // Variant and styling tests
  describe('Variants and Styling', () => {
    test('renders with different colors', () => {
      const { rerender } = render(<A11yButton color="primary">Primary</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#0056b3' });
      
      rerender(<A11yButton color="secondary">Secondary</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#6c757d' });
      
      rerender(<A11yButton color="success">Success</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#28a745' });
      
      rerender(<A11yButton color="danger">Danger</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#dc3545' });
    });
    
    test('renders with different sizes', () => {
      const { rerender } = render(<A11yButton size="small">Small</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ fontSize: '0.875rem' });
      
      rerender(<A11yButton size="medium">Medium</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ fontSize: '1rem' });
      
      rerender(<A11yButton size="large">Large</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ fontSize: '1.25rem' });
    });
    
    test('renders with different variants', () => {
      const { rerender } = render(<A11yButton variant="contained">Contained</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ border: 'none' });
      
      rerender(<A11yButton variant="outlined">Outlined</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: 'transparent' });
      
      rerender(<A11yButton variant="text">Text</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: 'transparent', border: 'none' });
    });
    
    test('renders full width when specified', () => {
      render(<A11yButton fullWidth>Full Width</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ width: '100%' });
    });
    
    test('accepts custom styles', () => {
      render(<A11yButton style={{ textTransform: 'none', borderRadius: '50px' }}>Custom Style</A11yButton>);
      expect(screen.getByRole('button')).toHaveStyle({ textTransform: 'none', borderRadius: '50px' });
    });
  });
});