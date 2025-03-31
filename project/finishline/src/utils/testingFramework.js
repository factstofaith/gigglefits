/**
 * Testing Framework
 * 
 * Comprehensive testing utilities for standardized testing patterns.
 * 
 * @module utils/testingFramework
 */

import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ConfigProvider } from '../contexts/ConfigContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AuthProvider } from '../contexts/AuthContext';
import { DialogProvider } from '../contexts/DialogContext';

/**
 * Create a fully wrapped test render for components
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} [options.theme] - Theme context options
 * @param {Object} [options.config] - Config context options
 * @param {Object} [options.auth] - Auth context options
 * @param {Object} [options.notifications] - Notification context options
 * @param {Object} [options.dialog] - Dialog context options
 * @param {Object} [options.router] - Router options
 * @param {Object} [options.renderOptions] - Additional render options
 * @returns {Object} Rendered component with utilities
 */
export function renderWithProviders(ui, options = {}) {
  const {
    theme = {},
    config = {},
    auth = {},
    notifications = {},
    dialog = {},
    router = {},
    renderOptions = {},
  } = options;
  
  // Create a wrapper with all providers
  const AllProviders = ({ children }) => (
    <ThemeProvider defaultMode={theme.defaultMode || 'light'}>
      <ConfigProvider initialConfig={config.initialConfig || {}}>
        <AuthProvider initialUser={auth.initialUser}>
          <NotificationProvider maxNotifications={notifications.maxNotifications || 5}>
            <DialogProvider>
              {router.routes ? (
                <MemoryRouter initialEntries={router.initialEntries || ['/']}>
                  <Routes>
                    {router.routes}
                    <Route path="*" element={children} />
                  </Routes>
                </MemoryRouter>
              ) : (
                <MemoryRouter initialEntries={router.initialEntries || ['/']}>
                  {children}
                </MemoryRouter>
              )}
            </DialogProvider>
          </NotificationProvider>
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
  
  // Render with the wrapper
  const renderResult = render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
  
  // Return with extended utilities
  return {
    ...renderResult,
    user: userEvent.setup(),
    findByTestId: async (testId) => {
      return await waitFor(() => screen.getByTestId(testId));
    },
    findByRole: async (role, options) => {
      return await waitFor(() => screen.getByRole(role, options));
    },
    getDialogByTitle: (title) => {
      const dialogs = screen.getAllByRole('dialog');
      return dialogs.find(dialog => 
        within(dialog).queryByText(title) !== null
      );
    },
    expectNotificationToBeVisible: async (message) => {
      await waitFor(() => {
        expect(screen.getByText(message)).toBeInTheDocument();
      });
    },
  };
}

/**
 * Create a mock store for testing components that use the store
 * 
 * @param {Object} [initialState={}] - Initial state for the store
 * @returns {Object} Mock store
 */
export function createMockStore(initialState = {}) {
  const state = { ...initialState };
  const listeners = [];
  
  return {
    getState: jest.fn(() => state),
    setState: jest.fn((newState) => {
      Object.assign(state, newState);
      listeners.forEach(listener => listener());
    }),
    subscribe: jest.fn((listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }),
    dispatch: jest.fn((action) => {
      if (typeof action === 'function') {
        return action(this.dispatch, this.getState);
      }
      return action;
    }),
  };
}

/**
 * Test case builder for creating structured test cases
 */
export class TestCaseBuilder {
  constructor() {
    this.testCases = [];
  }
  
  /**
   * Add a test case
   * 
   * @param {string} description - Test case description
   * @param {Object} options - Test case options
   * @param {Object} [options.props] - Props to test with
   * @param {Function} [options.setup] - Setup function
   * @param {Function} [options.act] - Action function
   * @param {Function} [options.assert] - Assertion function
   * @returns {TestCaseBuilder} This builder for chaining
   */
  addTestCase(description, options) {
    this.testCases.push({
      description,
      ...options,
    });
    return this;
  }
  
  /**
   * Run the test cases
   * 
   * @param {Function} renderFn - Function to render the component
   */
  runTests(renderFn) {
    this.testCases.forEach(testCase => {
      test(testCase.description, async () => {
        // Setup
        const props = testCase.props || {};
        let renderResult;
        
        // Custom setup
        if (testCase.setup) {
          await testCase.setup();
        }
        
        // Render
        renderResult = renderFn(props);
        
        // Act
        if (testCase.act) {
          await testCase.act(renderResult);
        }
        
        // Assert
        if (testCase.assert) {
          await testCase.assert(renderResult);
        }
      });
    });
  }
}

/**
 * Create standard Jest mock functions for testing
 * 
 * @returns {Object} Standard mocks
 */
export function createStandardMocks() {
  return {
    mockFn: jest.fn(),
    mockPromise: jest.fn().mockResolvedValue({}),
    mockRejectedPromise: jest.fn().mockRejectedValue(new Error('Mock error')),
    mockEvent: { preventDefault: jest.fn(), stopPropagation: jest.fn() },
  };
}

/**
 * Helper for testing form interactions
 */
export class FormTester {
  /**
   * Create a new form tester
   * 
   * @param {Object} renderResult - Result from renderWithProviders
   */
  constructor(renderResult) {
    this.screen = renderResult.screen || screen;
    this.user = renderResult.user || userEvent.setup();
  }
  
  /**
   * Fill a text input
   * 
   * @param {string} name - Input name attribute or label text
   * @param {string} value - Value to enter
   */
  async fillInput(name, value) {
    let input;
    
    try {
      // Try to find by label
      input = this.screen.getByLabelText(name);
    } catch (e) {
      // Try to find by name
      input = this.screen.getByRole('textbox', { name });
    }
    
    await this.user.clear(input);
    await this.user.type(input, value);
  }
  
  /**
   * Select an option in a dropdown
   * 
   * @param {string} name - Select name attribute or label text
   * @param {string} option - Option text to select
   */
  async selectOption(name, option) {
    let select;
    
    try {
      // Try to find by label
      select = this.screen.getByLabelText(name);
    } catch (e) {
      // Try to find by name
      select = this.screen.getByRole('combobox', { name });
    }
    
    await this.user.click(select);
    await this.user.click(this.screen.getByText(option));
  }
  
  /**
   * Check or uncheck a checkbox
   * 
   * @param {string} name - Checkbox name attribute or label text
   * @param {boolean} checked - Whether to check or uncheck
   */
  async setCheckbox(name, checked) {
    let checkbox;
    
    try {
      // Try to find by label
      checkbox = this.screen.getByLabelText(name);
    } catch (e) {
      // Try to find by name
      checkbox = this.screen.getByRole('checkbox', { name });
    }
    
    if (checkbox.checked !== checked) {
      await this.user.click(checkbox);
    }
  }
  
  /**
   * Submit a form
   * 
   * @param {string} [submitButtonText='Submit'] - Text of the submit button
   */
  async submitForm(submitButtonText = 'Submit') {
    const submitButton = this.screen.getByRole('button', { name: submitButtonText });
    await this.user.click(submitButton);
  }
  
  /**
   * Fill an entire form
   * 
   * @param {Object} values - Map of field names to values
   * @param {string} [submitButtonText='Submit'] - Text of the submit button
   */
  async fillForm(values, submitButtonText = 'Submit') {
    for (const [name, value] of Object.entries(values)) {
      if (typeof value === 'boolean') {
        await this.setCheckbox(name, value);
      } else if (Array.isArray(value)) {
        await this.selectOption(name, value[0]);
      } else {
        await this.fillInput(name, value);
      }
    }
    
    await this.submitForm(submitButtonText);
  }
}

/**
 * Helper for testing component accessibility
 */
export class AccessibilityTester {
  /**
   * Create a new accessibility tester
   * 
   * @param {Object} renderResult - Result from renderWithProviders
   */
  constructor(renderResult) {
    this.container = renderResult.container;
    this.getByRole = renderResult.getByRole;
    this.getAllByRole = renderResult.getAllByRole;
    this.queryByRole = renderResult.queryByRole;
    this.queryAllByRole = renderResult.queryAllByRole;
  }
  
  /**
   * Verify form field accessibility
   * 
   * @param {string} fieldName - Field name or label
   */
  verifyFormField(fieldName) {
    // Check for label
    const labels = Array.from(this.container.querySelectorAll('label'))
      .filter(label => label.textContent.includes(fieldName));
    
    expect(labels.length).toBeGreaterThan(0);
    
    if (labels.length > 0) {
      const label = labels[0];
      const forAttr = label.getAttribute('for');
      
      // Check that label is connected to an input
      if (forAttr) {
        const input = this.container.querySelector(`#${forAttr}`);
        expect(input).not.toBeNull();
      }
    }
  }
  
  /**
   * Verify all interactive elements are focusable
   */
  verifyFocusableElements() {
    const interactiveElements = Array.from(this.container.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
    
    interactiveElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  }
  
  /**
   * Verify ARIA attributes are used correctly
   */
  verifyAriaAttributes() {
    // Check required ARIA attributes
    const elementsWithRole = Array.from(this.container.querySelectorAll('[role]'));
    
    elementsWithRole.forEach(element => {
      const role = element.getAttribute('role');
      
      // Roles that require aria-checked
      if (['checkbox', 'radio', 'switch'].includes(role)) {
        expect(element).toHaveAttribute('aria-checked');
      }
      
      // Roles that require aria-expanded
      if (['button', 'link'].includes(role) && element.getAttribute('aria-controls')) {
        expect(element).toHaveAttribute('aria-expanded');
      }
    });
  }
  
  /**
   * Run all accessibility checks
   * 
   * @param {Array<string>} [formFields=[]] - Form fields to check
   */
  runAllChecks(formFields = []) {
    this.verifyFocusableElements();
    this.verifyAriaAttributes();
    
    formFields.forEach(field => {
      this.verifyFormField(field);
    });
  }
}

/**
 * Create an event object for testing
 * 
 * @param {string} type - Event type
 * @param {Object} [overrides={}] - Property overrides
 * @returns {Object} Event object
 */
export function createEvent(type, overrides = {}) {
  const event = {
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {
      value: '',
      checked: false,
      ...overrides.target,
    },
    ...overrides,
  };
  
  return event;
}

/**
 * Create a mock ResizeObserver for testing responsive components
 */
export class MockResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    
    // Save original ResizeObserver
    this.original = window.ResizeObserver;
    
    // Install mock
    window.ResizeObserver = jest.fn(() => this);
  }
  
  /**
   * Simulate a resize event
   * 
   * @param {HTMLElement} element - Element to resize
   * @param {Object} rect - New client rect
   */
  simulateResize(element, rect = {}) {
    const entry = {
      target: element,
      contentRect: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600,
        ...rect,
      },
    };
    
    const callback = window.ResizeObserver.mock.calls[0][0];
    callback([entry]);
  }
  
  /**
   * Restore original ResizeObserver
   */
  restore() {
    window.ResizeObserver = this.original;
  }
}

