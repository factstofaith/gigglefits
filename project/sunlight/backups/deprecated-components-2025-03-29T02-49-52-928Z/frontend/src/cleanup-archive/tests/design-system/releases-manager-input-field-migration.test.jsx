// releases-manager-input-field-migration.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReleasesManager from '../../components/admin/ReleasesManager';
import { InputField } from '../../design-system/legacy';

// Mock the dependencies
jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

jest.mock('../../services/adminService', () => ({
  getReleases: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: 'Test Release',
      description: 'Test Description',
      version: '1.0.0',
      release_date: '2025-04-15T12:00:00.000Z',
      status: 'draft',
      items: [],
      tenants: [],
      created_at: '2025-03-15T10:00:00.000Z',
      completed_at: null,
    },
  ]),
  getTenants: jest.fn().mockResolvedValue([
    { id: '1', name: 'Tenant 1' },
    { id: '2', name: 'Tenant 2' },
  ]),
  getApplications: jest.fn().mockResolvedValue([]),
  getDatasets: jest.fn().mockResolvedValue([]),
}));

// Mock the legacy components
jest.mock('../../design-system/legacy', () => ({
  SelectLegacy: jest.fn(({ children, ...props }) => (
    <select data-testid="select-legacy-mock" {...props}>
      {children}
    </select>
  )),
  InputFieldLegacy: jest.fn(({ ...props }) => (
    <input data-testid="input-field-legacy-mock" {...props} />
  )),
}));

// Mock DateTimePicker component
jest.mock('@mui/x-date-pickers', () => ({
  DateTimePicker: jest.fn(({ onChange, value, ...props }) => (
    <input
      data-testid="mock-date-picker"
      value={value ? value.toString() : ''}
      onChange={e => onChange(new Date(e.target.value))}
      {...props}
    />
  )),
  LocalizationProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: jest.fn(),
}));

describe('ReleasesManager - InputFieldLegacy Migration Tests', () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();
  });

  it('renders the component with InputFieldLegacy components', async () => {
    render(<ReleasesManager />);

    // Check search field has been converted to InputFieldLegacy
    const searchInputs = await screen.findAllByTestId('input-field-legacy-mock');
    expect(searchInputs.length).toBeGreaterThan(0);

    // Verify InputFieldLegacy was called with the correct props for search
    expect(InputFieldLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: 'Search releases...',
        fullWidth: true,
        variant: 'outlined',
      }),
      expect.anything()
    );
  });

  it('opens the create dialog and displays InputFieldLegacy components', async () => {
    render(<ReleasesManager />);

    // Click new release button
    const newReleaseButton = await screen.findByText('New Release');
    fireEvent.click(newReleaseButton);

    // Check form fields have been converted to InputFieldLegacy
    const formInputs = await screen.findAllByTestId('input-field-legacy-mock');
    expect(formInputs.length).toBeGreaterThan(3); // At least name, description, version

    // Verify InputFieldLegacy was called with the correct props for the form fields
    expect(InputFieldLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'name',
        label: 'Release Name',
        required: true,
      }),
      expect.anything()
    );

    expect(InputFieldLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'description',
        label: 'Description',
        multiline: true,
        rows: 3,
      }),
      expect.anything()
    );

    expect(InputFieldLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'version',
        label: 'Version (Semantic Versioning)',
        required: true,
        placeholder: 'e.g., 1.0.0',
      }),
      expect.anything()
    );
  });

  it('updates form data when InputFieldLegacy values change', async () => {
    render(<ReleasesManager />);

    // Click new release button
    const newReleaseButton = await screen.findByText('New Release');
    fireEvent.click(newReleaseButton);

    // Get the name input field (first input field legacy)
    const formInputs = await screen.findAllByTestId('input-field-legacy-mock');
    const nameInput = formInputs.find(input => input.name === 'name');

    // Simulate input change
    fireEvent.change(nameInput, { target: { value: 'New Test Release' } });

    // Move to next step to trigger validation
    const nextButton = await screen.findByText('Next');
    fireEvent.click(nextButton);

    // The form should proceed to next step if fields were updated correctly
    expect(await screen.findByText('Select Applications & Datasets')).toBeInTheDocument();
  });
});
