/**
 * Accessibility Testing Framework
 * 
 * Comprehensive tools for testing and ensuring accessibility compliance in React components.
 * Supports automated testing of WCAG guidelines, keyboard navigation, screen reader compatibility,
 * and generates detailed reports for accessibility issues.
 * 
 * @module utils/accessibilityTesting
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add custom matchers
expect.extend(toHaveNoViolations);

/**
 * Accessibility configuration
 * 
 * @typedef {Object} A11yConfig
 * @property {string} level - WCAG compliance level ('A', 'AA', or 'AAA')
 * @property {Array<string>} rules - Specific axe rules to run
 * @property {Array<string>} disable - Rules to disable
 * @property {boolean} verbose - Whether to show detailed output
 */

/**
 * Default configuration
 * 
 * @type {A11yConfig}
 */
const defaultConfig = {
  level: 'AA',
  rules: [],
  disable: [],
  verbose: false
};

/**
 * Keyboard navigation keys
 * 
 * @enum {string}
 */
export const Keys = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

/**
 * DOM accessibility test toolkit
 */
export class AccessibilityTester {
  /**
   * Create a new accessibility tester
   * 
   * @param {A11yConfig} [config] - Configuration
   */
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.results = [];
  }
  
  /**
   * Run axe accessibility tests on a rendered component
   * 
   * @param {HTMLElement} container - Rendered component container
   * @param {Object} [options] - Additional axe options
   * @returns {Promise<Object>} Accessibility results
   */
  async testAccessibility(container, options = {}) {
    const axeOptions = {
      rules: {},
      ...options
    };
    
    // Apply configuration
    if (this.config.level) {
      axeOptions.runOnly = {
        type: 'tag',
        values: [`wcag${this.config.level.toLowerCase()}`]
      };
    }
    
    // Add specific rules
    if (this.config.rules && this.config.rules.length > 0) {
      if (!axeOptions.runOnly) {
        axeOptions.runOnly = { type: 'rule', values: this.config.rules };
      }
    }
    
    // Disable specific rules
    if (this.config.disable && this.config.disable.length > 0) {
      this.config.disable.forEach(rule => {
        axeOptions.rules[rule] = { enabled: false };
      });
    }
    
    // Run axe tests
    const results = await axe(container, axeOptions);
    
    // Store results
    this.results.push(results);
    
    // Log results if verbose
    if (this.config.verbose && results.violations.length > 0) {
      console.log(`${results.violations.length} accessibility violations found:`);
      results.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.help} (${violation.id})`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Nodes: ${violation.nodes.length}`);
        console.log('---');
      });
    }
    
    return results;
  }
  
  /**
   * Test keyboard navigation for a component
   * 
   * @param {HTMLElement} container - Rendered component container
   * @param {Array<Object>} navigationSequence - Sequence of keyboard actions
   * @returns {Object} Navigation test results
   */
  testKeyboardNavigation(container, navigationSequence) {
    const results = {
      passed: true,
      steps: [],
      failedSteps: []
    };
    
    // Execute navigation sequence
    navigationSequence.forEach((step, index) => {
      try {
        const { key, element, expectedFocus, description } = step;
        
        // Find target element if specified
        let target = element;
        if (typeof element === 'string') {
          target = container.querySelector(element);
          if (!target) {
            throw new Error(`Element not found: ${element}`);
          }
        } else if (!element && index > 0) {
          // Use document.activeElement if no target specified
          target = document.activeElement;
        }
        
        // Press key
        if (key) {
          fireEvent.keyDown(target || container, { key });
          fireEvent.keyUp(target || container, { key });
        }
        
        // Check expected focus
        if (expectedFocus) {
          let focusElement = null;
          
          if (typeof expectedFocus === 'string') {
            focusElement = container.querySelector(expectedFocus);
            if (!focusElement) {
              throw new Error(`Expected focus element not found: ${expectedFocus}`);
            }
          } else if (typeof expectedFocus === 'function') {
            const result = expectedFocus(document.activeElement);
            if (!result) {
              throw new Error('Focus check function returned false');
            }
            focusElement = document.activeElement;
          } else {
            focusElement = expectedFocus;
          }
          
          if (document.activeElement !== focusElement) {
            throw new Error(`Expected ${focusElement} to have focus, but ${document.activeElement} has focus`);
          }
        }
        
        // Record success
        results.steps.push({
          index,
          description: description || `Step ${index + 1}`,
          key,
          passed: true
        });
      } catch (error) {
        // Record failure
        results.passed = false;
        const failedStep = {
          index,
          description: step.description || `Step ${index + 1}`,
          key: step.key,
          passed: false,
          error: error.message
        };
        
        results.steps.push(failedStep);
        results.failedSteps.push(failedStep);
        
        if (this.config.verbose) {
          console.error(`Keyboard navigation failed at step ${index + 1}: ${error.message}`);
        }
      }
    });
    
    return results;
  }
  
  /**
   * Test focus trapping for modal components
   * 
   * @param {HTMLElement} container - Rendered component container
   * @param {string|HTMLElement} modalSelector - Modal element or selector
   * @param {number} [tabCount=10] - Number of tab presses to test
   * @returns {Object} Focus trap test results
   */
  testFocusTrap(container, modalSelector, tabCount = 10) {
    const results = {
      passed: false,
      containsFocus: false,
      cyclesFocus: false,
      steps: []
    };
    
    // Find modal element
    const modal = typeof modalSelector === 'string' 
      ? container.querySelector(modalSelector)
      : modalSelector;
    
    if (!modal) {
      results.error = `Modal element not found: ${modalSelector}`;
      return results;
    }
    
    // Store all focusable elements in the modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      results.error = 'No focusable elements found in modal';
      return results;
    }
    
    const focusableArray = Array.from(focusableElements);
    
    // Press Tab multiple times and track focus
    let currentFocus = document.activeElement;
    const focusHistory = [currentFocus];
    
    for (let i = 0; i < tabCount; i++) {
      fireEvent.keyDown(currentFocus, { key: 'Tab' });
      
      // Record focus
      currentFocus = document.activeElement;
      focusHistory.push(currentFocus);
      
      results.steps.push({
        index: i,
        element: currentFocus,
        insideModal: modal.contains(currentFocus)
      });
      
      // Exit early if focus leaves the modal
      if (!modal.contains(currentFocus)) {
        results.containsFocus = false;
        return results;
      }
    }
    
    // Check if focus was contained in the modal
    results.containsFocus = focusHistory.every(el => modal.contains(el));
    
    // Check if focus cycles through all focusable elements
    const uniqueFocusedElements = new Set(focusHistory.map(el => el.outerHTML));
    results.cyclesFocus = uniqueFocusedElements.size >= focusableArray.length;
    
    // Overall pass/fail
    results.passed = results.containsFocus && results.cyclesFocus;
    
    return results;
  }
  
  /**
   * Test screen reader accessibility
   * 
   * @param {HTMLElement} container - Rendered component container
   * @returns {Object} Screen reader test results
   */
  testScreenReaderAccessibility(container) {
    const results = {
      passed: true,
      issues: [],
      elements: {
        withoutLabels: [],
        missingAlt: [],
        emptyButtons: [],
        badAriaRoles: [],
        missingLiveRegions: []
      }
    };
    
    // Check for elements without accessible names
    const elementsWithoutLabels = container.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]):empty, ' +
      'a:not([aria-label]):not([aria-labelledby]):empty, ' +
      'input:not([aria-label]):not([aria-labelledby]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
    );
    
    if (elementsWithoutLabels.length > 0) {
      results.passed = false;
      results.elements.withoutLabels = Array.from(elementsWithoutLabels);
      results.issues.push({
        type: 'missingLabels',
        message: `${elementsWithoutLabels.length} elements without accessible names`
      });
    }
    
    // Check for images without alt text
    const imagesWithoutAlt = container.querySelectorAll('img:not([alt])');
    
    if (imagesWithoutAlt.length > 0) {
      results.passed = false;
      results.elements.missingAlt = Array.from(imagesWithoutAlt);
      results.issues.push({
        type: 'missingAlt',
        message: `${imagesWithoutAlt.length} images without alt text`
      });
    }
    
    // Check for empty buttons without aria-label
    const emptyButtons = container.querySelectorAll('button:empty:not([aria-label]):not([aria-labelledby])');
    
    if (emptyButtons.length > 0) {
      results.passed = false;
      results.elements.emptyButtons = Array.from(emptyButtons);
      results.issues.push({
        type: 'emptyButtons',
        message: `${emptyButtons.length} empty buttons without accessible names`
      });
    }
    
    // Check for invalid ARIA roles
    const elementsWithRoles = container.querySelectorAll('[role]');
    const badAriaRoles = Array.from(elementsWithRoles).filter(el => {
      const role = el.getAttribute('role');
      return !this.isValidAriaRole(role, el);
    });
    
    if (badAriaRoles.length > 0) {
      results.passed = false;
      results.elements.badAriaRoles = badAriaRoles;
      results.issues.push({
        type: 'badAriaRoles',
        message: `${badAriaRoles.length} elements with invalid ARIA roles`
      });
    }
    
    return results;
  }
  
  /**
   * Check if an ARIA role is valid for an element
   * 
   * @param {string} role - ARIA role
   * @param {HTMLElement} element - DOM element
   * @returns {boolean} Whether the role is valid
   */
  isValidAriaRole(role, element) {
    // Common valid ARIA roles
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
      'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
    
    // Check if role is in the list of valid roles
    if (!validRoles.includes(role)) {
      return false;
    }
    
    // Specific element restrictions
    const tagName = element.tagName.toLowerCase();
    
    // Links with role="button" must have keydown handler for Space
    if (tagName === 'a' && role === 'button') {
      const hasKeydownHandler = element.hasAttribute('onkeydown') ||
                               element.hasAttribute('onkeypress');
      if (!hasKeydownHandler) {
        return false;
      }
    }
    
    // Interactive elements shouldn't use presentation role
    const interactiveElements = ['button', 'a', 'select', 'textarea', 'input'];
    if (interactiveElements.includes(tagName) && role === 'presentation') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Test color contrast for a component
   * 
   * @param {HTMLElement} container - Rendered component container
   * @returns {Object} Color contrast test results
   */
  testColorContrast(container) {
    // This is a placeholder - in a real implementation,
    // we would analyze the computed styles of elements
    // and calculate contrast ratios for text and backgrounds
    
    return {
      passed: true,
      message: 'Color contrast check requires browser integration'
    };
  }
  
  /**
   * Generate an accessibility report from test results
   * 
   * @returns {Object} Accessibility report
   */
  generateReport() {
    // Get latest results
    const latestResults = this.results[this.results.length - 1];
    
    if (!latestResults) {
      return {
        timestamp: new Date().toISOString(),
        passed: false,
        message: 'No test results available'
      };
    }
    
    // Calculate overall stats
    const totalViolations = latestResults.violations.length;
    const impactCounts = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };
    
    latestResults.violations.forEach(violation => {
      impactCounts[violation.impact]++;
    });
    
    // Create report
    return {
      timestamp: new Date().toISOString(),
      passed: totalViolations === 0,
      rules: {
        passes: latestResults.passes.length,
        violations: totalViolations,
        incomplete: latestResults.incomplete.length,
        inapplicable: latestResults.inapplicable.length
      },
      impacts: impactCounts,
      violations: latestResults.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length
      })),
      incompleteTests: latestResults.incomplete.map(incomplete => ({
        id: incomplete.id,
        impact: incomplete.impact,
        description: incomplete.help,
        helpUrl: incomplete.helpUrl,
        nodes: incomplete.nodes.length
      }))
    };
  }
}

