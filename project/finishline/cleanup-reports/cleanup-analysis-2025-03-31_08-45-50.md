# File Cleanup Analysis Report

Generated: 3/31/2025, 3:45:56 AM

## Summary

- Total files: 353
- Potentially unused files: 212
- Files with duplicate code segments: 596
- Files with unused imports: 24
- Large files (>1000 lines or >100KB): 1
- Empty or near-empty files: 0
- Files not modified in 6+ months: 0

## File Distribution

### By File Extension

| Extension | Count |
|-----------|-------|
| .py | 134 |
| .jsx | 123 |
| .js | 96 |

### Top Directories by File Count

| Directory | Count |
|-----------|-------|
| components/common | 26 |
| utils | 25 |
| tests/components/common | 21 |
| stories/components | 14 |
| api/performance | 14 |
| test/api/performance | 14 |
| stories/utils | 13 |
| tests/utils | 13 |
| db/optimizations | 13 |
| test/db/optimizations | 13 |
| components/common/__tests__ | 12 |
| components/performance | 11 |
| hooks | 11 |
| tests/codeQuality | 9 |
| adapters/connectors | 8 |
| adapters/tests | 8 |
| db/migrations | 8 |
| db/models | 8 |
| db/schemas | 8 |
| db/tests | 8 |

## Cleanup Candidates

### Large Files (>1000 lines or >100KB)

| File | Lines | Size |
|------|-------|------|
| api/performance/ratelimiter.py | 1133 | 38 KB |

### Potentially Unused JavaScript Files

**Note**: False positives are possible. Please verify before deletion.

- AppRoutes.jsx
- components/auth/RequireAdmin.jsx
- components/auth/RequireAuth.jsx
- components/codeQuality/CodeConsistencyMonitor.jsx
- components/codeQuality/CodeQualityDashboard.jsx
- components/codeQuality/DeprecationManager.jsx
- components/codeQuality/DevelopmentGuide.jsx
- components/codeQuality/ErrorPrevention.jsx
- components/common/A11yAlert.jsx
- components/common/A11yButton.jsx
- components/common/A11yCheckbox.jsx
- components/common/A11yDialog.jsx
- components/common/A11yForm.jsx
- components/common/A11yMenu.jsx
- components/common/A11yModal.jsx
- components/common/A11yRadio.jsx
- components/common/A11ySelect.jsx
- components/common/A11yTable.jsx
- components/common/A11yTabs.jsx
- components/common/A11yTooltip.jsx
- components/common/ErrorBoundary.jsx
- components/integration/IntegrationDetailView.jsx
- components/integration/panels/IntegrationActionPanel.jsx
- components/integration/panels/IntegrationConfigPanel.jsx
- components/integration/panels/IntegrationHistoryPanel.jsx
- components/integration/panels/IntegrationStatusPanel.jsx
- components/layout/Footer.jsx
- components/layout/MainLayout.jsx
- components/layout/Sidebar.jsx
- components/layout/TopBar.jsx
- components/performance/AccessibilityMonitor.jsx
- components/performance/ErrorTrackingSystem.jsx
- components/performance/LazyLoadedImage.jsx
- components/performance/OptimizedDataGrid.jsx
- components/performance/PerformanceBudgetMonitor.jsx
- components/performance/PerformanceDashboard.jsx
- components/performance/PerformanceMetricsDisplay.jsx
- components/performance/PerformanceMonitor.jsx
- components/performance/PerformanceTest.perf.jsx
- components/performance/RuntimePerformanceMonitor.jsx
- components/performance/VirtualizedList.jsx
- contexts/DatabaseMonitoringContext.js
- hooks/useDatabasePerformance.js
- hooks/useLazyComponent.js
- hooks/useNotification.js
- hooks/useOfflineStatus.js
- hooks/usePerformanceTracking.js
- hooks/useWebWorker.js
- pages/ErrorBoundaryPage.jsx
- pages/NotFoundPage.jsx
- setupTests.js
- stories/codeQuality/CodeConsistencyMonitor.stories.jsx
- stories/codeQuality/CodeQualityDashboard.stories.jsx
- stories/codeQuality/DeprecationManager.stories.jsx
- stories/codeQuality/DevelopmentGuide.stories.jsx
- stories/codeQuality/ErrorPrevention.stories.jsx
- stories/components/A11yAlert.stories.jsx
- stories/components/A11yCheckbox.stories.jsx
- stories/components/A11yForm.stories.jsx
- stories/components/A11yMenu.stories.jsx
- stories/components/A11yModal.stories.jsx
- stories/components/A11yRadio.stories.jsx
- stories/components/A11ySelect.stories.jsx
- stories/components/A11yTable.stories.jsx
- stories/components/A11yTabs.stories.jsx
- stories/components/A11yTooltip.stories.jsx
- stories/components/AccessibilityMonitor.stories.jsx
- stories/components/ErrorTrackingSystem.stories.jsx
- stories/components/PerformanceBudgetMonitor.stories.jsx
- stories/components/RuntimePerformanceMonitor.stories.jsx
- stories/utils/bundleSizeOptimizer.stories.jsx
- stories/utils/ComponentAnalytics.stories.jsx
- stories/utils/criticalPathOptimizer.stories.jsx
- stories/utils/differentialLoader.stories.jsx
- stories/utils/dynamicImportSplitter.stories.jsx
- stories/utils/ModuleFederationConfig.stories.jsx
- stories/utils/offlineSupport.stories.jsx
- stories/utils/parallelBuildProcessor.stories.jsx
- stories/utils/productionOptimizer.stories.jsx
- stories/utils/ssrAdapter.stories.jsx
- stories/utils/StaticSiteGenerator.stories.jsx
- stories/utils/treeShakerEnhancer.stories.jsx
- stories/utils/webWorkerManager.stories.jsx
- tests/components/common/A11yAlert.visual.js
- tests/components/common/A11yCheckbox.visual.js
- tests/components/common/A11yForm.visual.js
- tests/components/common/A11yMenu.visual.js
- tests/components/common/A11yModal.visual.js
- tests/components/common/A11yRadio.visual.js
- tests/components/common/A11ySelect.visual.js
- tests/components/common/A11yTable.visual.js
- tests/components/common/A11yTabs.visual.js
- tests/components/common/A11yTooltip.visual.js
- tests/components/integration/IntegrationDetailView.visual.js
- tests/e2e/IntegrationWorkflow.e2e.js
- tests/templates/ComponentTestTemplate.jsx
- tests/templates/E2ETestTemplate.js
- tests/templates/VisualRegressionTestTemplate.js
- utils/a11yUtils.js
- utils/accessibilityTesting.js
- utils/bundleAnalyzer.js
- utils/bundleSizeOptimizer.js
- utils/codeQuality/codeOptimizer.js
- utils/codeQuality/consistencyEnforcer.js
- utils/codeQuality/standardFormatter.js
- utils/codeQuality/staticAnalyzer.js
- utils/codeQuality/typeValidator.js
- utils/codeSplitting.js
- utils/ComponentAnalytics.js
- utils/criticalPathOptimizer.js
- utils/differentialLoader.js
- utils/dynamicImportSplitter.js
- utils/e2eTesting.js
- utils/ModuleFederationConfig.js
- utils/monitoring/errorTracking.js
- utils/monitoring/performanceMonitoring.js
- utils/monitoring/usageAnalytics.js
- utils/offlineSupport.js
- utils/parallelBuildProcessor.js
- utils/productionOptimizer.js
- utils/ssrAdapter.js
- utils/StaticSiteGenerator.js
- utils/testingFramework.js
- utils/testUtils.js
- utils/themeUtils.js
- utils/treeShakerEnhancer.js
- utils/validation.js
- utils/visualRegressionTesting.js
- utils/webWorkerManager.js
### Potentially Unused TypeScript Files

