/**
 * Accessibility Audit Utils
 * 
 * Utilities for systematic accessibility auditing of components and pages.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module utils/a11y/accessibilityAudit
 */

import { axe } from 'axe-core';

/**
 * WCAG Success Criteria mapped to human-readable names
 */
export const WCAG_CRITERIA = {
  'wcag2a': 'WCAG 2.0 Level A',
  'wcag2aa': 'WCAG 2.0 Level AA',
  'wcag21a': 'WCAG 2.1 Level A',
  'wcag21aa': 'WCAG 2.1 Level AA',
  'wcag22a': 'WCAG 2.2 Level A',
  'wcag22aa': 'WCAG 2.2 Level AA',
  'best-practice': 'Best Practice'
};

/**
 * Issue impact levels mapped to severity
 */
export const IMPACT_LEVELS = {
  'critical': 4,
  'serious': 3,
  'moderate': 2,
  'minor': 1
};

/**
 * Configuration for the axe-core accessibility auditing
 */
const DEFAULT_AXE_CONFIG = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice']
  },
  rules: {
    'color-contrast': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    'frame-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'meta-viewport': { enabled: true },
    'tabindex': { enabled: true }
  }
};

/**
 * Run an accessibility audit on a DOM element
 * 
 * @param {HTMLElement} element - Element to audit
 * @param {Object} config - Axe configuration override
 * @returns {Promise<Object>} Audit results
 */
export const auditElement = async (element, config = {}) => {
  if (!element) {
    throw new Error('No element provided for accessibility audit');
  }
  
  // Merge default config with provided config
  const axeConfig = {
    ...DEFAULT_AXE_CONFIG,
    ...config
  };
  
  try {
    // Run the accessibility audit
    const results = await axe.run(element, axeConfig);
    
    return processAuditResults(results);
  } catch (error) {
    console.error('Error running accessibility audit:', error);
    throw error;
  }
};

/**
 * Process the raw results from axe-core into a more useful format
 * 
 * @param {Object} results - Raw axe-core results
 * @returns {Object} Processed results
 */
const processAuditResults = (results) => {
  const violations = results.violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    impactScore: IMPACT_LEVELS[violation.impact] || 0,
    description: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    wcagCriteria: violation.tags
      .filter(tag => Object.keys(WCAG_CRITERIA).includes(tag))
      .map(tag => WCAG_CRITERIA[tag]),
    nodes: violation.nodes.map(node => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary,
      fixes: extractFixSuggestions(node)
    }))
  }));
  
  const passed = results.passes.map(pass => ({
    id: pass.id,
    description: pass.help,
    tags: pass.tags,
    wcagCriteria: pass.tags
      .filter(tag => Object.keys(WCAG_CRITERIA).includes(tag))
      .map(tag => WCAG_CRITERIA[tag]),
    nodes: pass.nodes.map(node => ({
      html: node.html,
      target: node.target
    }))
  }));
  
  // Group violations by impact level
  const violationsByImpact = violations.reduce((acc, violation) => {
    const impact = violation.impact || 'unknown';
    if (!acc[impact]) {
      acc[impact] = [];
    }
    acc[impact].push(violation);
    return acc;
  }, {});
  
  // Sort violations by impact score (highest first)
  const sortedViolations = [...violations].sort((a, b) => 
    (b.impactScore || 0) - (a.impactScore || 0)
  );
  
  return {
    summary: {
      violations: violations.length,
      passes: passed.length,
      violationsBySeverity: {
        critical: violationsByImpact.critical?.length || 0,
        serious: violationsByImpact.serious?.length || 0,
        moderate: violationsByImpact.moderate?.length || 0,
        minor: violationsByImpact.minor?.length || 0
      },
      passRate: passed.length / (passed.length + violations.length) * 100,
      wcagCompliance: {
        a: !violations.some(v => v.tags.includes('wcag2a') || v.tags.includes('wcag21a') || v.tags.includes('wcag22a')),
        aa: !violations.some(v => v.tags.includes('wcag2aa') || v.tags.includes('wcag21aa') || v.tags.includes('wcag22aa'))
      }
    },
    violations: sortedViolations,
    violationsByImpact,
    passed,
    incomplete: results.incomplete,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    rawResults: results
  };
};

/**
 * Extract fix suggestions from node data
 * 
 * @param {Object} node - Axe node data
 * @returns {Array<string>} Fix suggestions
 */
