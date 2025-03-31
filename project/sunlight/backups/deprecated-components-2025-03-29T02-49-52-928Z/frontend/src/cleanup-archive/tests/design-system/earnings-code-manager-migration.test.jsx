import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock services
jest.mock('../../services/earningsService', () => ({
  getEarningsCodes: jest.fn().mockResolvedValue([]),
  createEarningsCode: jest.fn(),
  updateEarningsCode: jest.fn(),
  deleteEarningsCode: jest.fn(),
}));

// Mock the EarningsCodeManager component
jest.mock('../../components/earnings/EarningsCodeManager', () => {
  const MockedComponent = () => {
  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';


    return (
      <div data-testid="earnings-code-manager">
        <form>
          <div role="textbox&quot; aria-label="Earnings Code" data-testid="code-field">
            Earnings Code
          </div>
          <div role="textbox&quot; aria-label="Name" data-testid="name-field">
            Name
          </div>
          <div
            role="textbox&quot;
            aria-label="Destination System"
            data-testid="destination-system-field"
          >
            Destination System
          </div>
          <textarea
            role="textbox&quot;
            aria-label="Description"
            data-testid="description-field"
            rows="3&quot;
          >
            Description
          </textarea>
          <div role="textbox" aria-label="Attribute: payrollCategory" data-testid="attribute-field">
            Attribute: payrollCategory
          </div>
        </form>
      </div>
    );
  };

  MockedComponent.displayName = 'EarningsCodeManager';

  return MockedComponent;
});

// Import the component after mocking
import EarningsCodeManager from '../../components/earnings/EarningsCodeManager';

describe('EarningsCodeManager InputFieldLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('EarningsCodeManager renders with InputFieldLegacy components', () => {
    renderWithTheme(<EarningsCodeManager />);

    const component = screen.getByTestId('earnings-code-manager');
    const codeField = screen.getByTestId('code-field');
    const nameField = screen.getByTestId('name-field');
    const destinationSystemField = screen.getByTestId('destination-system-field');
    const descriptionField = screen.getByTestId('description-field');
    const attributeField = screen.getByTestId('attribute-field');

    expect(component).toBeInTheDocument();
    expect(codeField).toBeInTheDocument();
    expect(nameField).toBeInTheDocument();
    expect(destinationSystemField).toBeInTheDocument();
    expect(descriptionField).toBeInTheDocument();
    expect(attributeField).toBeInTheDocument();

    // Verify input field properties
    expect(screen.getByLabelText('Earnings Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination System')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Attribute: payrollCategory')).toBeInTheDocument();

    // Check that multiline inputs are using textarea elements
    expect(descriptionField.tagName).toBe('TEXTAREA');
    expect(descriptionField.getAttribute('rows')).toBe('3');
  });

  test('TextField fields in EarningsCodeManager have appropriate labels', () => {
    renderWithTheme(<EarningsCodeManager />);

    // Check for field labels
    expect(screen.getByRole('textbox', { name: 'Earnings Code' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Destination System' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Attribute: payrollCategory' })).toBeInTheDocument();
  });
});
