/**
 * CustomFormulaNode.test.jsx
 * 
 * Unit tests for the CustomFormula transformation node component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomFormulaNode from '../CustomFormulaNode';

describe('CustomFormulaNode', () => {
  const mockNodeData = {
    id: 'node-1',
    type: 'CustomFormula',
    config: {
      formula: '',
      inputFieldPath: 'data.input',
      outputFieldPath: 'data.output',
      errorHandling: 'NULL'
    }
  };
  
  const mockOnChange = jest.fn();
  
  const mockSampleData = {
    id: '12345',
    name: 'Test Record',
    amount: 100,
    isActive: true,
    items: [1, 2, 3],
    metadata: {
      createdAt: '2023-01-01',
      updatedBy: 'user1'
    }
  };
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });
  
  it('renders correctly with default props', () => {
    render(
      <CustomFormulaNode
        nodeData={mockNodeData}
        onChange={mockOnChange}
      />
    );
    
    // Check title
    expect(screen.getByText('Custom Formula')).toBeInTheDocument();
    
    // Check formula editor
    expect(screen.getByTestId('formula-editor')).toBeInTheDocument();
    
    // Check configuration fields
    expect(screen.getByLabelText('Input Field')).toBeInTheDocument();
    expect(screen.getByLabelText('Output Field')).toBeInTheDocument();
    expect(screen.getByLabelText('Error Handling')).toBeInTheDocument();
  });
  
  it('renders with a provided formula', () => {
    const nodeWithFormula = {
      ...mockNodeData,
      config: {
        ...mockNodeData.config,
        formula: 'sum(1, 2, 3)'
      }
    };
    
    render(
      <CustomFormulaNode
        nodeData={nodeWithFormula}
        onChange={mockOnChange}
        sampleData={mockSampleData}
      />
    );
    
    // Check that the formula is displayed
    const formulaEditor = screen.getByTestId('formula-editor');
    expect(formulaEditor).toHaveValue('sum(1, 2, 3)');
  });
  
  it('calls onChange when formula changes', () => {
    render(
      <CustomFormulaNode
        nodeData={mockNodeData}
        onChange={mockOnChange}
      />
    );
    
    // Simulate formula input
    const formulaEditor = screen.getByTestId('formula-editor');
    fireEvent.change(formulaEditor, { target: { value: 'sum(1, 2)' } });
    
    // Check that onChange was called with updated node data
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNodeData,
      config: {
        ...mockNodeData.config,
        formula: 'sum(1, 2)'
      }
    });
  });
  
  it('shows available fields from sample data', () => {
    render(
      <CustomFormulaNode
        nodeData={mockNodeData}
        onChange={mockOnChange}
        sampleData={mockSampleData}
      />
    );
    
    // Check that fields are displayed
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('amount')).toBeInTheDocument();
    expect(screen.getByText('isActive')).toBeInTheDocument();
  });
  
  it('updates configuration when fields change', () => {
    render(
      <CustomFormulaNode
        nodeData={mockNodeData}
        onChange={mockOnChange}
      />
    );
    
    // Change input field
    const inputField = screen.getByLabelText('Input Field');
    fireEvent.change(inputField, { target: { value: 'data.newInput' } });
    
    // Check that onChange was called with updated input
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNodeData,
      config: {
        ...mockNodeData.config,
        inputFieldPath: 'data.newInput'
      }
    });
    
    // Change output field
    const outputField = screen.getByLabelText('Output Field');
    fireEvent.change(outputField, { target: { value: 'data.newOutput' } });
    
    // Check that onChange was called with updated output
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNodeData,
      config: {
        ...mockNodeData.config,
        outputFieldPath: 'data.newOutput'
      }
    });
    
    // Change error handling
    const errorHandling = screen.getByLabelText('Error Handling');
    fireEvent.change(errorHandling, { target: { value: 'DEFAULT' } });
    
    // Check that onChange was called with updated error handling
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNodeData,
      config: {
        ...mockNodeData.config,
        errorHandling: 'DEFAULT'
      }
    });
  });
});