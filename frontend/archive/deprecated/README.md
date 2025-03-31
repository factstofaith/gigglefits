# Cleanup Archive Directory

## Overview

This directory contains files that have been archived during the aggressive cleanup of the TAP Integration Platform codebase. These files are no longer in active use but are preserved for reference or future reuse.

## Archive Contents

- **components/**: Unused component files
  - **common/**: Common components that were duplicated or unused
  - **integration/**: Unused integration components
  - **admin/**: Unused admin components
  - **dynamic/**: Dynamic loading components that were unused
  - **documentation/**: Documentation related components

- **design-system/**: Design system files that were deprecated
  - **adapted/**: Adapted components that were unused or duplicated
  - **components/**: Core design system components that were duplicated or obsolete

- **tests/**: Test files related to archived components
  - **design-system/**: Design system related tests

- **utils/**: Utility files that were unused or duplicated

## Archiving Criteria

Files were archived based on the following criteria:

1. Unused components (not imported anywhere in the codebase)
2. Duplicate implementations where a better alternative exists
3. Legacy components that have been migrated to a separate package
4. Components with no clear usage pattern

## Notes for Developers

If you need to resurrect any of these components, please consider:

1. The files might require updates to work with the current architecture
2. Many components have been superseded by design system implementations
3. Check the project documentation for the reasoning behind the archiving

For more information, see:
- `frontend/project/Sunlight/CLEANUP_SUMMARY.md`
- `frontend/project/Sunlight/DESIGN_SYSTEM_ADAPTATION_MAP.md`
- `frontend/src/design-system/README.md`

Created: March 28, 2025