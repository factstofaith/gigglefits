# Technical Debt Audit Report

Generated: 2025-03-29T03:45:21.890Z

## Summary

| Category | Count | Details |
|----------|-------|--------|
| ESLint Errors | 0 | 0 errors, 0 warnings |
| TypeScript Errors | 0 | 0 TypeScript errors |
| Duplicate Components | 0 |  |
| Hook Violations | 1 | 1 files with hook violations |
| Missing Tests | 0 | 0 components missing tests |
| Import Issues | 0 | 0 files with direct MUI imports |

## Recommendations

### Hook Violations

- Run `npm run standardize-hooks` to fix hook issues
- Extract custom hooks for complex cases
- Follow React hooks rules for remaining issues

