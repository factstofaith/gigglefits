# TAP Integration Platform UI Facelift - Documentation

This directory contains implementation files, designs, and documentation for the TAP Integration Platform UI Facelift project.

## Folder Structure

The documentation is organized as follows:

- **components/**: React component files (JSX)
  - UI components for applications, integrations, datasets, etc.
  - Reusable UI elements and dialogs
  - Form components and containers

- **documentation/**: Markdown documentation files
  - Implementation summaries
  - API documentation
  - Architecture diagrams
  - Project planning documents
  - Design specifications
  
- **utilities/**: JavaScript utility files
  - Helper functions and services
  - Data models and schema definitions
  - Form validation utilities
  - Custom hooks (use_*.js files)

## Core Project Files

The main project files are kept at the root level of the facelift folder:

- **ClaudeContext.md**: Running log of work performed by Claude AI assistant
- **master-project-tracker.md**: Project progress tracker with task status and completion metrics
- **facelift_projectplan.md**: Comprehensive project plan with phased approach

## File Naming Conventions

Files follow these naming conventions:

- Component files: `component_type_name.jsx` (e.g., `application_form.jsx`)
- API documentation: `feature_api.md` (e.g., `application_lifecycle_api.md`)
- Implementation summaries: `feature_implementation_summary.md`
- Utilities: `utility_name.js` (e.g., `form_validation.js`)
- Custom hooks: `use_feature_name.js` (e.g., `use_application_management.js`)

## Development Approach

All code and documentation follow the zero technical debt approach as outlined in the master project tracker. This means:

1. Comprehensive documentation inline with development
2. Full type safety across all code
3. Clean architecture with proper separation of concerns
4. Implementation of best practices from day one
5. No shortcuts or temporary solutions

For more information about the project approach, please refer to the master-project-tracker.md file in the parent directory.