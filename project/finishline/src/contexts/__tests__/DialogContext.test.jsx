/**
 * DialogContext Tests
 * 
 * Tests for the DialogContext provider and hooks.
 */

import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DialogProvider, useDialog, useSpecificDialog } from '../DialogContext';

// Test component that uses the dialog context to manage a single dialog
const TestDialog = ({ id = 'test-dialog' }) => {
  const { isOpen, props, open, close } = useSpecificDialog(id);
  
  return (
    <div data-testid="dialog-test">
      {isOpen && (
        <dialog data-testid="dialog" open>
          <h1>{props.title || 'Dialog'}</h1>
          <p>{props.content || 'Dialog content'}</p>
          <button onClick={close} data-testid="close-button">Close</button>
        </dialog>
      )}
      <button 
        onClick={() => open({ title: 'Test Dialog', content: 'This is a test dialog' })} 
        data-testid="open-button"
      >
        Open Dialog
      </button>
    </div>
  );
};

// Test component that uses multiple dialogs
const MultipleDialogsTest = () => {
  const { openDialog, closeDialog } = useDialog();
  const dialog1 = useSpecificDialog('dialog1');
  const dialog2 = useSpecificDialog('dialog2');
  
  return (
    <div data-testid="multi-dialog-test">
      {dialog1.isOpen && (
        <dialog data-testid="dialog1" open>
          <h1>{dialog1.props.title || 'Dialog 1'}</h1>
          <button onClick={dialog1.close} data-testid="close-dialog1">Close</button>
        </dialog>
      )}
      
      {dialog2.isOpen && (
        <dialog data-testid="dialog2" open>
          <h1>{dialog2.props.title || 'Dialog 2'}</h1>
          <button onClick={dialog2.close} data-testid="close-dialog2">Close</button>
        </dialog>
      )}
      
      <button 
        onClick={() => openDialog('dialog1', { title: 'First Dialog' })} 
        data-testid="open-dialog1"
      >
        Open Dialog 1
      </button>
      
      <button 
        onClick={() => openDialog('dialog2', { title: 'Second Dialog' })} 
        data-testid="open-dialog2"
      >
        Open Dialog 2
      </button>
      
      <button 
        onClick={() => {
          closeDialog('dialog1');
          closeDialog('dialog2');
        }} 
        data-testid="close-all"
      >
        Close All
      </button>
    </div>
  );
};

// Wrapper for testing hooks
const wrapper = ({ children }) => <DialogProvider>{children}</DialogProvider>;

