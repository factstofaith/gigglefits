/**
 * Component Template Generator
 * 
 * A powerful utility for generating React component templates with built-in
 * accessibility, performance optimizations, and testing scaffolding.
 * 
 * @module utils/tools/componentTemplateGenerator
 */

import fs from 'fs';
import path from 'path';

// Base templates for different component types
const COMPONENT_TEMPLATES = {
  functional: `/**
 * {{componentName}}
 *
 * {{componentDescription}}
 *
 * @component
 */

import React, { {{hooks}} } from 'react';
import PropTypes from 'prop-types';
{{imports}}

{{hocImports}}

/**
 * {{componentName}} component
 *
 * @param {Object} props - Component props
 {{paramDocs}}
 * @returns {JSX.Element} The rendered component
 */
const {{componentName}} = ({ {{props}} }) => {
  {{stateHooks}}
  {{effectHooks}}
  {{callbackHooks}}
  {{customHooks}}

  {{handlers}}

  {{renderHelpers}}

  return (
    {{jsx}}
  );
};

{{componentName}}.propTypes = {
  {{propTypes}}
};

{{componentName}}.defaultProps = {
  {{defaultProps}}
};

{{exports}}`,

  a11y: `/**
 * Accessibility-Enhanced {{componentName}}
 *
 * {{componentDescription}} with enhanced accessibility.
 * Part of the zero technical debt accessibility implementation.
 *
 * @component
 */

import React, { {{hooks}} } from 'react';
import PropTypes from 'prop-types';
{{imports}}

// Import accessibility components
{{a11yComponentImports}}

// Import accessibility hooks
import { {{a11yHooks}} } from '../../hooks/a11y';
{{a11yUtilImports}}

{{hocImports}}

/**
 * Enhanced {{componentName}} with built-in accessibility features
 *
 * @param {Object} props - Component props
 {{paramDocs}}
 * @param {string} [props.a11yLabel] - Accessible label for screen readers
 * @param {string} [props.a11yAnnouncement] - Message to announce when component changes
 * @returns {JSX.Element} The enhanced component
 */
const {{componentName}} = ({ {{props}}, a11yLabel, a11yAnnouncement, ...rest }) => {
  {{stateHooks}}
  
  // A11y hooks
  {{a11yHooksInit}}
  
  {{effectHooks}}
  {{callbackHooks}}
  {{customHooks}}

  {{handlers}}

  {{a11yHandlers}}

  {{renderHelpers}}

  return (
    {{jsx}}
  );
};

{{componentName}}.propTypes = {
  {{propTypes}}
  // A11y props
  a11yLabel: PropTypes.string,
  a11yAnnouncement: PropTypes.string,
  {{a11yPropTypes}}
};

{{componentName}}.defaultProps = {
  {{defaultProps}}
};

{{exports}}`,

  performance: `/**
 * Performance-Optimized {{componentName}}
 *
 * {{componentDescription}} with built-in performance optimizations.
 * Part of the zero technical debt performance implementation.
 *
 * @component
 */

import React, { {{hooks}} } from 'react';
import PropTypes from 'prop-types';
{{imports}}

// Import performance utilities
import { {{perfUtils}} } from '../../utils/performance';

{{hocImports}}

/**
 * Optimized {{componentName}} component with performance monitoring
 *
 * @param {Object} props - Component props
 {{paramDocs}}
 * @returns {JSX.Element} The rendered component
 */
const {{componentName}} = ({ {{props}} }) => {
  {{stateHooks}}
  
  // Memoize expensive calculations
  {{memoHooks}}
  
  {{effectHooks}}
  
  // Memoize callbacks
  {{optimizedCallbacks}}
  
  {{customHooks}}

  // Performance monitoring
  {{performanceMonitoring}}

  {{renderHelpers}}

  return (
    {{jsx}}
  );
};

{{componentName}}.propTypes = {
  {{propTypes}}
};

{{componentName}}.defaultProps = {
  {{defaultProps}}
};

// Apply performance optimizations
{{perfHoc}}

{{exports}}`,

  test: `/**
 * Tests for {{componentName}}
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {{componentName}} from '../{{componentFile}}';

describe('{{componentName}}', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Clean up test environment
  });

  test('renders correctly', () => {
    render(<{{componentName}} {{defaultTestProps}} />);
    // Test basic rendering
    {{basicRenderAssertions}}
  });

  test('handles user interactions correctly', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Render component with test props
    const mockHandler = jest.fn();
    render(<{{componentName}} {{interactionTestProps}} onAction={mockHandler} />);
    
    // Find interactive elements
    {{interactiveElements}}
    
    // Perform user interactions
    {{userInteractions}}
    
    // Assert expected outcomes
    {{interactionAssertions}}
  });

  {{additionalTests}}
});`,

  a11yTest: `/**
 * Accessibility tests for {{componentName}}
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import {{componentName}} from '../{{componentFile}}';

expect.extend(toHaveNoViolations);

describe('{{componentName}} - Accessibility', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Clean up test environment
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<{{componentName}} {{defaultTestProps}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('is keyboard navigable', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Render component
    render(<{{componentName}} {{defaultTestProps}} />);
    
    // Find interactive elements
    {{interactiveElements}}
    
    // Test keyboard navigation
    {{keyboardNavigation}}
    
    // Assert expected focus behavior
    {{focusAssertions}}
  });

  test('has proper ARIA attributes', () => {
    render(<{{componentName}} {{defaultTestProps}} />);
    
    // Check for proper ARIA attributes
    {{ariaAssertions}}
  });

  test('announces changes to screen readers', async () => {
    // Setup mocks for announcements
    const announcePolite = jest.fn();
    jest.mock('../../hooks/a11y', () => ({
      ...jest.requireActual('../../hooks/a11y'),
      useA11yAnnouncement: () => ({
        announcePolite,
        announceAssertive: jest.fn()
      })
    }));
    
    // Render component
    const { rerender } = render(<{{componentName}} {{defaultTestProps}} />);
    
    // Trigger announcements
    {{triggerAnnouncements}}
    
    // Assert announcements were made
    {{announcementAssertions}}
  });

  {{additionalA11yTests}}
});`
};

