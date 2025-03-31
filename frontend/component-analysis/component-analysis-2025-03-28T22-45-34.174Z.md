# Component Analysis Report

Generated: 2025-03-28T22:45:34.935Z

Analyzed 96 components

## Statistical Overview

### Hook Usage

| Hook | Usage Count | % of Components |
|------|-------------|----------------|
| useState | 85 | 88.5% |
| useCallback | 23 | 24.0% |
| useEffect | 10 | 10.4% |
| useNavigate | 5 | 5.2% |
| useMemo | 3 | 3.1% |
| useUser | 3 | 3.1% |
| useParams | 2 | 2.1% |
| useTheme | 2 | 2.1% |
| useNotification | 1 | 1.0% |
| useAzureConfig | 1 | 1.0% |

### Design System Compliance

- Components using design system imports: 70 (72.9%)
- Components using adapted components: 0 (0.0%)
- Components with direct MUI imports: 90 (93.8%)
- Overall design system compliance: 4.2%

### Performance Indicators

- Memoized components: 30 (31.3%)
- High complexity render functions: 1 (1.0%)
- Average inline objects per component: 1.0

### Component Dependencies

**Most Referenced Components:**

| Component | Dependency Count |
|-----------|------------------|

## Issues Summary

172 issues found in 90 components

### Design-system Issues (90)

| Component | Issue | Severity |
|-----------|-------|----------|
| ApplicationsManager | Direct MUI import detected (should use design system) | medium |
| AzureConfigurationPanel | Direct MUI import detected (should use design system) | medium |
| DatasetsManager | Direct MUI import detected (should use design system) | medium |
| DocumentationDashboard | Direct MUI import detected (should use design system) | medium |
| DocumentationLibrary | Direct MUI import detected (should use design system) | medium |
| DocumentViewer | Direct MUI import detected (should use design system) | medium |
| DocumentationAnalytics | Direct MUI import detected (should use design system) | medium |
| EmailConfiguration | Direct MUI import detected (should use design system) | medium |
| ErrorLogViewer | Direct MUI import detected (should use design system) | medium |
| InvitationForm | Direct MUI import detected (should use design system) | medium |
| ... | ... and 80 more | ... |

### Parse-error Issues (81)

| Component | Issue | Severity |
|-----------|-------|----------|
| ApplicationsManager | Parser error: Unexpected token (3:23) | high |
| AzureConfigurationPanel | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| DatasetsManager | Parser error: Unterminated string constant. (308:17) | high |
| DocumentationDashboard | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| DocumentationLibrary | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| DocumentViewer | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| DocumentationAnalytics | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| EmailConfiguration | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| ErrorLogViewer | Parser error: Unexpected keyword 'import'. (38:0) | high |
| InvitationForm | Parser error: Cannot read properties of undefined (reading 'buildError') | high |
| ... | ... and 71 more | ... |

### Performance Issues (1)

| Component | Issue | Severity |
|-----------|-------|----------|
| ErrorBoundary | Complex render function detected (over 500 characters) | medium |

## Recommendations

### Design System Compliance

90 components have design system issues. To fix:

1. Replace direct MUI imports with design system equivalents
2. Use adapted components from the design system
3. Update import statements to use design system paths
4. Consider creating a script to automatically convert direct imports

### Performance Improvements

1 components have potential performance issues. To improve:

1. Memoize expensive calculations with useMemo
2. Memoize callback functions with useCallback
3. Move object creation outside of render functions
4. Break down complex render functions into smaller components
5. Consider using React.memo for components that render often but with the same props

## Next Steps

1. **Fix Hook Violations**: Address all hook rule violations as they can cause unpredictable behavior
2. **Improve Design System Compliance**: Standardize component usage by migrating to design system components
3. **Optimize Performance**: Focus on high-complexity components and add memoization where appropriate
4. **Address Interdependent Issues**: Coordinate fixes for components that depend on each other
5. **Implement Static Analysis**: Add these checks to CI/CD to prevent regressions

See the detailed JSON report at `/home/ai-dev/Desktop/tap-integration-platform/frontend/component-analysis/detailed-analysis-2025-03-28T22-45-34.174Z.json` for complete component data.
