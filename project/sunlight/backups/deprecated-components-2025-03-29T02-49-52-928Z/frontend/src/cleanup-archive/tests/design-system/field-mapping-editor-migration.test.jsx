import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FieldMappingEditor from '../../components/integration/FieldMappingEditor';

// Mock the integration service
jest.mock('../../services/integrationService', () => ({
  getFieldMappings: jest.fn().mockResolvedValue([]),
  createFieldMapping: jest.fn(),
  updateFieldMapping: jest.fn(),
  deleteFieldMapping: jest.fn(),
  discoverFields: jest.fn().mockResolvedValue([]),
  getTransformations: jest
    .fn()
    .mockResolvedValue([{ name: 'direct', description: 'Direct (No transformation)' }]),
}));

describe('FieldMappingEditor Migration', () => {
  const props = {
    integrationId: '123',
    onUpdate: jest.fn(),
  };

  it('renders with legacy design system components', () => {
    render(<FieldMappingEditor {...props} />);

    // Check if the main component is rendered
    expect(screen.getByText('Field Mappings')).toBeInTheDocument();

    // Check if legacy Card is rendered
    expect(screen.getByText('Field Mappings').closest('.CardLegacy-root')).toBeInTheDocument();

    // Check if legacy Button is rendered
    expect(screen.getByText('Add Mapping').closest('.ButtonLegacy-root')).toBeInTheDocument();
  });

  it('opens the dialog with legacy components when Add Mapping is clicked', async () => {
    render(<FieldMappingEditor {...props} />);

    // Click add mapping button
    fireEvent.click(screen.getByText('Add Mapping'));

    // Check if the dialog is open with legacy Dialog
    expect(screen.getByText('Add Field Mapping')).toBeInTheDocument();
    expect(screen.getByText('Add Field Mapping').closest('.DialogLegacy-root')).toBeInTheDocument();

    // Check if legacy SelectLegacy is rendered
    const sourceFieldSelect = screen.getByLabelText('Source Field');
    expect(sourceFieldSelect.closest('.SelectLegacy-root')).toBeInTheDocument();

    // Check if legacy TextField is rendered
    const descriptionField = screen.getByLabelText('Description (Optional)');
    expect(descriptionField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Check if legacy Button is rendered in the dialog
    expect(screen.getByText('Save').closest('.ButtonLegacy-root')).toBeInTheDocument();
  });
});