/**
 * Create a mock IntersectionObserver for testing visible loading
 */
export class MockIntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    
    // Save original IntersectionObserver
    this.original = window.IntersectionObserver;
    
    // Install mock
    window.IntersectionObserver = jest.fn(() => this);
  }
  
  /**
   * Simulate an intersection event
   * 
   * @param {HTMLElement} element - Element to intersect
   * @param {Object} options - Intersection options
   * @param {boolean} [options.isIntersecting=true] - Whether element is intersecting
   * @param {number} [options.intersectionRatio=1] - Intersection ratio
   */
  simulateIntersection(element, { isIntersecting = true, intersectionRatio = 1 } = {}) {
    const entry = {
      target: element,
      isIntersecting,
      intersectionRatio,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRect: isIntersecting ? element.getBoundingClientRect() : { width: 0, height: 0 },
      rootBounds: { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 },
    };
    
    const callback = window.IntersectionObserver.mock.calls[0][0];
    callback([entry]);
  }
  
  /**
   * Restore original IntersectionObserver
   */
  restore() {
    window.IntersectionObserver = this.original;
  }
}

/**
 * Mock storage (localStorage/sessionStorage) for testing
 */
export class MockStorage {
  constructor() {
    this.store = {};
    this.getItem = jest.fn(key => this.store[key] || null);
    this.setItem = jest.fn((key, value) => {
      this.store[key] = value.toString();
    });
    this.removeItem = jest.fn(key => {
      delete this.store[key];
    });
    this.clear = jest.fn(() => {
      this.store = {};
    });
  }
  
