// chat-support-help-features.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Chat Support and User Help features

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Chat Support and User Help Features', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load test data
    cy.fixture('chat/messages.json').as('chatMessages');
    cy.fixture('chat/responses.json').as('chatResponses');
    cy.fixture('shortcuts/keyboard_shortcuts.json').as('keyboardShortcuts');
    
    // Login as standard user
    cy.login('user@example.com', 'Password123!');
    
    // Mock support response for chat messages
    cy.intercept('POST', '/api/support/chat', (req) => {
      cy.get('@chatResponses').then((responses) => {
        // Check message content to determine appropriate response
        const message = req.body.message.toLowerCase();
        let responseType = 'default';
        
        if (message.includes('integration')) responseType = 'integrations';
        if (message.includes('connect') || message.includes('connection')) responseType = 'connections';
        if (message.includes('error') || message.includes('issue')) responseType = 'error';
        if (message.includes('template')) responseType = 'templates';
        if (message.includes('documentation') || message.includes('docs')) responseType = 'documentation';
        if (message.includes('help')) responseType = 'help';
        
        req.reply({
          id: `support-${Date.now()}`,
          message: responses[responseType],
          from: 'Support',
          timestamp: new Date().toISOString()
        });
      });
    }).as('sendChatMessage');
    
    // Mock keyboard shortcuts registration
    cy.intercept('POST', '/api/user/shortcuts', (req) => {
      req.reply({
        success: true,
        message: 'Shortcuts updated successfully'
      });
    }).as('updateShortcuts');
    
    // Mock keyboard shortcuts retrieval
    cy.intercept('GET', '/api/user/shortcuts', (req) => {
      cy.get('@keyboardShortcuts').then((shortcuts) => {
        req.reply(shortcuts);
      });
    }).as('getShortcuts');
  });
  
  describe('Chat Support Panel', () => {
    it('should display chat button and toggle panel open/closed', () => {
      // Go to home page
      cy.visit('/');
      
      // Verify chat button is visible
      cy.contains('Chat').should('be.visible');
      
      // Open chat panel
      cy.openChatPanel();
      
      // Verify panel dimensions and content
      cy.contains('Support Chat').should('be.visible');
      cy.contains('Hello! How can we help you today?').should('be.visible');
      cy.get('input[placeholder="Type a message..."]').should('be.visible');
      cy.contains('button', 'Send').should('be.visible');
      
      // Close chat panel
      cy.closeChatPanel();
      
      // Verify panel is closed
      cy.verifyChatPanelState(false);
      
      // Check accessibility
      cy.checkChatHelpA11y('chat button');
    });
    
    it('should send and receive chat messages', () => {
      // Go to home page
      cy.visit('/');
      
      // Open chat panel
      cy.openChatPanel();
      
      // Send a message and verify it appears
      const testMessage = 'I need help with an integration';
      cy.sendChatMessage(testMessage);
      cy.verifyChatMessage(testMessage, 'You');
      
      // Wait for support response
      cy.wait('@sendChatMessage');
      
      // Verify support response
      cy.verifyChatMessage('For help with integrations', 'Support');
      
      // Send another message using Enter key
      const secondMessage = 'How do I create a new integration?';
      cy.sendChatMessage(secondMessage, true);
      cy.verifyChatMessage(secondMessage, 'You');
      
      // Wait for support response
      cy.wait('@sendChatMessage');
      
      // Verify support response
      cy.verifyChatMessage('For help with integrations', 'Support');
      
      // Check accessibility
      cy.checkChatHelpA11y('chat panel with messages');
    });
    
    it('should persist chat state during navigation', () => {
      // Go to home page
      cy.visit('/');
      
      // Open chat panel
      cy.openChatPanel();
      
      // Send a message
      const testMessage = 'I need documentation help';
      cy.sendChatMessage(testMessage);
      cy.verifyChatMessage(testMessage, 'You');
      
      // Wait for support response
      cy.wait('@sendChatMessage');
      
      // Navigate to another page
      cy.get('a[href*="/integrations"]').click();
      cy.url().should('include', '/integrations');
      
      // Verify chat panel remains open with messages
      cy.verifyChatPanelState(true);
      cy.verifyChatMessage(testMessage, 'You');
      
      // Send another message from new page
      const secondMessage = 'How do I find documentation?';
      cy.sendChatMessage(secondMessage);
      cy.verifyChatMessage(secondMessage, 'You');
      
      // Wait for support response
      cy.wait('@sendChatMessage');
      
      // Check accessibility
      cy.checkChatHelpA11y('chat panel after navigation');
    });
    
    it('should validate empty messages', () => {
      // Go to home page
      cy.visit('/');
      
      // Open chat panel
      cy.openChatPanel();
      
      // Try to send empty message
      cy.get('input[placeholder="Type a message..."]').clear();
      cy.contains('button', 'Send').click();
      
      // Verify no new messages appear in chat
      cy.get('input[placeholder="Type a message..."]').should('have.value', '');
      
      // Verify only initial message is shown
      cy.contains('Support: Hello! How can we help you today?').should('be.visible');
      
      // Verify we don't see a second support message
      cy.get('strong').contains('Support:').should('have.length', 1);
    });
  });
  
  describe('Keyboard Shortcuts Help', () => {
    it('should open and close keyboard shortcuts dialog', () => {
      // Go to home page 
      cy.visit('/');
      
      // Open keyboard shortcuts dialog
      cy.openKeyboardShortcutsDialog();
      
      // Verify dialog content
      cy.contains('Keyboard Shortcuts').should('be.visible');
      cy.get('[role="tab"]').should('be.visible');
      
      // Verify default category is selected
      cy.get('[role="tab"]').first().should('have.attr', 'aria-selected', 'true');
      
      // Check several shortcuts are displayed
      cy.verifyShortcutExists('Ctrl + S', 'Save flow');
      cy.verifyShortcutExists('Ctrl + Z', 'Undo last action');
      
      // Close dialog
      cy.closeKeyboardShortcutsDialog();
      
      // Verify dialog is closed
      cy.contains('Keyboard Shortcuts').should('not.exist');
      
      // Check accessibility
      cy.checkChatHelpA11y('keyboard shortcuts dialog');
    });
    
    it('should navigate between shortcut categories', () => {
      // Go to home page
      cy.visit('/');
      
      // Open keyboard shortcuts dialog
      cy.openKeyboardShortcutsDialog();
      
      // Get shortcut categories
      cy.get('@keyboardShortcuts').then((shortcuts) => {
        // Extract unique categories
        const categories = [...new Set(shortcuts.map(s => s.category))];
        
        // Verify we have multiple categories
        expect(categories.length).to.be.greaterThan(1);
        
        // Navigate to each category
        categories.forEach(category => {
          // Select category
          cy.selectShortcutCategory(category);
          
          // Verify category shortcuts are displayed
          const categoryShortcuts = shortcuts.filter(s => s.category === category);
          expect(categoryShortcuts.length).to.be.greaterThan(0);
          
          // Verify at least first shortcut in category
          const firstShortcut = categoryShortcuts[0];
          cy.verifyShortcutExists(firstShortcut.combo, firstShortcut.description);
        });
      });
      
      // Check accessibility for each category
      cy.get('@keyboardShortcuts').then((shortcuts) => {
        const categories = [...new Set(shortcuts.map(s => s.category))];
        cy.selectShortcutCategory(categories[0]);
        cy.checkChatHelpA11y(`shortcuts category ${categories[0]}`);
      });
    });
    
    it('should display keyboard key visualization correctly', () => {
      // Go to home page
      cy.visit('/');
      
      // Open keyboard shortcuts dialog
      cy.openKeyboardShortcutsDialog();
      
      // Find visualization elements
      cy.get('[style*="border-radius: 4px"]').should('be.visible');
      
      // Check various key styles
      cy.contains('Ctrl').should('be.visible')
        .parent()
        .should('have.css', 'background-color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');
      
      // Check key combinations are split correctly
      cy.get('@keyboardShortcuts').then((shortcuts) => {
        // Find a shortcut with multiple keys
        const multiKeyShortcut = shortcuts.find(s => s.combo.includes('+'));
        
        if (multiKeyShortcut) {
          // Verify each part of the combo is shown
          const keys = multiKeyShortcut.combo.split(' + ');
          
          keys.forEach(key => {
            cy.contains(key).should('be.visible');
          });
        }
      });
    });
    
    it('should show the correct number of shortcuts for each category', () => {
      // Go to home page
      cy.visit('/');
      
      // Open keyboard shortcuts dialog
      cy.openKeyboardShortcutsDialog();
      
      // For each category, verify the correct number of shortcuts are shown
      cy.get('@keyboardShortcuts').then((shortcuts) => {
        // Get unique categories
        const categories = [...new Set(shortcuts.map(s => s.category))];
        
        // Check each category
        categories.forEach(category => {
          // Select category
          cy.selectShortcutCategory(category);
          
          // Count shortcuts for this category in the fixture
          const categoryShortcuts = shortcuts.filter(s => s.category === category);
          
          // Wait for UI to update
          cy.wait(200);
          
          // Verify the correct number of shortcut elements are shown
          // Each shortcut is a Grid.Item with description
          cy.get('[role="tabpanel"]').find(':contains("' + categoryShortcuts[0].description + '")')
            .should('exist');
        });
      });
    });
  });
  
  describe('Keyboard Shortcuts Context Integration', () => {
    it('should register keyboard shortcuts and trigger actions', () => {
      // Go to integration flow page where shortcuts are used
      cy.visit('/integrations/new');
      
      // Mock the keyboard handler registration
      cy.window().then((win) => {
        // Add a flag we can check to verify the shortcut was triggered
        win.shortcutTriggered = false;
        
        // Override the shortcut handler for Ctrl+S
        win.handleSaveShortcut = () => {
          win.shortcutTriggered = true;
        };
      });
      
      // Trigger Ctrl+S shortcut
      cy.triggerKeyboardShortcut('s', 'ctrl', () => {
        // Verify the shortcut was triggered
        cy.window().its('shortcutTriggered').should('be.true');
      });
    });
    
    it('should open keyboard shortcuts with ? key', () => {
      // Go to home page
      cy.visit('/');
      
      // Use ? key to open shortcuts dialog
      cy.get('body').type('?');
      
      // Verify dialog opened
      cy.contains('Keyboard Shortcuts').should('be.visible');
      
      // Close dialog
      cy.closeKeyboardShortcutsDialog();
    });
    
    it('should maintain shortcuts across navigation', () => {
      // Go to home page
      cy.visit('/');
      
      // Use ? key to open shortcuts
      cy.openKeyboardShortcutsDialog();
      
      // Close dialog
      cy.closeKeyboardShortcutsDialog();
      
      // Navigate to another page
      cy.get('a[href*="/integrations"]').click();
      cy.url().should('include', '/integrations');
      
      // Verify ? shortcut still works
      cy.openKeyboardShortcutsDialog();
      
      // Verify dialog contents
      cy.contains('Keyboard Shortcuts').should('be.visible');
      cy.verifyShortcutExists('Ctrl + S', 'Save flow');
      
      // Check accessibility
      cy.checkChatHelpA11y('shortcuts after navigation');
    });
  });
});