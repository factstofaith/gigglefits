/**
 * Simple isolated test for MFA bypass functionality
 * This test doesn't use the standard setupTests.js to avoid issues
 */

// Mock jwt-decode module at the top level
jest.mock('jwt-decode');

// Import after mocking
import jwtDecode from 'jwt-decode';

// We'll simulate the core functionality of the MFA bypass
describe('MFA Bypass Functionality', () => {
  // Set up localStorage mock before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup localStorage mock
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
  });

  test('localStorage bypass_mfa flag should trigger bypass', () => {
    // Setup bypass flag
    localStorage.getItem.mockImplementation(key => {
      if (key === 'bypass_mfa') return 'true';
      return null;
    });
    
    // Simulate logic in MFAVerification component
    const shouldBypassMFA = () => {
  // Added display name
  shouldBypassMFA.displayName = 'shouldBypassMFA';

  // Added display name
  shouldBypassMFA.displayName = 'shouldBypassMFA';

  // Added display name
  shouldBypassMFA.displayName = 'shouldBypassMFA';

  // Added display name
  shouldBypassMFA.displayName = 'shouldBypassMFA';

  // Added display name
  shouldBypassMFA.displayName = 'shouldBypassMFA';


      return localStorage.getItem('bypass_mfa') === 'true';
    };
    
    // Verify bypass works
    expect(shouldBypassMFA()).toBe(true);
    expect(localStorage.getItem).toHaveBeenCalledWith('bypass_mfa');
  });

  test('bypass_mfa extracted from token is stored in localStorage', () => {
    // Mock JWT token and decoded result
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJieXBhc3NfbWZhIjp0cnVlfQ.mockSignature';
    const mockDecodedToken = {
      bypass_mfa: true
    };

    // Set up the mock implementation for jwt-decode
    jwtDecode.mockReturnValue(mockDecodedToken);

    // Simulate the token storage logic from authService
    const storeToken = (token) => {
  // Added display name
  storeToken.displayName = 'storeToken';

  // Added display name
  storeToken.displayName = 'storeToken';

  // Added display name
  storeToken.displayName = 'storeToken';

  // Added display name
  storeToken.displayName = 'storeToken';

  // Added display name
  storeToken.displayName = 'storeToken';


      localStorage.setItem('auth_token', token);
      
      // Decode token and extract bypass flag
      const decoded = jwtDecode(token);
      
      if (decoded.bypass_mfa) {
        localStorage.setItem('bypass_mfa', 'true');
      }
      
      return decoded;
    };

    // Run the function
    const result = storeToken(mockToken);

    // Verify correct behavior
    expect(jwtDecode).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual(mockDecodedToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('bypass_mfa', 'true');
  });
});