  /**
   * Install this mock as localStorage
   */
  installAsLocalStorage() {
    Object.defineProperty(window, 'localStorage', {
      value: this,
      writable: true,
    });
  }
  
  /**
   * Install this mock as sessionStorage
   */
  installAsSessionStorage() {
    Object.defineProperty(window, 'sessionStorage', {
      value: this,
      writable: true,
    });
  }
}

/**
 * Utility for mocking date and time in tests
 */
export class MockDateTime {
  constructor(mockDate = new Date('2025-04-15T12:00:00Z')) {
    this.mockDate = mockDate;
    this.originalDate = global.Date;
  }
  
  /**
   * Install mock Date
   */
  install() {
    const mockDateClass = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(this.mockDate);
        } else {
          super(...args);
        }
      }
      
      static now() {
        return new this().getTime();
      }
    };
    
    mockDateClass.prototype.mockDate = this.mockDate;
    global.Date = mockDateClass;
  }
  
  /**
   * Restore original Date
   */
  restore() {
    global.Date = this.originalDate;
  }
  
  /**
   * Advance mock time
   * 
   * @param {number} ms - Milliseconds to advance
   */
  advanceTime(ms) {
    this.mockDate = new Date(this.mockDate.getTime() + ms);
    global.Date.prototype.mockDate = this.mockDate;
  }
}

/**
 * Mock server for API testing
 */
export class MockApiServer {
  constructor() {
    this.originalFetch = global.fetch;
    this.routes = {};
    this.requests = [];
    
    // Install mock fetch
    global.fetch = this.fetch.bind(this);
  }
  
