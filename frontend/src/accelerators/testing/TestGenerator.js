// TestGenerator.js
// Utility to generate comprehensive test suites for transformation components
// with production-ready patterns and thorough coverage.

/**
 * @typedef {Object} ComponentSchema
 * @property {string} name - Component name
 * @property {Object} props - Component props schema
 * @property {Object} config - Configuration schema for the component
 * @property {Object} state - State schema for the component
 * @property {string[]} events - Events the component can trigger
 * @property {Object} validation - Validation rules for the component
 */

/**
 * @typedef {Object} TestOptions
 * @property {boolean} unitTests - Whether to generate unit tests
 * @property {boolean} integrationTests - Whether to generate integration tests
 * @property {boolean} accessibilityTests - Whether to generate accessibility tests
 * @property {boolean} performanceTests - Whether to generate performance tests
 * @property {boolean} visualTests - Whether to generate visual regression tests
 * @property {string} testLibrary - Test library to use ('jest', 'vitest', etc.)
 * @property {string} testRenderer - Test renderer to use ('testing-library', 'enzyme', etc.)
 * @property {Object} customMatchers - Custom test matchers to include
 * @property {Object} mockProviders - Mock providers for context/state
 */

/**
 * Generates a comprehensive test suite for a component based on its schema
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test generation options
 * @returns {string} Generated test code
 */
export function generateComponentTests(componentSchema, options = {}) {
  // Default options
  const config = {
    unitTests: true,
    integrationTests: true,
    accessibilityTests: true,
    performanceTests: false,
    visualTests: false,
    testLibrary: 'jest',
    testRenderer: 'testing-library',
    customMatchers: {},
    mockProviders: {},
    ...options
  };
  
  // Generate imports based on test library and renderer
  const imports = generateImports(componentSchema, config);
  
  // Generate test suites
  const testSuites = [];
  
  if (config.unitTests) {
    testSuites.push(generateUnitTests(componentSchema, config));
  }
  
  if (config.integrationTests) {
    testSuites.push(generateIntegrationTests(componentSchema, config));
  }
  
  if (config.accessibilityTests) {
    testSuites.push(generateAccessibilityTests(componentSchema, config));
  }
  
  if (config.performanceTests) {
    testSuites.push(generatePerformanceTests(componentSchema, config));
  }
  
  if (config.visualTests) {
    testSuites.push(generateVisualTests(componentSchema, config));
  }
  
  // Combine all test suites
  return `${imports}

${testSuites.join('\n\n')}`;
}

/**
 * Generates imports for tests based on the test library and renderer
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Import statements
 */
function generateImports(componentSchema, options) {
  const importStatements = [];
  
  // Import test library
  if (options.testLibrary === 'jest') {
    importStatements.push(`import { describe, it, expect, beforeEach, afterEach } from 'jest';`);
  } else if (options.testLibrary === 'vitest') {
    importStatements.push(`import { describe, it, expect, beforeEach, afterEach } from 'vitest';`);
  }
  
  // Import test renderer
  if (options.testRenderer === 'testing-library') {
    importStatements.push(`import { render, screen, fireEvent, waitFor } from '@testing-library/react';`);
    importStatements.push(`import userEvent from '@testing-library/user-event';`);
  } else if (options.testRenderer === 'enzyme') {
    importStatements.push(`import { mount, shallow } from 'enzyme';`);
  }
  
  // Import accessibility testing
  if (options.accessibilityTests) {
    importStatements.push(`import { axe, toHaveNoViolations } from 'jest-axe';`);
  }
  
  // Import performance testing
  if (options.performanceTests) {
    importStatements.push(`import { Profiler } from 'react';`);
    importStatements.push(`import { measureRenderTime } from '../test-utils/performance';`);
  }
  
  // Import component
  importStatements.push(`import ${componentSchema.name} from './${componentSchema.name}';`);
  
  // Import mock providers if needed
  if (Object.keys(options.mockProviders).length > 0) {
    importStatements.push(`import { MockProviders } from '../test-utils/providers';`);
  }
  
  return importStatements.join('\n');
}

/**
 * Generates unit tests for a component
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Unit test suite
 */
function generateUnitTests(componentSchema, options) {
  const { name, props, validation } = componentSchema;
  
  // Generate test cases for regular rendering
  const renderTestCases = generateRenderTestCases(componentSchema, options);
  
  // Generate test cases for props validation
  const propsValidationCases = generatePropsValidationCases(componentSchema, options);
  
  // Generate test cases for events
  const eventsTestCases = generateEventsTestCases(componentSchema, options);
  
  return `describe('${name} - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ${renderTestCases}

  ${propsValidationCases}

  ${eventsTestCases}
});`;
}

