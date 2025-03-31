/**
 * Visual Regression Testing Utilities
 * 
 * Tools for screenshot-based testing and visual comparison.
 * 
 * @module utils/visualRegressionTesting
 */

/**
 * Visual regression testing configuration
 * 
 * @typedef {Object} VisualTestConfig
 * @property {string} snapshotsDir - Directory for snapshots
 * @property {string} diffDir - Directory for difference images
 * @property {number} threshold - Difference threshold (0-1)
 * @property {boolean} updateSnapshots - Whether to update snapshots
 * @property {Array<string>} viewports - Viewport sizes to test
 */

/**
 * Default configuration
 * 
 * @type {VisualTestConfig}
 */
const defaultConfig = {
  snapshotsDir: '__snapshots__/visual',
  diffDir: '__diff__/visual',
  threshold: 0.01, // 1% threshold
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true',
  viewports: ['320x568', '768x1024', '1280x800'],
};

/**
 * Parse viewport string
 * 
 * @param {string} viewport - Viewport string (e.g. '320x568')
 * @returns {Object} Parsed viewport
 */
function parseViewport(viewport) {
  const [width, height] = viewport.split('x').map(Number);
  return { width, height };
}

/**
 * Visual testing service
 */
export class VisualTesting {
  /**
   * Create a new visual testing service
   * 
   * @param {VisualTestConfig} [config] - Configuration
   */
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.browser = null;
    this.page = null;
  }
  
  /**
   * Initialize the browser
   */
  async initialize() {
    // This would normally use puppeteer, but we're mocking it for this example
    console.log('Initializing browser');
    this.browser = {
      newPage: async () => ({
        setViewport: async ({ width, height }) => console.log(`Setting viewport to ${width}x${height}`),
        goto: async (url) => console.log(`Navigating to ${url}`),
        screenshot: async (options) => Buffer.from('mock screenshot'),
        evaluate: async (fn) => fn(),
        close: async () => console.log('Closing page'),
      }),
      close: async () => console.log('Closing browser'),
    };
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Take a screenshot of a component
   * 
   * @param {string} name - Test name
   * @param {string} component - Component name
   * @param {string} url - URL to screenshot
   * @param {Object} [options={}] - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeScreenshot(name, component, url, options = {}) {
    if (!this.browser) {
      await this.initialize();
    }
    
    const page = await this.browser.newPage();
    const viewport = parseViewport(options.viewport || this.config.viewports[0]);
    
    await page.setViewport(viewport);
    await page.goto(url);
    
    // Wait for any animations to complete
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Check if there are any CSS animations or transitions active
        const hasPendingAnimations = () => {
          const elements = document.querySelectorAll('*');
          for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (style.animationName !== 'none' || style.transition !== 'all 0s ease 0s') {
              return true;
            }
          }
          return false;
        };
        
        if (!hasPendingAnimations()) {
          resolve();
          return;
        }
        
        // Wait for animations to finish
        const checkAnimations = () => {
          if (!hasPendingAnimations()) {
            resolve();
          } else {
            requestAnimationFrame(checkAnimations);
          }
        };
        
        requestAnimationFrame(checkAnimations);
      });
    });
    
    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: options.fullPage || false,
      omitBackground: options.omitBackground || false,
    });
    
    await page.close();
    
    return screenshot;
  }
  
  /**
   * Compare a screenshot with a reference
   * 
   * @param {Buffer} screenshot - Screenshot buffer
   * @param {Buffer} reference - Reference buffer
   * @returns {Object} Comparison result
   */
  compareScreenshots(screenshot, reference) {
    // This would normally use image comparison libraries like pixelmatch
    // But we'll mock it for this example
    
    // Mock result
    return {
      diffPercentage: 0.005, // 0.5% difference
      diffBuffer: Buffer.from('mock diff image'),
      matches: true,
    };
  }
  
  /**
   * Run a visual test
   * 
   * @param {string} name - Test name
   * @param {string} component - Component name
   * @param {string} url - URL to test
   * @param {Object} [options={}] - Test options
   * @returns {Promise<boolean>} Whether test passed
   */
  async runTest(name, component, url, options = {}) {
    const vpName = options.viewport || this.config.viewports[0];
    const fileName = `${component}_${name}_${vpName}.png`;
    const snapshotPath = `${this.config.snapshotsDir}/${fileName}`;
    const diffPath = `${this.config.diffDir}/${fileName}`;
    
    // Take screenshot
    const screenshot = await this.takeScreenshot(name, component, url, options);
    
    // Check if reference exists (mock for this example)
    const referenceExists = true;
    
    // If updating snapshots, save and return
    if (this.config.updateSnapshots) {
      console.log(`Updating snapshot: ${snapshotPath}`);
      // Normally would save the file here
      return true;
    }
    
    // If reference doesn't exist, save and return
    if (!referenceExists) {
      console.log(`Creating new snapshot: ${snapshotPath}`);
      // Normally would save the file here
      return true;
    }
    
    // Load reference (mock for this example)
    const reference = Buffer.from('mock reference');
    
    // Compare screenshots
    const result = this.compareScreenshots(screenshot, reference);
    
    // Check threshold
    const passed = result.diffPercentage <= this.config.threshold;
    
    // If test failed, save diff image
    if (!passed) {
      console.log(`Test failed. Diff: ${result.diffPercentage * 100}%`);
      console.log(`Saving diff image: ${diffPath}`);
      // Normally would save the diff image here
    }
    
    return passed;
  }
  
  /**
   * Run visual tests for all viewports
   * 
   * @param {string} name - Test name
   * @param {string} component - Component name
   * @param {string} url - URL to test
   * @param {Object} [options={}] - Test options
   * @returns {Promise<Object>} Test results
   */
  async runTestAllViewports(name, component, url, options = {}) {
    const results = {};
    
    for (const viewport of this.config.viewports) {
      results[viewport] = await this.runTest(name, component, url, {
        ...options,
        viewport,
      });
    }
    
    return results;
  }
  
  /**
   * Run a component test with multiple states
   * 
   * @param {string} component - Component name
   * @param {string} url - Base URL
   * @param {Array<Object>} states - Component states to test
   * @param {Object} [options={}] - Test options
   * @returns {Promise<Object>} Test results
   */
  async testComponentStates(component, url, states, options = {}) {
    const results = {};
    
    for (const state of states) {
      const stateUrl = `${url}?state=${encodeURIComponent(JSON.stringify(state.props || {}))}`;
      results[state.name] = await this.runTestAllViewports(state.name, component, stateUrl, options);
    }
    
    return results;
  }
}

