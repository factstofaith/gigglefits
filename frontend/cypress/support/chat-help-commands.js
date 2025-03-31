// chat-help-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Chat Support and User Help features

/**
 * Open the chat support panel
 * Finds and clicks the chat button to open the panel
 */
Cypress.Commands.add('openChatPanel', () => {
  cy.log('Opening chat support panel');
  
  // Find and click the chat button
  // The chat button is the small collapsed version of the panel
  cy.contains('Chat').should('be.visible').click();
  
  // Verify the panel is open
  cy.contains('Support Chat').should('be.visible');
  cy.get('input[placeholder="Type a message..."]').should('be.visible');
});

/**
 * Close the chat support panel
 * Finds and clicks the header to close the panel
 */
Cypress.Commands.add('closeChatPanel', () => {
  cy.log('Closing chat support panel');
  
  // Find and click the header to close the panel
  cy.contains('Support Chat').should('be.visible').click();
  
  // Verify the panel is closed
  cy.contains('Support Chat').should('not.exist');
  cy.contains('Chat').should('be.visible');
});

/**
 * Send a chat message
 * Types a message and clicks send (or presses Enter)
 * 
 * @param {string} message - The message to send
 * @param {boolean} useEnterKey - Whether to use Enter key instead of click
 */
Cypress.Commands.add('sendChatMessage', (message, useEnterKey = false) => {
  cy.log(`Sending chat message: ${message}`);
  
  // Make sure the panel is open
  cy.get('input[placeholder="Type a message..."]').should('be.visible');
  
  // Type the message
  cy.get('input[placeholder="Type a message..."]').clear().type(message);
  
  // Send the message via click or Enter key
  if (useEnterKey) {
    cy.get('input[placeholder="Type a message..."]').type('{enter}');
  } else {
    cy.contains('button', 'Send').click();
  }
});

/**
 * Verify chat message exists
 * Checks if a specific message appears in the chat history
 * 
 * @param {string} message - The message text to verify
 * @param {string} sender - Expected sender ('You' or 'Support')
 */
Cypress.Commands.add('verifyChatMessage', (message, sender = 'You') => {
  cy.log(`Verifying chat message: ${message} from ${sender}`);
  
  // Check for the message with the correct sender
  cy.contains(`${sender}: ${message}`).should('be.visible');
});

/**
 * Verify chat panel state
 * Checks if the chat panel is open or closed
 * 
 * @param {boolean} isOpen - Expected state of the panel
 */
Cypress.Commands.add('verifyChatPanelState', (isOpen) => {
  cy.log(`Verifying chat panel is ${isOpen ? 'open' : 'closed'}`);
  
  if (isOpen) {
    cy.contains('Support Chat').should('be.visible');
    cy.get('input[placeholder="Type a message..."]').should('be.visible');
  } else {
    cy.contains('Support Chat').should('not.exist');
    cy.contains('Chat').should('be.visible');
  }
});

/**
 * Open keyboard shortcuts dialog
 * Either presses the ? key or uses a direct approach to open the dialog
 * 
 * @param {boolean} useShortcut - Whether to use ? shortcut or direct open
 */
Cypress.Commands.add('openKeyboardShortcutsDialog', (useShortcut = true) => {
  cy.log('Opening keyboard shortcuts dialog');
  
  if (useShortcut) {
    // Use the ? keyboard shortcut
    cy.get('body').type('?');
  } else {
    // For direct approach, we'll need to trigger the dialog manually
    // This might be different based on your app, but we'll intercept the call
    cy.window().then((win) => {
      win.dispatchEvent(new KeyboardEvent('keydown', {
        key: '?',
        bubbles: true
      }));
    });
  }
  
  // Verify the dialog is open
  cy.contains('Keyboard Shortcuts').should('be.visible');
});

/**
 * Close keyboard shortcuts dialog
 * Clicks the close button on the dialog
 */
Cypress.Commands.add('closeKeyboardShortcutsDialog', () => {
  cy.log('Closing keyboard shortcuts dialog');
  
  cy.contains('button', 'Close').click();
  
  // Verify the dialog is closed
  cy.contains('Keyboard Shortcuts').should('not.exist');
});

/**
 * Select shortcuts category
 * Clicks on a category tab in the shortcuts dialog
 * 
 * @param {string} category - Category name to select
 */
Cypress.Commands.add('selectShortcutCategory', (category) => {
  cy.log(`Selecting shortcut category: ${category}`);
  
  // Find and click the category tab
  cy.get('[role="tab"]').contains(category).click();
  
  // Verify the tab is selected (has aria-selected="true")
  cy.get('[role="tab"]').contains(category).should('have.attr', 'aria-selected', 'true');
});

/**
 * Verify shortcut exists in the dialog
 * Checks if a specific shortcut and description appear in the current view
 * 
 * @param {string} keyCombo - Key combination (e.g., "Ctrl + S")
 * @param {string} description - Description text
 */
Cypress.Commands.add('verifyShortcutExists', (keyCombo, description) => {
  cy.log(`Verifying shortcut exists: ${keyCombo} - ${description}`);
  
  // Look for the key combination - keys are in separate elements but next to each other
  const keys = keyCombo.split(' + ');
  
  // Check for the description
  cy.contains(description).should('be.visible');
  
  // Check for keys (they might be wrapped in key caps)
  keys.forEach(key => {
    // The key should be visible somewhere in the dialog
    cy.contains(key).should('be.visible');
  });
});

/**
 * Simulate keyboard shortcut
 * Triggers a keyboard shortcut and optionally checks for a result
 * 
 * @param {string} keys - Keys to press (comma separated for sequence)
 * @param {string} modifier - Modifier key (ctrl, alt, shift, meta)
 * @param {Function} verification - Optional callback to verify result
 */
Cypress.Commands.add('triggerKeyboardShortcut', (keys, modifier = null, verification = null) => {
  cy.log(`Triggering keyboard shortcut: ${modifier ? modifier + ' + ' : ''}${keys}`);
  
  // Split if multiple keys in sequence
  const keyArray = keys.split(',');
  
  // Build the key options
  const keyOptions = {};
  if (modifier === 'ctrl') keyOptions.ctrlKey = true;
  if (modifier === 'alt') keyOptions.altKey = true;
  if (modifier === 'shift') keyOptions.shiftKey = true;
  if (modifier === 'meta') keyOptions.metaKey = true;
  
  // Type each key with modifiers
  keyArray.forEach(key => {
    cy.get('body').trigger('keydown', {
      key: key.trim(),
      ...keyOptions,
      bubbles: true
    });
  });
  
  // Run verification if provided
  if (verification && typeof verification === 'function') {
    verification();
  }
});

/**
 * Check accessibility for chat and help components
 * Uses axe to check for accessibility issues
 * 
 * @param {string} context - Description of the current context for logging
 * @param {string} selector - Optional CSS selector to limit the check
 */
Cypress.Commands.add('checkChatHelpA11y', (context = 'component', selector = null) => {
  cy.log(`Checking accessibility for: ${context}`);
  
  // Run the accessibility check
  cy.injectAxe();
  
  if (selector) {
    cy.checkA11y(selector, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  } else {
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  }
});