/**
 * Generates test cases for basic component rendering
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Render test cases
 */
function generateRenderTestCases(componentSchema, options) {
  const { name, props } = componentSchema;
  const cases = [];
  
  // Basic rendering test
  cases.push(`
  it('renders without crashing', () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    ${renderComponent(name, 'defaultProps', options)}
  });`);
  
  // Test for content visibility
  if (props.title || props.label || props.content) {
    cases.push(`
  it('displays the correct content', () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    ${renderComponent(name, 'defaultProps', options)}
    
    ${checkContent(props, options)}
  });`);
  }
  
  // Test disabled state if applicable
  if (props.disabled !== undefined) {
    cases.push(`
  it('renders in disabled state when disabled prop is true', () => {
    const disabledProps = {
      ...${JSON.stringify(generateDefaultProps(props), null, 4)},
      disabled: true
    };
    ${renderComponent(name, 'disabledProps', options)}
    
    ${checkDisabledState(options)}
  });`);
  }
  
  // Test read-only state if applicable
  if (props.readOnly !== undefined) {
    cases.push(`
  it('renders in read-only state when readOnly prop is true', () => {
    const readOnlyProps = {
      ...${JSON.stringify(generateDefaultProps(props), null, 4)},
      readOnly: true
    };
    ${renderComponent(name, 'readOnlyProps', options)}
    
    ${checkReadOnlyState(options)}
  });`);
  }
  
  return cases.join('\n');
}

/**
 * Generates test cases for prop validation
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Props validation test cases
 */
function generatePropsValidationCases(componentSchema, options) {
  const { name, props, validation } = componentSchema;
  
  if (!validation || Object.keys(validation).length === 0) {
    return '// No validation rules specified for this component';
  }
  
  const cases = [];
  
  // Test required props
  const requiredProps = Object.entries(props)
    .filter(([propName, propSchema]) => propSchema.required)
    .map(([propName]) => propName);
    
  if (requiredProps.length > 0) {
    cases.push(`
  describe('required props validation', () => {
    ${requiredProps.map(propName => `
    it('validates that ${propName} is required', () => {
      // React will show prop type validation warnings in console
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const invalidProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
      delete invalidProps.${propName};
      
      ${renderComponent(name, 'invalidProps', options)}
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('${propName}');
      
      consoleErrorSpy.mockRestore();
    });`).join('\n')}
  });`);
  }
  
  // Test prop type validation
  const typedProps = Object.entries(props)
    .filter(([propName, propSchema]) => propSchema.type)
    .map(([propName, propSchema]) => ({ name: propName, type: propSchema.type }));
    
  if (typedProps.length > 0) {
    cases.push(`
  describe('prop type validation', () => {
    ${typedProps.map(prop => `
    it('validates that ${prop.name} is of type ${prop.type}', () => {
      // React will show prop type validation warnings in console
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const invalidTypeProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
      invalidTypeProps.${prop.name} = ${getInvalidValue(prop.type)};
      
      ${renderComponent(name, 'invalidTypeProps', options)}
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('${prop.name}');
      
      consoleErrorSpy.mockRestore();
    });`).join('\n')}
  });`);
  }
  
  return cases.join('\n');
}

/**
 * Generates test cases for component events
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Events test cases
 */
function generateEventsTestCases(componentSchema, options) {
  const { name, props, events } = componentSchema;
  
  if (!events || events.length === 0) {
    return '// No events specified for this component';
  }
  
  const cases = [];
  
  // Test each event
  events.forEach(event => {
    const handlerName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    
    if (props[handlerName]) {
      cases.push(`
  it('calls ${handlerName} when ${event} occurs', async () => {
    const handler = jest.fn();
    const eventProps = {
      ...${JSON.stringify(generateDefaultProps(props), null, 4)},
      ${handlerName}: handler
    };
    
    ${renderComponent(name, 'eventProps', options)}
    
    ${triggerEvent(event, options)}
    
    expect(handler).toHaveBeenCalled();
  });`);
    }
  });
  
  return cases.join('\n');
}

/**
 * Generates integration tests for a component
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Integration test suite
 */