// Configuration defaults for different component types
const COMPONENT_DEFAULTS = {
  button: {
    hooks: 'useCallback',
    imports: `import { Button } from '@mui/material';`,
    a11yComponentImports: `import A11yButton from '../common/A11yButton';`,
    a11yHooks: 'useA11yAnnouncement',
    a11yHooksInit: `const { announcePolite } = useA11yAnnouncement();`,
    props: 'children, onClick, disabled, variant = "contained", color = "primary", size = "medium"',
    propTypes: `children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),`,
    defaultProps: `variant: 'contained',
  color: 'primary',
  size: 'medium',`,
    jsx: `<A11yButton
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color={color}
      size={size}
      a11yLabel={a11yLabel}
      a11yAnnouncement={a11yAnnouncement}
      {...rest}
    >
      {children}
    </A11yButton>`,
    exports: `export default ${componentName};`,
    paramDocs: ` * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.variant="contained"] - Button variant
 * @param {string} [props.color="primary"] - Button color
 * @param {string} [props.size="medium"] - Button size`,
  },
  dialog: {
    hooks: 'useState, useEffect, useCallback, useRef',
    imports: `import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
} from '@mui/material';`,
    a11yComponentImports: `import A11yDialog from '../common/A11yDialog';
import A11yButton from '../common/A11yButton';`,
    a11yHooks: 'useA11yAnnouncement, useA11yFocus, useA11yKeyboard',
    a11yHooksInit: `const { announcePolite } = useA11yAnnouncement();
  const { registerKeyHandler } = useA11yKeyboard();
  const { containerRef } = useA11yFocus({ trapFocus: open });`,
    props: 'open, onClose, title, children, actions',
    propTypes: `open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.node,`,
    defaultProps: ``,
    jsx: `<A11yDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
      a11yLabelledBy="a11y-dialog-title"
      a11yDescribedBy="a11y-dialog-description"
      a11yAnnouncement={a11yAnnouncement || \`\${title || 'Dialog'} opened\`}
      {...rest}
    >
      {children}
    </A11yDialog>`,
    a11yHandlers: `// Register keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    
    // Handle Escape key
    const cleanup = registerKeyHandler({
      'Escape': () => {
        if (onClose) {
          onClose();
          announcePolite('Dialog closed');
        }
      }
    });
    
    return cleanup;
  }, [open, onClose, registerKeyHandler, announcePolite]);`,
    a11yPropTypes: `a11yLabelledBy: PropTypes.string,
  a11yDescribedBy: PropTypes.string,`,
    exports: `export default ${componentName};`,
    paramDocs: ` * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog should close
 * @param {React.ReactNode} [props.title] - Dialog title
 * @param {React.ReactNode} [props.children] - Dialog content
 * @param {React.ReactNode} [props.actions] - Dialog actions`,
  },
  form: {
    hooks: 'useState, useEffect, useCallback, useRef',
    imports: `import {
  Box,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';`,
    a11yComponentImports: `import A11yButton from '../common/A11yButton';
import A11yForm from '../common/A11yForm';`,
    a11yHooks: 'useA11yAnnouncement, useA11yFocus',
    a11yUtilImports: `import { getFormFieldAttributes } from '../../utils/a11y/ariaAttributeHelper';`,
    a11yHooksInit: `const { announcePolite, announceAssertive } = useA11yAnnouncement();`,
    props: 'onSubmit, initialValues, children',
    stateHooks: `const [submitting, setSubmitting] = useState(false);`,
    a11yHandlers: `// Announce form errors
  const announceFormErrors = () => {
    const errors = formik.errors;
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors) {
      const errorCount = Object.keys(errors).length;
      const errorMessage = \`Form has \${errorCount} \${errorCount === 1 ? 'error' : 'errors'}. \${Object.values(errors).join('. ')}\`;
      announceAssertive(errorMessage);
      return false;
    }
    
    return true;
  };
  
  // Get ARIA attributes for form fields
  const getFieldAttributes = (fieldName, label) => {
    return getFormFieldAttributes({
      label,
      required: validationSchema.fields[fieldName]?._exclusive?.required,
      invalid: formik.touched[fieldName] && Boolean(formik.errors[fieldName]),
      errorId: formik.touched[fieldName] && formik.errors[fieldName] ? \`\${fieldName}-error\` : undefined
    });
  };`,
    propTypes: `onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  children: PropTypes.node,`,
    defaultProps: `initialValues: {},`,
    exports: `export default ${componentName};`,
    paramDocs: ` * @param {Function} props.onSubmit - Form submission handler
 * @param {Object} [props.initialValues={}] - Initial form values
 * @param {React.ReactNode} [props.children] - Form content`,
  },
  table: {
    hooks: 'useState, useEffect, useCallback, useMemo',
    imports: `import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box
} from '@mui/material';`,
    a11yComponentImports: `import A11yTable from '../common/A11yTable';`,
    a11yHooks: 'useA11yAnnouncement, useA11yKeyboard',
    a11yHooksInit: `const { announcePolite } = useA11yAnnouncement();
  const { registerKeyHandler } = useA11yKeyboard();`,
    props: 'data, columns, onRowClick, sortable = true',
    propTypes: `data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'right', 'center']),
      format: PropTypes.func,
    })
  ).isRequired,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,`,
    defaultProps: `sortable: true,`,
    stateHooks: `const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');`,
    a11yHandlers: `// Announce sorting changes
  const handleSortChange = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    
    setOrder(newOrder);
    setOrderBy(columnId);
    
    const column = columns.find(col => col.id === columnId);
    if (column) {
      announcePolite(\`Table sorted by \${column.label} in \${newOrder === 'asc' ? 'ascending' : 'descending'} order\`);
    }
  };
  
  // Register keyboard handlers for table navigation
  useEffect(() => {
    const handleArrowKeys = (e) => {
      // Implement keyboard navigation for table cells
    };
    
    return registerKeyHandler({
      'ArrowUp': handleArrowKeys,
      'ArrowDown': handleArrowKeys,
      'ArrowLeft': handleArrowKeys,
      'ArrowRight': handleArrowKeys,
    });
  }, [registerKeyHandler]);`,
    exports: `export default ${componentName};`,
    paramDocs: ` * @param {Array} props.data - Data to display in the table
 * @param {Array} props.columns - Column definitions
 * @param {Function} [props.onRowClick] - Function to call when a row is clicked
 * @param {boolean} [props.sortable=true] - Whether the table can be sorted`,
  }
};

