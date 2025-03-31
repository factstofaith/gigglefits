// src/tests/design-system/Stack.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Stack from '@design-system/components/layout/Stack';

// Mock Box component
jest.mock('../../design-system/components/layout/Box', () => {
  return {
    __esModule: true,
    default: ({ children, ...props }) => (
      <div data-testid="mock-box" {...props}>
        {children}
      </div>
    ),
  };
});

const customRender = (ui, options = {}) => {
  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';


  return render(ui, { wrapper: MockThemeProvider, ...options });
};

describe('Stack Component', () => {
  it('renders correctly with default props', () => {
    customRender(
      <Stack data-testid="stack">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Stack>
    );
    
    const stack = screen.getByTestId('stack');
    expect(stack).toBeInTheDocument();
    
    // Check Box props passed from Stack
    expect(stack).toHaveAttribute('data-testid', 'mock-box');
    expect(stack).toHaveAttribute('display', 'flex');
    expect(stack).toHaveAttribute('flexDirection', 'column');
    
    // Check children are rendered
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('renders with horizontal direction', () => {
    customRender(
      <Stack data-testid="stack" direction="row&quot;>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    
    const stack = screen.getByTestId("stack');
    expect(stack).toHaveAttribute('flexDirection', 'row');
  });

  it('renders with row-reverse direction', () => {
    customRender(
      <Stack data-testid="stack" direction="row-reverse&quot;>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    
    const stack = screen.getByTestId("stack');
    expect(stack).toHaveAttribute('flexDirection', 'row-reverse');
  });

  it('renders with column-reverse direction', () => {
    customRender(
      <Stack data-testid="stack" direction="column-reverse&quot;>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    
    const stack = screen.getByTestId("stack');
    expect(stack).toHaveAttribute('flexDirection', 'column-reverse');
  });

  it('applies correct alignment props', () => {
    customRender(
      <Stack
        data-testid="stack"
        alignItems="center&quot;
        justifyContent="space-between"
      >
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
    
    const stack = screen.getByTestId('stack');
    expect(stack).toHaveAttribute('alignItems', 'center');
    expect(stack).toHaveAttribute('justifyContent', 'space-between');
  });

  it('adds spacing between items', () => {
    customRender(
      <Stack data-testid="stack" spacing="lg&quot;>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Stack>
    );
    
    // Since we"re using a mock Box, we can't easily check the styles
    // This test would be better with an actual implementation or style testing
    // but we can verify that the children are rendered
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('renders with dividers between items', () => {
    customRender(
      <Stack data-testid="stack" divider={<hr data-testid="divider" />}>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Stack>
    );
    
    // Check that dividers are rendered
    const dividers = screen.getAllByTestId('divider');
    expect(dividers.length).toBe(2); // Should be 2 dividers for 3 children
  });

  it('filters out null or undefined children', () => {
    customRender(
      <Stack data-testid="stack">
        <div>Child 1</div>
        {null}
        <div>Child 2</div>
        {undefined}
      </Stack>
    );
    
    // Should only render two children
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await testA11y(
      <Stack>
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );
  });
});