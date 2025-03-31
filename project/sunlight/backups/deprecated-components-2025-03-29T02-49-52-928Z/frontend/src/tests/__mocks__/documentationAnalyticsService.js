// Mock documentation analytics service
const mockDocumentationAnalyticsService = {
  getDocumentationStats: jest.fn(),
  getTopSearchTerms: jest.fn(),
  getDocumentStats: jest.fn(),
  getUserEngagementMetrics: jest.fn(),
  getUsageByCategory: jest.fn()
};

export default mockDocumentationAnalyticsService;