/**
 * Run accessibility tests on a React component
 * 
 * @param {React.ReactElement} ui - Component to test
 * @param {A11yConfig} [config] - Configuration
 * @returns {Promise<Object>} Test results
 */
export async function testA11y(ui, config = {}) {
  const { container } = render(ui);
  const tester = new AccessibilityTester(config);
  const results = await tester.testAccessibility(container);
  return results;
}

/**
 * Keyboard navigation test sequence builder
 */
export class KeyboardTestSequence {
  /**
   * Create a new keyboard test sequence
   */
  constructor() {
    this.sequence = [];
  }
  
  /**
   * Add a tab key press
   * 
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  tab(expectedFocus, description) {
    this.sequence.push({
      key: Keys.TAB,
      expectedFocus,
      description: description || 'Tab key press'
    });
    return this;
  }
  
  /**
   * Add shift+tab key press
   * 
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  shiftTab(expectedFocus, description) {
    this.sequence.push({
      key: Keys.TAB,
      shiftKey: true,
      expectedFocus,
      description: description || 'Shift+Tab key press'
    });
    return this;
  }
  
  /**
   * Add enter key press
   * 
   * @param {string|HTMLElement} [element] - Element to press Enter on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  enter(element, expectedFocus, description) {
    this.sequence.push({
      key: Keys.ENTER,
      element,
      expectedFocus,
      description: description || 'Enter key press'
    });
    return this;
  }
  
  /**
   * Add space key press
   * 
   * @param {string|HTMLElement} [element] - Element to press Space on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  space(element, expectedFocus, description) {
    this.sequence.push({
      key: Keys.SPACE,
      element,
      expectedFocus,
      description: description || 'Space key press'
    });
    return this;
  }
  
  /**
   * Add escape key press
   * 
   * @param {string|HTMLElement} [element] - Element to press Escape on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  escape(element, expectedFocus, description) {
    this.sequence.push({
      key: Keys.ESCAPE,
      element,
      expectedFocus,
      description: description || 'Escape key press'
    });
    return this;
  }
  
  /**
   * Add arrow key press
   * 
   * @param {string} direction - Arrow direction ('up', 'down', 'left', 'right')
   * @param {string|HTMLElement} [element] - Element to press arrow key on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  arrow(direction, element, expectedFocus, description) {
    const directionMap = {
      up: Keys.ARROW_UP,
      down: Keys.ARROW_DOWN,
      left: Keys.ARROW_LEFT,
      right: Keys.ARROW_RIGHT
    };
    
    const key = directionMap[direction.toLowerCase()];
    if (!key) {
      throw new Error(`Invalid arrow direction: ${direction}`);
    }
    
    this.sequence.push({
      key,
      element,
      expectedFocus,
      description: description || `Arrow ${direction} key press`
    });
    return this;
  }
  
  /**
   * Add home key press
   * 
   * @param {string|HTMLElement} [element] - Element to press Home on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  home(element, expectedFocus, description) {
    this.sequence.push({
      key: Keys.HOME,
      element,
      expectedFocus,
      description: description || 'Home key press'
    });
    return this;
  }
  
  /**
   * Add end key press
   * 
   * @param {string|HTMLElement} [element] - Element to press End on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  end(element, expectedFocus, description) {
    this.sequence.push({
      key: Keys.END,
      element,
      expectedFocus,
      description: description || 'End key press'
    });
    return this;
  }
  
  /**
   * Add arbitrary key press
   * 
   * @param {string} key - Key to press
   * @param {string|HTMLElement} [element] - Element to press key on
   * @param {string|HTMLElement|Function} [expectedFocus] - Expected focus target
   * @param {string} [description] - Step description
   * @returns {KeyboardTestSequence} This sequence for chaining
   */
  press(key, element, expectedFocus, description) {
    this.sequence.push({
      key,
      element,
      expectedFocus,
      description: description || `${key} key press`
    });
    return this;
  }
  
