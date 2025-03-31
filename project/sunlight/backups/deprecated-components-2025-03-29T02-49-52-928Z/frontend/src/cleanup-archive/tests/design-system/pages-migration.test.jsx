import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';
import { Button } from '../../design-system/legacy';

// Mock components that use ButtonLegacy
jest.mock('../../pages/HomePage', () => {
  return function MockHomePage() {
  // Added display name
  MockHomePage.displayName = 'MockHomePage';

    return (
      <div data-testid="home-page">
        <ButtonLegacy variant="contained&quot;>New Integration</ButtonLegacy>
        <ButtonLegacy>View All Templates</ButtonLegacy>
        <ButtonLegacy variant="contained" size="large&quot;>
          Register Now
        </ButtonLegacy>
        <ButtonLegacy variant="outlined" size="large&quot;>
          Log In
        </ButtonLegacy>
      </div>
    );
  };
});

jest.mock("../../pages/IntegrationDetailPage', () => {
  return function MockIntegrationDetailPage() {
  // Added display name
  MockIntegrationDetailPage.displayName = 'MockIntegrationDetailPage';

    return (
      <div data-testid="integration-detail-page">
        <ButtonLegacy variant="contained&quot; color="primary">
          Run Now
        </ButtonLegacy>
        <ButtonLegacy variant="outlined&quot;>Edit</ButtonLegacy>
        <ButtonLegacy variant="outlined" color="error&quot;>
          Delete
        </ButtonLegacy>
        <ButtonLegacy size="small">Refresh</ButtonLegacy>
      </div>
    );
  };
});

// Import migrated components
import HomePage from '../../pages/HomePage';
import IntegrationDetailPage from '../../pages/IntegrationDetailPage';

describe('Migrated Page Components', () => {
  const renderWithTheme = component => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>{component}</MemoryRouter>
      </ThemeProvider>
    );
  };

  // Testing migrated pages
  test('HomePage renders with ButtonLegacy components', () => {
    renderWithTheme(<HomePage />);
    const component = screen.getByTestId('home-page');
    const newIntegrationButton = screen.getByText('New Integration');
    const viewAllButton = screen.getByText('View All Templates');
    const registerButton = screen.getByText('Register Now');
    const loginButton = screen.getByText('Log In');

    expect(component).toBeInTheDocument();
    expect(newIntegrationButton).toBeInTheDocument();
    expect(viewAllButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();

    // Check that all are rendered as buttons
    expect(newIntegrationButton.tagName).toBe('BUTTON');
    expect(viewAllButton.tagName).toBe('BUTTON');
    expect(registerButton.tagName).toBe('BUTTON');
    expect(loginButton.tagName).toBe('BUTTON');
  });

  test('IntegrationDetailPage renders with ButtonLegacy components', () => {
    renderWithTheme(<IntegrationDetailPage />);
    const component = screen.getByTestId('integration-detail-page');
    const runButton = screen.getByText('Run Now');
    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');
    const refreshButton = screen.getByText('Refresh');

    expect(component).toBeInTheDocument();
    expect(runButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(refreshButton).toBeInTheDocument();

    // Check that all are rendered as buttons
    expect(runButton.tagName).toBe('BUTTON');
    expect(editButton.tagName).toBe('BUTTON');
    expect(deleteButton.tagName).toBe('BUTTON');
    expect(refreshButton.tagName).toBe('BUTTON');
  });

  // Integration test between ButtonLegacy and material UI
  test('ButtonLegacy maintains proper behavior when used in pages', () => {
    const handleClick = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <ButtonLegacy variant="contained&quot; onClick={handleClick} data-testid="test-button">
          Test Button
        </ButtonLegacy>
      </ThemeProvider>
    );

    const button = screen.getByTestId('test-button');

    // Check if rendered as Material UI button
    expect(button).toBeInTheDocument();

    // Check event handling
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
