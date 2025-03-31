/**
 * PaginationAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Pagination from '../PaginationAdapted';

// Mock the design system Pagination component
jest.mock('@design-system/components/navigation', () => ({
  Pagination: jest.fn(({ 
    count, 
    page, 
    onChange, 
    disabled, 
    showFirstButton,
    showLastButton,
    hideNextButton,
    hidePrevButton,
    'aria-label': ariaLabel,
    ...props 
  }) => (
    <nav 
      data-testid="mock-pagination" 
      aria-label={ariaLabel || "pagination navigation"}
      data-count={count}
      data-page={page}
      data-disabled={disabled}
      data-first-button={showFirstButton}
      data-last-button={showLastButton}
    >
      {showFirstButton && (
        <button 
          data-testid="first-button" 
          onClick={() => onChange(1)}
          disabled={disabled || page === 1}
        >
          First
        </button>
      )}

      {!hidePrevButton && (
        <button 
          data-testid="prev-button" 
          onClick={() => onChange(page - 1)}
          disabled={disabled || page === 1}
        >
          Previous
        </button>
      )}

      <ul>
        {Array.from({ length: Math.min(count, 5) }, (_, i) => {
          const pageNumber = i + Math.max(1, page - 2);
          if (pageNumber > count) return null;
          return (
            <li key={pageNumber}>
              <button
                data-testid={`page-${pageNumber}`}
                onClick={() => onChange(pageNumber)}
                disabled={disabled}
                aria-current={pageNumber === page ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
      </ul>

      {!hideNextButton && (
        <button 
          data-testid="next-button" 
          onClick={() => onChange(page + 1)}
          disabled={disabled || page === count}
        >
          Next
        </button>
      )}

      {showLastButton && (
        <button 
          data-testid="last-button" 
          onClick={() => onChange(count)}
          disabled={disabled || page === count}
        >
          Last
        </button>
      )}
    </nav>
  )),
}));

describe('PaginationAdapted', () => {
  it('renders with default props', () => {
    render(<PaginationAdapted />);
    
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-count', '1');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page', '1');
  });

  it('renders with specified count and page', () => {
    render(<PaginationAdapted count={10} page={3} />);
    
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-count', '10');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page', '3');
  });

  it('uses defaultPage when page is not provided', () => {
    render(<PaginationAdapted count={10} defaultPage={5} />);
    
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page', '5');
  });

  it('handles page changes correctly', () => {
    const handleChange = jest.fn();
    render(<PaginationAdapted count={10} page={3} onChange={handleChange} />);
    
    fireEvent.click(screen.getByTestId('next-button'));
    expect(handleChange).toHaveBeenCalledWith({}, 4);
  });

  it('renders with first and last buttons when specified', () => {
    render(<PaginationAdapted count={10} page={3} showFirstButton showLastButton />);
    
    expect(screen.getByTestId('first-button')).toBeInTheDocument();
    expect(screen.getByTestId('last-button')).toBeInTheDocument();
  });

  it('can hide next and previous buttons', () => {
    render(<PaginationAdapted count={10} page={3} hideNextButton hidePrevButton />);
    
    expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prev-button')).not.toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<PaginationAdapted count={10} page={3} disabled />);
    
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('next-button')).toBeDisabled();
    expect(screen.getByTestId('prev-button')).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<PaginationAdapted className="custom-class&quot; />);
    
    expect(container.firstChild).toHaveClass("ds-pagination');
    expect(container.firstChild).toHaveClass('ds-pagination-adapted');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies proper aria attributes', () => {
    render(<PaginationAdapted ariaLabel="Custom pagination&quot; />);
    
    expect(screen.getByTestId("mock-pagination')).toHaveAttribute('aria-label', 'Custom pagination');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <PaginationAdapted 
        count={10} 
        page={3} 
        ariaLabel="Test pagination"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});