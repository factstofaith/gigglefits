/**
 * A11yAlert Visual Tests
 * 
 * Visual regression tests for the A11yAlert component.
 * Tests the visual appearance across different states and viewports.
 */

import React from 'react';
import { VisualTesting, ComponentVisualState } from '../../../utils/visualRegressionTesting';
import A11yAlert from '../../../components/common/A11yAlert';

describe('A11yAlert Visual Tests', () => {
  let visualTesting;
  
  beforeAll(async () => {
    visualTesting = new VisualTesting({
      snapshotsDir: '__snapshots__/visual/common',
      diffDir: '__diff__/visual/common',
      threshold: 0.02,
      viewports: ['375x667', '768x1024', '1440x900'],
    });
    
    await visualTesting.initialize();
  });
  
  afterAll(async () => {
    await visualTesting.cleanup();
  });
  
  test('renders correctly in all states', async () => {
    // Define component states to test
    const states = new ComponentVisualState()
      .addDefaultState()
      .addFocusState()
      .addHoverState()
      // Add more states specific to this component
      .getStates();
    
    // Test all states across all viewports
    const results = await visualTesting.testComponentStates(
      'A11yAlert',
      'http://localhost:6006/iframe.html?id=components-common-a11yalert',
      states
    );
    
    // Verify all screenshots match baseline
    Object.entries(results).forEach(([stateName, viewportResults]) => {
      Object.entries(viewportResults).forEach(([viewport, passed]) => {
        expect(passed).toBe(true);
      });
    });
  });
  
  test('renders with different themes', async () => {
    // Test light theme
    const lightResults = await visualTesting.runTestAllViewports(
      'light-theme',
      'A11yAlert',
      'http://localhost:6006/iframe.html?id=components-common-a11yalert&theme=light'
    );
    
    // Test dark theme
    const darkResults = await visualTesting.runTestAllViewports(
      'dark-theme',
      'A11yAlert',
      'http://localhost:6006/iframe.html?id=components-common-a11yalert&theme=dark'
    );
    
    // Verify theme screenshots match baselines
    Object.values(lightResults).forEach(passed => expect(passed).toBe(true));
    Object.values(darkResults).forEach(passed => expect(passed).toBe(true));
  });
});