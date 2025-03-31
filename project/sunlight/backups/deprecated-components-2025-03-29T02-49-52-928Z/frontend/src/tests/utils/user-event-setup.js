import userEvent from '@testing-library/user-event';

/**
 * Setup user event instance with default options
 * @param {Object} options - Options for userEvent
 * @returns {Object} - User event instance
 */
export function setupUserEvent(options = {}) {
  // Added display name
  setupUserEvent.displayName = 'setupUserEvent';

  return userEvent.setup({
    // Default options
    advanceTimers: jest.advanceTimersByTime,
    ...options,
  });
}

export { userEvent };

/**
 * Utility function for testing form input
 * @param {Object} user - User event instance
 * @param {HTMLElement} element - Form element
 * @param {string} value - Value to type
 */
export async function typeIntoForm(user, element, value) {
  // Added display name
  typeIntoForm.displayName = 'typeIntoForm';

  await user.clear(element);
  await user.type(element, value);
}

/**
 * Utility function for testing form submission
 * @param {Object} user - User event instance
 * @param {HTMLElement} submitButton - Submit button element
 */
export async function clickSubmit(user, submitButton) {
  // Added display name
  clickSubmit.displayName = 'clickSubmit';

  await user.click(submitButton);
}

/**
 * Utility function for testing select inputs
 * @param {Object} user - User event instance
 * @param {HTMLElement} selectElement - Select element
 * @param {string} optionText - Option text to select
 */
export async function selectOption(user, selectElement, optionText) {
  // Added display name
  selectOption.displayName = 'selectOption';

  await user.click(selectElement);
  const option = document.querySelector(`li[data-value="${optionText}"]`) || 
                 document.querySelector(`li[role="option"]:has-text("${optionText}")`);
  if (option) {
    await user.click(option);
  } else {
    throw new Error(`Option with text "${optionText}" not found`);
  }
}

/**
 * Utility function for testing checkbox inputs
 * @param {Object} user - User event instance
 * @param {HTMLElement} checkboxElement - Checkbox element
 * @param {boolean} shouldBeChecked - Whether checkbox should be checked
 */
export async function toggleCheckbox(user, checkboxElement, shouldBeChecked) {
  // Added display name
  toggleCheckbox.displayName = 'toggleCheckbox';

  if (checkboxElement.checked !== shouldBeChecked) {
    await user.click(checkboxElement);
  }
}