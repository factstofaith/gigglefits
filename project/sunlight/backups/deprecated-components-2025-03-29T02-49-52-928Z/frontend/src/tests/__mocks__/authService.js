// Mock authService for tests
const authService = {
  // Auth token management
  getAuthToken: jest.fn().mockResolvedValue('mock-token'),
  refreshToken: jest.fn().mockResolvedValue({ token: 'mock-refreshed-token', expiresIn: 3600 }),
  logout: jest.fn().mockResolvedValue(true),

  // User state management
  initialize: jest
    .fn()
    .mockReturnValue({ token: 'mock-token', userInfo: { name: 'Test User', role: 'admin' } }),
  getCurrentUser: jest.fn().mockResolvedValue({ name: 'Test User', role: 'admin' }),
  isAuthenticated: jest.fn().mockReturnValue(true),
  isAdmin: jest.fn().mockResolvedValue(true),

  // Login methods
  login: jest
    .fn()
    .mockResolvedValue({
      token: 'mock-token',
      refreshToken: 'mock-refresh',
      userInfo: { name: 'Test User' },
    }),
  loginWithOffice365: jest.fn().mockResolvedValue({ token: 'mock-o365-token' }),
  loginWithGmail: jest.fn().mockResolvedValue({ token: 'mock-gmail-token' }),
};

export default authService;
