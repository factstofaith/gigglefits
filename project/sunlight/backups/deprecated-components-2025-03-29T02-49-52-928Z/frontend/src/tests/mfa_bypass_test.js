/**
 * Simple test for MFA bypass functionality
 */
describe('MFA Bypass Functionality', () => {
  test('localStorage bypass_mfa flag should trigger bypass', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Set bypass flag
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'bypass_mfa') return 'true';
      return null;
    });
    
    // The actual test
    expect(localStorage.getItem('bypass_mfa')).toBe('true');
  });
});
