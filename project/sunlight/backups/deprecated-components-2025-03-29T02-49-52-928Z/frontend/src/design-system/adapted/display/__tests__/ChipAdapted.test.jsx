/**
 * ChipAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Chip from '../ChipAdapted';

// Mock the design system Chip component
jest.mock('@design-system/components/display', () => ({
  Chip: jest.fn(({ 
    label, 
    icon, 
    onDelete, 
    onClick, 
    disabled, 
    clickable,
    children,
    deleteIcon,
    variant,
    size,
    color,
    'aria-label': ariaLabel,
    ...props 
  }) => (
    <div 
      data-testid="mock-chip" 
      role={clickable ? 'button' : undefined}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      data-clickable={clickable}
      data-variant={variant}
      data-size={size}
      data-color={color}
      onClick={onClick}
    >
      {icon && <span data-testid="icon">{icon}</span>}
      <span data-testid="label">{label}</span>
      {onDelete && (
        <button 
          data-testid="delete-button" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          aria-label="Remove"
        >
          {deleteIcon || 'x'}
        </button>
      )}
      {children}
    </div>
  )),
}));

describe('ChipAdapted', () => {
  it('renders with basic props', () => {
    render(
      <ChipAdapted 
        label="Test Chip&quot; 
      />
    );

    expect(screen.getByTestId("mock-chip')).toBeInTheDocument();
    expect(screen.getByTestId('label')).toHaveTextContent('Test Chip');
  });

  it('renders with icon', () => {
    render(
      <ChipAdapted 
        label="Test Chip&quot; 
        icon={<span>🏷️</span>}
      />
    );

    expect(screen.getByTestId("icon')).toBeInTheDocument();
    expect(screen.getByText('🏷️')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <ChipAdapted 
        label="Clickable Chip&quot; 
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByTestId("mock-chip'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles delete events', () => {
    const handleDelete = jest.fn();
    render(
      <ChipAdapted 
        label="Deletable Chip&quot; 
        onDelete={handleDelete}
      />
    );

    fireEvent.click(screen.getByTestId("delete-button'));
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled', () => {
    render(
      <ChipAdapted 
        label="Disabled Chip&quot; 
        disabled={true}
      />
    );

    expect(screen.getByTestId("mock-chip')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies variant correctly', () => {
    render(
      <ChipAdapted 
        label="Outlined Chip&quot; 
        variant="outlined"
      />
    );

    expect(screen.getByTestId('mock-chip')).toHaveAttribute('data-variant', 'outlined');
  });

  it('applies size correctly', () => {
    render(
      <ChipAdapted 
        label="Small Chip&quot; 
        size="small"
      />
    );

    expect(screen.getByTestId('mock-chip')).toHaveAttribute('data-size', 'small');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChipAdapted 
        label="Custom Class Chip&quot; 
        className="custom-class"
      />
    );

    // container.firstChild is the mocked component wrapper
    expect(container.firstChild).toHaveClass('ds-chip');
    expect(container.firstChild).toHaveClass('ds-chip-adapted');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies accessibility attributes', () => {
    render(
      <ChipAdapted 
        label="Accessible Chip&quot; 
        ariaLabel="Accessible chip description"
      />
    );

    expect(screen.getByTestId('mock-chip')).toHaveAttribute('aria-label', 'Accessible chip description');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ChipAdapted
        label="Accessibility Test&quot;
        ariaLabel="Test chip"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});