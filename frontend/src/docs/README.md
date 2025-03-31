# Frontend Documentation

This folder contains documentation for the frontend project.

## Testing Documentation

All testing-related documentation is now located in the `testing/` subfolder:

- `testing/testing-infrastructure-plan.md` - Detailed implementation timeline for the testing infrastructure
- `testing/testing-tools-evaluation.md` - Evaluation of testing tools and their selection rationale
- `testing/testing-standards.md` - Testing standards and best practices
- `testing/test-audit-results.md` - Audit of existing tests and recommendations
- `testing/testing_claude_log.md` - Progress tracking for the testing implementation
- `testing/CLAUDE.md` - Comprehensive testing implementation plan with checklists

## Important Updates

The testing infrastructure implementation is now complete (Phase 1). The infrastructure includes:

1. Jest configuration for unit and integration tests
2. MSW v2 for API mocking
3. Testing utilities for rendering, user events, and accessibility testing
4. Test templates for component, hook, and integration tests
5. Storybook integration with accessibility testing
6. CI pipeline with GitHub Actions

We're now moving to Phase 2: Systematic Test Implementation.