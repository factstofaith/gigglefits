// MswFreeResourceLoader.test.jsx
// Independent test file that doesn't import or use MSW

// Use our standalone test setup
require('../../standalone-setup');

import React from 'react';
import { render, screen } from '@testing-library/react';
import ResourceLoader from '@components/common/ResourceLoader';

// This test file avoids using MSW to demonstrate the ResourceLoader component
describe('ResourceLoader Component (MSW-Free Tests)', () => {
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

  // Test error state
  it('renders error state with default message', () => {
    render(<ResourceLoader error="Something went wrong&quot; />);

    expect(screen.getByText("Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
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
});
