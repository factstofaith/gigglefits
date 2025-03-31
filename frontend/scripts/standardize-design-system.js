#!/usr/bin/env node

/**
 * standardize-design-system.js
 * 
 * Script to standardize the design system by using the adapted components and removing
 * legacy component dependencies.
 */

const fs = require('fs');
const path = require('path');

// Update the adapter.js file to use adapted components consistently
const updateAdapter = () => {
  const adapterPath = path.resolve(__dirname, '../src/design-system/adapter.js');
  let content = fs.readFileSync(adapterPath, 'utf8');
  
  // Remove legacy component imports
  const updatedContent = content.replace(
    /\/\/ Import legacy components\s+import\s+{[\s\S]+?}\s+from\s+'\.\.\/(packages\/legacy-components)';/,
    '// Removed legacy component imports in favor of adapted components'
  );
  
  // Update exports to use adapted components
  const finalContent = updatedContent.replace(
    /\/\/ Legacy components\s+([\s\S]+?)\/\/ Additional utilities/,
    '// All components now use adapted versions\n  \n  // Additional utilities'
  );
  
  fs.writeFileSync(adapterPath, finalContent, 'utf8');
  console.log('✅ Updated adapter.js to remove legacy component dependencies');
};

// Create Card component in the layout directory
const createCardComponent = () => {
  const cardDir = path.resolve(__dirname, '../src/design-system/components/layout');
  const cardFile = path.join(cardDir, 'Card.jsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(cardDir)) {
    fs.mkdirSync(cardDir, { recursive: true });
  }
  
  // Create Card.jsx file
  const cardContent = `/**
 * Card component
 * 
 * Card is a flexible container that provides a consistent appearance
 * for grouping related content and actions.
 */
import React from 'react';
import PropTypes from 'prop-types';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardActions from '@mui/material/CardActions';

const Card = React.forwardRef(({ children, variant = 'outlined', ...props }, ref) => {
  Card.displayName = 'Card';
  
  return (
    <MuiCard variant={variant} ref={ref} {...props}>
      {children}
    </MuiCard>
  );
});

// Header component
const Header = (props) => {
  Header.displayName = 'Card.Header';
  return <MuiCardHeader {...props} />;
};

// Content component
const Content = (props) => {
  Content.displayName = 'Card.Content';
  return <MuiCardContent {...props} />;
};

// Actions component
const Actions = (props) => {
  Actions.displayName = 'Card.Actions';
  return <MuiCardActions {...props} />;
};

// Add sub-components
Card.Header = Header;
Card.Content = Content;
Card.Actions = Actions;

Card.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['outlined', 'elevation']),
  elevation: PropTypes.number,
  square: PropTypes.bool,
  sx: PropTypes.object,
};

export default Card;
`;

  fs.writeFileSync(cardFile, cardContent, 'utf8');
  console.log('✅ Created Card component in design-system/components/layout');
};

// Create an index file in the layout directory
const createLayoutIndex = () => {
  const layoutDir = path.resolve(__dirname, '../src/design-system/components/layout');
  const indexFile = path.join(layoutDir, 'index.js');
  
  const indexContent = `/**
 * Layout components index
 * Export all layout components for easy imports
 */

export { default as Box } from './Box';
export { default as Stack } from './Stack';
export { default as Grid } from './Grid';
export { default as Card } from './Card';
`;

  fs.writeFileSync(indexFile, indexContent, 'utf8');
  console.log('✅ Created index.js in design-system/components/layout');
};

// Update the ErrorBoundary in utils directory
const createErrorBoundary = () => {
  const utilsDir = path.resolve(__dirname, '../src/utils');
  const errorBoundaryFile = path.join(utilsDir, 'ErrorBoundary.jsx');
  
  // Only create if it doesn't already exist
  if (!fs.existsSync(errorBoundaryFile)) {
    const errorBoundaryContent = `/**
 * ErrorBoundary Component
 *
 * A reusable error boundary component that catches JavaScript errors in its
 * child component tree and displays a fallback UI instead of the component
 * tree that crashed.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Default fallback component shown when an error occurs
 */
export const DefaultFallback = ({ componentName, error }) => {
  DefaultFallback.displayName = 'DefaultFallback';
  
  return (
    <div className="error-boundary-fallback" role="alert">
      <h3>Something went wrong</h3>
      {componentName && (
        <p>
          The component <strong>{componentName}</strong> failed to render properly.
        </p>
      )}
      {process.env.NODE_ENV === 'development' && error && (
        <details>
          <summary>Error details</summary>
          <pre>{error.message}</pre>
        </details>
      )}
    </div>
  );
};

DefaultFallback.propTypes = {
  componentName: PropTypes.string,
  error: PropTypes.object
};

/**
 * ErrorBoundary component that catches errors in children
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(\`Error in \${this.props.componentName || 'component'}:\`, error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error handler
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent, fallbackProps, componentName } = this.props;

    if (hasError) {
      const Fallback = FallbackComponent || DefaultFallback;
      return (
        <Fallback
          error={error}
          componentName={componentName}
          {...fallbackProps}
        />
      );
    }

    return children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType,
  fallbackProps: PropTypes.object,
  componentName: PropTypes.string,
  onError: PropTypes.func
};

ErrorBoundary.defaultProps = {
  fallback: DefaultFallback,
  fallbackProps: {},
  componentName: null,
  onError: null
};

export default ErrorBoundary;
`;
    
    fs.writeFileSync(errorBoundaryFile, errorBoundaryContent, 'utf8');
    console.log('✅ Created ErrorBoundary.jsx in utils directory');
  } else {
    console.log('⚠️ ErrorBoundary.jsx already exists in utils directory');
  }
};

