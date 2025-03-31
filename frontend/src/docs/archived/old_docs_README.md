# TAP Integration Platform Documentation

This directory contains documentation for the TAP Integration Platform frontend application, focusing on the design system and migration process.

## Main Documentation Files

- **DesignSystem-Overview.md** - Main guide to the design system, components, and usage
- **DesignSystem-Migration.md** - Migration guide, plan, and current status with optimized completion strategy
- **DesignSystem-ComponentWrappers.md** - Details on legacy wrapper components
- **DesignSystemUsage.md** - Component usage examples and patterns
- **CLAUDE.md** - Guide for using Claude with the migration

## Key Features of Our Migration Approach

1. **Feature-First Focus**
   - Complete entire features before moving to the next
   - Migrate Templates → Admin → Settings → Dashboard
   
2. **Parallel Testing & Development**
   - Implement visual regression testing while migration continues
   - Use automated component analysis to track progress
   
3. **Accelerated Timeline**
   - Complete migration by May 2025 (one month ahead of schedule)
   - Target 100% completion of all UI components

## Running the Cleanup Script

If you've just completed the documentation consolidation, you can run the cleanup script to remove old, redundant documentation files:

```sh
cd /path/to/frontend/src/docs
./cleanup-docs.sh
```

## Documentation Structure

Our documentation is organized to support the design system migration process:

1. **Overview**: General information about the design system, its purpose, and components
2. **Migration**: Specific guidance for migrating from Material UI to our design system
3. **Component Wrappers**: Technical details about legacy wrapper components
4. **Usage Examples**: Code examples for using design system components

## Contributing to Documentation

When updating documentation:

1. Keep it concise and focused
2. Include code examples where appropriate
3. Update status in DesignSystem-Migration.md as components are migrated
4. Use consistent formatting (markdown)