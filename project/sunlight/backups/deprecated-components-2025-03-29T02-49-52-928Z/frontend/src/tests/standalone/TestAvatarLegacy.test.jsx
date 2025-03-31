// TestAvatarLegacy.test.jsx
// Independent test file for AvatarLegacy that doesn't rely on any external dependencies

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import Avatar from './TestAvatarLegacy';

// Test suite
describe('AvatarLegacy Component', () => {
  // Basic rendering tests
  it('renders an avatar element', () => {
    render(<AvatarLegacy>A</AvatarLegacy>);

    const avatar = screen.getByTestId('avatar-legacy');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('A');
  });

  it('applies the correct default classes', () => {
    render(<AvatarLegacy>A</AvatarLegacy>);

    const avatar = screen.getByTestId('avatar-legacy');
    expect(avatar).toHaveClass('avatar');
    expect(avatar).toHaveClass('avatar-circular');
    expect(avatar).toHaveClass('avatar-default');
  });

  // Variant tests
  it('applies the correct classes for rounded variant', () => {
    render(<AvatarLegacy variant="rounded&quot;>A</AvatarLegacy>);

    const avatar = screen.getByTestId("avatar-legacy');
    expect(avatar).toHaveClass('avatar-rounded');
  });

  it('applies the correct classes for square variant', () => {
    render(<AvatarLegacy variant="square&quot;>A</AvatarLegacy>);

    const avatar = screen.getByTestId("avatar-legacy');
    expect(avatar).toHaveClass('avatar-square');
  });

  // Color tests
  it('applies the correct classes for primary color', () => {
    render(<AvatarLegacy color="primary&quot;>A</AvatarLegacy>);

    const avatar = screen.getByTestId("avatar-legacy');
    expect(avatar).toHaveClass('avatar-primary');
  });

  it('applies the correct classes for secondary color', () => {
    render(<AvatarLegacy color="secondary&quot;>A</AvatarLegacy>);

    const avatar = screen.getByTestId("avatar-legacy');
    expect(avatar).toHaveClass('avatar-secondary');
  });

  // Image rendering tests
  it('renders an image when src is provided', () => {
    render(<AvatarLegacy src="https://example.com/image.jpg&quot; alt="Test Image" />);

    const avatar = screen.getByTestId('avatar-legacy');
    const image = screen.getByTestId('avatar-image');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Image');
  });

  it('applies alt text correctly to the image', () => {
    render(<AvatarLegacy src="https://example.com/image.jpg&quot; alt="Test Alt" />);

    const image = screen.getByTestId('avatar-image');
    expect(image).toHaveAttribute('alt', 'Test Alt');
  });

  it('uses default alt text when none is provided', () => {
    render(<AvatarLegacy src="https://example.com/image.jpg&quot; />);

    const image = screen.getByTestId("avatar-image');
    expect(image).toHaveAttribute('alt', 'avatar');
  });

  // Custom component tests
  it('renders with a custom component', () => {
    const CustomComponent = props => <span data-testid="custom-component" {...props} />;
    render(<AvatarLegacy component={CustomComponent}>Custom</AvatarLegacy>);

    const customComponent = screen.getByTestId('custom-component');
    expect(customComponent).toBeInTheDocument();
    expect(customComponent).toHaveTextContent('Custom');
  });

  // Style and className tests
  it('applies custom className correctly', () => {
    render(<AvatarLegacy className="custom-class&quot;>A</AvatarLegacy>);

    const avatar = screen.getByTestId("avatar-legacy');
    expect(avatar).toHaveClass('custom-class');
  });

  it('applies custom styles correctly', () => {
    render(<AvatarLegacy style={{ backgroundColor: 'red' }}>A</AvatarLegacy>);

    const avatar = screen.getByTestId('avatar-legacy');
    expect(avatar).toHaveStyle('background-color: red');
  });

  // Image props tests
  it('passes imgProps correctly to the image element', () => {
    render(
      <AvatarLegacy
        src="https://example.com/image.jpg&quot;
        imgProps={{ loading: "lazy', className: 'test-img-class' }}
      />
    );

    const image = screen.getByTestId('avatar-image');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveClass('test-img-class');
  });

  it('passes srcSet and sizes correctly to the image element', () => {
    render(
      <AvatarLegacy
        src="https://example.com/image.jpg&quot;
        srcSet="https://example.com/image.jpg 1x, https://example.com/image@2x.jpg 2x"
        sizes="(max-width: 600px) 100px, 200px&quot;
      />
    );

    const image = screen.getByTestId("avatar-image');
    expect(image).toHaveAttribute(
      'srcSet',
      'https://example.com/image.jpg 1x, https://example.com/image@2x.jpg 2x'
    );
    expect(image).toHaveAttribute('sizes', '(max-width: 600px) 100px, 200px');
  });
});
