import React from 'react';
import { render, screen } from '@testing-library/react';
import { Typography } from '@design-system/components/core/Typography';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import { checkA11y } from '../utils/a11y-utils';

/**
 * Typography component test suite
 */
describe('Typography Component', () => {
  // Test basic rendering
  it('renders text correctly', () => {
    render(
      <MockThemeProvider>
        <Typography>Hello World</Typography>
      </MockThemeProvider>
    );
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  // Test different variants
  it('renders with different variants', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Typography variant="h1&quot; data-testid="typography">Heading 1</Typography>
      </MockThemeProvider>
    );
    
    // Check h1 element is used
    let element = screen.getByTestId('typography');
    expect(element.tagName).toBe('H1');
    
    // Check h2 is rendered when variant is h2
    rerender(
      <MockThemeProvider>
        <Typography variant="h2&quot; data-testid="typography">Heading 2</Typography>
      </MockThemeProvider>
    );
    element = screen.getByTestId('typography');
    expect(element.tagName).toBe('H2');
    
    // Check p is rendered for body1
    rerender(
      <MockThemeProvider>
        <Typography variant="body1&quot; data-testid="typography">Body text</Typography>
      </MockThemeProvider>
    );
    element = screen.getByTestId('typography');
    expect(element.tagName).toBe('P');
    
    // Check span for button variant
    rerender(
      <MockThemeProvider>
        <Typography variant="button&quot; data-testid="typography">Button Text</Typography>
      </MockThemeProvider>
    );
    element = screen.getByTestId('typography');
    expect(element.tagName).toBe('SPAN');
  });

  // Test component override
  it('allows component type override', () => {
    render(
      <MockThemeProvider>
        <Typography variant="h1&quot; component="div" data-testid="typography">
          Heading as div
        </Typography>
      </MockThemeProvider>
    );
    
    const element = screen.getByTestId('typography');
    expect(element.tagName).toBe('DIV');
  });

  // Test color prop
  it('applies color correctly', () => {
    render(
      <MockThemeProvider>
        <Typography color="primary&quot; data-testid="typography">
          Colored text
        </Typography>
      </MockThemeProvider>
    );
    
    const element = screen.getByTestId('typography');
    const styles = window.getComputedStyle(element);
    // We can't directly test the computed style in JSDOM, but we can check style attribute
    expect(element.style.color).toBe('#1976d2'); // primary color from MockThemeProvider
  });

  // Test additional style props
  it('applies style props correctly', () => {
    render(
      <MockThemeProvider>
        <Typography 
          align="center&quot; 
          gutterBottom 
          noWrap 
          data-testid="typography"
        >
          Styled text
        </Typography>
      </MockThemeProvider>
    );
    
    const element = screen.getByTestId('typography');
    
    // Check that styles are applied
    expect(element.style.textAlign).toBe('center');
    expect(element.style.marginBottom).toBe('0.35em');
    expect(element.style.whiteSpace).toBe('nowrap');
    expect(element.style.overflow).toBe('hidden');
    expect(element.style.textOverflow).toBe('ellipsis');
  });

  // Test forwarding of additional props
  it('forwards additional props', () => {
    render(
      <MockThemeProvider>
        <Typography 
          data-testid="typography"
          aria-label="Typography label"
          title="Title attribute&quot;
        >
          Props test
        </Typography>
      </MockThemeProvider>
    );
    
    const element = screen.getByTestId("typography');
    expect(element).toHaveAttribute('aria-label', 'Typography label');
    expect(element).toHaveAttribute('title', 'Title attribute');
  });

  // Test with ref forwarding
  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <MockThemeProvider>
        <Typography ref={ref} data-testid="typography">
          Ref test
        </Typography>
      </MockThemeProvider>
    );
    
    expect(ref.current).toBe(screen.getByTestId('typography'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <Typography>Accessibility test</Typography>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });

  // Test semantic heading levels
  it('maintains semantic heading levels', () => {
    render(
      <MockThemeProvider>
        <Typography variant="h1&quot; data-testid="h1">Heading 1</Typography>
        <Typography variant="h2&quot; data-testid="h2">Heading 2</Typography>
        <Typography variant="h3&quot; data-testid="h3">Heading 3</Typography>
        <Typography variant="h4&quot; data-testid="h4">Heading 4</Typography>
        <Typography variant="h5&quot; data-testid="h5">Heading 5</Typography>
        <Typography variant="h6&quot; data-testid="h6">Heading 6</Typography>
      </MockThemeProvider>
    );
    
    // Check that each heading is rendered with the correct HTML element
    expect(screen.getByTestId('h1').tagName).toBe('H1');
    expect(screen.getByTestId('h2').tagName).toBe('H2');
    expect(screen.getByTestId('h3').tagName).toBe('H3');
    expect(screen.getByTestId('h4').tagName).toBe('H4');
    expect(screen.getByTestId('h5').tagName).toBe('H5');
    expect(screen.getByTestId('h6').tagName).toBe('H6');
  });

  // Test with semantic color values
  it('applies semantic color values correctly', () => {
    render(
      <MockThemeProvider>
        <Typography color="error&quot; data-testid="error">Error text</Typography>
        <Typography color="warning&quot; data-testid="warning">Warning text</Typography>
        <Typography color="success&quot; data-testid="success">Success text</Typography>
        <Typography color="info&quot; data-testid="info">Info text</Typography>
      </MockThemeProvider>
    );
    
    // Check that each color is applied correctly
    expect(screen.getByTestId('error').style.color).toBe('#d32f2f');
    expect(screen.getByTestId('warning').style.color).toBe('#ed6c02');
    expect(screen.getByTestId('success').style.color).toBe('#2e7d32');
    expect(screen.getByTestId('info').style.color).toBe('#0288d1');
  });

  // Test custom style overrides
  it('allows style overrides', () => {
    render(
      <MockThemeProvider>
        <Typography 
          style={{ textDecoration: 'underline', fontStyle: 'italic' }}
          data-testid="typography"
        >
          Custom styled text
        </Typography>
      </MockThemeProvider>
    );
    
    const element = screen.getByTestId('typography');
    expect(element.style.textDecoration).toBe('underline');
    expect(element.style.fontStyle).toBe('italic');
  });
});