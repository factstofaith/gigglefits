// TestResourceLoader.test.jsx
// Independent test file that doesn't rely on any MSW or setupTests.js

// Load testing-library
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one which might require MSW setup)
import ResourceLoader, { Skeleton, ErrorDisplay, EmptyState } from './TestResourceLoader';

// Test suite
describe('ResourceLoader Component', () => {
  // Test loading state
  it('renders loading state with default skeleton', () => {
    render(<ResourceLoader isLoading />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Error Loading Data')).not.toBeInTheDocument();
    expect(screen.queryByText('No Items Found')).not.toBeInTheDocument();
  });

  it('renders custom loading component when provided', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Custom Loading...</div>;
    render(<ResourceLoader isLoading loadingComponent={<CustomLoader />} />);

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  // Test error state
  it('renders error state with default message', () => {
    render(<ResourceLoader error="Something went wrong&quot; />);

    expect(screen.getByText("Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ResourceLoader error="Network error&quot; onRetry={onRetry} />);

    const retryButton = screen.getByText("Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // Test empty state
  it('renders empty state with default message', () => {
    render(<ResourceLoader isEmpty />);

    expect(screen.getByText('No Items Found')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<ResourceLoader isEmpty emptyMessage="No results match your search&quot; />);

    expect(screen.getByText("No results match your search')).toBeInTheDocument();
  });

  // Test content rendering
  it('renders children when not loading, not error, and not empty', () => {
    render(
      <ResourceLoader>
        <div data-testid="content">Content is loaded</div>
      </ResourceLoader>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Content is loaded')).toBeInTheDocument();
  });

  it('prioritizes loading state over error and empty states', () => {
    render(
      <ResourceLoader
        isLoading
        error="Error occurred&quot;
        isEmpty
        loadingComponent={<div data-testid="loading">Loading...</div>}
      >
        <div>Content</div>
      </ResourceLoader>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
    expect(screen.queryByText('No Items Found')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