/**
 * Create a new visual testing instance
 * 
 * @param {VisualTestConfig} [config] - Configuration
 * @returns {VisualTesting} Visual testing instance
 */
export function createVisualTesting(config = {}) {
  return new VisualTesting(config);
}

/**
 * Component visual state for testing
 */
export class ComponentVisualState {
  /**
   * Create a new component visual state
   */
  constructor() {
    this.states = [];
  }
  
  /**
   * Add a state
   * 
   * @param {string} name - State name
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addState(name, props = {}) {
    this.states.push({ name, props });
    return this;
  }
  
  /**
   * Add default state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addDefaultState(props = {}) {
    return this.addState('default', props);
  }
  
  /**
   * Add hover state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addHoverState(props = {}) {
    return this.addState('hover', { ...props, hover: true });
  }
  
  /**
   * Add focus state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addFocusState(props = {}) {
    return this.addState('focus', { ...props, focus: true });
  }
  
  /**
   * Add disabled state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addDisabledState(props = {}) {
    return this.addState('disabled', { ...props, disabled: true });
  }
  
  /**
   * Add loading state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addLoadingState(props = {}) {
    return this.addState('loading', { ...props, loading: true });
  }
  
  /**
   * Add error state
   * 
   * @param {Object} [props={}] - Component props
   * @returns {ComponentVisualState} This instance for chaining
   */
  addErrorState(props = {}) {
    return this.addState('error', { ...props, error: 'Error message' });
  }
  
  /**
   * Get all states
   * 
   * @returns {Array<Object>} Component states
   */
  getStates() {
    return this.states;
  }
}

export default {
  VisualTesting,
  createVisualTesting,
  ComponentVisualState,
};