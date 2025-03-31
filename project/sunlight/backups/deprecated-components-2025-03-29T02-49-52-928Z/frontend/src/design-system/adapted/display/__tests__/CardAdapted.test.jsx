import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Card from '../CardAdapted';

// Mock the Card component
jest.mock('@design-system/components/display', () => ({
  Card: jest.fn(({ 
    children, 
    ref, 
    elevation, 
    variant, 
    square, 
    className, 
    style, 
    ...props 
  }) => (
    <div 
      ref={ref}
      data-testid="mock-card"
      data-elevation={elevation}
      data-variant={variant}
      data-square={square ? 'true' : 'false'}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </div>
  )),
}));

// Mock the ErrorBoundary component
jest.mock('../../core/ErrorBoundary', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="error-boundary">{children}</div>),
}));

describe('CardAdapted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<CardAdapted>Card Content</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
    expect(card).toHaveClass('ds-card');
    expect(card).toHaveClass('ds-card-adapted');
    expect(card).toHaveAttribute('data-elevation', '1');
    expect(card).toHaveAttribute('data-variant', 'elevation');
    expect(card).toHaveAttribute('data-square', 'false');
    expect(card).toHaveStyle('cursor: default');
  });

  it('applies elevation correctly', () => {
    render(<CardAdapted elevation={4}>Elevated Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveAttribute('data-elevation', '4');
  });

  it('handles raised prop correctly', () => {
    render(<CardAdapted raised>Raised Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveAttribute('data-elevation', '8');
  });

  it('applies variant correctly', () => {
    render(<CardAdapted variant="outlined&quot;>Outlined Card</CardAdapted>);
    
    const card = screen.getByTestId("mock-card');
    expect(card).toHaveAttribute('data-variant', 'outlined');
  });

  it('applies square prop correctly', () => {
    render(<CardAdapted square>Square Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveAttribute('data-square', 'true');
  });

  it('handles interactive behavior when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<CardAdapted onClick={handleClick}>Interactive Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveClass('ds-card-interactive');
    expect(card).toHaveStyle('cursor: pointer');
    expect(card).toHaveAttribute('tabIndex', '0');
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard interaction for interactive cards', () => {
    const handleClick = jest.fn();
    render(<CardAdapted onClick={handleClick}>Keyboard Interactive Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    // Test other keys (shouldn't trigger)
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('applies custom className correctly', () => {
    render(<CardAdapted className="custom-card&quot;>Custom Class Card</CardAdapted>);
    
    const card = screen.getByTestId("mock-card');
    expect(card).toHaveClass('ds-card');
    expect(card).toHaveClass('ds-card-adapted');
    expect(card).toHaveClass('custom-card');
  });

  it('applies custom style correctly', () => {
    render(
      <CardAdapted style={{ backgroundColor: 'red', padding: '10px' }}>
        Styled Card
      </CardAdapted>
    );
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveStyle('backgroundColor: red');
    expect(card).toHaveStyle('padding: 10px');
  });

  it('applies aria attributes correctly', () => {
    render(
      <CardAdapted 
        ariaLabel="Card Label&quot;
        ariaLabelledBy="external-label"
        ariaDescribedBy="description-id&quot;
        role="region"
      >
        Accessible Card
      </CardAdapted>
    );
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveAttribute('aria-label', 'Card Label');
    expect(card).toHaveAttribute('aria-labelledby', 'external-label');
    expect(card).toHaveAttribute('aria-describedby', 'description-id');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('sets role automatically for interactive cards', () => {
    render(<CardAdapted onClick={() => {}}>Interactive Card</CardAdapted>);
    
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('uses ErrorBoundary to handle errors', () => {
    render(<CardAdapted>Card with Error Boundary</CardAdapted>);
    
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <CardAdapted ariaLabel="Standard Card&quot;>
          This is a standard card content
        </CardAdapted>
        
        <CardAdapted 
          onClick={() => {}} 
          ariaLabel="Interactive Card"
        >
          This is an interactive card
        </CardAdapted>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});