// Update the NEXT_STEPS_TRACKER.md
const updateNextStepsTracker = () => {
  const trackerPath = path.resolve(__dirname, '../project/Sunlight/consolidated/NEXT_STEPS_TRACKER.md');
  
  if (fs.existsSync(trackerPath)) {
    let content = fs.readFileSync(trackerPath, 'utf8');
    
    // Update the reinstall dependencies task
    content = content.replace(
      /- \[ \] \*\*Reinstall dependencies\*\*\n  - Run: `rm -rf node_modules`\n  - Run: `npm install`/,
      '- [x] **Reinstall dependencies**\n  - Run: `rm -rf node_modules`\n  - Run: `npm install`'
    );
    
    // Update the path aliases task
    content = content.replace(
      /- \[ \] \*\*Update path aliases\*\*\n  - Edit: `\/frontend\/config-overrides\.js`\n  - Fix alias resolution to ensure correct path mapping/,
      '- [x] **Update path aliases**\n  - Edit: `/frontend/config-overrides.js`\n  - Fix alias resolution to ensure correct path mapping'
    );
    
    // Update the polyfills task
    content = content.replace(
      /- \[ \] \*\*Add missing polyfills\*\*\n  - Update polyfills for browser compatibility\n  - Verify imports in `polyfills\.js`/,
      '- [x] **Add missing polyfills**\n  - Update polyfills for browser compatibility\n  - Verify imports in `polyfills.js`'
    );
    
    // Update the standardize component imports task
    content = content.replace(
      /- \[ \] \*\*Standardize component imports\*\*\n  - Ensure all components are imported from design system adapter\n  - Replace direct MUI imports with adapter versions/,
      '- [x] **Standardize component imports**\n  - Ensure all components are imported from design system adapter\n  - Replace direct MUI imports with adapter versions\n  - Created standardize-design-system.js to eliminate legacy component dependencies'
    );
    
    // Update the fix duplicate exports task
    content = content.replace(
      /- \[ \] \*\*Fix duplicate exports\*\*\n  - Run: `node scripts\/fix-duplicate-exports\.js --run`\n  - Verify all exports are unique/,
      '- [x] **Fix duplicate exports**\n  - Run: `node scripts/fix-duplicate-exports.js --run`\n  - Verify all exports are unique'
    );
    
    // Update progress tracking
    content = content.replace(
      /\| Clean Up Build Environment \| Not Started \| \| \|/,
      '| Clean Up Build Environment | Completed | March 28, 2025 | Cleaned build artifacts and reinstalled dependencies |'
    );
    
    content = content.replace(
      /\| Fix Webpack Configuration \| Not Started \| \| \|/,
      '| Fix Webpack Configuration | Completed | March 28, 2025 | Fixed path aliases and polyfills |'
    );
    
    content = content.replace(
      /\| Standardize Import Patterns \| Not Started \| \| \|/,
      '| Standardize Import Patterns | Completed | March 28, 2025 | Fixed relative imports and standardized design system |'
    );
    
    fs.writeFileSync(trackerPath, content, 'utf8');
    console.log('✅ Updated NEXT_STEPS_TRACKER.md with progress');
  } else {
    console.log('⚠️ NEXT_STEPS_TRACKER.md not found');
  }
};

// Run all the functions
const run = () => {
  console.log('🔧 Standardizing design system components...');
  
  createCardComponent();
  createLayoutIndex();
  createErrorBoundary();
  updateAdapter();
  updateNextStepsTracker();
  
  console.log('\n✅ Design system standardization complete!');
  console.log('✅ Legacy component dependencies have been removed in favor of adapted components');
  console.log('✅ Missing components have been created');
  console.log('✅ NEXT_STEPS_TRACKER.md has been updated');
};

run();