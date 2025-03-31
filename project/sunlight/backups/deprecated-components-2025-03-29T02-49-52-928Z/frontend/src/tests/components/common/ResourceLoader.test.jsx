// tests/components/common/ResourceLoader.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceLoader, {
  SkeletonLoader,
  ErrorDisplay,
  EmptyState,
} from '@components/common/ResourceLoader';

describe('ResourceLoader', () => {
  // Test loading state
  it('renders loading state with default skeleton', () => {
    render(<ResourceLoader isLoading />);

    // We can't directly test for Skeleton component, but we can check that
    // neither error nor empty state components are rendered
    expect(screen.queryByText('Error Loading Data')).not.toBeInTheDocument();
    expect(screen.queryByText('No Items Found')).not.toBeInTheDocument();
  });

  it('renders custom loading component when provided', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Custom Loading...</div>;
    render(<ResourceLoader isLoading loadingComponent={<CustomLoader />} />);

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('calls renderLoading function when provided', () => {
    const renderLoading = jest
      .fn()
      .mockReturnValue(<div data-testid="render-loading">Render Loading</div>);

    render(<ResourceLoader isLoading renderLoading={renderLoading} />);

    expect(renderLoading).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('render-loading')).toBeInTheDocument();
    expect(screen.getByText('Render Loading')).toBeInTheDocument();
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

  it('calls renderError function when provided', () => {
    const renderError = jest
      .fn()
      .mockReturnValue(<div data-testid="custom-error">Custom Error</div>);

    render(<ResourceLoader error="API Error&quot; renderError={renderError} />);

    expect(renderError).toHaveBeenCalledTimes(1);
    expect(renderError).toHaveBeenCalledWith("API Error', null);
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
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

  it('renders action component in empty state', () => {
    const ActionButton = () => <button data-testid="create-new">Create New</button>;

    render(<ResourceLoader isEmpty emptyActionComponent={<ActionButton />} />);

    expect(screen.getByText('No Items Found')).toBeInTheDocument();
    expect(screen.getByTestId('create-new')).toBeInTheDocument();
  });

  it('calls renderEmpty function when provided', () => {
    const renderEmpty = jest
      .fn()
      .mockReturnValue(<div data-testid="custom-empty">Custom Empty State</div>);

    render(<ResourceLoader isEmpty renderEmpty={renderEmpty} />);

    expect(renderEmpty).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    expect(screen.getByText('Custom Empty State')).toBeInTheDocument();
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

  it('prioritizes error state over empty state', () => {
    render(
      <ResourceLoader error="Error occurred&quot; isEmpty>
        <div>Content</div>
      </ResourceLoader>
    );

    expect(screen.getByText("Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.queryByText('No Items Found')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});

// Test subcomponents
describe('SkeletonLoader', () => {
  it('renders children when provided instead of skeleton', () => {
    render(
      <SkeletonLoader height={200} width="50%&quot;>
        <div data-testid="skeleton-child">Custom Skeleton</div>
      </SkeletonLoader>
    );

    expect(screen.getByTestId('skeleton-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Skeleton')).toBeInTheDocument();
  });
});

describe('ErrorDisplay', () => {
  it('renders error message and retry button', () => {
    const onRetry = jest.fn();
    render(<ErrorDisplay error="Connection failed&quot; onRetry={onRetry} />);

    expect(screen.getByText("Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders default message when error is null', () => {
    render(<ErrorDisplay />);

    expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('There was an error loading the requested data.')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders custom message and action component', () => {
    render(
      <EmptyState
        message="No data available&quot;
        actionComponent={<button data-testid="empty-action">New Item</button>}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByTestId('empty-action')).toBeInTheDocument();
  });

  it('renders default message when not provided', () => {
    render(<EmptyState />);

    expect(screen.getByText('No Items Found')).toBeInTheDocument();
  });
});
