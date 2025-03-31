import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Typography from '../TypographyAdapted';

describe('TypographyAdapted', () => {
  it('renders with default props', () => {
    render(<TypographyAdapted>Default Text</TypographyAdapted>);
    
    const typography = screen.getByText('Default Text');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveClass('ds-typography');
    expect(typography).toHaveClass('ds-typography-body1');
    expect(typography.tagName).toBe('P'); // Default variant body1 maps to p element
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<TypographyAdapted variant="h1&quot;>Heading 1</TypographyAdapted>);
    
    let typography = screen.getByText("Heading 1');
    expect(typography).toHaveClass('ds-typography-h1');
    expect(typography.tagName).toBe('H1');
    expect(typography).toHaveStyle('fontSize: 2.5rem');
    expect(typography).toHaveStyle('fontWeight: 700');
    
    rerender(<TypographyAdapted variant="body2&quot;>Body Text</TypographyAdapted>);
    typography = screen.getByText("Body Text');
    expect(typography).toHaveClass('ds-typography-body2');
    expect(typography.tagName).toBe('P');
    expect(typography).toHaveStyle('fontSize: 0.875rem');
    expect(typography).toHaveStyle('fontWeight: 400');
    
    rerender(<TypographyAdapted variant="caption&quot;>Caption Text</TypographyAdapted>);
    typography = screen.getByText("Caption Text');
    expect(typography).toHaveClass('ds-typography-caption');
    expect(typography.tagName).toBe('SPAN');
    expect(typography).toHaveStyle('fontSize: 0.75rem');
  });

  it('applies custom component correctly', () => {
    render(<TypographyAdapted component="article&quot;>Article Text</TypographyAdapted>);
    
    const typography = screen.getByText("Article Text');
    expect(typography.tagName).toBe('ARTICLE');
  });

  it('handles paragraph prop correctly', () => {
    const { rerender } = render(
      <TypographyAdapted paragraph>
        This is a paragraph with default styles.
      </TypographyAdapted>
    );
    
    let typography = screen.getByText('This is a paragraph with default styles.');
    expect(typography.tagName).toBe('P');
    expect(typography).toHaveStyle('marginBottom: 16px');
    
    rerender(
      <TypographyAdapted paragraph variant="h2&quot;>
        This is a heading that should still be a paragraph.
      </TypographyAdapted>
    );
    
    typography = screen.getByText("This is a heading that should still be a paragraph.');
    expect(typography.tagName).toBe('P');
    expect(typography).toHaveClass('ds-typography-h2');
    expect(typography).toHaveStyle('marginBottom: 16px');
  });

  it('applies gutterBottom correctly', () => {
    render(<TypographyAdapted gutterBottom>Text with gutter</TypographyAdapted>);
    
    const typography = screen.getByText('Text with gutter');
    expect(typography).toHaveStyle('marginBottom: 0.35em');
  });

  it('applies noWrap correctly', () => {
    render(<TypographyAdapted noWrap>Text that should not wrap</TypographyAdapted>);
    
    const typography = screen.getByText('Text that should not wrap');
    expect(typography).toHaveStyle('overflow: hidden');
    expect(typography).toHaveStyle('textOverflow: ellipsis');
    expect(typography).toHaveStyle('whiteSpace: nowrap');
  });

  it('applies text alignment correctly', () => {
    const { rerender } = render(<TypographyAdapted align="center&quot;>Centered Text</TypographyAdapted>);
    
    let typography = screen.getByText("Centered Text');
    expect(typography).toHaveStyle('textAlign: center');
    
    rerender(<TypographyAdapted align="right&quot;>Right-aligned Text</TypographyAdapted>);
    typography = screen.getByText("Right-aligned Text');
    expect(typography).toHaveStyle('textAlign: right');
  });

  it('applies custom color correctly', () => {
    render(<TypographyAdapted color="#ff0000&quot;>Red Text</TypographyAdapted>);
    
    const typography = screen.getByText("Red Text');
    expect(typography).toHaveStyle('color: #ff0000');
  });

  it('applies custom fontSize and fontWeight', () => {
    render(
      <TypographyAdapted fontSize="1.5em&quot; fontWeight={700}>
        Custom Sized Text
      </TypographyAdapted>
    );
    
    const typography = screen.getByText("Custom Sized Text');
    expect(typography).toHaveStyle('fontSize: 1.5em');
    expect(typography).toHaveStyle('fontWeight: 700');
  });

  it('applies fontStyle correctly', () => {
    render(<TypographyAdapted fontStyle="italic&quot;>Italic Text</TypographyAdapted>);
    
    const typography = screen.getByText("Italic Text');
    expect(typography).toHaveStyle('fontStyle: italic');
  });

  it('applies custom className correctly', () => {
    render(<TypographyAdapted className="custom-text&quot;>Custom Class Text</TypographyAdapted>);
    
    const typography = screen.getByText("Custom Class Text');
    expect(typography).toHaveClass('ds-typography');
    expect(typography).toHaveClass('ds-typography-body1');
    expect(typography).toHaveClass('custom-text');
  });

  it('applies custom style correctly', () => {
    render(
      <TypographyAdapted style={{ textDecoration: 'underline', letterSpacing: '2px' }}>
        Custom Styled Text
      </TypographyAdapted>
    );
    
    const typography = screen.getByText('Custom Styled Text');
    expect(typography).toHaveStyle('textDecoration: underline');
    expect(typography).toHaveStyle('letterSpacing: 2px');
  });

  it('applies aria attributes correctly', () => {
    render(
      <TypographyAdapted 
        ariaLabel="Typography Label&quot;
        ariaLabelledBy="external-label"
        ariaDescribedBy="description-id&quot;
        role="heading"
      >
        Accessible Typography
      </TypographyAdapted>
    );
    
    const typography = screen.getByText('Accessible Typography');
    expect(typography).toHaveAttribute('aria-label', 'Typography Label');
    expect(typography).toHaveAttribute('aria-labelledby', 'external-label');
    expect(typography).toHaveAttribute('aria-describedby', 'description-id');
    expect(typography).toHaveAttribute('role', 'heading');
  });

  it('handles data attributes and other props correctly', () => {
    render(
      <TypographyAdapted data-testid="custom-id" data-custom="value">
        Text with Data Attributes
      </TypographyAdapted>
    );
    
    const typography = screen.getByTestId('custom-id');
    expect(typography).toHaveAttribute('data-custom', 'value');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <TypographyAdapted variant="h1&quot;>Main Heading</TypographyAdapted>
        <TypographyAdapted variant="h2">Secondary Heading</TypographyAdapted>
        <TypographyAdapted variant="body1&quot; paragraph>
          This is a paragraph of text. It demonstrates the typography component with
          longer content to ensure it renders correctly and maintains proper spacing.
        </TypographyAdapted>
        <TypographyAdapted variant="caption" color="#666">
          This is a caption with custom color
        </TypographyAdapted>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});