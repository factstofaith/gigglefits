import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

// Add custom jest matchers
expect.extend(toHaveNoViolations);

/**
 * Run accessibility checks on rendered component
 * @param {HTMLElement} container - Component container element
 * @param {Object} options - Axe options
 * @returns {Promise<Object>} - Axe results
 */
export async function checkA11y(container, options = {}) {
  // Added display name
  checkA11y.displayName = 'checkA11y';

  const results = await axe(container, {
    rules: {
      // Add specific rule configurations here
      'color-contrast': { enabled: true },
      'landmark-one-main': { enabled: true },
      'region': { enabled: false }, // Disable region rule for smaller components
      ...options.rules,
    },
    ...options,
  });
  
  return results;
}

/**
 * Test component for accessibility violations
 * @param {ReactElement} ui - Component to test
 * @param {Object} options - Render options
 * @returns {Promise<void>}
 */
export async function testA11y(ui, options = {}) {
  // Added display name
  testA11y.displayName = 'testA11y';

  const { container } = render(ui, options);
  const results = await checkA11y(container);
  expect(results).toHaveNoViolations();
}

/**
 * Check if element is focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - Whether element is focusable
 */
export function isFocusable(element) {
  // Added display name
  isFocusable.displayName = 'isFocusable';

  if (!element) return false;
  
  // Check if element matches focusable selectors
  const focusableSelectors = [
    'button', 
    'input', 
    'select', 
    'textarea', 
    'a[href]', 
    '[tabindex]',
    '[contenteditable]'
  ];
  
  return focusableSelectors.some(selector => 
    element.matches(selector) && 
    !element.hasAttribute('disabled') && 
    element.getAttribute('tabindex') !== '-1'
  );
}

/**
 * Get all focusable elements in a container
 * @param {HTMLElement} container - Container element
 * @returns {Array<HTMLElement>} - List of focusable elements
 */
export function getFocusableElements(container) {
  // Added display name
  getFocusableElements.displayName = 'getFocusableElements';

  if (!container) return [];
  
  const focusableSelector = [
    'button:not([disabled])', 
    'input:not([disabled])', 
    'select:not([disabled])', 
    'textarea:not([disabled])', 
    'a[href]', 
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]:not([contenteditable="false"])'
  ].join(',');
  
  return Array.from(container.querySelectorAll(focusableSelector));
}

/**
 * Check keyboard navigation in a component
 * @param {Object} user - User event instance
 * @param {HTMLElement} container - Component container
 * @returns {Promise<void>}
 */
export async function checkKeyboardNavigation(user, container) {
  // Added display name
  checkKeyboardNavigation.displayName = 'checkKeyboardNavigation';

  const focusableElements = getFocusableElements(container);
  
  // First element should be focusable
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    expect(document.activeElement).toBe(focusableElements[0]);
    
    // Tab through all elements
    for (let i = 1; i < focusableElements.length; i++) {
      await user.tab();
      expect(document.activeElement).toBe(focusableElements[i]);
    }
  }
}

/**
 * Test component for ARIA attributes
 * @param {HTMLElement} element - Element to test
 * @param {Object} expected - Expected ARIA attributes
 */
export function testAriaAttributes(element, expected) {
  // Added display name
  testAriaAttributes.displayName = 'testAriaAttributes';

  if (!element) return;
  
  // Check each expected attribute
  Object.entries(expected).forEach(([attribute, value]) => {
    const attrName = attribute.startsWith('aria-') 
      ? attribute 
      : `aria-${attribute}`;
    
    expect(element).toHaveAttribute(attrName, value);
  });
}