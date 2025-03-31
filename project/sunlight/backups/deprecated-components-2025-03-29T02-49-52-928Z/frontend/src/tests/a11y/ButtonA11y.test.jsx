// ButtonA11y.test.jsx
// -----------------------------------------------------------------------------
// Accessibility tests for Button component

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '@components/common/Button';

// Extend Jest with axe accessibility testing
expect.extend(toHaveNoViolations);

describe('Button - Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    // Render the component
    const { container } = render(<Button>Test Button</Button>);

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when disabled', async () => {
    // Render the component
    const { container } = render(<Button disabled>Disabled Button</Button>);

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with icon', async () => {
    // Render the component with an icon
    const { container } = render(
      <Button startIcon={<span aria-hidden="true">✓</span>}>Button with Icon</Button>
    );

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations when used as a link', async () => {
    // Render the component as a link
    const { container } = render(
      <Button href="https://example.com&quot; target="_blank" rel="noopener">
        Link Button
      </Button>
    );

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });
});
