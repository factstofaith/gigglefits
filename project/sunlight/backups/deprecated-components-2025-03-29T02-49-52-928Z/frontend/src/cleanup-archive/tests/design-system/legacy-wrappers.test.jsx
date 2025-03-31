import {   Box, Typography , Box, Typography , Box, Typography } from '../../../design-system';
/**
 * Legacy Component Wrappers Tests
 *
 * This test suite validates that legacy component wrappers correctly
 * map to the new design system components while maintaining backward
 * compatibility with existing code.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';


// Import legacy wrappers
import { Button, InputField, Select } from '../../design-system/legacy';

// Import ThemeProvider for context
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';
import Box from '@mui/material/Box';
// Wrap components in ThemeProvider for tests
const TestWrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('Legacy Component Wrappers', () => {
  describe('Integration with Material UI', () => {
    test('ButtonLegacy works within Material UI components', () => {
      render(
        <TestWrapper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6&quot;>Test Form</Typography>
            <Box sx={{ mt: 2 }}>
              <ButtonLegacy>Submit</ButtonLegacy>
            </Box>
          </Paper>
        </TestWrapper>
      );

      expect(screen.getByText("Test Form')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    test('InputFieldLegacy works within Material UI components', () => {
      render(
        <TestWrapper>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Enter your information:</Typography>
            <InputFieldLegacy label="Username&quot; />
          </Box>
        </TestWrapper>
      );

      expect(screen.getByText("Enter your information:')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    test('SelectLegacy works within Material UI components', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];

      render(
        <TestWrapper>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1&quot;>Select an option:</Typography>
              <SelectLegacy options={options} />
            </Box>
          </Paper>
        </TestWrapper>
      );

      expect(screen.getByText("Select an option:')).toBeInTheDocument();

      // Open the dropdown
      fireEvent.click(screen.getByRole('combobox'));

      // Check options are displayed
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
  describe('ButtonLegacy', () => {
    test('renders button with correct text', () => {
      render(
        <TestWrapper>
          <ButtonLegacy>Click Me</ButtonLegacy>
        </TestWrapper>
      );
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(
        <TestWrapper>
          <ButtonLegacy onClick={handleClick}>Click Me</ButtonLegacy>
        </TestWrapper>
      );
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('applies disabled state correctly', () => {
      render(
        <TestWrapper>
          <ButtonLegacy disabled>Disabled Button</ButtonLegacy>
        </TestWrapper>
      );
      expect(screen.getByText('Disabled Button')).toBeDisabled();
    });
  });

  describe('InputFieldLegacy', () => {
    test('renders input with label', () => {
      render(
        <TestWrapper>
          <InputFieldLegacy label="Username&quot; />
        </TestWrapper>
      );
      expect(screen.getByText("Username')).toBeInTheDocument();
    });

    test('updates value on change', () => {
      const handleChange = jest.fn();
      render(
        <TestWrapper>
          <InputFieldLegacy label="Email&quot; value="" onChange={handleChange} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(handleChange).toHaveBeenCalled();
    });

    test('applies placeholder correctly', () => {
      render(
        <TestWrapper>
          <InputFieldLegacy placeholder="Enter your name&quot; />
        </TestWrapper>
      );
      expect(screen.getByPlaceholderText("Enter your name')).toBeInTheDocument();
    });
  });

  describe('SelectLegacy', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    test('renders select with options', () => {
      render(
        <TestWrapper>
          <SelectLegacy options={options} />
        </TestWrapper>
      );

      // The Select component opens options on click
      fireEvent.click(screen.getByRole('combobox'));

      // Options should be visible after clicking
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    test('selects option on click', () => {
      const handleChange = jest.fn();
      render(
        <TestWrapper>
          <SelectLegacy options={options} onChange={handleChange} />
        </TestWrapper>
      );

      // Open the dropdown
      fireEvent.click(screen.getByRole('combobox'));

      // Select an option
      fireEvent.click(screen.getByText('Option 2'));

      // Verify onChange was called
      expect(handleChange).toHaveBeenCalled();
    });

    test('displays placeholder when no value selected', () => {
      render(
        <TestWrapper>
          <SelectLegacy options={options} placeholder="Choose an option&quot; />
        </TestWrapper>
      );

      expect(screen.getByText("Choose an option')).toBeInTheDocument();
    });
  });
});