No potentially unused TypeScript files detected.

### Potentially Unused Python Files

**Note**: False positives are likely with Python imports. Verify carefully.

- adapters/connectors/apiconnector.py
- adapters/connectors/azureblobconnector.py
- adapters/connectors/baseconnector.py
- adapters/connectors/dataquality.py
- adapters/connectors/etlpipeline.py
- adapters/connectors/s3connector.py
- adapters/connectors/sharepointconnector.py
- adapters/connectors/transformationengine.py
- api/performance/apianalyticsdashboard.py
- api/performance/apirequestlogger.py
- api/performance/asyncrequesthandler.py
- api/performance/backgroundtaskprocessor.py
- api/performance/batchrequestprocessor.py
- api/performance/bottleneckdetector.py
- api/performance/cachemanager.py
- api/performance/endpointmetricscollector.py
- api/performance/partialresponsehandler.py
- api/performance/performancemonitor.py
- api/performance/queryoptimizationmiddleware.py
- api/performance/ratelimiter.py
- api/performance/responsecompression.py
- api/performance/streamingresponsehandler.py
- db/migrations/1743404316_basemodel.py
- db/migrations/1743404316_datasetmodel.py
- db/migrations/1743404316_entityrelationshipdiagram.py
- db/migrations/1743404316_integrationmodel.py
- db/migrations/1743404316_migrationframework.py
- db/migrations/1743404316_schemavalidator.py
- db/migrations/1743404316_tenantmodel.py
- db/migrations/1743404316_usermodel.py
- db/models/basemodel.py
- db/models/datasetmodel.py
- db/models/entityrelationshipdiagram.py
- db/models/integrationmodel.py
- db/models/migrationframework.py
- db/models/schemavalidator.py
- db/models/tenantmodel.py
- db/models/usermodel.py
- db/optimizations/alembicmigrationmanager.py
- db/optimizations/bulkoperationhandler.py
- db/optimizations/connectionpoolmanager.py
- db/optimizations/databasehealthmonitor.py
- db/optimizations/datavalidation.py
- db/optimizations/indexmanager.py
- db/optimizations/jsonfieldoptimizer.py
- db/optimizations/migrationdependencymanager.py
- db/optimizations/migrationframework.py
- db/optimizations/migrationrollbackmanager.py
- db/optimizations/migrationverification.py
- db/optimizations/queryoptimizer.py
- db/optimizations/transactionmanager.py
- db/schemas/basemodel.py
- db/schemas/datasetmodel.py
- db/schemas/entityrelationshipdiagram.py
- db/schemas/integrationmodel.py
- db/schemas/migrationframework.py
- db/schemas/schemavalidator.py
- db/schemas/tenantmodel.py
- db/schemas/usermodel.py
- modules/controllers/apiversioning_controller.py
- modules/controllers/baseservice_controller.py
- modules/controllers/datasetservice_controller.py
- modules/controllers/errorhandler_controller.py
- modules/controllers/integrationservice_controller.py
- modules/controllers/tenantservice_controller.py
- modules/controllers/transactionmanager_controller.py
- modules/controllers/userservice_controller.py
- modules/schemas/apiversioning.py
- modules/schemas/baseservice.py
- modules/schemas/datasetservice.py
- modules/schemas/errorhandler.py
- modules/schemas/integrationservice.py
- modules/schemas/tenantservice.py
- modules/schemas/transactionmanager.py
- modules/schemas/userservice.py
- modules/services/apiversioning_service.py
- modules/services/baseservice_service.py
- modules/services/datasetservice_service.py
- modules/services/errorhandler_service.py
- modules/services/integrationservice_service.py
- modules/services/tenantservice_service.py
- modules/services/transactionmanager_service.py
- modules/services/userservice_service.py
### Files with Duplicate Code

