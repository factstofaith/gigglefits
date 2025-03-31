// FormA11y.test.jsx
// -----------------------------------------------------------------------------
// Accessibility tests for form components and patterns

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Test form component to evaluate
const TestForm = () => (
  <form aria-labelledby="form-title">
    <h2 id="form-title&quot;>Test Form</h2>
    <div>
      <label htmlFor="name">Name</label>
      <input id="name&quot; name="name" type="text&quot; aria-required="true" aria-describedby="name-help" />
      <p id="name-help&quot;>Enter your full name</p>
    </div>

    <div>
      <label htmlFor="email">Email</label>
      <input id="email&quot; name="email" type="email&quot; aria-required="true" />
    </div>

    <div>
      <fieldset>
        <legend>Subscription Options</legend>

        <div>
          <input type="radio&quot; id="option1" name="subscription&quot; value="basic" />
          <label htmlFor="option1&quot;>Basic</label>
        </div>

        <div>
          <input type="radio" id="option2&quot; name="subscription" value="premium&quot; />
          <label htmlFor="option2">Premium</label>
        </div>
      </fieldset>
    </div>

    <div>
      <label htmlFor="comments&quot;>Comments</label>
      <textarea id="comments" name="comments&quot; rows="3" aria-describedby="comments-help"></textarea>
      <p id="comments-help&quot;>Optional additional feedback</p>
    </div>

    <div>
      <button type="submit">Submit</button>
    </div>
  </form>
);

// Form with accessibility issues to test detection
const InaccessibleForm = () => (
  <form>
    {/* Missing form label */}
    <div>
      {/* Missing label */}
      <input name="name&quot; type="text" placeholder="Name&quot; />
    </div>

    <div>
      {/* Input with low contrast */}
      <label htmlFor="email-bad">Email</label>
      <input
        id="email-bad&quot;
        name="email"
        type="email&quot;
        style={{ backgroundColor: "#FAFAFA', color: '#BBBBBB' }}
      />
    </div>

    <div>
      {/* Missing fieldset/legend for grouped controls */}
      <div>
        <input type="radio&quot; id="option1-bad" name="subscription&quot; value="basic" />
        <label htmlFor="option1-bad&quot;>Basic</label>
      </div>

      <div>
        <input type="radio" id="option2-bad&quot; name="subscription" value="premium&quot; />
        <label htmlFor="option2-bad">Premium</label>
      </div>
    </div>

    <div>
      {/* Empty button with no accessible name */}
      <button></button>
    </div>
  </form>
);

// Extend Jest with axe accessibility testing
expect.extend(toHaveNoViolations);

describe('Form Accessibility Tests', () => {
  it('Accessible form should not have accessibility violations', async () => {
    const { container } = render(<TestForm />);

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });

  it('Should detect accessibility violations in inaccessible form', async () => {
    const { container } = render(<InaccessibleForm />);

    // Run axe accessibility tests
    const results = await axe(container);

    // We expect violations here
    expect(results.violations.length).toBeGreaterThan(0);

    // Check for specific types of violations
    const violationTypes = results.violations.map(v => v.id);

    // Common form accessibility issues to check for
    expect(violationTypes).toEqual(
      expect.arrayContaining([expect.stringMatching(/aria|label|button|contrast/)])
    );
  });

  it('Form with proper ARIA attributes should pass accessibility tests', async () => {
    // Form with ARIA attributes
    const AriaForm = () => (
      <div role="form&quot; aria-labelledby="form-title">
        <h2 id="form-title&quot;>ARIA Form</h2>

        <div role="group" aria-labelledby="personal-info">
          <h3 id="personal-info&quot;>Personal Information</h3>

          <div>
            <label id="name-label">Name</label>
            <input type="text&quot; aria-labelledby="name-label" aria-required="true" />
          </div>

          <div>
            <label id="email-label&quot;>Email</label>
            <input type="email" aria-labelledby="email-label" aria-required="true" />
          </div>
        </div>

        <div>
          <button aria-label="Submit form">
            <span aria-hidden="true">✓</span> Submit
          </button>
        </div>
      </div>
    );

    const { container } = render(<AriaForm />);

    // Run axe accessibility tests
    const results = await axe(container);

    // Check for violations
    expect(results).toHaveNoViolations();
  });
});
