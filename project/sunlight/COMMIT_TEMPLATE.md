# Commit Message Template

```
type(scope): short description

[optional body with more details]

[optional footer]
```

## Types

- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `style`: Changes that do not affect the meaning of the code (formatting, etc)
- `test`: Adding missing tests or correcting existing tests
- `docs`: Documentation only changes
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts

## Scopes

- `design-system`: Changes to the design system components
- `hooks`: Changes to React hooks
- `components`: Changes to UI components
- `build`: Changes to the build process
- `test`: Changes to tests
- `config`: Changes to configuration files
- `lint`: Changes to linting rules or fixes
- `types`: Changes to TypeScript types

## Examples

```
fix(components): fix missing display names in ResourceLoader

Added displayName property to ResourceLoader component to fix
react/display-name ESLint errors and improve component debugging.
```

```
refactor(design-system): standardize MUI imports

- Added design system adapter for centralized imports
- Updated component imports to use adapter
- Removed duplicate imports in IntegrationFlowCanvas
```

```
build(config): optimize TypeScript configuration

- Added proper JSX handling
- Fixed module resolution
- Added path aliases for better imports
```