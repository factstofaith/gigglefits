import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Breadcrumbs from '@design-system/components/navigation/Breadcrumbs';

/**
 * Breadcrumbs component test suite
 */
describe('Breadcrumbs Component', () => {
  // Test basic rendering
  it('renders breadcrumbs correctly', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs data-testid="breadcrumbs">
          <li>Home</li>
          <li>Category</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    
    // Test separators are rendered
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  // Test default separator
  it('uses default separator', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs>
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  // Test custom separator
  it('supports custom separator', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs separator=">&quot;>
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(screen.getByText(">')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  // Test custom separator as a node
  it('supports custom separator as a node', () => {
    const CustomSeparator = () => <span data-testid="custom-separator">•</span>;
    
    render(
      <MockThemeProvider>
        <Breadcrumbs separator={<CustomSeparator />}>
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('custom-separator')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  // Test item collapsing
  it('collapses items when there are more than maxItems', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item A</li>
          <li>Item B</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    // Should show first and last items with ellipsis in between
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    
    // Middle items should be hidden
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Item A')).not.toBeInTheDocument();
  });

  // Test configurable number of items before collapse
  it('allows configuring the number of items before collapse', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs maxItems={4} itemsBeforeCollapse={2} itemsAfterCollapse={1}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
          <li>Item 5</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    // Should show first two items, ellipsis, and last item
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    
    // Middle items should be hidden
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 4')).not.toBeInTheDocument();
  });

  // Test configurable number of items after collapse
  it('allows configuring the number of items after collapse', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
          <li>Item 5</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    // Should show first item, ellipsis, and last two items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    
    // Middle items should be hidden
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
  });

  // Test no collapsing when maxItems is set to 0
  it('does not collapse items when maxItems is 0', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs maxItems={0}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
          <li>Item 5</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    // All items should be visible
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    
    // Ellipsis should not be visible
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });

  // Test styling of the last item
  it('applies correct styling to the last item', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs>
          <li data-testid="first-item">Home</li>
          <li data-testid="last-item">Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    const firstItem = screen.getByTestId('first-item');
    const lastItem = screen.getByTestId('last-item');
    
    // Last item should have the aria-current attribute
    expect(lastItem).toHaveAttribute('aria-current', 'page');
    expect(firstItem).not.toHaveAttribute('aria-current');
    
    // Last item should have primary text color and medium font weight
    expect(lastItem.style.color).toBe(mockTheme.colors.text.primary);
    expect(lastItem.style.fontWeight).toBe(mockTheme.typography.fontWeights.medium.toString());
    
    // First item should have secondary text color
    expect(firstItem.style.color).toBe(mockTheme.colors.text.secondary);
  });

  // Test aria-label
  it('applies default aria-label', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs data-testid="breadcrumbs">
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveAttribute('aria-label', 'breadcrumbs');
  });

  // Test custom aria-label
  it('allows custom aria-label', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs aria-label="Page navigation" data-testid="breadcrumbs">
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveAttribute('aria-label', 'Page navigation');
  });

  // Test with links
  it('renders with anchor links', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs>
          <a href="/&quot; data-testid="home-link">Home</a>
          <a href="/category&quot; data-testid="category-link">Category</a>
          <span>Current Page</span>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('home-link')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('category-link')).toHaveAttribute('href', '/category');
  });

  // Test with click handlers
  it('allows click handlers on items', async () => {
    const user = setupUserEvent();
    const handleClick = jest.fn();
    
    render(
      <MockThemeProvider>
        <Breadcrumbs>
          <button onClick={handleClick} data-testid="clickable-item">Home</button>
          <span>Current Page</span>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    await user.click(screen.getByTestId('clickable-item'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test ref forwarding
  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <MockThemeProvider>
        <Breadcrumbs ref={ref} data-testid="breadcrumbs">
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    expect(ref.current).toBe(screen.getByTestId('breadcrumbs'));
  });

  // Test applying custom styles
  it('allows custom styles', () => {
    render(
      <MockThemeProvider>
        <Breadcrumbs
          style={{ backgroundColor: 'lightblue', padding: '8px' }}
          data-testid="breadcrumbs"
        >
          <li>Home</li>
          <li>Current Page</li>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs.style.backgroundColor).toBe('lightblue');
    expect(breadcrumbs.style.padding).toBe('8px');
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <Breadcrumbs>
          <a href="/&quot;>Home</a>
          <a href="/category">Category</a>
          <span>Current Page</span>
        </Breadcrumbs>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });
});

// Mock theme for style testing
const mockTheme = {
  colors: {
    text: { 
      primary: '#000000', 
      secondary: '#00000099' 
    }
  },
  typography: {
    fontWeights: {
      regular: 400,
      medium: 500
    }
  }
};