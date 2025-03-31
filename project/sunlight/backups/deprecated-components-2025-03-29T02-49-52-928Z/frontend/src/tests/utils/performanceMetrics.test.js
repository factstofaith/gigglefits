// performanceMetrics.test.js
import React from 'react';
import { render } from '@testing-library/react';
import performanceMetrics, {
  PerformanceMetrics,
  trackRender,
  withPerformanceTracking
} from '../../utils/performanceMetrics';

// Most important features to test:
// 1. Basic initialization and functionality
// 2. Timing operations (startTiming/endTiming)
// 3. trackRender/withPerformanceTracking functions
// 4. Singleton pattern

describe('performanceMetrics', () => {
  // Save original console methods for cleanup
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Save original environment for cleanup
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDebugFlag = process.env.REACT_APP_PERF_DEBUG;
  
  // Save original performance APIs
  const originalPerformanceNow = window.performance.now;
  
  // Setup mocks
  beforeAll(() => {
    // Mock console methods to avoid test output noise
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock performance.now
    window.performance.now = jest.fn().mockReturnValue(1000);
    
    // Mock environment for testing
    process.env.NODE_ENV = 'development';
    process.env.REACT_APP_PERF_DEBUG = 'true';
  });
  
  afterAll(() => {
    // Restore originals
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    window.performance.now = originalPerformanceNow;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.REACT_APP_PERF_DEBUG = originalDebugFlag;
  });

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a singleton instance', () => {
    // Create a new instance
    const newInstance = new PerformanceMetrics();
    
    // They should be different objects
    expect(performanceMetrics).not.toBe(newInstance);
    
    // Import the module again
    const reimportedModule = require('../../utils/performanceMetrics');
    
    // Should be the same instance
    expect(reimportedModule.default).toBe(performanceMetrics);
  });
  
  it('should properly track timing operations', () => {
    // Create a fresh instance for testing
    const metrics = new PerformanceMetrics();
    
    // Force enabled for testing
    metrics.enabled = true;
    
    // Setup mock metrics directly
    metrics.metrics = {
      navigationStart: 0,
      apiResponseTimes: {},
      componentRenderTimes: {}
    };
    
    // Set up performance.now to return different values
    window.performance.now
      .mockReturnValueOnce(1000) // startTiming
      .mockReturnValueOnce(1500); // endTiming
    
    // Start timing an operation
    const startTime = metrics.startTiming('testOperation');
    
    // Verify start time
    expect(startTime).toBe(1000);
    expect(metrics.metrics.testOperation_start).toBe(1000);
    
    // End timing
    const duration = metrics.endTiming('testOperation');
    
    // Verify duration
    expect(duration).toBe(500); // 1500 - 1000
    
    // Create a custom timing category
    metrics.metrics.customCategoryTimes = {};
    window.performance.now
      .mockReturnValueOnce(2000) // startTiming
      .mockReturnValueOnce(2400); // endTiming
    
    metrics.startTiming('categoryTest');
    const categoryDuration = metrics.endTiming('categoryTest', 'customCategory');
    
    expect(categoryDuration).toBe(400);
    expect(metrics.metrics.customCategoryTimes.categoryTest).toBe(400);
  });
  
  it('should track API calls correctly', () => {
    // Create a fresh instance for testing
    const metrics = new PerformanceMetrics();
    
    // Force enabled for testing
    metrics.enabled = true;
    
    // Set up metrics directly
    metrics.metrics = {
      apiResponseTimes: {}
    };
    
    // Track an API call
    metrics.trackApiCall('/api/test', 150);
    
    // Verify tracking
    const stats = metrics.metrics.apiResponseTimes['/api/test'];
    expect(stats).toBeDefined();
    expect(stats.calls).toBe(1);
    expect(stats.totalTime).toBe(150);
    expect(stats.average).toBe(150);
    expect(stats.min).toBe(150);
    expect(stats.max).toBe(150);
    
    // Track another call to the same endpoint
    metrics.trackApiCall('/api/test', 250);
    
    // Verify updated stats
    expect(stats.calls).toBe(2);
    expect(stats.totalTime).toBe(400); // 150 + 250
    expect(stats.average).toBe(200); // 400 / 2
    expect(stats.min).toBe(150); // unchanged
    expect(stats.max).toBe(250); // updated
  });
  
  it('should track component renders correctly', () => {
    // Create a fresh instance for testing
    const metrics = new PerformanceMetrics();
    
    // Force enabled for testing
    metrics.enabled = true;
    
    // Set up metrics directly
    metrics.metrics = {
      componentRenderTimes: {}
    };
    
    // Track a component render
    metrics.trackRender('Button', 5);
    
    // Verify tracking
    const stats = metrics.metrics.componentRenderTimes.Button;
    expect(stats).toBeDefined();
    expect(stats.renders).toBe(1);
    expect(stats.totalTime).toBe(5);
    expect(stats.average).toBe(5);
    
    // Track another render of the same component
    metrics.trackRender('Button', 7);
    
    // Verify updated stats
    expect(stats.renders).toBe(2);
    expect(stats.totalTime).toBe(12); // 5 + 7
    expect(stats.average).toBe(6); // 12 / 2
  });
  
  describe('trackRender helper function', () => {
    it('should measure render time and return result', () => {
      // Create a spy on the singleton's trackRender method
      const trackRenderSpy = jest.spyOn(performanceMetrics, 'trackRender')
        .mockImplementation(jest.fn());
      
      // Force enabled for testing
      performanceMetrics.enabled = true;
      
      // Set up performance.now to return different values
      window.performance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1080); // End time
      
      // Create a simple render function
      const renderFunc = () => 'Rendered content';
      
      // Call the helper
      const result = trackRender('TestComponent', renderFunc);
      
      // Verify result
      expect(result).toBe('Rendered content');
      
      // Verify the singleton's trackRender was called
      expect(trackRenderSpy).toHaveBeenCalled();
      
      // Clean up
      trackRenderSpy.mockRestore();
    });
    
    it('should bypass tracking when disabled', () => {
      // Temporarily disable metrics
      const originalEnabled = performanceMetrics.enabled;
      performanceMetrics.enabled = false;
      
      // Create a spy
      const trackRenderSpy = jest.spyOn(performanceMetrics, 'trackRender');
      
      // Create a simple render function
      const renderFunc = jest.fn().mockReturnValue('Disabled render');
      
      // Call the helper
      const result = trackRender('DisabledComponent', renderFunc);
      
      // Verify the render function was called but not tracked
      expect(result).toBe('Disabled render');
      expect(renderFunc).toHaveBeenCalled();
      expect(trackRenderSpy).not.toHaveBeenCalled();
      
      // Clean up
      performanceMetrics.enabled = originalEnabled;
      trackRenderSpy.mockRestore();
    });
  });
  
  describe('withPerformanceTracking HOC', () => {
    it('should create a tracked component', () => {
      // Create a spy
      const trackRenderSpy = jest.spyOn(performanceMetrics, 'trackRender')
        .mockImplementation(jest.fn());
      
      // Force enabled for testing
      performanceMetrics.enabled = true;
      
      // Create a simple component
      const TestComponent = (props) => <div>{props.text}</div>;
      
      // Wrap with HOC
      const TrackedComponent = withPerformanceTracking('TrackedComponent', TestComponent);
      
      // Render the component
      render(<TrackedComponent text="Hello" />);
      
      // Verify tracking was called
      expect(trackRenderSpy).toHaveBeenCalled();
      
      // Clean up
      trackRenderSpy.mockRestore();
    });
    
    it('should render correctly when disabled', () => {
      // Temporarily disable metrics
      const originalEnabled = performanceMetrics.enabled;
      performanceMetrics.enabled = false;
      
      // Create a spy
      const trackRenderSpy = jest.spyOn(performanceMetrics, 'trackRender');
      
      // Create a simple component
      const TestComponent = (props) => <div>{props.text}</div>;
      
      // Wrap with HOC
      const TrackedComponent = withPerformanceTracking('DisabledHOC', TestComponent);
      
      // Render the component
      const { container } = render(<TrackedComponent text="Disabled" />);
      
      // Verify component rendered but tracking was not called
      expect(container.textContent).toBe('Disabled');
      expect(trackRenderSpy).not.toHaveBeenCalled();
      
      // Clean up
      performanceMetrics.enabled = originalEnabled;
      trackRenderSpy.mockRestore();
    });
  });
});