const extractFixSuggestions = (node) => {
  const fixes = [];
  
  // Parse the failure summary for fix suggestions
  if (node.failureSummary) {
    const summaryLines = node.failureSummary.split('\n').filter(Boolean);
    const fixSuggestions = summaryLines.slice(1); // Skip the first line which is just a header
    fixes.push(...fixSuggestions);
  }
  
  // Add specific fixes based on the rule that failed
  if (node.any) {
    node.any.forEach(check => {
      if (check.message) {
        fixes.push(check.message);
      }
    });
  }
  
  if (node.all) {
    node.all.forEach(check => {
      if (check.message) {
        fixes.push(check.message);
      }
    });
  }
  
  if (node.none) {
    node.none.forEach(check => {
      if (check.message) {
        fixes.push(check.message);
      }
    });
  }
  
  // Remove duplicates
  return [...new Set(fixes)];
};

/**
 * Generate a comprehensive report from audit results
 * 
 * @param {Object} results - Processed audit results
 * @param {string} [title='Accessibility Audit Report'] - Report title
 * @returns {string} HTML report
 */
export const generateAuditReport = (results, title = 'Accessibility Audit Report') => {
  const { summary, violations, passed } = results;
  
  // Generate HTML report
  let report = `
    <h1>${title}</h1>
    <div class="audit-summary">
      <h2>Summary</h2>
      <ul>
        <li>Total issues: ${summary.violations}</li>
        <li>Tests passed: ${summary.passes}</li>
        <li>Pass rate: ${summary.passRate.toFixed(2)}%</li>
        <li>WCAG 2.1 Level A compliance: ${summary.wcagCompliance.a ? '✅ Yes' : '❌ No'}</li>
        <li>WCAG 2.1 Level AA compliance: ${summary.wcagCompliance.aa ? '✅ Yes' : '❌ No'}</li>
      </ul>
      
      <h3>Issues by Severity</h3>
      <ul>
        <li class="critical">Critical: ${summary.violationsBySeverity.critical}</li>
        <li class="serious">Serious: ${summary.violationsBySeverity.serious}</li>
        <li class="moderate">Moderate: ${summary.violationsBySeverity.moderate}</li>
        <li class="minor">Minor: ${summary.violationsBySeverity.minor}</li>
      </ul>
    </div>
    
    <div class="audit-violations">
      <h2>Violations (${violations.length})</h2>
  `;
  
  // Add violations
  if (violations.length > 0) {
    violations.forEach(violation => {
      report += `
        <div class="violation ${violation.impact}">
          <h3>${violation.description}</h3>
          <p>Impact: <span class="${violation.impact}">${violation.impact}</span></p>
          <p>WCAG Criteria: ${violation.wcagCriteria.join(', ') || 'Best Practice'}</p>
          <a href="${violation.helpUrl}" target="_blank" rel="noopener noreferrer">Learn More</a>
          
          <h4>Affected Elements (${violation.nodes.length})</h4>
          <ul>
      `;
      
      violation.nodes.forEach(node => {
        report += `
          <li>
            <div class="element-code">${node.html}</div>
            <p>Selector: ${node.target.join(' ')}</p>
            <div class="fix-suggestions">
              <h5>Fix Suggestions:</h5>
              <ul>
          `;
        
        node.fixes.forEach(fix => {
          report += `<li>${fix}</li>`;
        });
        
        report += `
              </ul>
            </div>
          </li>
        `;
      });
      
      report += `
          </ul>
        </div>
      `;
    });
  } else {
    report += '<p>No violations found. Great job!</p>';
  }
  
  // Add passed tests summary
  report += `
    <div class="audit-passed">
      <h2>Passed Tests (${passed.length})</h2>
      <ul>
  `;
  
  passed.forEach(pass => {
    report += `<li>${pass.description} (${pass.nodes.length} elements)</li>`;
  });
  
  report += `
      </ul>
    </div>
    
    <div class="audit-timestamp">
      <p>Report generated: ${new Date(results.timestamp).toLocaleString()}</p>
      <p>URL: ${results.url}</p>
    </div>
  `;
  
  // Add CSS styles
  report = `
    <style>
      .audit-summary { margin-bottom: 2rem; }
      .violation { margin-bottom: 1.5rem; padding: 1rem; border-radius: 4px; }
      .critical { background-color: #ffeded; color: #d32f2f; border-left: 4px solid #d32f2f; }
      .serious { background-color: #fff4e5; color: #ed6c02; border-left: 4px solid #ed6c02; }
      .moderate { background-color: #fff9c4; color: #ed6c02; border-left: 4px solid #ffc107; }
      .minor { background-color: #e8f5e9; color: #2e7d32; border-left: 4px solid #2e7d32; }
      .element-code { font-family: monospace; padding: 0.5rem; background-color: #f5f5f5; margin: 0.5rem 0; }
      .fix-suggestions { margin-top: 0.5rem; }
      .audit-timestamp { margin-top: 2rem; font-style: italic; }
    </style>
  ` + report;
  
  return report;
};