describe('DialogContext', () => {
  // Provider tests
  describe('DialogProvider', () => {
    it('renders children without dialogs by default', () => {
      render(
        <DialogProvider>
          <div data-testid="child">Child Content</div>
        </DialogProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });
  
  // useDialog hook tests
  describe('useDialog', () => {
    it('returns the dialog management functions', () => {
      const { result } = renderHook(() => useDialog(), { wrapper });
      
      expect(result.current.dialogs).toEqual({});
      expect(typeof result.current.openDialog).toBe('function');
      expect(typeof result.current.closeDialog).toBe('function');
      expect(typeof result.current.updateDialog).toBe('function');
    });
    
    it('can open and close dialogs', () => {
      const { result } = renderHook(() => useDialog(), { wrapper });
      
      // Open a dialog
      act(() => {
        result.current.openDialog('test', { title: 'Test' });
      });
      
      expect(result.current.dialogs).toHaveProperty('test');
      expect(result.current.dialogs.test.isOpen).toBe(true);
      expect(result.current.dialogs.test.props).toEqual({ title: 'Test' });
      
      // Close the dialog
      act(() => {
        result.current.closeDialog('test');
      });
      
      expect(result.current.dialogs.test.isOpen).toBe(false);
    });
    
    it('can update dialog props', () => {
      const { result } = renderHook(() => useDialog(), { wrapper });
      
      // Open a dialog with initial props
      act(() => {
        result.current.openDialog('test', { title: 'Initial Title', count: 0 });
      });
      
      expect(result.current.dialogs.test.props).toEqual({ title: 'Initial Title', count: 0 });
      
      // Update props
      act(() => {
        result.current.updateDialog('test', { title: 'Updated Title', newProp: true });
      });
      
      // Check that props were merged correctly
      expect(result.current.dialogs.test.props).toEqual({
        title: 'Updated Title', // updated
        count: 0, // preserved
        newProp: true, // added
      });
    });
    
    it('does nothing when trying to update non-existent dialog', () => {
      const { result } = renderHook(() => useDialog(), { wrapper });
      
      // Try to update non-existent dialog
      act(() => {
        result.current.updateDialog('nonexistent', { title: 'Should Not Exist' });
      });
      
      // State should be unchanged
      expect(result.current.dialogs).toEqual({});
    });
    
    it('throws an error when used outside of DialogProvider', () => {
      // Suppress console.error for this test to avoid noisy output
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useDialog());
      }).toThrow('useDialog must be used within a DialogProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });
  
  // useSpecificDialog hook tests
  describe('useSpecificDialog', () => {
    it('returns methods for a specific dialog', () => {
      const { result } = renderHook(() => useSpecificDialog('specific'), { wrapper });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.props).toEqual({});
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.update).toBe('function');
    });
    
    it('can open and close a specific dialog', () => {
      const { result } = renderHook(() => useSpecificDialog('specific'), { wrapper });
      
      // Open the dialog
      act(() => {
        result.current.open({ message: 'Hello' });
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.props).toEqual({ message: 'Hello' });
      
      // Close the dialog
      act(() => {
        result.current.close();
      });
      
      expect(result.current.isOpen).toBe(false);
      // Props should still be available even when closed
      expect(result.current.props).toEqual({ message: 'Hello' });
    });
    
    it('can update a specific dialog', () => {
      const { result } = renderHook(() => useSpecificDialog('specific'), { wrapper });
      
      // Open with initial props
      act(() => {
        result.current.open({ message: 'Initial' });
      });
      
      expect(result.current.props).toEqual({ message: 'Initial' });
      
      // Update props
      act(() => {
        result.current.update({ message: 'Updated', extra: true });
      });
      
      expect(result.current.props).toEqual({ message: 'Updated', extra: true });
    });
  });
  
  // Integration tests with components
  describe('Dialog components integration', () => {
    it('can open and close a dialog through the component', () => {
      render(<TestDialog />, { wrapper: DialogProvider });
      
      // Dialog should be closed initially
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      
      // Open the dialog
      fireEvent.click(screen.getByTestId('open-button'));
      
      // Dialog should now be open
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toHaveTextContent('Test Dialog');
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
      
      // Close the dialog
      fireEvent.click(screen.getByTestId('close-button'));
      
      // Dialog should be closed again
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
    
    it('can manage multiple dialogs independently', () => {
      render(<MultipleDialogsTest />, { wrapper: DialogProvider });
      
      // Both dialogs should be closed initially
      expect(screen.queryByTestId('dialog1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dialog2')).not.toBeInTheDocument();
      
      // Open dialog 1
      fireEvent.click(screen.getByTestId('open-dialog1'));
      
      expect(screen.getByTestId('dialog1')).toBeInTheDocument();
      expect(screen.queryByTestId('dialog2')).not.toBeInTheDocument();
      expect(screen.getByTestId('dialog1')).toHaveTextContent('First Dialog');
      
      // Open dialog 2 while dialog 1 is still open
      fireEvent.click(screen.getByTestId('open-dialog2'));
      
      expect(screen.getByTestId('dialog1')).toBeInTheDocument();
      expect(screen.getByTestId('dialog2')).toBeInTheDocument();
      expect(screen.getByTestId('dialog2')).toHaveTextContent('Second Dialog');
      
      // Close dialog 1
      fireEvent.click(screen.getByTestId('close-dialog1'));
      
      expect(screen.queryByTestId('dialog1')).not.toBeInTheDocument();
      expect(screen.getByTestId('dialog2')).toBeInTheDocument();
      
      // Close all dialogs
      fireEvent.click(screen.getByTestId('close-all'));
      
      expect(screen.queryByTestId('dialog1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dialog2')).not.toBeInTheDocument();
    });
  });
});