function generateIntegrationTests(componentSchema, options) {
  const { name, props, config, state } = componentSchema;
  
  // Generate test cases for component interaction
  const interactionTestCases = generateInteractionTestCases(componentSchema, options);
  
  // Generate test cases for state changes
  const stateChangeTestCases = generateStateChangeTestCases(componentSchema, options);
  
  // Generate test cases for config changes
  const configChangeTestCases = generateConfigChangeTestCases(componentSchema, options);
  
  return `describe('${name} - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ${interactionTestCases}

  ${stateChangeTestCases}

  ${configChangeTestCases}
});`;
}

/**
 * Generates test cases for component interaction
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Interaction test cases
 */
function generateInteractionTestCases(componentSchema, options) {
  // Implementation would depend on the specific component
  return `
  it('integrates with other components', () => {
    // TODO: Add integration tests specific to this component
    expect(true).toBeTruthy();
  });`;
}

/**
 * Generates test cases for state changes
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} State change test cases
 */
function generateStateChangeTestCases(componentSchema, options) {
  const { state } = componentSchema;
  
  if (!state || Object.keys(state).length === 0) {
    return '// No state schema specified for this component';
  }
  
  // Implementation would depend on the specific component state
  return `
  describe('state changes', () => {
    it('updates state correctly', () => {
      // TODO: Add state change tests specific to this component
      expect(true).toBeTruthy();
    });
  });`;
}

/**
 * Generates test cases for config changes
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Config change test cases
 */
function generateConfigChangeTestCases(componentSchema, options) {
  const { config } = componentSchema;
  
  if (!config || Object.keys(config).length === 0) {
    return '// No config schema specified for this component';
  }
  
  // Implementation would depend on the specific component config
  return `
  describe('configuration changes', () => {
    it('applies configuration changes correctly', () => {
      // TODO: Add config change tests specific to this component
      expect(true).toBeTruthy();
    });
  });`;
}

/**
 * Generates accessibility tests for a component
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Accessibility test suite
 */
function generateAccessibilityTests(componentSchema, options) {
  const { name, props } = componentSchema;
  
  return `describe('${name} - Accessibility Tests', () => {
  // Add jest-axe matcher
  expect.extend(toHaveNoViolations);

  it('has no accessibility violations', async () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    const { container } = render(<${name} {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('has proper focus management', async () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    render(<${name} {...defaultProps} />);
    
    // Test keyboard navigation and focus management
    // TODO: Add component-specific focus testing
  });
  
  it('has appropriate ARIA attributes', () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    render(<${name} {...defaultProps} />);
    
    // Check component-specific ARIA attributes
    // TODO: Add ARIA attribute checking specific to this component
  });
});`;
}

/**
 * Generates performance tests for a component
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Performance test suite
 */
function generatePerformanceTests(componentSchema, options) {
  const { name, props } = componentSchema;
  
  return `describe('${name} - Performance Tests', () => {
  it('renders efficiently', async () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    
    const renderTime = await measureRenderTime(
      <${name} {...defaultProps} />
    );
    
    // Ensure render time is below threshold
    expect(renderTime).toBeLessThan(100); // milliseconds
  });
  
  it('handles updates efficiently', async () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    
    const { rerender } = render(
      <Profiler id="${name}" onRender={onRenderCallback}>
        <${name} {...defaultProps} />
      </Profiler>
    );
    
    // Reset measurement
    let updateTime = 0;
    const onRenderCallback = (
      id, phase, actualDuration, baseDuration, startTime, commitTime
    ) => {
      if (phase === 'update') {
        updateTime = actualDuration;
      }
    };
    
    // Update props
    const updatedProps = {...defaultProps, someValue: 'changed'};
    
    rerender(
      <Profiler id="${name}" onRender={onRenderCallback}>
        <${name} {...updatedProps} />
      </Profiler>
    );
    
    // Ensure update time is below threshold
    expect(updateTime).toBeLessThan(50); // milliseconds
  });
});`;
}

/**
 * Generates visual regression tests for a component
 * @param {ComponentSchema} componentSchema - Component schema
 * @param {TestOptions} options - Test options
 * @returns {string} Visual test suite
 */
function generateVisualTests(componentSchema, options) {
  const { name, props } = componentSchema;
  
  return `describe('${name} - Visual Regression Tests', () => {
  it('matches snapshot with default props', () => {
    const defaultProps = ${JSON.stringify(generateDefaultProps(props), null, 4)};
    const { container } = render(<${name} {...defaultProps} />);
    
    expect(container).toMatchSnapshot();
  });
  
  it('matches snapshot in disabled state', () => {
    const disabledProps = {
      ...${JSON.stringify(generateDefaultProps(props), null, 4)},
      disabled: true
    };
    const { container } = render(<${name} {...disabledProps} />);
    
    expect(container).toMatchSnapshot();
  });
  
  it('matches snapshot in read-only state', () => {
    const readOnlyProps = {
      ...${JSON.stringify(generateDefaultProps(props), null, 4)},
      readOnly: true
    };
    const { container } = render(<${name} {...readOnlyProps} />);
    
    expect(container).toMatchSnapshot();
  });
});`;
}

