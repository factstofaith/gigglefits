import React from 'react';
import { render, screen } from '@testing-library/react';
import {MuiBox as MuiBox} from '@design-system/components/layout/Box';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import { checkA11y } from '../utils/a11y-utils';
import { MuiBox } from '../../design-system';
;

/**
 * MuiBox component test suite
 */
describe('MuiBox Component', () => {
  // Test basic rendering
  it('renders children correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox data-testid="box">MuiBox Content</MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box).toBeInTheDocument();
    expect(box.tagName).toBe('DIV'); // Default component is div
    expect(box.textContent).toBe('MuiBox Content');
  });

  // Test component override
  it('allows component type override', () => {
    render(
      <MockThemeProvider>
        <MuiBox component="section&quot; data-testid="box">
          MuiBox as section
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.tagName).toBe('SECTION');
  });

  // Test padding props
  it('applies padding correctly', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <MuiBox p="md&quot; data-testid="box">
          MuiBox with padding
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.padding).toBe('16px'); // md spacing from theme
    
    // Test individual padding props
    rerender(
      <MockThemeProvider>
        <MuiBox pt="lg&quot; pr="sm" pb="xs&quot; pl="md" data-testid="box">
          MuiBox with different paddings
        </MuiBox>
      </MockThemeProvider>
    );
    
    expect(box.style.paddingTop).toBe('24px'); // lg spacing
    expect(box.style.paddingRight).toBe('8px'); // sm spacing
    expect(box.style.paddingBottom).toBe('4px'); // xs spacing
    expect(box.style.paddingLeft).toBe('16px'); // md spacing
    
    // Test shorthand paddings
    rerender(
      <MockThemeProvider>
        <MuiBox px="md&quot; py="lg" data-testid="box">
          MuiBox with shorthand paddings
        </MuiBox>
      </MockThemeProvider>
    );
    
    expect(box.style.paddingLeft).toBe('16px');
    expect(box.style.paddingRight).toBe('16px');
    expect(box.style.paddingTop).toBe('24px');
    expect(box.style.paddingBottom).toBe('24px');
  });

  // Test margin props
  it('applies margin correctly', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <MuiBox m="md&quot; data-testid="box">
          MuiBox with margin
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.margin).toBe('16px'); // md spacing from theme
    
    // Test individual margin props
    rerender(
      <MockThemeProvider>
        <MuiBox mt="lg&quot; mr="sm" mb="xs&quot; ml="md" data-testid="box">
          MuiBox with different margins
        </MuiBox>
      </MockThemeProvider>
    );
    
    expect(box.style.marginTop).toBe('24px'); // lg spacing
    expect(box.style.marginRight).toBe('8px'); // sm spacing
    expect(box.style.marginBottom).toBe('4px'); // xs spacing
    expect(box.style.marginLeft).toBe('16px'); // md spacing
    
    // Test shorthand margins
    rerender(
      <MockThemeProvider>
        <MuiBox mx="md&quot; my="lg" data-testid="box">
          MuiBox with shorthand margins
        </MuiBox>
      </MockThemeProvider>
    );
    
    expect(box.style.marginLeft).toBe('16px');
    expect(box.style.marginRight).toBe('16px');
    expect(box.style.marginTop).toBe('24px');
    expect(box.style.marginBottom).toBe('24px');
  });

  // Test dimension props
  it('applies dimension props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          width="200px&quot; 
          height="100px"
          minWidth="150px&quot;
          maxWidth="300px"
          minHeight="50px&quot;
          maxHeight="150px"
          data-testid="box"
        >
          MuiBox with dimensions
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.width).toBe('200px');
    expect(box.style.height).toBe('100px');
    expect(box.style.minWidth).toBe('150px');
    expect(box.style.maxWidth).toBe('300px');
    expect(box.style.minHeight).toBe('50px');
    expect(box.style.maxHeight).toBe('150px');
  });

  // Test flex props
  it('applies flex props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          display="flex&quot;
          flexDirection="column"
          flexWrap="wrap&quot;
          flexGrow={1}
          flexShrink={0}
          justifyContent="center"
          alignItems="flex-start&quot;
          alignContent="space-between"
          alignSelf="flex-end&quot;
          data-testid="box"
        >
          MuiBox with flex props
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.display).toBe('flex');
    expect(box.style.flexDirection).toBe('column');
    expect(box.style.flexWrap).toBe('wrap');
    expect(box.style.flexGrow).toBe('1');
    expect(box.style.flexShrink).toBe('0');
    expect(box.style.justifyContent).toBe('center');
    expect(box.style.alignItems).toBe('flex-start');
    expect(box.style.alignContent).toBe('space-between');
    expect(box.style.alignSelf).toBe('flex-end');
  });

  // Test color props
  it('applies color props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          color="primary&quot;
          bgcolor="background.paper"
          data-testid="box"
        >
          MuiBox with colors
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.color).toBe('#1976d2'); // primary color from mock theme
    expect(box.style.backgroundColor).toBe('#ffffff'); // background.paper from mock theme
  });

  // Test border props
  it('applies border props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          border="1px solid&quot;
          borderTop="2px dashed"
          borderRight="3px dotted&quot;
          borderBottom="4px solid"
          borderLeft="5px double&quot;
          borderColor="primary"
          borderRadius="4px&quot;
          data-testid="box"
        >
          MuiBox with borders
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.border).toBe('1px solid');
    expect(box.style.borderTop).toBe('2px dashed');
    expect(box.style.borderRight).toBe('3px dotted');
    expect(box.style.borderBottom).toBe('4px solid');
    expect(box.style.borderLeft).toBe('5px double');
    expect(box.style.borderColor).toBe('#1976d2'); // primary color from mock theme
    expect(box.style.borderRadius).toBe('4px');
  });

  // Test position props
  it('applies position props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          position="absolute&quot;
          top="10px"
          right="20px&quot;
          bottom="30px"
          left="40px&quot;
          zIndex={100}
          data-testid="box"
        >
          MuiBox with position
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.position).toBe('absolute');
    expect(box.style.top).toBe('10px');
    expect(box.style.right).toBe('20px');
    expect(box.style.bottom).toBe('30px');
    expect(box.style.left).toBe('40px');
    expect(box.style.zIndex).toBe('100');
  });

  // Test shadow and overflow props
  it('applies shadow and overflow props correctly', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          boxShadow="0 2px 4px rgba(0,0,0,0.2)&quot;
          overflow="hidden"
          overflowX="auto&quot;
          overflowY="scroll"
          data-testid="box"
        >
          MuiBox with shadow and overflow
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.boxShadow).toBe('0 2px 4px rgba(0,0,0,0.2)');
    expect(box.style.overflow).toBe('hidden');
    expect(box.style.overflowX).toBe('auto');
    expect(box.style.overflowY).toBe('scroll');
  });

  // Test style override
  it('allows style overrides', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          p="md&quot;
          style={{ padding: "50px', opacity: 0.8 }}
          data-testid="box"
        >
          MuiBox with style override
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.padding).toBe('50px'); // Override takes precedence
    expect(box.style.opacity).toBe('0.8'); // Additional style
  });

  // Test forwarding of additional props
  it('forwards additional props', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          data-testid="box"
          aria-label="MuiBox label"
          title="MuiBox title&quot;
          tabIndex={0}
        >
          MuiBox with props
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId("box');
    expect(box).toHaveAttribute('aria-label', 'MuiBox label');
    expect(box).toHaveAttribute('title', 'MuiBox title');
    expect(box).toHaveAttribute('tabindex', '0');
  });

  // Test with ref forwarding
  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <MockThemeProvider>
        <MuiBox ref={ref} data-testid="box">
          MuiBox with ref
        </MuiBox>
      </MockThemeProvider>
    );
    
    expect(ref.current).toBe(screen.getByTestId('box'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <MuiBox>MuiBox for accessibility test</MuiBox>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });

  // Test numeric spacing values
  it('handles numeric spacing values', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          p={16}
          m={8}
          data-testid="box"
        >
          MuiBox with numeric spacing
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.padding).toBe('16px');
    expect(box.style.margin).toBe('8px');
  });

  // Test custom color values
  it('handles custom color values', () => {
    render(
      <MockThemeProvider>
        <MuiBox 
          color="#ff0000&quot;
          bgcolor="rgba(0, 255, 0, 0.5)"
          data-testid="box"
        >
          MuiBox with custom colors
        </MuiBox>
      </MockThemeProvider>
    );
    
    const box = screen.getByTestId('box');
    expect(box.style.color).toBe('#ff0000');
    expect(box.style.backgroundColor).toBe('rgba(0, 255, 0, 0.5)');
  });
});