  /**
   * Add a mock route
   * 
   * @param {string} method - HTTP method
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  addRoute(method, path, handler) {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes[key] = handler;
    return this;
  }
  
  /**
   * Handle GET requests
   * 
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  get(path, handler) {
    return this.addRoute('GET', path, handler);
  }
  
  /**
   * Handle POST requests
   * 
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  post(path, handler) {
    return this.addRoute('POST', path, handler);
  }
  
  /**
   * Handle PUT requests
   * 
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  put(path, handler) {
    return this.addRoute('PUT', path, handler);
  }
  
  /**
   * Handle DELETE requests
   * 
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  delete(path, handler) {
    return this.addRoute('DELETE', path, handler);
  }
  
  /**
   * Handle PATCH requests
   * 
   * @param {string|RegExp} path - URL path or pattern
   * @param {Function|Object} handler - Response handler or data
   * @returns {MockApiServer} This server for chaining
   */
  patch(path, handler) {
    return this.addRoute('PATCH', path, handler);
  }
  
  /**
   * Find matching route
   * 
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @returns {Object|null} Matching route and params
   */
  findRoute(method, url) {
    const urlObj = new URL(url, 'http://localhost');
    const path = urlObj.pathname;
    
    for (const key in this.routes) {
      const [routeMethod, routePath] = key.split(' ');
      
      if (routeMethod === method) {
        if (typeof routePath === 'string' && routePath === path) {
          return { handler: this.routes[key], params: {} };
        }
        
        if (routePath instanceof RegExp && routePath.test(path)) {
          return { handler: this.routes[key], params: {} };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Process a response handler
   * 
   * @param {Function|Object} handler - Response handler or data
   * @param {Object} request - Request object
   * @returns {Object} Response data
   */
  async processHandler(handler, request) {
    if (typeof handler === 'function') {
      return await handler(request);
    }
    
    return handler;
  }
  
  /**
   * Mock fetch implementation
   * 
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Response>} Response object
   */
  async fetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    
    // Parse request body
    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Leave as string if not valid JSON
      }
    }
    
    // Create request object
    const request = {
      url,
      method,
      headers: options.headers || {},
      body,
    };
    
    // Record request
    this.requests.push(request);
    
    // Find matching route
    const route = this.findRoute(method, url);
    
    if (!route) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: `No handler for ${method} ${url}`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Process handler
    let responseData;
    try {
      responseData = await this.processHandler(route.handler, request);
    } catch (error) {
      // Handler threw an error
      return new Response(JSON.stringify({
        error: error.name,
        message: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create response
    const responseInit = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    };
    
    // Allow overriding response properties
    if (responseData && responseData.__response) {
      Object.assign(responseInit, responseData.__response);
      delete responseData.__response;
    }
    
    return new Response(JSON.stringify(responseData), responseInit);
  }
  
  /**
   * Restore original fetch
   */
  restore() {
    global.fetch = this.originalFetch;
  }
  
  /**
   * Get all recorded requests
   * 
   * @param {string} [method] - Filter by HTTP method
   * @param {string|RegExp} [url] - Filter by URL
   * @returns {Array} Filtered requests
   */
  getRequests(method, url) {
    let filtered = this.requests;
    
    if (method) {
      filtered = filtered.filter(req => req.method === method);
    }
    
    if (url) {
      if (url instanceof RegExp) {
        filtered = filtered.filter(req => url.test(req.url));
      } else {
        filtered = filtered.filter(req => req.url.includes(url));
      }
    }
    
    return filtered;
  }
  
  /**
   * Reset recorded requests
   */
  resetRequests() {
    this.requests = [];
  }
  
  /**
   * Clear all routes
   */
  clearRoutes() {
    this.routes = {};
  }
}

/**
 * Test hook in isolation
 * 
 * @param {Function} hook - React hook to test
 * @param {Array} [initialArgs=[]] - Initial arguments for hook
 * @returns {Object} Hook testing utilities
 */
export function testHook(hook, initialArgs = []) {
  let result;
  let renderCount = 0;
  
  function TestComponent({ args }) {
    result = hook(...args);
    renderCount++;
    return null;
  }
  
  const { rerender, unmount } = render(<TestComponent args={initialArgs} />);
  
  return {
    result: () => result,
    renderCount: () => renderCount,
    rerender: (args = initialArgs) => rerender(<TestComponent args={args} />),
    unmount,
  };
}

export default {
  renderWithProviders,
  createMockStore,
  TestCaseBuilder,
  createStandardMocks,
  FormTester,
  AccessibilityTester,
  createEvent,
  MockResizeObserver,
  MockIntersectionObserver,
  MockStorage,
  MockDateTime,
  MockApiServer,
  testHook,
};