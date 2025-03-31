import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Pagination from '@design-system/components/navigation/Pagination';

/**
 * Pagination component test suite
 */
describe('Pagination Component', () => {
  // Test basic rendering
  it('renders pagination correctly', () => {
    render(
      <MockThemeProvider>
        <Pagination count={5} page={1} data-testid="pagination" />
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByLabelText('pagination navigation')).toBeInTheDocument();
    
    // Should show page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Should show next button by default
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
    
    // Should show previous button by default (disabled when on page 1)
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByText('‹')).toBeInTheDocument();
  });

  // Test page change handling
  it('handles page changes correctly', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Pagination count={5} page={2} onChange={handleChange} data-testid="pagination" />
      </MockThemeProvider>
    );
    
    // Click on page 4
    await user.click(screen.getByText('4'));
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(4);
    
    // Click next button from page 2
    await user.click(screen.getByLabelText('Go to next page'));
    
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenCalledWith(3);
    
    // Click previous button from page 2
    await user.click(screen.getByLabelText('Go to previous page'));
    
    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  // Test current page is highlighted
  it('highlights the current page', () => {
    render(
      <MockThemeProvider>
        <Pagination count={5} page={3} data-testid="pagination" />
      </MockThemeProvider>
    );
    
    // Find the button with aria-current="page"
    const currentPageButton = screen.getByLabelText('Go to page 3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    
    // Check that only page 3 is highlighted
    const page1Button = screen.getByLabelText('Go to page 1');
    const page2Button = screen.getByLabelText('Go to page 2');
    const page4Button = screen.getByLabelText('Go to page 4');
    const page5Button = screen.getByLabelText('Go to page 5');
    
    expect(page1Button).not.toHaveAttribute('aria-current');
    expect(page2Button).not.toHaveAttribute('aria-current');
    expect(page4Button).not.toHaveAttribute('aria-current');
    expect(page5Button).not.toHaveAttribute('aria-current');
  });

  // Test disabled state
  it('disables all buttons when disabled is true', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3} 
          onChange={handleChange}
          disabled={true}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // All buttons should be disabled
    expect(screen.getByLabelText('Go to page 1')).toBeDisabled();
    expect(screen.getByLabelText('Go to page 2')).toBeDisabled();
    expect(screen.getByLabelText('Go to page 3')).toBeDisabled();
    expect(screen.getByLabelText('Go to page 4')).toBeDisabled();
    expect(screen.getByLabelText('Go to page 5')).toBeDisabled();
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    
    // Clicking should not trigger onChange
    await user.click(screen.getByLabelText('Go to page 4'));
    await user.click(screen.getByLabelText('Go to next page'));
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  // Test with first and last buttons
  it('shows first and last buttons when enabled', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={10} 
          page={5}
          showFirstButton
          showLastButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // First and last buttons should be present
    expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    expect(screen.getByText('«')).toBeInTheDocument();
    expect(screen.getByText('»')).toBeInTheDocument();
  });

  // Test hiding next/prev buttons
  it('hides next and previous buttons when specified', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          hideNextButton
          hidePrevButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Next and prev buttons should not be present
    expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
    expect(screen.queryByText('‹')).not.toBeInTheDocument();
  });

  // Test ellipsis rendering for many pages
  it('renders ellipses for many pages', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={20} 
          page={10}
          boundaryCount={1}
          siblingCount={1}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should show boundary pages (1, 20)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    
    // Should show sibling pages around current (9, 10, 11)
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    
    // Should show ellipses
    const ellipses = screen.getAllByText('…');
    expect(ellipses).toHaveLength(2);
  });

  // Test with different sibling counts
  it('shows correct number of siblings', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={20} 
          page={10}
          boundaryCount={1}
          siblingCount={2}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should show boundary pages (1, 20)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    
    // Should show 2 siblings on each side (8, 9, 10, 11, 12)
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  // Test with different boundary counts
  it('shows correct number of boundary pages', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={20} 
          page={10}
          boundaryCount={2}
          siblingCount={1}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should show 2 boundary pages on each end (1, 2, 19, 20)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  // Test different sizes
  it('renders different sizes', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          size="small&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const getPageButton = () => screen.getByLabelText('Go to page 3');
    
    // Small size
    expect(getPageButton().style.height).toBe('30px');
    expect(getPageButton().style.minWidth).toBe('30px');
    
    // Medium size (default)
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          size="medium&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(getPageButton().style.height).toBe('36px');
    expect(getPageButton().style.minWidth).toBe('36px');
    
    // Large size
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          size="large&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(getPageButton().style.height).toBe('42px');
    expect(getPageButton().style.minWidth).toBe('42px');
  });

  // Test different shapes
  it('renders different shapes', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          shape="rounded&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const getPageButton = () => screen.getByLabelText('Go to page 3');
    
    // Rounded shape (default)
    expect(getPageButton().style.borderRadius).toBeTruthy();
    expect(getPageButton().style.borderRadius).not.toBe('50%');
    
    // Circular shape
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          shape="circular&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(getPageButton().style.borderRadius).toBe('50%');
  });

  // Test different variants
  it('renders different variants', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          variant="outlined&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const getPageButton = () => screen.getByLabelText('Go to page 3');
    
    // Outlined variant (default)
    expect(getPageButton().style.border).toBeTruthy();
    
    // Text variant
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          variant="text&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(getPageButton().style.border).toBeFalsy();
    
    // Contained variant
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          variant="contained&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(getPageButton().style.backgroundColor).toBeTruthy();
  });

  // Test different colors
  it('applies different colors', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          color="primary&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const getPageButton = () => screen.getByLabelText('Go to page 3');
    
    // Primary color (default) - can't directly test color value, but checking behavior
    const primaryStyleBefore = getPageButton().style.color;
    
    // Secondary color
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={3}
          color="secondary&quot;
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should be different from primary
    expect(getPageButton().style.color).not.toBe(primaryStyleBefore);
  });

  // Test disabling next/prev buttons when at first/last page
  it('disables navigation buttons at boundary pages', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={1}
          showFirstButton
          showLastButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // At first page, prev and first buttons should be disabled
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).not.toBeDisabled();
    
    // At last page, next and last buttons should be disabled
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={5}
          showFirstButton
          showLastButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(screen.getByLabelText('Go to first page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).toBeDisabled();
  });

  // Test first and last button navigation
  it('navigates with first and last buttons', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Pagination 
          count={10} 
          page={5}
          onChange={handleChange}
          showFirstButton
          showLastButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Click first page button
    await user.click(screen.getByLabelText('Go to first page'));
    expect(handleChange).toHaveBeenCalledWith(1);
    
    // Click last page button
    await user.click(screen.getByLabelText('Go to last page'));
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  // Test ref forwarding
  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <MockThemeProvider>
        <Pagination 
          ref={ref}
          count={5} 
          page={3}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    expect(ref.current).toBe(screen.getByTestId('pagination'));
  });

  // Test invalid page number handling
  it('handles invalid page numbers gracefully', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={10} // Greater than count
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should normalize to maximum available page
    expect(screen.getByLabelText('Go to page 5')).toHaveAttribute('aria-current', 'page');
    
    // Test with page less than 1
    rerender(
      <MockThemeProvider>
        <Pagination 
          count={5} 
          page={-3} // Less than 1
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should normalize to minimum page (1)
    expect(screen.getByLabelText('Go to page 1')).toHaveAttribute('aria-current', 'page');
  });

  // Test page 0 count cases
  it('shows at least one page even with zero count', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={0} // Invalid count
          page={1}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    // Should show at least page 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  // Test that ellipsis is not focusable or clickable
  it('renders ellipsis as non-interactive element', () => {
    render(
      <MockThemeProvider>
        <Pagination 
          count={20} 
          page={10}
          boundaryCount={1}
          siblingCount={1}
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const ellipses = screen.getAllByText('…');
    
    // Ellipsis should have aria-hidden="true"
    expect(ellipses[0]).toHaveAttribute('aria-hidden', 'true');
    
    // Ellipsis should not be a button
    const ellipsisParent = ellipses[0].parentNode;
    expect(ellipsisParent.tagName).not.toBe('BUTTON');
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <Pagination 
          count={10} 
          page={5}
          showFirstButton
          showLastButton
          data-testid="pagination"
        />
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });
});