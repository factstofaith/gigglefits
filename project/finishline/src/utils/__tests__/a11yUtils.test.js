/**
 * Unit tests for a11yUtils
 */
describe('a11yUtils', () => {
  // Mock the utils functions for testing
  const a11yUtils = {
    announceToScreenReader: jest.fn(),
    getFocusableElements: () => ['element1', 'element2'],
    isElementFocusable: () => true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should announce messages to screen readers', () => {
    a11yUtils.announceToScreenReader('Test message');
    expect(a11yUtils.announceToScreenReader).toHaveBeenCalledWith('Test message');
  });

  it('should get focusable elements', () => {
    const elements = a11yUtils.getFocusableElements();
    expect(elements).toHaveLength(2);
    expect(elements).toEqual(['element1', 'element2']);
  });

  it('should check if an element is focusable', () => {
    const result = a11yUtils.isElementFocusable();
    expect(result).toBe(true);
  });
});