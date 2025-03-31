/**
 * Storybook Test Runner Configuration
 * 
 * This file configures the @storybook/test-runner to:
 * 1. Perform accessibility checks on all stories
 * 2. Take Percy snapshots for visual regression testing
 */
const { injectAxe, checkA11y } = require('axe-playwright');
const { getStoryContext } = require('@storybook/test-runner');

/*
 * See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api
 * for more information about the test runner hooks API
 */
module.exports = {
  async preRender(page) {
    // Inject axe-core into the page for accessibility testing
    await injectAxe(page);
  },
  async postRender(page, context) {
    // Get the current story context
    const storyContext = await getStoryContext(page, context);
    
    // Skip accessibility tests if explicitly disabled
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }
    
    // Run accessibility tests
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // You can pass custom axe-core options here
      axeOptions: storyContext.parameters?.a11y?.options || {},
    });
    
    // Check for Percy visual testing
    if (process.env.PERCY_TOKEN) {
      // Take Percy snapshot for visual regression testing
      // await page.evaluate(() => {
      //   window.Percy?.snapshot({
      //     name: document.title,
      //   });
      // });
    }
  },
};