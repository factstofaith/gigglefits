/**
 * API Service Tests
 * 
 * Tests for the API service.
 */

import { ApiService } from '../apiService';

// Mock fetch
global.fetch = jest.fn();
global.AbortController = class {
  constructor() {
    this.signal = { aborted: false };
    this.abort = jest.fn(() => {
      this.signal.aborted = true;
    });
  }
};

describe('ApiService', () => {
  let apiService;
  
  beforeEach(() => {
    // Reset mocks
    fetch.mockReset();
    jest.useFakeTimers();
    
    // Create new API service instance for each test
    apiService = new ApiService({
      baseUrl: 'https://api.example.com',
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('constructor', () => {
    it('uses default values when no options are provided', () => {
      const defaultService = new ApiService();
      
      expect(defaultService.baseUrl).toBe('');
      expect(defaultService.defaultOptions.timeout).toBe(30000);
    });
    
    it('uses provided options', () => {
      const customService = new ApiService({
        baseUrl: 'https://test.example.com',
        timeout: 5000,
      });
      
      expect(customService.baseUrl).toBe('https://test.example.com');
      expect(customService.defaultOptions.timeout).toBe(5000);
    });
  });
  
  describe('buildUrl', () => {
    it('prepends baseUrl to path', () => {
      expect(apiService.buildUrl('/users')).toBe('https://api.example.com/users');
    });
    
    it('handles paths without leading slash', () => {
      expect(apiService.buildUrl('users')).toBe('https://api.example.com/users');
    });
    
    it('handles baseUrl with trailing slash', () => {
      apiService.baseUrl = 'https://api.example.com/';
      expect(apiService.buildUrl('/users')).toBe('https://api.example.com/users');
    });
    
    it('does not modify absolute URLs', () => {
      const absoluteUrl = 'https://another-api.example.com/users';
      expect(apiService.buildUrl(absoluteUrl)).toBe(absoluteUrl);
    });
  });
  
  describe('request', () => {
    it('makes a request with correct URL and options', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      await apiService.request('/users', { method: 'GET' });
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          credentials: 'include',
          signal: expect.any(Object),
        })
      );
    });
    
    it('parses JSON response', async () => {
      const mockData = { data: 'test' };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue(mockData),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      const result = await apiService.request('/users');
      
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
    
    it('parses text response when content-type is text/', async () => {
      const mockText = 'Hello, world!';
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'text/plain',
        },
        text: jest.fn().mockResolvedValue(mockText),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      const result = await apiService.request('/text');
      
      expect(mockResponse.text).toHaveBeenCalled();
      expect(result).toBe(mockText);
    });
    
    it('handles blob response for other content types', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/pdf',
        },
        blob: jest.fn().mockResolvedValue(mockBlob),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      const result = await apiService.request('/file');
      
      expect(mockResponse.blob).toHaveBeenCalled();
      expect(result).toBe(mockBlob);
    });
    
    it('throws error for non-ok responses', async () => {
      const errorData = { message: 'Not found' };
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue(errorData),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      await expect(apiService.request('/nonexistent')).rejects.toThrow('Not found');
    });
    
    it('handles request timeout', async () => {
      // Timeout is set to a very short period for testing
      apiService = new ApiService({
        baseUrl: 'https://api.example.com',
        timeout: 50,
      });
      
      // Mock a request that never resolves
      fetch.mockImplementation(() => new Promise(resolve => {
        // This promise will never resolve unless aborted
      }));
      
      const promise = apiService.request('/slow-endpoint');
      
      // Advance timers to trigger timeout
      jest.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow('Request timeout');
    });
    
    it('calls onRequest interceptor if provided', async () => {
      const onRequest = jest.fn().mockReturnValue({
        headers: { 'X-Custom-Header': 'test' },
      });
      
      apiService = new ApiService({
        baseUrl: 'https://api.example.com',
        onRequest,
      });
      
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue({}),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      await apiService.request('/users');
      
      expect(onRequest).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test',
          }),
        })
      );
    });
    
    it('calls onResponse interceptor if provided', async () => {
      const mockData = { data: 'test' };
      const transformedData = { data: 'transformed' };
      
      const onResponse = jest.fn().mockReturnValue(transformedData);
      
      apiService = new ApiService({
        baseUrl: 'https://api.example.com',
        onResponse,
      });
      
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue(mockData),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      const result = await apiService.request('/users');
      
      expect(onResponse).toHaveBeenCalledWith(mockResponse, mockData);
      expect(result).toEqual(transformedData);
    });
    
    it('calls onError interceptor for failed requests', async () => {
      const onError = jest.fn();
      
      apiService = new ApiService({
        baseUrl: 'https://api.example.com',
        onError,
      });
      
      const errorData = { message: 'Server error' };
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue(errorData),
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      await expect(apiService.request('/error')).rejects.toThrow('Server error');
      
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toHaveProperty('status', 500);
      expect(onError.mock.calls[0][0]).toHaveProperty('data', errorData);
    });
  });
  
  describe('HTTP methods', () => {
    beforeEach(() => {
      // Mock successful response for all tests
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      
      fetch.mockResolvedValue(mockResponse);
    });
    
    it('makes GET request with query params', async () => {
      await apiService.get('/users', { page: 1, limit: 10 });
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
    
    it('skips null and undefined query params', async () => {
      await apiService.get('/users', { page: 1, filter: null, sort: undefined });
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1',
        expect.anything()
      );
    });
    
    it('makes POST request with JSON body', async () => {
      const data = { name: 'John', email: 'john@example.com' };
      
      await apiService.post('/users', data);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });
    
    it('makes PUT request with JSON body', async () => {
      const data = { name: 'Updated Name' };
      
      await apiService.put('/users/123', data);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });
    
    it('makes PATCH request with JSON body', async () => {
      const data = { name: 'Patched Name' };
      
      await apiService.patch('/users/123', data);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });
    
    it('makes DELETE request', async () => {
      await apiService.delete('/users/123');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});