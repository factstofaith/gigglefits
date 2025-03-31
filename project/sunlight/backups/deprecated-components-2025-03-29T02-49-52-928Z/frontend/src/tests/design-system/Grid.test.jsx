// src/tests/design-system/Grid.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Grid from '@design-system/components/layout/Grid';

// Mock breakpoints.up function
const mockUp = jest.fn(size => `@media (min-width: ${size}px)`);
jest.mock('../../design-system/foundations/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
        up: mockUp,
      },
    },
    mode: 'light',
  }),
}));

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

describe('Grid Component', () => {
  describe('Grid.Container', () => {
    it('renders correctly with default props', () => {
      customRender(
        <Grid.Container data-testid="grid-container">
          <div>Grid Item Content</div>
        </Grid.Container>
      );
      
      const container = screen.getByTestId('grid-container');
      expect(container).toBeInTheDocument();
      
      // Check default styles
      const styles = window.getComputedStyle(container);
      expect(styles.display).toBe('grid');
      expect(styles.gridTemplateColumns).toBe('repeat(12, 1fr)');
      expect(container.textContent).toBe('Grid Item Content');
    });

    it('applies spacing correctly', () => {
      customRender(
        <Grid.Container data-testid="grid-container" spacing="lg&quot;>
          <div>Grid Item Content</div>
        </Grid.Container>
      );
      
      const container = screen.getByTestId("grid-container');
      
      // Verify spacing is applied (inspect the style props directly)
      expect(container.style.columnGap).toBe('24px');
      expect(container.style.rowGap).toBe('24px');
    });

    it('applies different row and column spacing', () => {
      customRender(
        <Grid.Container data-testid="grid-container" rowSpacing="lg&quot; columnSpacing="sm">
          <div>Grid Item Content</div>
        </Grid.Container>
      );
      
      const container = screen.getByTestId('grid-container');
      
      // Verify different spacing values
      expect(container.style.rowGap).toBe('24px');
      expect(container.style.columnGap).toBe('8px');
    });

    it('applies justifyContent and alignItems props', () => {
      customRender(
        <Grid.Container 
          data-testid="grid-container" 
          justifyContent="center&quot; 
          alignItems="center"
        >
          <div>Grid Item Content</div>
        </Grid.Container>
      );
      
      const container = screen.getByTestId('grid-container');
      
      // Verify alignment properties
      expect(container.style.justifyContent).toBe('center');
      expect(container.style.alignItems).toBe('center');
    });
  });

  describe('Grid.Item', () => {
    it('renders correctly with default props', () => {
      customRender(
        <Grid.Container>
          <Grid.Item data-testid="grid-item">
            Item Content
          </Grid.Item>
        </Grid.Container>
      );
      
      const item = screen.getByTestId('grid-item');
      expect(item).toBeInTheDocument();
      expect(item.textContent).toBe('Item Content');
      
      // Default is xs=12
      expect(item.style.gridColumn).toBe('span 12');
    });

    it('applies column span for different breakpoints', () => {
      customRender(
        <Grid.Container>
          <Grid.Item 
            data-testid="grid-item"
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
          >
            Item Content
          </Grid.Item>
        </Grid.Container>
      );
      
      const item = screen.getByTestId('grid-item');
      
      // Base xs value
      expect(item.style.gridColumn).toBe('span 12');
      
      // Check if the breakpoint functions were called with correct values
      // This is testing the implementation that the responsive styles would be generated correctly
      expect(mockUp).toHaveBeenCalledWith('sm');
      expect(mockUp).toHaveBeenCalledWith('md');
      expect(mockUp).toHaveBeenCalledWith('lg');
      expect(mockUp).toHaveBeenCalledWith('xl');
    });

    it('handles special column values correctly', () => {
      customRender(
        <Grid.Container>
          <Grid.Item 
            data-testid="grid-item-auto"
            xs="auto&quot;
          >
            Auto Item
          </Grid.Item>
          <Grid.Item 
            data-testid="grid-item-true"
            xs={true}
          >
            True Item
          </Grid.Item>
          <Grid.Item 
            data-testid="grid-item-false"
            xs={false}
          >
            False Item
          </Grid.Item>
        </Grid.Container>
      );
      
      // Auto value
      expect(screen.getByTestId('grid-item-auto').style.gridColumn).toBe('auto');
      
      // True = auto
      expect(screen.getByTestId('grid-item-true').style.gridColumn).toBe('auto');
      
      // False = none
      expect(screen.getByTestId('grid-item-false').style.gridColumn).toBe('none');
    });
  });

  describe('Grid System', () => {
    it('creates a responsive grid layout', () => {
      customRender(
        <Grid.Container data-testid="grid-container" spacing="md&quot;>
          <Grid.Item xs={12} md={6} data-testid="grid-item-1">Item 1</Grid.Item>
          <Grid.Item xs={12} md={6} data-testid="grid-item-2">Item 2</Grid.Item>
          <Grid.Item xs={12} data-testid="grid-item-3">Item 3</Grid.Item>
        </Grid.Container>
      );
      
      // Container renders with grid display
      const container = screen.getByTestId('grid-container');
      expect(container.style.display).toBe('grid');
      expect(container.style.gridTemplateColumns).toBe('repeat(12, 1fr)');
      
      // Items render with correct spans
      expect(screen.getByTestId('grid-item-1').style.gridColumn).toBe('span 12');
      expect(screen.getByTestId('grid-item-2').style.gridColumn).toBe('span 12');
      expect(screen.getByTestId('grid-item-3').style.gridColumn).toBe('span 12');
      
      // Check that md breakpoint styles were requested
      expect(mockUp).toHaveBeenCalledWith('md');
    });
  });
  
  // Accessibility test
  it('has no accessibility violations', async () => {
    await testA11y(
      <Grid.Container>
        <Grid.Item xs={6}>Item 1</Grid.Item>
        <Grid.Item xs={6}>Item 2</Grid.Item>
      </Grid.Container>
    );
  });
});