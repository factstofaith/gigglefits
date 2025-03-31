/**
 * Test configuration for the application
 */

export const TEST_CONFIG = {
  enableMocks: true,
  logLevel: 'error',
  timeouts: {
    api: 5000,
    render: 1000,
    animation: 300
  },
  testUsers: {
    admin: {
      username: 'admin@example.com',
      password: 'admin-password'
    },
    standard: {
      username: 'user@example.com',
      password: 'user-password'
    }
  }
};

export default TEST_CONFIG;