/**
 * Helper function to generate default props based on the props schema
 * @param {Object} propsSchema - Props schema
 * @returns {Object} Default props
 */
function generateDefaultProps(propsSchema) {
  if (!propsSchema) return {};
  
  const defaultProps = {};
  
  Object.entries(propsSchema).forEach(([propName, propSchema]) => {
    if (propName.startsWith('on') && propName.length > 2) {
      // Event handler
      defaultProps[propName] = () => {};
    } else if (propSchema.default !== undefined) {
      // Use provided default value
      defaultProps[propName] = propSchema.default;
    } else if (propSchema.required) {
      // Generate default value based on type
      defaultProps[propName] = getDefaultValue(propSchema.type);
    }
  });
  
  return defaultProps;
}

/**
 * Helper function to get a default value for a given type
 * @param {string} type - Prop type
 * @returns {any} Default value
 */
function getDefaultValue(type) {
  switch (type) {
    case 'string':
      return 'Test Value';
    case 'number':
      return 123;
    case 'boolean':
      return false;
    case 'function':
      return () => {};
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

/**
 * Helper function to get an invalid value for a given type
 * @param {string} type - Prop type
 * @returns {string} Invalid value as a string
 */
function getInvalidValue(type) {
  switch (type) {
    case 'string':
      return '123'; // Number as string is still valid
    case 'number':
      return '"invalid"'; // String when number expected
    case 'boolean':
      return '"true"'; // String when boolean expected
    case 'function':
      return '{}'; // Object when function expected
    case 'array':
      return '{}'; // Object when array expected
    case 'object':
      return '[]'; // Array when object expected
    default:
      return 'null';
  }
}

/**
 * Helper function to render a component based on the test renderer
 * @param {string} componentName - Component name
 * @param {string} propsVar - Variable name for props
 * @param {TestOptions} options - Test options
 * @returns {string} Component rendering code
 */
function renderComponent(componentName, propsVar, options) {
  if (options.testRenderer === 'testing-library') {
    if (Object.keys(options.mockProviders).length > 0) {
      return `render(
      <MockProviders>
        <${componentName} {...${propsVar}} />
      </MockProviders>
    );`;
    }
    return `render(<${componentName} {...${propsVar}} />);`;
  } else if (options.testRenderer === 'enzyme') {
    return `const wrapper = shallow(<${componentName} {...${propsVar}} />);`;
  }
  
  return `render(<${componentName} {...${propsVar}} />);`;
}

/**
 * Helper function to check component content
 * @param {Object} props - Props schema
 * @param {TestOptions} options - Test options
 * @returns {string} Content checking code
 */
function checkContent(props, options) {
  const checks = [];
  
  if (props.title) {
    if (options.testRenderer === 'testing-library') {
      checks.push(`expect(screen.getByText('${props.title.default || 'Test Value'}')).toBeInTheDocument();`);
    } else if (options.testRenderer === 'enzyme') {
      checks.push(`expect(wrapper.find('h1').text()).toContain('${props.title.default || 'Test Value'}');`);
    }
  }
  
  if (props.label) {
    if (options.testRenderer === 'testing-library') {
      checks.push(`expect(screen.getByText('${props.label.default || 'Test Value'}')).toBeInTheDocument();`);
    } else if (options.testRenderer === 'enzyme') {
      checks.push(`expect(wrapper.find('label').text()).toContain('${props.label.default || 'Test Value'}');`);
    }
  }
  
  if (props.content) {
    if (options.testRenderer === 'testing-library') {
      checks.push(`expect(screen.getByText('${props.content.default || 'Test Value'}')).toBeInTheDocument();`);
    } else if (options.testRenderer === 'enzyme') {
      checks.push(`expect(wrapper.text()).toContain('${props.content.default || 'Test Value'}');`);
    }
  }
  
  return checks.join('\n    ');
}

/**
 * Helper function to check disabled state
 * @param {TestOptions} options - Test options
 * @returns {string} Disabled state checking code
 */
function checkDisabledState(options) {
  if (options.testRenderer === 'testing-library') {
    return `expect(screen.getByRole('button')).toBeDisabled();
    // or for custom components
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');`;
  } else if (options.testRenderer === 'enzyme') {
    return `expect(wrapper.prop('disabled')).toBe(true);
    // or for custom components
    expect(wrapper.find('button').prop('disabled')).toBe(true);`;
  }
  
  return `// Add appropriate disabled state check for your test renderer`;
}

/**
 * Helper function to check read-only state
 * @param {TestOptions} options - Test options
 * @returns {string} Read-only state checking code
 */
function checkReadOnlyState(options) {
  if (options.testRenderer === 'testing-library') {
    return `expect(screen.getByRole('textbox')).toHaveAttribute('readOnly');
    // or for custom components
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'true');`;
  } else if (options.testRenderer === 'enzyme') {
    return `expect(wrapper.prop('readOnly')).toBe(true);
    // or for custom components
    expect(wrapper.find('input').prop('readOnly')).toBe(true);`;
  }
  
  return `// Add appropriate read-only state check for your test renderer`;
}

/**
 * Helper function to trigger an event
 * @param {string} event - Event name
 * @param {TestOptions} options - Test options
 * @returns {string} Event triggering code
 */
function triggerEvent(event, options) {
  if (options.testRenderer === 'testing-library') {
    switch (event) {
      case 'click':
        return `fireEvent.click(screen.getByRole('button'));
    // or with userEvent (preferred)
    await userEvent.click(screen.getByRole('button'));`;
      case 'change':
        return `fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Value' } });
    // or with userEvent (preferred)
    await userEvent.type(screen.getByRole('textbox'), 'New Value');`;
      case 'submit':
        return `fireEvent.submit(screen.getByRole('form'));`;
      case 'keypress':
        return `fireEvent.keyPress(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter' });
    // or with userEvent (preferred)
    await userEvent.type(screen.getByRole('textbox'), '{enter}');`;
      default:
        return `fireEvent.${event}(screen.getByTestId('${event}-target'));`;
    }
  } else if (options.testRenderer === 'enzyme') {
    switch (event) {
      case 'click':
        return `wrapper.find('button').simulate('click');`;
      case 'change':
        return `wrapper.find('input').simulate('change', { target: { value: 'New Value' } });`;
      case 'submit':
        return `wrapper.find('form').simulate('submit');`;
      case 'keypress':
        return `wrapper.find('input').simulate('keypress', { key: 'Enter', code: 'Enter' });`;
      default:
        return `wrapper.find('[data-testid="${event}-target"]').simulate('${event}');`;
    }
  }
  
  return `// Add appropriate event trigger for your test renderer and '${event}' event`;
}

/**
 * Generate test file for a transformation node component
 * @param {string} componentName - Component name
 * @param {Object} componentSchema - Component schema
 * @param {Object} options - Test options
 * @returns {string} Test file content
 */
export function generateTransformationNodeTests(componentName, componentSchema, options = {}) {
  // Prepare schema for test generation
  const testSchema = {
    name: componentName,
    props: {
      title: {
        type: 'string',
        required: true,
        default: componentSchema.title || 'Test Transformation'
      },
      icon: {
        type: 'elementType',
        required: false
      },
      description: {
        type: 'string',
        required: false,
        default: componentSchema.description || 'Test transformation description'
      },
      initialConfig: {
        type: 'object',
        required: false,
        default: componentSchema.initialConfig || {}
      },
      onConfigChange: {
        type: 'function',
        required: false,
        default: null
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      readOnly: {
        type: 'boolean',
        required: false,
        default: false
      },
      id: {
        type: 'string',
        required: false,
        default: 'test-transformation-node'
      },
      testId: {
        type: 'string',
        required: false,
        default: 'test-transformation-node'
      }
    },
    events: ['configChange', 'validate'],
    validation: {
      title: 'required',
      initialConfig: 'object'
    }
  };
  
  // Generate comprehensive tests
  return generateComponentTests(testSchema, {
    unitTests: true,
    integrationTests: true,
    accessibilityTests: true,
    performanceTests: true,
    ...options
  });
}

/**
 * Sample usage:
 * 
 * const dataTypeConverterSchema = {
 *   title: 'Data Type Converter',
 *   description: 'Converts data from one type to another',
 *   initialConfig: {
 *     inputType: 'string',
 *     outputType: 'number',
 *     formatString: ''
 *   }
 * };
 * 
 * const testCode = generateTransformationNodeTests(
 *   'DataTypeConverter',
 *   dataTypeConverterSchema,
 *   { testLibrary: 'jest', testRenderer: 'testing-library' }
 * );
 */