| File 1 | File 2 | Line Number | Preview |
|--------|--------|-------------|--------|
| App.jsx | utils/codeSplitting.js | 31 | `class ErrorBoundary extends React.Component {   co` |
| App.jsx | utils/codeSplitting.js | 36 | `static getDerivedStateFromError(error) {     retur` |
| components/auth/RequireAdmin.jsx | components/auth/RequireAuth.jsx | 21 | `// Show loading indicator while checking auth stat` |
| components/auth/RequireAdmin.jsx | components/auth/RequireAuth.jsx | 26 | `<div className="loading-spinner"></div>         <p` |
| components/codeQuality/CodeConsistencyMonitor.jsx | components/codeQuality/CodeQualityDashboard.jsx | 6 | `* Features:  * - Zero technical debt implementatio` |
| components/codeQuality/CodeConsistencyMonitor.jsx | components/codeQuality/CodeQualityDashboard.jsx | 11 | `* - Detailed documentation  */ import React, { use` |
| components/codeQuality/CodeConsistencyMonitor.jsx | components/codeQuality/CodeQualityDashboard.jsx | 71 | `});    useEffect(() => {     // Initialize compone` |
| components/codeQuality/CodeConsistencyMonitor.jsx | components/codeQuality/CodeQualityDashboard.jsx | 76 | `}, []);    // Memoized component logic   const han` |
| components/codeQuality/CodeQualityDashboard.jsx | components/codeQuality/DeprecationManager.jsx | 6 | `* Features:  * - Zero technical debt implementatio` |
| components/codeQuality/CodeQualityDashboard.jsx | components/codeQuality/DeprecationManager.jsx | 11 | `* - Detailed documentation  */ import React, { use` |
| components/codeQuality/CodeQualityDashboard.jsx | components/codeQuality/DeprecationManager.jsx | 71 | `});    useEffect(() => {     // Initialize compone` |
| components/codeQuality/CodeQualityDashboard.jsx | components/codeQuality/DeprecationManager.jsx | 76 | `}, []);    // Memoized component logic   const han` |
| components/codeQuality/DeprecationManager.jsx | components/codeQuality/DevelopmentGuide.jsx | 6 | `* Features:  * - Zero technical debt implementatio` |
| components/codeQuality/DeprecationManager.jsx | components/codeQuality/DevelopmentGuide.jsx | 11 | `* - Detailed documentation  */ import React, { use` |
| components/codeQuality/DeprecationManager.jsx | components/codeQuality/DevelopmentGuide.jsx | 71 | `});    useEffect(() => {     // Initialize compone` |
| components/codeQuality/DeprecationManager.jsx | components/codeQuality/DevelopmentGuide.jsx | 76 | `}, []);    // Memoized component logic   const han` |
| components/codeQuality/DevelopmentGuide.jsx | components/codeQuality/ErrorPrevention.jsx | 6 | `* Features:  * - Zero technical debt implementatio` |
| components/codeQuality/DevelopmentGuide.jsx | components/codeQuality/ErrorPrevention.jsx | 11 | `* - Detailed documentation  */ import React, { use` |
| components/codeQuality/DevelopmentGuide.jsx | components/codeQuality/ErrorPrevention.jsx | 71 | `});    useEffect(() => {     // Initialize compone` |
| components/codeQuality/DevelopmentGuide.jsx | components/codeQuality/ErrorPrevention.jsx | 76 | `}, []);    // Memoized component logic   const han` |
| components/common/__tests__/Checkbox.test.jsx | components/common/__tests__/Select.test.jsx | 66 | `// Controlled vs Uncontrolled tests   describe('co` |
| components/common/__tests__/Checkbox.test.jsx | components/common/__tests__/Modal.test.jsx | 166 | `});   });    // Ref forwarding   describe('refs', ` |
| components/common/__tests__/Modal.test.jsx | components/common/__tests__/Tooltip.test.jsx | 11 | `// Mock createPortal to make it work with testing-` |
| components/common/__tests__/Modal.test.jsx | components/common/__tests__/Tooltip.test.jsx | 16 | `...original,     createPortal: (node) => node,   }` |
| components/common/__tests__/Modal.test.jsx | components/common/__tests__/Select.test.jsx | 116 | `});   });    // Event handler tests   describe('ev` |
| components/common/__tests__/Modal.test.jsx | components/common/__tests__/Select.test.jsx | 191 | `});   });    // Accessibility tests   describe('ac` |
| components/common/__tests__/Select.test.jsx | components/common/__tests__/Tabs.test.jsx | 126 | `});      it('works as an uncontrolled component', ` |
| components/common/__tests__/Select.test.jsx | components/common/__tests__/TextField.test.jsx | 191 | `});      it('does not call onChange when disabled'` |
| components/common/__tests__/Select.test.jsx | components/common/__tests__/Tabs.test.jsx | 221 | `});   });    // Accessibility tests   describe('ac` |
| components/common/__tests__/Select.test.jsx | components/common/__tests__/Table.test.jsx | 276 | `});   });    // Ref forwarding   describe('refs', ` |
| components/common/__tests__/Tabs.test.jsx | components/common/__tests__/TextField.test.jsx | 96 | `// Controlled vs Uncontrolled tests   describe('co` |
| components/common/__tests__/Tabs.test.jsx | components/common/__tests__/Tooltip.test.jsx | 201 | `});    // Accessibility tests   describe('accessib` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yAlert.jsx | components/common/A11yCheckbox.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11yCheckbox.jsx | components/common/A11yForm.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yCheckbox.jsx | components/common/A11yForm.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yCheckbox.jsx | components/common/A11yForm.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yCheckbox.jsx | components/common/A11yMenu.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yCheckbox.jsx | components/common/A11yForm.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11yForm.jsx | components/common/A11yMenu.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yForm.jsx | components/common/A11yMenu.jsx | 236 | `const {     children,     className,     style,   ` |
| components/common/A11yForm.jsx | components/common/A11yMenu.jsx | 246 | `ariaDescribedBy,     dataTestId,     ...other   } ` |
| components/common/A11yForm.jsx | hooks/useForm.js | 251 | `// Form state   const [values, setValues] = useSta` |
| components/common/A11yForm.jsx | hooks/useForm.js | 386 | `} catch (error) {         console.error('Form subm` |
| components/common/A11yForm.jsx | components/common/A11yMenu.jsx | 441 | `/** Additional CSS class */   className: PropTypes` |
| components/common/A11yForm.jsx | components/common/A11yMenu.jsx | 456 | `ariaLabelledBy: PropTypes.string,   /** ID of elem` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yMenu.jsx | components/common/A11yModal.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yModal.jsx | components/common/A11yRadio.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yRadio.jsx | components/common/A11ySelect.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11ySelect.jsx | components/common/A11yTable.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11ySelect.jsx | components/common/A11yTable.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11ySelect.jsx | components/common/A11yTabs.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11ySelect.jsx | components/common/A11yTable.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11ySelect.jsx | components/common/A11yTable.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/A11yTable.jsx | components/common/A11yTabs.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yTable.jsx | components/common/A11yTabs.jsx | 16 | `*/  import React, { forwardRef, useRef, useState, ` |
| components/common/A11yTable.jsx | components/common/A11yTabs.jsx | 196 | `children,     className,     style,     id,     ar` |
| components/common/A11yTable.jsx | components/common/A11yTabs.jsx | 391 | `/** Additional CSS class */   className: PropTypes` |
| components/common/A11yTable.jsx | components/common/A11yTabs.jsx | 396 | `id: PropTypes.string,   /** ARIA label */   ariaLa` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 6 | `* Features:  * - Fully accessible with ARIA attrib` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 11 | `* - Focus management  */  import React, { forwardR` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 21 | `const {     children,     className,     style,   ` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 26 | `ariaLabel,     ariaLabelledBy,     ariaDescribedBy` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 31 | `} = props;    // Using internal ref if none provid` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 36 | `return (     <div       ref={resolvedRef}       cl` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 41 | `style={style}       id={id}       aria-label={aria` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 46 | `data-testid={dataTestId}       {...other}     >   ` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 61 | `/** Additional inline styles */   style: PropTypes` |
| components/common/A11yTabs.jsx | components/common/A11yTooltip.jsx | 66 | `ariaLabel: PropTypes.string,   /** ID of element t` |
| components/common/Badge.jsx | components/common/Tooltip.jsx | 81 | `};      // Size styles   const sizeMap = {     sma` |
| components/common/Button.jsx | components/common/Card.jsx | 231 | `/** Additional CSS class names */   className: Pro` |
| components/common/Checkbox.jsx | components/common/Select.jsx | 236 | `>           {error || helperText}         </div>  ` |
| components/common/Select.jsx | components/common/TextField.jsx | 46 | `helperText,   error,   required = false,   disable` |
| components/common/Select.jsx | components/common/TextField.jsx | 51 | `variant = 'outlined',   size = 'medium',   onChang` |
| components/common/Select.jsx | components/common/TextField.jsx | 56 | `fullWidth = false,   className = '',   ...rest }, ` |
| components/common/Select.jsx | components/common/TextField.jsx | 61 | `const isControlled = value !== undefined;   const ` |
| components/common/Select.jsx | components/common/TextField.jsx | 81 | `// Variant styles   const getVariantStyles = () =>` |
| components/common/Select.jsx | components/common/TextField.jsx | 86 | `borderRadius: '4px',         backgroundColor: disa` |
| components/common/Select.jsx | components/common/TextField.jsx | 91 | `borderBottom: `1px solid ${error ? '#f44336' : isF` |
| components/common/Select.jsx | components/common/TextField.jsx | 96 | `border: 'none',         borderBottom: `1px solid $` |
| components/common/Select.jsx | components/common/TextField.jsx | 101 | `};          return styles[variant] || styles.outli` |
| components/common/Select.jsx | components/common/TextField.jsx | 106 | `// Base container styles   const containerStyle = ` |
| components/common/Select.jsx | components/common/TextField.jsx | 111 | `marginBottom: '16px',     width: fullWidth ? '100%` |
| components/common/Select.jsx | components/common/TextField.jsx | 116 | `const labelStyle = {     marginBottom: '6px',     ` |
| components/common/Select.jsx | components/common/TextField.jsx | 121 | `};      // Helper text styles   const helperTextSt` |
| components/common/Select.jsx | components/common/TextField.jsx | 126 | `fontSize: '12px',     color: error ? '#f44336' : '` |
| components/common/Select.jsx | components/common/TextField.jsx | 156 | `};      // Handle changes   const handleChange = (` |
| components/common/Select.jsx | components/common/TextField.jsx | 161 | `if (!isControlled) {       setInternalValue(e.targ` |
| components/common/Select.jsx | components/common/TextField.jsx | 171 | `// Handle focus   const handleFocus = (e) => {    ` |
| components/common/Select.jsx | components/common/TextField.jsx | 176 | `}   };      // Handle blur   const handleBlur = (e` |
| components/common/Select.jsx | components/common/TextField.jsx | 181 | `setIsFocused(false);     if (onBlur) {       onBlu` |
| components/common/Select.jsx | components/common/TextField.jsx | 316 | `size: PropTypes.oneOf(['small', 'medium', 'large']` |
| components/common/Select.jsx | components/common/TextField.jsx | 321 | `/** Focus handler */   onFocus: PropTypes.func,   ` |
| components/integration/panels/IntegrationActionPanel.jsx | components/integration/panels/IntegrationConfigPanel.jsx | 71 | `// Memoize styles   const styles = useMemo(() => (` |
| components/integration/panels/IntegrationActionPanel.jsx | components/integration/panels/IntegrationConfigPanel.jsx | 131 | `},   }), [theme]);    return (     <div style={sty` |
| components/integration/panels/IntegrationConfigPanel.jsx | components/integration/panels/IntegrationHistoryPanel.jsx | 36 | `// Memoize styles   const styles = useMemo(() => (` |
| components/integration/panels/IntegrationConfigPanel.jsx | components/integration/panels/IntegrationHistoryPanel.jsx | 41 | `sectionTitle: {       fontSize: '18px',       font` |
| components/integration/panels/IntegrationConfigPanel.jsx | components/integration/panels/IntegrationHistoryPanel.jsx | 51 | `},     tableHeader: {       textAlign: 'left',    ` |
| components/integration/panels/IntegrationConfigPanel.jsx | components/layout/Sidebar.jsx | 86 | `color: theme.palette.text.secondary,     },   }), ` |
| components/integration/panels/IntegrationHistoryPanel.jsx | components/integration/panels/IntegrationStatusPanel.jsx | 106 | `// Memoize styles   const styles = useMemo(() => (` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/AccessibilityMonitor.jsx | components/performance/ErrorTrackingSystem.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/ErrorTrackingSystem.jsx | components/performance/LazyLoadedImage.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/LazyLoadedImage.jsx | components/performance/OptimizedDataGrid.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/OptimizedDataGrid.jsx | components/performance/PerformanceBudgetMonitor.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/PerformanceBudgetMonitor.jsx | components/performance/PerformanceMetricsDisplay.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/PerformanceMetricsDisplay.jsx | components/performance/RuntimePerformanceMonitor.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 6 | `* Features:  * - Performance optimized rendering  ` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 11 | `* - SSR compatible  */  import React, { memo, useS` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 36 | `const [isReady, setIsReady] = useState(false);    ` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 41 | `trackRender({       renderCount: renderCount.curre` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 46 | `// Component initialization   useEffect(() => {   ` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 51 | `}, []);      // Interaction handlers with performa` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 56 | `type: 'user-interaction',       timestamp: Date.no` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 61 | `// Optimize rendering based on ready state   if (!` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 76 | `id={id}           data-testid={dataTestId}        ` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 81 | `{children}         </div>       </Suspense>     </` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 91 | `/** Child elements */   children: PropTypes.node, ` |
| components/performance/RuntimePerformanceMonitor.jsx | components/performance/VirtualizedList.jsx | 96 | `id: PropTypes.string,   /** Data test ID for testi` |
| contexts/__tests__/AuthContext.test.jsx | hooks/__tests__/useLocalStorage.test.js | 21 | `delete store[key];     }),     clear: jest.fn(() =` |
| contexts/__tests__/ConfigContext.test.jsx | hooks/__tests__/useLocalStorage.test.js | 11 | `// Mock localStorage const localStorageMock = (() ` |
| contexts/__tests__/DialogContext.test.jsx | contexts/__tests__/NotificationContext.test.jsx | 176 | `// Restore console.error       console.error = ori` |
| contexts/__tests__/NotificationContext.test.jsx | contexts/__tests__/ThemeContext.test.jsx | 251 | `// Restore console.error       console.error = ori` |
| hooks/__tests__/useLocalStorage.test.js | utils/testUtils.js | 16 | `store[key] = value.toString();     }),     removeI` |
| hooks/useLazyComponent.js | hooks/useOfflineStatus.js | 6 | `import { useState, useEffect, useRef, useCallback ` |
| hooks/useOfflineStatus.js | hooks/useWebWorker.js | 6 | `import { useState, useEffect, useRef, useCallback ` |
| pages/ErrorBoundaryPage.jsx | pages/NotFoundPage.jsx | 36 | `const styles = useMemo(() => ({     container: {  ` |
| pages/ErrorBoundaryPage.jsx | pages/NotFoundPage.jsx | 41 | `justifyContent: 'center',       padding: '48px 24p` |
| pages/ErrorBoundaryPage.jsx | pages/NotFoundPage.jsx | 51 | `fontSize: '32px',       fontWeight: 600,       mar` |
| pages/ErrorBoundaryPage.jsx | pages/NotFoundPage.jsx | 81 | `backgroundColor: theme.palette.primary.main,      ` |
| stories/codeQuality/CodeConsistencyMonitor.stories.jsx | stories/codeQuality/CodeQualityDashboard.stories.jsx | 21 | `export const Default = Template.bind({}); Default.` |
| stories/codeQuality/CodeConsistencyMonitor.stories.jsx | stories/codeQuality/CodeQualityDashboard.stories.jsx | 26 | `export const WithData = Template.bind({}); WithDat` |
| stories/codeQuality/CodeConsistencyMonitor.stories.jsx | stories/codeQuality/CodeQualityDashboard.stories.jsx | 31 | `export const WithError = Template.bind({}); WithEr` |
| stories/codeQuality/CodeQualityDashboard.stories.jsx | stories/codeQuality/DeprecationManager.stories.jsx | 21 | `export const Default = Template.bind({}); Default.` |
| stories/codeQuality/CodeQualityDashboard.stories.jsx | stories/codeQuality/DeprecationManager.stories.jsx | 26 | `export const WithData = Template.bind({}); WithDat` |
| stories/codeQuality/CodeQualityDashboard.stories.jsx | stories/codeQuality/DeprecationManager.stories.jsx | 31 | `export const WithError = Template.bind({}); WithEr` |
| stories/codeQuality/DeprecationManager.stories.jsx | stories/codeQuality/DevelopmentGuide.stories.jsx | 21 | `export const Default = Template.bind({}); Default.` |
| stories/codeQuality/DeprecationManager.stories.jsx | stories/codeQuality/DevelopmentGuide.stories.jsx | 26 | `export const WithData = Template.bind({}); WithDat` |
| stories/codeQuality/DeprecationManager.stories.jsx | stories/codeQuality/DevelopmentGuide.stories.jsx | 31 | `export const WithError = Template.bind({}); WithEr` |
| stories/codeQuality/DevelopmentGuide.stories.jsx | stories/codeQuality/ErrorPrevention.stories.jsx | 21 | `export const Default = Template.bind({}); Default.` |
| stories/codeQuality/DevelopmentGuide.stories.jsx | stories/codeQuality/ErrorPrevention.stories.jsx | 26 | `export const WithData = Template.bind({}); WithDat` |
| stories/codeQuality/DevelopmentGuide.stories.jsx | stories/codeQuality/ErrorPrevention.stories.jsx | 31 | `export const WithError = Template.bind({}); WithEr` |
| stories/components/A11yAlert.stories.jsx | stories/components/A11yCheckbox.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yAlert.stories.jsx | stories/components/A11yCheckbox.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yAlert.stories.jsx | stories/components/A11yCheckbox.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yAlert.stories.jsx | stories/components/A11yCheckbox.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yCheckbox.stories.jsx | stories/components/A11yForm.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yCheckbox.stories.jsx | stories/components/A11yForm.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yCheckbox.stories.jsx | stories/components/A11yForm.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yCheckbox.stories.jsx | stories/components/A11yForm.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yForm.stories.jsx | stories/components/A11yMenu.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yForm.stories.jsx | stories/components/A11yMenu.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yForm.stories.jsx | stories/components/A11yMenu.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yForm.stories.jsx | stories/components/A11yMenu.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yMenu.stories.jsx | stories/components/A11yModal.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yMenu.stories.jsx | stories/components/A11yModal.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yMenu.stories.jsx | stories/components/A11yModal.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yMenu.stories.jsx | stories/components/A11yModal.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yModal.stories.jsx | stories/components/A11yRadio.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yModal.stories.jsx | stories/components/A11yRadio.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yModal.stories.jsx | stories/components/A11yRadio.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yModal.stories.jsx | stories/components/A11yRadio.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yRadio.stories.jsx | stories/components/A11ySelect.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yRadio.stories.jsx | stories/components/A11ySelect.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yRadio.stories.jsx | stories/components/A11ySelect.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yRadio.stories.jsx | stories/components/A11ySelect.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11ySelect.stories.jsx | stories/components/A11yTable.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11ySelect.stories.jsx | stories/components/A11yTable.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11ySelect.stories.jsx | stories/components/A11yTable.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11ySelect.stories.jsx | stories/components/A11yTable.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yTable.stories.jsx | stories/components/A11yTabs.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yTable.stories.jsx | stories/components/A11yTabs.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yTable.stories.jsx | stories/components/A11yTabs.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yTable.stories.jsx | stories/components/A11yTabs.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yTabs.stories.jsx | stories/components/A11yTooltip.stories.jsx | 21 | `config: {         rules: [           {            ` |
| stories/components/A11yTabs.stories.jsx | stories/components/A11yTooltip.stories.jsx | 31 | `argTypes: {     // Define control types for compon` |
| stories/components/A11yTabs.stories.jsx | stories/components/A11yTooltip.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/A11yTabs.stories.jsx | stories/components/A11yTooltip.stories.jsx | 41 | `},     style: {       control: 'object',       des` |
| stories/components/A11yTooltip.stories.jsx | stories/components/AccessibilityMonitor.stories.jsx | 36 | `defaultValue: 'Component content'     },     class` |
| stories/components/AccessibilityMonitor.stories.jsx | stories/components/ErrorTrackingSystem.stories.jsx | 21 | `argTypes: {     children: {       control: 'text',` |
| stories/components/AccessibilityMonitor.stories.jsx | stories/components/ErrorTrackingSystem.stories.jsx | 26 | `},     className: {       control: 'text',       d` |
| stories/components/ErrorTrackingSystem.stories.jsx | stories/components/PerformanceBudgetMonitor.stories.jsx | 21 | `argTypes: {     children: {       control: 'text',` |
| stories/components/ErrorTrackingSystem.stories.jsx | stories/components/PerformanceBudgetMonitor.stories.jsx | 26 | `},     className: {       control: 'text',       d` |
| stories/components/PerformanceBudgetMonitor.stories.jsx | stories/components/RuntimePerformanceMonitor.stories.jsx | 21 | `argTypes: {     children: {       control: 'text',` |
| stories/components/PerformanceBudgetMonitor.stories.jsx | stories/components/RuntimePerformanceMonitor.stories.jsx | 26 | `},     className: {       control: 'text',       d` |
| stories/utils/bundleSizeOptimizer.stories.jsx | stories/utils/ComponentAnalytics.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/bundleSizeOptimizer.stories.jsx | stories/utils/ComponentAnalytics.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/ComponentAnalytics.stories.jsx | stories/utils/criticalPathOptimizer.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/ComponentAnalytics.stories.jsx | stories/utils/criticalPathOptimizer.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/criticalPathOptimizer.stories.jsx | stories/utils/differentialLoader.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/criticalPathOptimizer.stories.jsx | stories/utils/differentialLoader.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/differentialLoader.stories.jsx | stories/utils/dynamicImportSplitter.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/differentialLoader.stories.jsx | stories/utils/dynamicImportSplitter.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/dynamicImportSplitter.stories.jsx | stories/utils/ModuleFederationConfig.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/dynamicImportSplitter.stories.jsx | stories/utils/ModuleFederationConfig.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/ModuleFederationConfig.stories.jsx | stories/utils/offlineSupport.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/ModuleFederationConfig.stories.jsx | stories/utils/offlineSupport.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/offlineSupport.stories.jsx | stories/utils/parallelBuildProcessor.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/offlineSupport.stories.jsx | stories/utils/parallelBuildProcessor.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/parallelBuildProcessor.stories.jsx | stories/utils/productionOptimizer.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/parallelBuildProcessor.stories.jsx | stories/utils/productionOptimizer.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/productionOptimizer.stories.jsx | stories/utils/ssrAdapter.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/productionOptimizer.stories.jsx | stories/utils/ssrAdapter.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/ssrAdapter.stories.jsx | stories/utils/StaticSiteGenerator.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/ssrAdapter.stories.jsx | stories/utils/StaticSiteGenerator.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/StaticSiteGenerator.stories.jsx | stories/utils/treeShakerEnhancer.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/StaticSiteGenerator.stories.jsx | stories/utils/treeShakerEnhancer.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| stories/utils/treeShakerEnhancer.stories.jsx | stories/utils/webWorkerManager.stories.jsx | 21 | `};  // Example usage export const BasicUsage = () ` |
| stories/utils/treeShakerEnhancer.stories.jsx | stories/utils/webWorkerManager.stories.jsx | 36 | `});  // Optimize your application const result = o` |
| tests/codeQuality/codeOptimization.test.js | tests/codeQuality/codeOptimizer.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/codeOptimizer.test.js | tests/codeQuality/consistencyEnforcer.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/consistencyEnforcer.test.js | tests/codeQuality/patternConsistency.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/patternConsistency.test.js | tests/codeQuality/standardFormatter.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/standardFormatter.test.js | tests/codeQuality/staticAnalysis.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/staticAnalysis.test.js | tests/codeQuality/staticAnalyzer.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/staticAnalyzer.test.js | tests/codeQuality/typeValidation.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/codeQuality/typeValidation.test.js | tests/codeQuality/typeValidator.test.js | 6 | `import React from 'react'; import { render, screen` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yButton.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yAlert.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yAlert.visual.js | tests/components/common/A11yCheckbox.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yButton.test.jsx | tests/components/common/A11yCheckbox.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yCheckbox.test.jsx | tests/components/common/A11yForm.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yCheckbox.visual.js | tests/components/common/A11yForm.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yForm.test.jsx | tests/components/common/A11yMenu.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yForm.visual.js | tests/components/common/A11yMenu.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yMenu.test.jsx | tests/components/common/A11yModal.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yMenu.visual.js | tests/components/common/A11yModal.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yModal.test.jsx | tests/components/common/A11yRadio.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yModal.visual.js | tests/components/common/A11yRadio.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yRadio.test.jsx | tests/components/common/A11ySelect.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yRadio.visual.js | tests/components/common/A11ySelect.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11ySelect.test.jsx | tests/components/common/A11yTable.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11ySelect.visual.js | tests/components/common/A11yTable.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yTable.test.jsx | tests/components/common/A11yTabs.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yTable.visual.js | tests/components/common/A11yTabs.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 6 | `* and proper behavior across different states.  */` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 36 | `const component = screen.getByTestId('test-compone` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 51 | `const component = screen.getByText('Accessible Con` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 56 | `});   });      // Accessibility tests   describe('` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 71 | `// const tester = new AccessibilityTester();      ` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 76 | `// expect(results.passed).toBe(true);     });     ` |
| tests/components/common/A11yTabs.test.jsx | tests/components/common/A11yTooltip.test.jsx | 91 | `});      // Behavior tests   describe('Behavior', ` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 16 | `visualTesting = new VisualTesting({       snapshot` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 21 | `});          await visualTesting.initialize();   }` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 26 | `afterAll(async () => {     await visualTesting.cle` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 31 | `// Define component states to test     const state` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 36 | `// Add more states specific to this component     ` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 46 | `// Verify all screenshots match baseline     Objec` |
| tests/components/common/A11yTabs.visual.js | tests/components/common/A11yTooltip.visual.js | 51 | `});   });      test('renders with different themes` |
| tests/components/integration/IntegrationDetailView.visual.js | tests/templates/VisualRegressionTestTemplate.js | 11 | `// Set up visual testing before tests   beforeAll(` |
| tests/components/integration/IntegrationDetailView.visual.js | tests/templates/VisualRegressionTestTemplate.js | 21 | `// Initialize visual testing     await visualTesti` |
| tests/components/integration/IntegrationDetailView.visual.js | tests/templates/VisualRegressionTestTemplate.js | 26 | `// Clean up after tests   afterAll(async () => {  ` |
| tests/components/performance/AccessibilityMonitor.test.js | tests/components/performance/ErrorTrackingSystem.test.js | 31 | `const component = screen.getByTestId('test-compone` |
| tests/components/performance/AccessibilityMonitor.test.js | tests/components/performance/ErrorTrackingSystem.test.js | 36 | `// Performance tests   describe('Performance', () ` |
| tests/components/performance/AccessibilityMonitor.test.js | tests/components/performance/ErrorTrackingSystem.test.js | 41 | `});          test('tracks render metrics', () => {` |
| tests/components/performance/AccessibilityMonitor.test.js | tests/components/performance/ErrorTrackingSystem.test.js | 46 | `});      // Integration tests   describe('Integrat` |
| tests/components/performance/ErrorTrackingSystem.test.js | tests/components/performance/PerformanceBudgetMonitor.test.js | 31 | `const component = screen.getByTestId('test-compone` |
| tests/components/performance/ErrorTrackingSystem.test.js | tests/components/performance/PerformanceBudgetMonitor.test.js | 36 | `// Performance tests   describe('Performance', () ` |
| tests/components/performance/ErrorTrackingSystem.test.js | tests/components/performance/PerformanceBudgetMonitor.test.js | 41 | `});          test('tracks render metrics', () => {` |
| tests/components/performance/ErrorTrackingSystem.test.js | tests/components/performance/PerformanceBudgetMonitor.test.js | 46 | `});      // Integration tests   describe('Integrat` |
| tests/components/performance/PerformanceBudgetMonitor.test.js | tests/components/performance/RuntimePerformanceMonitor.test.js | 31 | `const component = screen.getByTestId('test-compone` |
| tests/components/performance/PerformanceBudgetMonitor.test.js | tests/components/performance/RuntimePerformanceMonitor.test.js | 36 | `// Performance tests   describe('Performance', () ` |
| tests/components/performance/PerformanceBudgetMonitor.test.js | tests/components/performance/RuntimePerformanceMonitor.test.js | 41 | `});          test('tracks render metrics', () => {` |
| tests/components/performance/PerformanceBudgetMonitor.test.js | tests/components/performance/RuntimePerformanceMonitor.test.js | 46 | `});      // Integration tests   describe('Integrat` |
| tests/components/performance/RuntimePerformanceMonitor.test.js | tests/utils/bundleSizeOptimizer.test.js | 46 | `});      // Integration tests   describe('Integrat` |
| tests/e2e/IntegrationWorkflow.e2e.js | tests/templates/E2ETestTemplate.js | 21 | `async login(username, password) {     await this.f` |
| tests/e2e/IntegrationWorkflow.e2e.js | tests/templates/E2ETestTemplate.js | 246 | `// Initialize browser     await e2e.initialize(); ` |
| tests/utils/bundleSizeOptimizer.test.js | tests/utils/ComponentAnalytics.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/bundleSizeOptimizer.test.js | tests/utils/ComponentAnalytics.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/bundleSizeOptimizer.test.js | tests/utils/ComponentAnalytics.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/bundleSizeOptimizer.test.js | tests/utils/ComponentAnalytics.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/ComponentAnalytics.test.js | tests/utils/criticalPathOptimizer.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/ComponentAnalytics.test.js | tests/utils/criticalPathOptimizer.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/ComponentAnalytics.test.js | tests/utils/criticalPathOptimizer.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/ComponentAnalytics.test.js | tests/utils/criticalPathOptimizer.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/criticalPathOptimizer.test.js | tests/utils/differentialLoader.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/criticalPathOptimizer.test.js | tests/utils/differentialLoader.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/criticalPathOptimizer.test.js | tests/utils/differentialLoader.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/criticalPathOptimizer.test.js | tests/utils/differentialLoader.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/differentialLoader.test.js | tests/utils/dynamicImportSplitter.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/differentialLoader.test.js | tests/utils/dynamicImportSplitter.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/differentialLoader.test.js | tests/utils/dynamicImportSplitter.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/differentialLoader.test.js | tests/utils/dynamicImportSplitter.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/dynamicImportSplitter.test.js | tests/utils/ModuleFederationConfig.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/dynamicImportSplitter.test.js | tests/utils/ModuleFederationConfig.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/dynamicImportSplitter.test.js | tests/utils/ModuleFederationConfig.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/dynamicImportSplitter.test.js | tests/utils/ModuleFederationConfig.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/ModuleFederationConfig.test.js | tests/utils/offlineSupport.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/ModuleFederationConfig.test.js | tests/utils/offlineSupport.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/ModuleFederationConfig.test.js | tests/utils/offlineSupport.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/ModuleFederationConfig.test.js | tests/utils/offlineSupport.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/offlineSupport.test.js | tests/utils/parallelBuildProcessor.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/offlineSupport.test.js | tests/utils/parallelBuildProcessor.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/offlineSupport.test.js | tests/utils/parallelBuildProcessor.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/offlineSupport.test.js | tests/utils/parallelBuildProcessor.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/parallelBuildProcessor.test.js | tests/utils/productionOptimizer.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/parallelBuildProcessor.test.js | tests/utils/productionOptimizer.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/parallelBuildProcessor.test.js | tests/utils/productionOptimizer.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/parallelBuildProcessor.test.js | tests/utils/productionOptimizer.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/productionOptimizer.test.js | tests/utils/ssrAdapter.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/productionOptimizer.test.js | tests/utils/ssrAdapter.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/productionOptimizer.test.js | tests/utils/ssrAdapter.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/productionOptimizer.test.js | tests/utils/ssrAdapter.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/ssrAdapter.test.js | tests/utils/StaticSiteGenerator.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/ssrAdapter.test.js | tests/utils/StaticSiteGenerator.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/ssrAdapter.test.js | tests/utils/StaticSiteGenerator.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/ssrAdapter.test.js | tests/utils/StaticSiteGenerator.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/StaticSiteGenerator.test.js | tests/utils/treeShakerEnhancer.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/StaticSiteGenerator.test.js | tests/utils/treeShakerEnhancer.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/StaticSiteGenerator.test.js | tests/utils/treeShakerEnhancer.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/StaticSiteGenerator.test.js | tests/utils/treeShakerEnhancer.test.js | 31 | `});   });      // Integration tests   describe('In` |
| tests/utils/treeShakerEnhancer.test.js | tests/utils/webWorkerManager.test.js | 16 | `});          test('handles edge cases appropriatel` |
| tests/utils/treeShakerEnhancer.test.js | tests/utils/webWorkerManager.test.js | 21 | `});      // Performance tests   describe('Performa` |
| tests/utils/treeShakerEnhancer.test.js | tests/utils/webWorkerManager.test.js | 26 | `// Test execution time     });          test('scal` |
| tests/utils/treeShakerEnhancer.test.js | tests/utils/webWorkerManager.test.js | 31 | `});   });      // Integration tests   describe('In` |
| utils/bundleSizeOptimizer.js | utils/ComponentAnalytics.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/bundleSizeOptimizer.js | utils/ComponentAnalytics.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/bundleSizeOptimizer.js | utils/ComponentAnalytics.js | 36 | `}      return {     // Public methods and properti` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 6 | `* Features:  * - Zero technical debt implementatio` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 11 | `* - Detailed documentation  */ import { useState, ` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 86 | `data: null   });    const execute = useCallback((a` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 91 | `try {       // Determine which function to call ba` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 111 | `default:           throw new Error(`Unknown action` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 116 | `...prev,          loading: false,          data: r` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 121 | `return result;     } catch (error) {       setStat` |
| utils/codeQuality/codeOptimizer.js | utils/codeQuality/consistencyEnforcer.js | 126 | `loading: false,          error: error.message || '` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 6 | `* Features:  * - Zero technical debt implementatio` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 11 | `* - Detailed documentation  */ import { useState, ` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 86 | `data: null   });    const execute = useCallback((a` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 91 | `try {       // Determine which function to call ba` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 111 | `default:           throw new Error(`Unknown action` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 116 | `...prev,          loading: false,          data: r` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 121 | `return result;     } catch (error) {       setStat` |
| utils/codeQuality/consistencyEnforcer.js | utils/codeQuality/standardFormatter.js | 126 | `loading: false,          error: error.message || '` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 6 | `* Features:  * - Zero technical debt implementatio` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 11 | `* - Detailed documentation  */ import { useState, ` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 86 | `data: null   });    const execute = useCallback((a` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 91 | `try {       // Determine which function to call ba` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 111 | `default:           throw new Error(`Unknown action` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 116 | `...prev,          loading: false,          data: r` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 121 | `return result;     } catch (error) {       setStat` |
| utils/codeQuality/standardFormatter.js | utils/codeQuality/staticAnalyzer.js | 126 | `loading: false,          error: error.message || '` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 6 | `* Features:  * - Zero technical debt implementatio` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 11 | `* - Detailed documentation  */ import { useState, ` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 86 | `data: null   });    const execute = useCallback((a` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 91 | `try {       // Determine which function to call ba` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 111 | `default:           throw new Error(`Unknown action` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 116 | `...prev,          loading: false,          data: r` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 121 | `return result;     } catch (error) {       setStat` |
| utils/codeQuality/staticAnalyzer.js | utils/codeQuality/typeValidator.js | 126 | `loading: false,          error: error.message || '` |
| utils/ComponentAnalytics.js | utils/criticalPathOptimizer.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/ComponentAnalytics.js | utils/criticalPathOptimizer.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/ComponentAnalytics.js | utils/criticalPathOptimizer.js | 36 | `}      return {     // Public methods and properti` |
| utils/criticalPathOptimizer.js | utils/differentialLoader.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/criticalPathOptimizer.js | utils/differentialLoader.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/criticalPathOptimizer.js | utils/differentialLoader.js | 36 | `}      return {     // Public methods and properti` |
| utils/differentialLoader.js | utils/dynamicImportSplitter.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/differentialLoader.js | utils/dynamicImportSplitter.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/differentialLoader.js | utils/dynamicImportSplitter.js | 36 | `}      return {     // Public methods and properti` |
| utils/dynamicImportSplitter.js | utils/ModuleFederationConfig.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/dynamicImportSplitter.js | utils/ModuleFederationConfig.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/dynamicImportSplitter.js | utils/ModuleFederationConfig.js | 36 | `}      return {     // Public methods and properti` |
| utils/e2eTesting.js | utils/visualRegressionTesting.js | 96 | `/**    * Clean up resources    */   async cleanup(` |
| utils/e2eTesting.js | utils/visualRegressionTesting.js | 111 | `await this.browser.close();       this.browser = n` |
| utils/ModuleFederationConfig.js | utils/monitoring/errorTracking.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/ModuleFederationConfig.js | utils/offlineSupport.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/ModuleFederationConfig.js | utils/offlineSupport.js | 36 | `}      return {     // Public methods and properti` |
| utils/monitoring/errorTracking.js | utils/monitoring/performanceMonitoring.js | 6 | `*   * Features:  * - High performance implementati` |
| utils/monitoring/errorTracking.js | utils/monitoring/usageAnalytics.js | 71 | `// Track initialization performance   const startT` |
| utils/monitoring/errorTracking.js | utils/monitoring/usageAnalytics.js | 156 | `// Apply sampling rate     if (Math.random() * 100` |
| utils/monitoring/performanceMonitoring.js | utils/monitoring/usageAnalytics.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/monitoring/performanceMonitoring.js | utils/monitoring/usageAnalytics.js | 376 | `if (typeof window !== 'undefined' && config.storag` |
| utils/monitoring/usageAnalytics.js | utils/offlineSupport.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/offlineSupport.js | utils/parallelBuildProcessor.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/offlineSupport.js | utils/parallelBuildProcessor.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/offlineSupport.js | utils/parallelBuildProcessor.js | 36 | `}      return {     // Public methods and properti` |
| utils/parallelBuildProcessor.js | utils/productionOptimizer.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/parallelBuildProcessor.js | utils/productionOptimizer.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/parallelBuildProcessor.js | utils/productionOptimizer.js | 36 | `}      return {     // Public methods and properti` |
| utils/productionOptimizer.js | utils/ssrAdapter.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/productionOptimizer.js | utils/ssrAdapter.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/productionOptimizer.js | utils/ssrAdapter.js | 36 | `}      return {     // Public methods and properti` |
| utils/ssrAdapter.js | utils/StaticSiteGenerator.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/ssrAdapter.js | utils/StaticSiteGenerator.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/ssrAdapter.js | utils/StaticSiteGenerator.js | 36 | `}      return {     // Public methods and properti` |
| utils/StaticSiteGenerator.js | utils/treeShakerEnhancer.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/StaticSiteGenerator.js | utils/treeShakerEnhancer.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/StaticSiteGenerator.js | utils/treeShakerEnhancer.js | 36 | `}      return {     // Public methods and properti` |
| utils/treeShakerEnhancer.js | utils/webWorkerManager.js | 6 | `* Features:  * - High performance implementation  ` |
| utils/treeShakerEnhancer.js | utils/webWorkerManager.js | 11 | `*/  import { performance } from '../utils/performa` |
| utils/treeShakerEnhancer.js | utils/webWorkerManager.js | 36 | `}      return {     // Public methods and properti` |

### Unused Imports

| File | Line | Import | Statement |
|------|------|--------|----------|
| hooks/useLazyComponent.js | 7 | useState | `import { useState, useEffect, useRef, useCallback } from 'react';` |
| hooks/useLazyComponent.js | 8 | performance | `import { performance } from '../utils/performance';` |
| hooks/useOfflineStatus.js | 7 | useState | `import { useState, useEffect, useRef, useCallback } from 'react';` |
| hooks/useOfflineStatus.js | 8 | performance | `import { performance } from '../utils/performance';` |
| hooks/useWebWorker.js | 7 | useState | `import { useState, useEffect, useRef, useCallback } from 'react';` |
| hooks/useWebWorker.js | 8 | performance | `import { performance } from '../utils/performance';` |
| tests/codeQuality/codeOptimization.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/codeOptimization.test.js | 11 | ImportOptimization | `import { ImportOptimization, UnusedCodeCleanup, FileRefactoring, CircularDependencyDetection, ComplexityReduction } from '../../utils/codeQuality/codeOptimization';` |
| tests/codeQuality/codeOptimizer.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/codeOptimizer.test.js | 11 | optimizeImports | `import { optimizeImports, cleanupUnusedCode, refactorLargeFiles, detectCircularDependencies, simplifyLogicalComplexity } from '../../utils/codeQuality/codeOptimizer';` |
| tests/codeQuality/consistencyEnforcer.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/consistencyEnforcer.test.js | 11 | enforceNamingConventions | `import { enforceNamingConventions, standardizeFileStructure, validateCodePatterns, detectPatternViolations, enforceArchitecturalConstraints } from '../../utils/codeQuality/consistencyEnforcer';` |
| tests/codeQuality/patternConsistency.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/patternConsistency.test.js | 11 | NamingConventions | `import { NamingConventions, FileStructureStandardization, CodePatternValidation, PatternViolationDetection, ArchitecturalConstraints } from '../../utils/codeQuality/patternConsistency';` |
| tests/codeQuality/standardFormatter.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/standardFormatter.test.js | 11 | formatCode | `import { formatCode, validateFormatting, generateFormattingReport, applyFormattingRules, syncFormattingConfig } from '../../utils/codeQuality/standardFormatter';` |
| tests/codeQuality/staticAnalysis.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/staticAnalysis.test.js | 11 | ComplexityAnalysis | `import { ComplexityAnalysis, DuplicateCodeDetection, UnusedImportsAnalysis, BestPracticesValidation, QualityReportGeneration } from '../../utils/codeQuality/staticAnalysis';` |
| tests/codeQuality/staticAnalyzer.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/staticAnalyzer.test.js | 11 | analyzeComplexity | `import { analyzeComplexity, detectDuplicateCode, analyzeUnusedImports, validateBestPractices, generateQualityReport } from '../../utils/codeQuality/staticAnalyzer';` |
| tests/codeQuality/typeValidation.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/typeValidation.test.js | 11 | TypeDefinitionValidation | `import { TypeDefinitionValidation, TypeHelpersGeneration, PropTypesValidation, TypeConsistencyChecking, TypeRestrictionEnforcement } from '../../utils/codeQuality/typeValidation';` |
| tests/codeQuality/typeValidator.test.js | 7 | render | `import { render, screen, fireEvent, waitFor } from '@testing-library/react';` |
| tests/codeQuality/typeValidator.test.js | 11 | validateTypeDefinitions | `import { validateTypeDefinitions, generateTypeHelpers, validatePropTypes, checkTypeConsistency, enforceTypeRestrictions } from '../../utils/codeQuality/typeValidator';` |

### Empty or Near-Empty Files

No empty files detected.

## Recommended Actions

1. **Verify and remove unused files**: Start with JS/TS files as they are easier to verify.
2. **Fix unused imports**: These are safe to remove and will clean up dependencies.
3. **Refactor large files**: Break them into smaller modules for better maintainability.
4. **Address duplicate code**: Extract repeated code into shared utilities.
5. **Remove empty files**: After verifying they aren't needed for scaffolding or placeholders.

## Next Steps

1. Run a more detailed analysis on specific directories identified as problematic
2. Implement automated testing to ensure cleanup doesn't break functionality
3. Create a priority cleanup plan based on technical debt impact
4. Set up linting rules to prevent future similar issues