/**
 * Generate component file content based on template
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name of the component
 * @param {string} options.componentDescription - Component description
 * @param {string} options.templateType - Type of template to use (functional, a11y, performance)
 * @param {string} options.componentType - Type of component (button, dialog, form, table, etc.)
 * @param {Object} options.customProps - Custom component props
 * @param {Array} options.customImports - Additional imports
 * @param {Object} options.customState - Custom state hooks
 * @param {Object} options.customEffects - Custom effect hooks
 * @param {string} options.customJSX - Custom JSX code
 * @returns {string} Generated component code
 */
export const generateComponent = ({
  componentName,
  componentDescription = `A component for ${componentName}`,
  templateType = 'a11y',
  componentType = 'generic',
  customProps = {},
  customImports = [],
  customState = {},
  customEffects = {},
  customJSX = ''
}) => {
  // Get the base template
  let template = COMPONENT_TEMPLATES[templateType];
  if (!template) {
    console.warn(`Template type '${templateType}' not found, using functional template.`);
    template = COMPONENT_TEMPLATES.functional;
  }
  
  // Get component type defaults
  const defaults = COMPONENT_DEFAULTS[componentType] || {};
  
  // Prepare template variables
  const hooks = customProps.hooks || defaults.hooks || 'useState, useEffect';
  const imports = [
    defaults.imports || '',
    ...customImports
  ].filter(Boolean).join('\n');
  
  const a11yComponentImports = defaults.a11yComponentImports || '';
  const a11yHooks = defaults.a11yHooks || 'useA11yAnnouncement';
  const a11yHooksInit = defaults.a11yHooksInit || 'const { announcePolite } = useA11yAnnouncement();';
  const a11yUtilImports = defaults.a11yUtilImports || '';
  
  const props = customProps.props || defaults.props || '';
  const stateHooks = [
    Object.entries(customState).map(([name, value]) => `const [${name}, set${name[0].toUpperCase() + name.slice(1)}] = useState(${value});`).join('\n  '),
    defaults.stateHooks || ''
  ].filter(Boolean).join('\n  ');
  
  const effectHooks = [
    Object.entries(customEffects).map(([name, effect]) => `useEffect(() => {\n    ${effect}\n  }, [${name}Dependencies]);`).join('\n\n  '),
    defaults.effectHooks || ''
  ].filter(Boolean).join('\n  ');
  
  const callbackHooks = defaults.callbackHooks || '';
  const customHooks = defaults.customHooks || '';
  const handlers = defaults.handlers || '';
  const a11yHandlers = defaults.a11yHandlers || '';
  const renderHelpers = defaults.renderHelpers || '';
  const jsx = customJSX || defaults.jsx || '<div />';
  
  const propTypes = defaults.propTypes || '';
  const defaultProps = defaults.defaultProps || '';
  const a11yPropTypes = defaults.a11yPropTypes || '';
  const exports = defaults.exports || `export default ${componentName};`;
  const paramDocs = defaults.paramDocs || '';
  
  // Performance specific fields
  const memoHooks = (templateType === 'performance') ? 'const memoizedValue = useMemo(() => { /* Calculate expensive value */ }, [dependencies]);' : '';
  const optimizedCallbacks = (templateType === 'performance') ? 'const handleEvent = useCallback(() => { /* Handle event */ }, [dependencies]);' : '';
  const performanceMonitoring = (templateType === 'performance') ? 'useRenderTracking("Component");' : '';
  const perfUtils = (templateType === 'performance') ? 'withRenderTracking, useRenderTracking' : '';
  const perfHoc = (templateType === 'performance') ? `const EnhancedComponent = withRenderTracking(${componentName}, { name: "${componentName}" });
export default EnhancedComponent;` : '';
  
  // Replace template placeholders
  return template
    .replace(/{{componentName}}/g, componentName)
    .replace(/{{componentDescription}}/g, componentDescription)
    .replace(/{{hooks}}/g, hooks)
    .replace(/{{imports}}/g, imports)
    .replace(/{{a11yComponentImports}}/g, a11yComponentImports)
    .replace(/{{a11yHooks}}/g, a11yHooks)
    .replace(/{{a11yHooksInit}}/g, a11yHooksInit)
    .replace(/{{a11yUtilImports}}/g, a11yUtilImports)
    .replace(/{{hocImports}}/g, '')
    .replace(/{{props}}/g, props)
    .replace(/{{stateHooks}}/g, stateHooks)
    .replace(/{{effectHooks}}/g, effectHooks)
    .replace(/{{callbackHooks}}/g, callbackHooks)
    .replace(/{{customHooks}}/g, customHooks)
    .replace(/{{handlers}}/g, handlers)
    .replace(/{{a11yHandlers}}/g, a11yHandlers)
    .replace(/{{renderHelpers}}/g, renderHelpers)
    .replace(/{{jsx}}/g, jsx)
    .replace(/{{propTypes}}/g, propTypes)
    .replace(/{{defaultProps}}/g, defaultProps)
    .replace(/{{a11yPropTypes}}/g, a11yPropTypes)
    .replace(/{{exports}}/g, exports)
    .replace(/{{paramDocs}}/g, paramDocs)
    // Performance specific
    .replace(/{{memoHooks}}/g, memoHooks)
    .replace(/{{optimizedCallbacks}}/g, optimizedCallbacks)
    .replace(/{{performanceMonitoring}}/g, performanceMonitoring)
    .replace(/{{perfUtils}}/g, perfUtils)
    .replace(/{{perfHoc}}/g, perfHoc);
};

