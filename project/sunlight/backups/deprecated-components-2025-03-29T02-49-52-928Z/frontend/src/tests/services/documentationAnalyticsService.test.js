import documentationAnalyticsService from '@services/documentationAnalyticsService';
import axios from 'axios';
import authService from '@services/authService';

// Mock axios and auth service
jest.mock('axios');
jest.mock('../../services/authService');

describe('documentationAnalyticsService', () => {
  const mockToken = 'mock-token';
  const mockTimePeriod = 'week';
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Clear the cache for clean tests
    documentationAnalyticsService._cache.clear();
    
    // Mock auth service to return a token
    authService.getAuthToken = jest.fn().mockResolvedValue(mockToken);
    
    // Mock axios to return successful responses
    axios.mockResolvedValue({ data: {} });
  });
  
  describe('getDocumentationStats', () => {
    it('should call the correct endpoint with auth token', async () => {
      const mockResponse = {
        time_period: 'week',
        total_views: 1245,
        unique_documents: 42,
        feedback: { positive: 98, negative: 12 }
      };
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documentationAnalyticsService.getDocumentationStats(mockTimePeriod);
      
      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining(`/api/documentation/analytics/stats?time_period=${mockTimePeriod}`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
    
    it('should return cached data on subsequent calls', async () => {
      const mockResponse = {
        time_period: 'week',
        total_views: 1245,
        unique_documents: 42
      };
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      // First call should make an API request
      const result1 = await documentationAnalyticsService.getDocumentationStats(mockTimePeriod);
      expect(axios).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockResponse);
      
      // Second call should use cached data
      const result2 = await documentationAnalyticsService.getDocumentationStats(mockTimePeriod);
      expect(axios).toHaveBeenCalledTimes(1); // Still only one call
      expect(result2).toEqual(mockResponse);
    });
    
    it('should return mock data in development environment when API fails', async () => {
      // Save original env
      const originalEnv = process.env.NODE_ENV;
      // Set env to development
      process.env.NODE_ENV = 'development';
      
      // Mock API failure
      axios.mockRejectedValueOnce(new Error('API error'));
      
      const result = await documentationAnalyticsService.getDocumentationStats(mockTimePeriod);
      
      // Check that we got mock data
      expect(result).toBeDefined();
      expect(result.total_views).toBeDefined();
      expect(result.unique_documents).toBeDefined();
      expect(result.feedback).toBeDefined();
      
      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should throw error in production environment when API fails', async () => {
      // Save original env
      const originalEnv = process.env.NODE_ENV;
      // Set env to production
      process.env.NODE_ENV = 'production';
      
      // Mock API failure
      axios.mockRejectedValueOnce(new Error('API error'));
      
      await expect(documentationAnalyticsService.getDocumentationStats(mockTimePeriod))
        .rejects.toThrow('API error');
      
      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe('getTopSearchTerms', () => {
    it('should call the correct endpoint with auth token', async () => {
      const mockLimit = 10;
      const mockResponse = [
        { term: 'integration', count: 87 },
        { term: 'api key', count: 65 }
      ];
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documentationAnalyticsService.getTopSearchTerms(mockTimePeriod, mockLimit);
      
      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining(`/api/documentation/analytics/search-terms?time_period=${mockTimePeriod}&limit=${mockLimit}`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getDocumentStats', () => {
    it('should call the correct endpoint with auth token', async () => {
      const mockDocumentId = 'doc-123';
      const mockResponse = {
        document_id: mockDocumentId,
        views: 156,
        unique_users: 42,
        feedback: { positive: 15, negative: 3 }
      };
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documentationAnalyticsService.getDocumentStats(mockDocumentId, mockTimePeriod);
      
      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining(`/api/documentation/analytics/document/${mockDocumentId}?time_period=${mockTimePeriod}`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getUserEngagementMetrics', () => {
    it('should call the correct endpoint with auth token', async () => {
      const mockResponse = {
        average_session_duration: 325,
        bounce_rate: 0.28,
        returning_users: 67
      };
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documentationAnalyticsService.getUserEngagementMetrics(mockTimePeriod);
      
      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining(`/api/documentation/analytics/engagement?time_period=${mockTimePeriod}`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getUsageByCategory', () => {
    it('should call the correct endpoint with auth token', async () => {
      const mockResponse = [
        { category: 'Getting Started', views: 245, documents: 5 },
        { category: 'API Reference', views: 187, documents: 8 }
      ];
      
      axios.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documentationAnalyticsService.getUsageByCategory(mockTimePeriod);
      
      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining(`/api/documentation/analytics/categories?time_period=${mockTimePeriod}`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('cache management', () => {
    it('invalidateCache should clear specific cache entries', async () => {
      // Setup: populate cache with mock data
      const mockStatsResponse = { total_views: 100 };
      const mockTermsResponse = [{ term: 'test', count: 10 }];
      
      axios.mockResolvedValueOnce({ data: mockStatsResponse });
      axios.mockResolvedValueOnce({ data: mockTermsResponse });
      
      // Call both methods to populate cache
      await documentationAnalyticsService.getDocumentationStats('week');
      await documentationAnalyticsService.getTopSearchTerms('month');
      
      // Reset mock to track future calls
      axios.mockClear();
      
      // Invalidate only 'week' data
      documentationAnalyticsService.invalidateCache('week');
      
      // This should make a new API call
      await documentationAnalyticsService.getDocumentationStats('week');
      expect(axios).toHaveBeenCalledTimes(1);
      
      // This should still use cache
      await documentationAnalyticsService.getTopSearchTerms('month');
      expect(axios).toHaveBeenCalledTimes(1); // No additional call
    });
    
    it('refreshAnalytics should fetch all data in parallel', async () => {
      // Setup mock responses
      const mockResponses = {
        stats: { total_views: 100 },
        searchTerms: [{ term: 'test', count: 10 }],
        categoryData: [{ category: 'API', views: 50 }],
        engagementData: { average_session_duration: 300 }
      };
      
      // Setup axios to return different responses for each call
      axios
        .mockResolvedValueOnce({ data: mockResponses.stats })
        .mockResolvedValueOnce({ data: mockResponses.searchTerms })
        .mockResolvedValueOnce({ data: mockResponses.categoryData })
        .mockResolvedValueOnce({ data: mockResponses.engagementData });
      
      // Call refreshAnalytics
      const result = await documentationAnalyticsService.refreshAnalytics('week');
      
      // Check that axios was called 4 times (for all 4 data types)
      expect(axios).toHaveBeenCalledTimes(4);
      
      // Check that the result includes all the data
      expect(result).toEqual(expect.objectContaining({
        stats: mockResponses.stats,
        searchTerms: mockResponses.searchTerms,
        categoryData: mockResponses.categoryData,
        engagementData: mockResponses.engagementData,
        refreshTime: expect.any(String)
      }));
    });
  });
  
  // Additional tests for mock data functions - optional
  describe('Mock data functions', () => {
    // Save original env
    const originalEnv = process.env.NODE_ENV;
    
    beforeAll(() => {
      // Set env to development to test mock data
      process.env.NODE_ENV = 'development';
    });
    
    afterAll(() => {
      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should return mock stats with correct time period properties', async () => {
      // Mock API failure to trigger mock data
      axios.mockRejectedValueOnce(new Error('API error'));
      
      const result = await documentationAnalyticsService.getDocumentationStats('day');
      
      expect(result.time_period).toBe('day');
      expect(new Date(result.start_date)).toBeInstanceOf(Date);
      expect(new Date(result.end_date)).toBeInstanceOf(Date);
      
      // End date should be more recent than start date
      expect(new Date(result.end_date) > new Date(result.start_date)).toBe(true);
    });
    
    it('should return appropriate mock search terms', async () => {
      // Mock API failure to trigger mock data
      axios.mockRejectedValueOnce(new Error('API error'));
      
      const result = await documentationAnalyticsService.getTopSearchTerms('week', 5);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Each item should have term and count properties
      result.forEach(item => {
        expect(item).toHaveProperty('term');
        expect(item).toHaveProperty('count');
        expect(typeof item.term).toBe('string');
        expect(typeof item.count).toBe('number');
      });
    });
  });
});