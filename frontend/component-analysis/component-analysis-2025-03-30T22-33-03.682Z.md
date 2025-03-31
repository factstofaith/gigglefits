# Component Analysis Report

Generated: 2025-03-30T22:33:04.530Z

Analyzed 106 components

## Statistical Overview

### Hook Usage

| Hook | Usage Count | % of Components |
|------|-------------|----------------|
| useState | 348 | 328.3% |
| useCallback | 171 | 161.3% |
| useEffect | 39 | 36.8% |
| useRef | 11 | 10.4% |
| useContext | 10 | 9.4% |
| useMemo | 9 | 8.5% |
| useNavigate | 6 | 5.7% |
| useUser | 5 | 4.7% |
| useTheme | 4 | 3.8% |
| useLocation | 4 | 3.8% |

### Design System Compliance

- Components using design system imports: 7 (6.6%)
- Components using adapted components: 0 (0.0%)
- Components with direct MUI imports: 51 (48.1%)
- Overall design system compliance: 6.6%

### Performance Indicators

- Memoized components: 27 (25.5%)
- High complexity render functions: 1 (0.9%)
- Average inline objects per component: 0.8

### Component Dependencies

**Most Referenced Components:**

| Component | Dependency Count |
|-----------|------------------|
| App | 2 |
| IntegrationDetailPage | 2 |
| IntegrationsPage | 1 |
| KeyboardShortcutsHelp.test | 1 |
| Navigation.test | 1 |

## Issues Summary

56 issues found in 54 components

### Design-system Issues (51)

| Component | Issue | Severity |
|-----------|-------|----------|
| AdminDashboard | Direct MUI import detected (should use design system) | medium |
| AdminNavigationBar | Direct MUI import detected (should use design system) | medium |
| FileCard | Direct MUI import detected (should use design system) | medium |
| FilePreview | Direct MUI import detected (should use design system) | medium |
| StatusDisplay | Direct MUI import detected (should use design system) | medium |
| APISourceConfiguration | Direct MUI import detected (should use design system) | medium |
| AzureBlobContainerBrowser | Direct MUI import detected (should use design system) | medium |
| AzureCredentialManager | Direct MUI import detected (should use design system) | medium |
| AzureBlobConfiguration | Direct MUI import detected (should use design system) | medium |
| DataPreview | Direct MUI import detected (should use design system) | medium |
| ... | ... and 41 more | ... |

### Parse-error Issues (4)

| Component | Issue | Severity |
|-----------|-------|----------|
| SEO | Parser error: Unexpected token (89:35) | high |
| AzureBlobConfiguration | Parser error: Identifier 'CloseIcon' has already been declared. (1392:7) | high |
| WebhookConfiguration | Parser error: Expecting Unicode escape sequence \uXXXX. (1362:9) | high |
| App.test | Parser error: Identifier 'App' has already been declared. (13:7) | high |

### Performance Issues (1)

| Component | Issue | Severity |
|-----------|-------|----------|
| ErrorBoundary | Complex render function detected (over 500 characters) | medium |

## Recommendations

### Design System Compliance

51 components have design system issues. To fix:

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

See the detailed JSON report at `/home/ai-dev/Desktop/tap-integration-platform/frontend/component-analysis/detailed-analysis-2025-03-30T22-33-03.682Z.json` for complete component data.