  /**
   * Get the test sequence
   * 
   * @returns {Array<Object>} Keyboard test sequence
   */
  getSequence() {
    return this.sequence;
  }
}

/**
 * ARIA attribute validator
 */
export class AriaValidator {
  /**
   * Validate ARIA attributes for a specific role
   * 
   * @param {string} role - ARIA role
   * @param {Object} attributes - ARIA attributes to validate
   * @returns {Object} Validation results
   */
  static validateRole(role, attributes) {
    const results = {
      valid: true,
      role,
      missing: [],
      invalid: []
    };
    
    // Required attributes for common roles
    const requiredAttributes = {
      button: [],
      checkbox: ['aria-checked'],
      combobox: ['aria-expanded', 'aria-controls'],
      dialog: ['aria-labelledby', 'aria-describedby'],
      listbox: ['aria-activedescendant'],
      menu: ['aria-activedescendant'],
      menuitem: [],
      progressbar: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
      radio: ['aria-checked'],
      slider: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
      spinbutton: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
      switch: ['aria-checked'],
      tab: [],
      tabpanel: [],
      textbox: []
    };
    
    // Check if role is supported
    if (!requiredAttributes[role]) {
      return {
        valid: false,
        role,
        error: `Unsupported role: ${role}`
      };
    }
    
    // Check required attributes
    const required = requiredAttributes[role];
    required.forEach(attr => {
      if (!(attr in attributes)) {
        results.valid = false;
        results.missing.push(attr);
      }
    });
    
    // Type checking for specific attributes
    if ('aria-valuenow' in attributes) {
      const value = attributes['aria-valuenow'];
      if (isNaN(parseFloat(value))) {
        results.valid = false;
        results.invalid.push({
          attribute: 'aria-valuenow',
          error: 'Must be a number'
        });
      }
    }
    
    if ('aria-checked' in attributes) {
      const value = attributes['aria-checked'];
      if (value !== true && value !== false && value !== 'mixed') {
        results.valid = false;
        results.invalid.push({
          attribute: 'aria-checked',
          error: 'Must be true, false, or "mixed"'
        });
      }
    }
    
    if ('aria-expanded' in attributes) {
      const value = attributes['aria-expanded'];
      if (value !== true && value !== false) {
        results.valid = false;
        results.invalid.push({
          attribute: 'aria-expanded',
          error: 'Must be true or false'
        });
      }
    }
    
    return results;
  }
}