/**
 * Create a DOM element to display audit results in the UI
 * 
 * @param {Object} results - Processed audit results
 * @param {Object} options - Display options
 * @param {boolean} [options.highlightElements=true] - Whether to highlight elements with issues
 * @param {boolean} [options.showFixSuggestions=true] - Whether to show fix suggestions
 * @param {Function} [options.onFix] - Callback when a fix is applied
 * @returns {HTMLElement} Results display element
 */
export const createAuditResultsDisplay = (results, {
  highlightElements = true,
  showFixSuggestions = true,
  onFix = null
} = {}) => {
  const { summary, violations } = results;
  
  // Create container element
  const container = document.createElement('div');
  container.className = 'a11y-audit-results';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Accessibility audit results');
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .a11y-audit-results {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      padding: 1rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .a11y-audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    .a11y-audit-summary {
      margin-bottom: 1rem;
    }
    .a11y-audit-violations {
      margin-bottom: 1rem;
    }
    .a11y-audit-violation {
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .a11y-audit-violation-critical { background-color: #ffeded; border-left: 3px solid #d32f2f; }
    .a11y-audit-violation-serious { background-color: #fff4e5; border-left: 3px solid #ed6c02; }
    .a11y-audit-violation-moderate { background-color: #fff9c4; border-left: 3px solid #ffc107; }
    .a11y-audit-violation-minor { background-color: #e8f5e9; border-left: 3px solid #2e7d32; }
    .a11y-audit-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
    }
    .a11y-highlighted {
      outline: 3px dashed red !important;
      position: relative;
    }
    .a11y-fix-button {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }
  `;
  container.appendChild(style);
  
  // Create header
  const header = document.createElement('div');
  header.className = 'a11y-audit-header';
  
  const title = document.createElement('h2');
  title.textContent = 'Accessibility Audit';
  title.style.margin = '0';
  header.appendChild(title);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'a11y-audit-close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close audit results');
  closeButton.onclick = () => {
    // Remove highlights if they exist
    if (highlightElements) {
      document.querySelectorAll('.a11y-highlighted').forEach(el => {
        el.classList.remove('a11y-highlighted');
      });
    }
    // Remove the results display
    container.remove();
  };
  header.appendChild(closeButton);
  
  container.appendChild(header);
  
  // Create summary
  const summaryEl = document.createElement('div');
  summaryEl.className = 'a11y-audit-summary';
  
  const summaryTitle = document.createElement('h3');
  summaryTitle.textContent = 'Summary';
  summaryEl.appendChild(summaryTitle);
  
  const summaryList = document.createElement('ul');
  
  const summaryItems = [
    `Total issues: ${summary.violations}`,
    `Critical: ${summary.violationsBySeverity.critical}`,
    `Serious: ${summary.violationsBySeverity.serious}`,
    `Moderate: ${summary.violationsBySeverity.moderate}`,
    `Minor: ${summary.violationsBySeverity.minor}`,
    `Pass rate: ${summary.passRate.toFixed(2)}%`,
    `WCAG 2.1 Level A: ${summary.wcagCompliance.a ? '✅ Yes' : '❌ No'}`,
    `WCAG 2.1 Level AA: ${summary.wcagCompliance.aa ? '✅ Yes' : '❌ No'}`
  ];
  
  summaryItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    summaryList.appendChild(li);
  });
  
  summaryEl.appendChild(summaryList);
  container.appendChild(summaryEl);
  
  // Create violations list
  const violationsEl = document.createElement('div');
  violationsEl.className = 'a11y-audit-violations';
  
  const violationsTitle = document.createElement('h3');
  violationsTitle.textContent = `Violations (${violations.length})`;
  violationsEl.appendChild(violationsTitle);
  
  if (violations.length > 0) {
    violations.forEach(violation => {
      const violationEl = document.createElement('div');
      violationEl.className = `a11y-audit-violation a11y-audit-violation-${violation.impact}`;
      
      const violationHeader = document.createElement('h4');
      violationHeader.textContent = violation.description;
      violationHeader.style.margin = '0 0 0.5rem 0';
      violationEl.appendChild(violationHeader);
      
      const violationImpact = document.createElement('p');
      violationImpact.textContent = `Impact: ${violation.impact}`;
      violationImpact.style.margin = '0 0 0.5rem 0';
      violationEl.appendChild(violationImpact);
      
      const affectedElements = document.createElement('p');
      affectedElements.textContent = `Affected elements: ${violation.nodes.length}`;
      affectedElements.style.margin = '0 0 0.5rem 0';
      violationEl.appendChild(affectedElements);
      
      // Create button to show affected elements
      if (highlightElements && violation.nodes.length > 0) {
        const highlightButton = document.createElement('button');
        highlightButton.textContent = 'Highlight Elements';
        highlightButton.className = 'a11y-fix-button';
        highlightButton.onclick = () => {
          // First remove any existing highlights
          document.querySelectorAll('.a11y-highlighted').forEach(el => {
            el.classList.remove('a11y-highlighted');
          });
          
          // Add highlights to the affected elements
          violation.nodes.forEach(node => {
            try {
              const elements = document.querySelectorAll(node.target.join(' '));
              elements.forEach(el => {
                el.classList.add('a11y-highlighted');
                
                // Scroll to the first element
                if (el === elements[0]) {
                  el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              });
            } catch (error) {
              console.warn('Error selecting elements:', error);
            }
          });
        };
        violationEl.appendChild(highlightButton);
      }
      
      // Add fix suggestions if available
      if (showFixSuggestions && violation.nodes.length > 0) {
        const firstNode = violation.nodes[0];
        if (firstNode.fixes && firstNode.fixes.length > 0) {
          const fixTitle = document.createElement('h5');
          fixTitle.textContent = 'Fix Suggestions:';
          fixTitle.style.margin = '0.5rem 0 0.25rem 0';
          violationEl.appendChild(fixTitle);
          
          const fixList = document.createElement('ul');
          firstNode.fixes.forEach(fix => {
            const fixItem = document.createElement('li');
            fixItem.textContent = fix;
            fixList.appendChild(fixItem);
          });
          violationEl.appendChild(fixList);
          
          // Add fix button if a callback is provided
          if (onFix) {
            const fixButton = document.createElement('button');
            fixButton.textContent = 'Apply Fix';
            fixButton.className = 'a11y-fix-button';
            fixButton.onclick = () => {
              onFix(violation, firstNode);
            };
            violationEl.appendChild(fixButton);
          }
        }
      }
      
      // Add learn more link
      const learnMore = document.createElement('a');
      learnMore.href = violation.helpUrl;
      learnMore.textContent = 'Learn More';
      learnMore.target = '_blank';
      learnMore.rel = 'noopener noreferrer';
      learnMore.style.display = 'inline-block';
      learnMore.style.marginTop = '0.5rem';
      violationEl.appendChild(learnMore);
      
      violationsEl.appendChild(violationEl);
    });
  } else {
    const noViolations = document.createElement('p');
    noViolations.textContent = 'No violations found. Great job!';
    violationsEl.appendChild(noViolations);
  }
  
  container.appendChild(violationsEl);
  
  return container;
};

/**
 * Run accessibility audit on the current page and display results
 * 
 * @param {Object} options - Audit options
 * @param {boolean} [options.highlightElements=true] - Whether to highlight elements with issues
 * @param {boolean} [options.showFixSuggestions=true] - Whether to show fix suggestions
 * @param {Function} [options.onFix] - Callback when a fix is applied
 * @returns {Promise<Object>} Audit results
 */
export const auditAndDisplayResults = async (options = {}) => {
  try {
    // Run audit on the document body
    const results = await auditElement(document.body);
    
    // Create and display results
    const display = createAuditResultsDisplay(results, options);
    document.body.appendChild(display);
    
    return results;
  } catch (error) {
    console.error('Error running audit:', error);
    throw error;
  }
};

/**
 * Timed audit function to track accessibility progress over time
 * 
 * @param {HTMLElement} element - Element to audit
 * @param {number} [interval=3000] - Interval in ms between audits
 * @param {number} [count=10] - Number of audits to run
 * @returns {Promise<Array<Object>>} Array of audit results over time
 */
export const runTimedAudits = async (element, interval = 3000, count = 10) => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // Run audit
    const result = await auditElement(element);
    results.push(result);
    
    // Wait for the next interval, but not after the last iteration
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  return results;
};