/**
 * Generate component test file content
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name of the component
 * @param {string} options.componentFile - Path to the component file
 * @param {string} options.testType - Type of test to generate (basic or a11y)
 * @param {Object} options.testProps - Props to use for testing
 * @returns {string} Generated test code
 */
export const generateComponentTest = ({
  componentName,
  componentFile,
  testType = 'basic',
  testProps = {}
}) => {
  // Get the base template
  const template = testType === 'a11y' 
    ? COMPONENT_TEMPLATES.a11yTest 
    : COMPONENT_TEMPLATES.test;
  
  // Generate default test props string
  const defaultTestProps = Object.entries(testProps)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? `${key}` : `${key}={false}`;
      if (typeof value === 'number') return `${key}={${value}}`;
      if (typeof value === 'object') return `${key}={${JSON.stringify(value)}}`;
      return `${key}={${value}}`;
    })
    .join(' ');
  
  const interactionTestProps = defaultTestProps;
  
  // Basic test assertions
  const basicRenderAssertions = `expect(screen.getByText('${testProps.label || 'Test'}')).toBeInTheDocument();`;
  
  // Interactive elements
  const interactiveElements = `const button = screen.getByRole('button', { name: /test/i });`;
  
  // User interactions
  const userInteractions = `await user.click(button);`;
  
  // Interaction assertions
  const interactionAssertions = `expect(mockHandler).toHaveBeenCalledTimes(1);`;
  
  // Accessibility specific
  const keyboardNavigation = `await user.tab();
    expect(button).toHaveFocus();`;
  
  const focusAssertions = `expect(button).toHaveFocus();`;
  
  const ariaAssertions = `const element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label');`;
  
  const triggerAnnouncements = `// Trigger action that should cause announcement
    await user.click(button);`;
  
  const announcementAssertions = `expect(announcePolite).toHaveBeenCalledWith(expect.any(String));`;
  
  // Replace template placeholders
  return template
    .replace(/{{componentName}}/g, componentName)
    .replace(/{{componentFile}}/g, componentFile)
    .replace(/{{defaultTestProps}}/g, defaultTestProps)
    .replace(/{{interactionTestProps}}/g, interactionTestProps)
    .replace(/{{basicRenderAssertions}}/g, basicRenderAssertions)
    .replace(/{{interactiveElements}}/g, interactiveElements)
    .replace(/{{userInteractions}}/g, userInteractions)
    .replace(/{{interactionAssertions}}/g, interactionAssertions)
    .replace(/{{keyboardNavigation}}/g, keyboardNavigation)
    .replace(/{{focusAssertions}}/g, focusAssertions)
    .replace(/{{ariaAssertions}}/g, ariaAssertions)
    .replace(/{{triggerAnnouncements}}/g, triggerAnnouncements)
    .replace(/{{announcementAssertions}}/g, announcementAssertions)
    .replace(/{{additionalTests}}/g, '')
    .replace(/{{additionalA11yTests}}/g, '');
};