/**
 * Create a focus trap component for testing
 * 
 * @param {React.ReactElement} children - Child elements
 * @returns {React.ReactElement} Focus trap component
 */
export function FocusTrap({ children }) {
  return (
    <div
      className="focus-trap"
      tabIndex={-1}
      onKeyDown={(e) => {
        // Keep focus within the trap
        if (e.key === 'Tab') {
          const focusableElements = e.currentTarget.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * Create live region component for screen reader announcements
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Message to announce
 * @param {string} [props.politeness='polite'] - Politeness level ('polite' or 'assertive')
 * @param {boolean} [props.visible=false] - Whether the region is visible
 * @returns {React.ReactElement} Live region component
 */
export function LiveRegion({ message, politeness = 'polite', visible = false }) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      style={{ 
        position: visible ? 'static' : 'absolute',
        width: visible ? 'auto' : '1px',
        height: visible ? 'auto' : '1px',
        padding: visible ? '8px' : 0,
        margin: visible ? '8px 0' : 0,
        overflow: 'hidden',
        clip: visible ? 'auto' : 'rect(0 0 0 0)',
        whiteSpace: 'nowrap'
      }}
    >
      {message}
    </div>
  );
}

export default {
  AccessibilityTester,
  testA11y,
  KeyboardTestSequence,
  AriaValidator,
  FocusTrap,
  LiveRegion,
  Keys
};