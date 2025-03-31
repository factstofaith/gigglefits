/**
 * @jest-environment jsdom
 */

import {
  formatDate,
  isValidEmail,
  createUniqueId,
  truncateString,
  sleep,
  isEmpty
} from '../../utils/helpers';

describe('formatDate', () => {
  const testDate = new Date('2023-05-15T14:30:45');
  
  beforeAll(() => {
    // Mock toLocaleDateString and toLocaleTimeString to return consistent values for testing
    const originalDateToLocaleString = Date.prototype.toLocaleDateString;
    const originalTimeToLocaleString = Date.prototype.toLocaleTimeString;
    
    Date.prototype.toLocaleDateString = jest.fn(function(locale, options) {
      if (options && options.weekday === 'long') {
        return 'Monday, May 15, 2023';
      }
      return '5/15/2023';
    });
    
    Date.prototype.toLocaleTimeString = jest.fn(() => {
      return '2:30:45 PM';
    });
    
    return () => {
      Date.prototype.toLocaleDateString = originalDateToLocaleString;
      Date.prototype.toLocaleTimeString = originalTimeToLocaleString;
    };
  });
  
  test('should format dates with short format by default', () => {
    expect(formatDate(testDate)).toBe('5/15/2023');
  });
  
  test('should format dates with long format when specified', () => {
    expect(formatDate(testDate, 'long')).toBe('Monday, May 15, 2023');
  });
  
  test('should format dates with time format when specified', () => {
    expect(formatDate(testDate, 'time')).toBe('2:30:45 PM');
  });
  
  test('should format dates with datetime format when specified', () => {
    expect(formatDate(testDate, 'datetime')).toBe('5/15/2023 2:30:45 PM');
  });
  
  test('should handle string date input', () => {
    expect(formatDate('2023-05-15T14:30:45')).toBe('5/15/2023');
  });
  
  test('should return empty string for null or undefined input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
  
  test('should return "Invalid date" for invalid date input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
  
  test('should use short format for unknown format type', () => {
    expect(formatDate(testDate, 'unknown')).toBe('5/15/2023');
  });
});

describe('isValidEmail', () => {
  test('should return true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
    expect(isValidEmail('123.456@example.com')).toBe(true);
    expect(isValidEmail('user-name@example.io')).toBe(true);
  });
  
  test('should return false for invalid email addresses', () => {
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user example.com')).toBe(false);
    expect(isValidEmail('user@exam ple.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false); // Will be treated as string "null" internally
    expect(isValidEmail(undefined)).toBe(false); // Will be treated as string "undefined" internally
  });
});

describe('createUniqueId', () => {
  const originalDateNow = Date.now;
  const originalMathRandom = Math.random;
  
  beforeEach(() => {
    let counter = 0;
    
    // Mock Date.now to return predictable values
    Date.now = jest.fn(() => 1620000000000 + counter * 1000);
    
    // Mock Math.random to return predictable values
    Math.random = jest.fn(() => 0.5);
    
    counter += 1;
  });
  
  afterEach(() => {
    // Restore original functions
    Date.now = originalDateNow;
    Math.random = originalMathRandom;
  });
  
  test('should create a unique ID based on timestamp and random value', () => {
    const id1 = createUniqueId();
    expect(typeof id1).toBe('string');
    expect(id1).toMatch(/^[a-z0-9]+$/);
    
    // Since we mocked Date.now to increment and Math.random to be constant
    // We can make assertions about the generated ID
    expect(id1).toBe('ksc8ovqgg7'); // This exact value depends on our mocks
  });
  
  test('should create unique IDs for multiple calls', () => {
    const id1 = createUniqueId();
    const id2 = createUniqueId();
    
    expect(id1).not.toBe(id2);
  });
});

describe('truncateString', () => {
  test('should not truncate strings shorter than the length', () => {
    expect(truncateString('Hello', 10)).toBe('Hello');
    expect(truncateString('', 10)).toBe('');
  });
  
  test('should truncate strings longer than the length and add ellipsis', () => {
    expect(truncateString('Hello world, this is a test', 10)).toBe('Hello worl...');
    expect(truncateString('abcdefghijklmnopqrstuvwxyz', 5)).toBe('abcde...');
  });
  
  test('should use default length of 50 if not provided', () => {
    const longString = 'a'.repeat(100);
    const result = truncateString(longString);
    
    expect(result.length).toBe(53); // 50 chars + 3 for ellipsis
    expect(result).toBe('a'.repeat(50) + '...');
  });
  
  test('should handle null or undefined input', () => {
    expect(truncateString(null)).toBe('');
    expect(truncateString(undefined)).toBe('');
  });
  
  test('should handle non-string inputs by converting to string', () => {
    expect(truncateString(12345, 3)).toBe('123...');
    expect(truncateString(true, 2)).toBe('tr...');
  });
});

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('should return a promise that resolves after the specified time', async () => {
    const mockFn = jest.fn();
    
    const promise = sleep(1000).then(mockFn);
    
    expect(mockFn).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(500);
    await Promise.resolve(); // Let any pending promises resolve
    
    expect(mockFn).not.toHaveBeenCalled();
    
    // Fast-forward time to just after 1000ms
    jest.advanceTimersByTime(501);
    await Promise.resolve(); // Let any pending promises resolve
    
    expect(mockFn).toHaveBeenCalled();
  });
  
  test('should work with await syntax', async () => {
    const startTime = Date.now();
    const mockDateNow = jest.spyOn(Date, 'now').mockImplementation(() => startTime);
    
    setTimeout(() => {
      mockDateNow.mockImplementation(() => startTime + 500);
    }, 500);
    
    await sleep(500);
    
    expect(Date.now()).toBe(startTime + 500);
    mockDateNow.mockRestore();
  });
});

describe('isEmpty', () => {
  test('should return true for null or undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });
  
  test('should return true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });
  
  test('should return true for empty arrays', () => {
    expect(isEmpty([])).toBe(true);
  });
  
  test('should return true for empty objects', () => {
    expect(isEmpty({})).toBe(true);
  });
  
  test('should return false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty(' a ')).toBe(false);
  });
  
  test('should return false for non-empty arrays', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty([null])).toBe(false);
  });
  
  test('should return false for non-empty objects', () => {
    expect(isEmpty({ key: 'value' })).toBe(false);
    expect(isEmpty({ key: null })).toBe(false);
  });
  
  test('should return false for numbers', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(42)).toBe(false);
    expect(isEmpty(-1)).toBe(false);
  });
  
  test('should return false for boolean values', () => {
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty(true)).toBe(false);
  });
});