/**
 * Write a component file to disk
 * 
 * @param {string} filePath - Path to write the file
 * @param {string} content - File content
 * @returns {boolean} Whether the write was successful
 */
export const writeComponentFile = (filePath, content) => {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

/**
 * Generate a complete component with test files
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name of the component
 * @param {string} options.componentPath - Path to write the component file
 * @param {string} options.componentDescription - Component description
 * @param {string} options.templateType - Type of template to use
 * @param {string} options.componentType - Type of component
 * @param {Object} options.customProps - Custom component props
 * @param {boolean} options.generateTests - Whether to generate test files
 * @returns {Object} Result of the generation
 */
export const generateCompleteComponent = ({
  componentName,
  componentPath,
  componentDescription,
  templateType = 'a11y',
  componentType = 'generic',
  customProps = {},
  generateTests = true
}) => {
  const result = {
    success: false,
    files: [],
    errors: []
  };
  
  try {
    // Generate component content
    const componentContent = generateComponent({
      componentName,
      componentDescription,
      templateType,
      componentType,
      customProps
    });
    
    // Write component file
    const componentFile = path.join(componentPath, `${componentName}.jsx`);
    const componentWriteResult = writeComponentFile(componentFile, componentContent);
    
    if (componentWriteResult) {
      result.files.push(componentFile);
    } else {
      result.errors.push(`Failed to write component file: ${componentFile}`);
    }
    
    // Generate tests if requested
    if (generateTests) {
      // Basic test
      const testPath = path.join(componentPath, '__tests__');
      const testFile = path.join(testPath, `${componentName}.test.jsx`);
      
      const testContent = generateComponentTest({
        componentName,
        componentFile: `../${componentName}.jsx`,
        testType: 'basic',
        testProps: customProps
      });
      
      const testWriteResult = writeComponentFile(testFile, testContent);
      
      if (testWriteResult) {
        result.files.push(testFile);
      } else {
        result.errors.push(`Failed to write test file: ${testFile}`);
      }
      
      // A11y test if using a11y template
      if (templateType === 'a11y') {
        const a11yTestFile = path.join(testPath, `${componentName}.a11y.test.jsx`);
        
        const a11yTestContent = generateComponentTest({
          componentName,
          componentFile: `../${componentName}.jsx`,
          testType: 'a11y',
          testProps: customProps
        });
        
        const a11yTestWriteResult = writeComponentFile(a11yTestFile, a11yTestContent);
        
        if (a11yTestWriteResult) {
          result.files.push(a11yTestFile);
        } else {
          result.errors.push(`Failed to write a11y test file: ${a11yTestFile}`);
        }
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(`Error generating component: ${error.message}`);
    return result;
  }
};

export default {
  generateComponent,
  generateComponentTest,
  writeComponentFile,
  generateCompleteComponent
};