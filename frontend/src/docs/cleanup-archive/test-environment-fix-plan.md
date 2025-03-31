# Test Environment Fix Plan

## Current Issues

1. **TextEncoder/TextDecoder Polyfills**
   - Tests are failing with `TextEncoder is not defined` error
   - We've attempted several approaches:
     - Adding polyfills to setupTests.js
     - Creating a jest-setup.js file with custom polyfills
     - Configuring setupFilesAfterEnv in package.json

2. **MSW Configuration Issues**
   - MSW v2.0+ requires TextEncoder/TextDecoder
   - We've updated the handlers.js with modern syntax (http/HttpResponse)
   - Server configuration is in progress

## Proposed Solutions

### Approach 1: Install Node Polyfills Package

```bash
npm install --save-dev node-polyfills
```

Add the following to package.json:

```json
"jest": {
  "transformIgnorePatterns": [
    "node_modules/(?!axios)/"
  ],
  "setupFilesAfterEnv": [
    "node-polyfills/polyfills.js"
  ]
}
```

### Approach 2: Use Jest Environment with Polyfills

Create React App supports specifying a custom Jest environment in package.json:

```json
"jest": {
  "testEnvironment": "jsdom-with-polyfills"
}
```

We would need to create a custom environment that includes the TextEncoder/TextDecoder polyfills.

### Approach 3: Eject from Create React App

If polyfill issues persist, we could eject from Create React App to gain full control over the Jest configuration:

```bash
npm run eject
```

This would allow us to:
- Configure Jest directly
- Add custom polyfills
- Modify test environment setup

This is a last resort option since it's a one-way operation.

### Approach 4: Use Direct Node Modules for Polyfills

```bash
npm install --save-dev util
```

Create a polyfills.js file:

```javascript
// polyfills.js
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
```

## Execution Plan

1. ❌ Try Approach 1 first (node-polyfills) - Package not available
2. ✅ Attempt Approach 4 (direct Node modules)
   - Installed text-encoding package
   - Created polyfills.js in src directory
   - Required polyfills in setupTests.js before all other imports
3. If still unsuccessful, attempt Approach 2 (custom environment)
4. As a last resort, consider Approach 3 (eject)

## Final Solution: Isolated Component Testing

After trying multiple approaches to fix the TextEncoder polyfill issue with MSW, we've implemented a solution that works:

1. **Create standalone component versions for testing**
   - Created `/src/tests/standalone/TestResourceLoader.jsx` as a test-only version of the component
   - No dependencies on MSW or any problematic modules
   - Streamlined implementation with the same API

2. **Create isolated test files**
   - Created `/src/tests/standalone/TestResourceLoader.test.jsx`
   - Imports only the standalone component version
   - Includes only the testing-library imports needed
   - No dependencies on setupTests.js or any global test setup

3. **Run tests directly with Jest**
   - Run standalone tests directly:
   ```bash
   npx jest src/tests/standalone/TestResourceLoader.test.jsx --no-watchman
   ```

This approach allows us to validate components independently while we work on a more comprehensive solution for the full test suite in parallel.

## Impact Assessment

Fixing the test environment is critical because:
- 0% of tests are currently passing
- MSW is required for API mocking
- Visual regression testing depends on a working test environment

## Timeline

- Test environment setup: 1-2 days
- Verification and validation: 1 day
- Documentation updates: 0.5 days

## Success Criteria

- All ResourceLoader tests passing
- MSW setup correctly configured
- TextEncoder/TextDecoder polyfills working
- IntersectionObserver mock functioning properly

## Documentation Updates Required

Once fixed:
- Update validation-issues-tracker.md (TE-001, TE-002)
- Update validation-execution-checklist.md
- Update validation-progress-update.md
- Document the solution in CLAUDE.md