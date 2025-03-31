/**
 * Modal Tests
 * 
 * Tests for the Modal component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../Modal';

// Mock createPortal to make it work with testing-library
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node) => node,
  };
});

describe('Modal', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders when open is true', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <Modal open={false} onClose={() => {}}>
          Modal content
        </Modal>
      );
      
      expect(screen.queryByTestId('tap-modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders with a title', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Modal Title">
          Modal content
        </Modal>
      );
      
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toHaveTextContent('Modal Title');
    });

    it('renders with a close button when onClose is provided', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal-close-button')).toBeInTheDocument();
    });

    it('renders with footer content', () => {
      const footer = <button>Save</button>;
      render(
        <Modal open={true} onClose={() => {}} footer={footer}>
          Modal content
        </Modal>
      );
      
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      render(
        <Modal open={true} onClose={() => {}} size="large">
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal').classList.contains('tap-modal--large')).toBe(true);
    });

    it('renders as full width', () => {
      render(
        <Modal open={true} onClose={() => {}} fullWidth>
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal').classList.contains('tap-modal--fullwidth')).toBe(true);
    });

    it('renders with custom className', () => {
      render(
        <Modal open={true} onClose={() => {}} className="custom-class">
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal').classList.contains('custom-class')).toBe(true);
    });

    it('renders with custom backdropClassName', () => {
      render(
        <Modal open={true} onClose={() => {}} backdropClassName="custom-backdrop">
          Modal content
        </Modal>
      );
      
      expect(screen.getByTestId('tap-modal-backdrop').classList.contains('custom-backdrop')).toBe(true);
    });
  });

  // Event handler tests
  describe('event handlers', () => {
    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose}>
          Modal content
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('tap-modal-close-button'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked and closeOnBackdropClick is true', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnBackdropClick={true}>
          Modal content
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('tap-modal-backdrop'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when backdrop is clicked and closeOnBackdropClick is false', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnBackdropClick={false}>
          Modal content
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('tap-modal-backdrop'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when escape key is pressed and closeOnEscape is true', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnEscape={true}>
          Modal content
        </Modal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when escape key is pressed and closeOnEscape is false', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose} closeOnEscape={false}>
          Modal content
        </Modal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });
    
    it('does not call onClose when clicking on the modal content', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose}>
          <div data-testid="modal-content">Modal content</div>
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('modal-content'));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Accessible Modal">
          Modal content
        </Modal>
      );
      
      const modal = screen.getByTestId('tap-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('has aria-labelledby only when title is provided', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          Modal content
        </Modal>
      );
      
      const modal = screen.getByTestId('tap-modal');
      expect(modal).not.toHaveAttribute('aria-labelledby');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to modal content element', () => {
      const ref = React.createRef();
      render(
        <Modal open={true} onClose={() => {}} ref={ref}>
          Modal content
        </Modal>
      );
      
      expect(ref.current).toBe(screen.getByTestId('tap-modal'));
    });
  });
});