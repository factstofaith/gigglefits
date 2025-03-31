// ChatSupportPanel.jsx
// -----------------------------------------------------------------------------
// Chat widget that appears in the corner for user support

import React, { useState } from 'react';
import { Box } from '../../../design-system'
import { Typography } from '../../../design-system'
import { Button } from '../../../design-system'
import { TextField } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import Box from '@mui/material/Box';
function ChatSupportPanel() {
  // Added display name
  ChatSupportPanel.displayName = 'ChatSupportPanel';

  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'Support', text: 'Hello! How can we help you today?' },
  ]);
  const [draftMessage, setDraftMessage] = useState('');

  // Toggle open/close
  const togglePanel = () => {
  // Added display name
  togglePanel.displayName = 'togglePanel';

  // Added display name
  togglePanel.displayName = 'togglePanel';

  // Added display name
  togglePanel.displayName = 'togglePanel';

  // Added display name
  togglePanel.displayName = 'togglePanel';

  // Added display name
  togglePanel.displayName = 'togglePanel';


    setIsOpen(!isOpen);
  };

  const handleSend = () => {
  // Added display name
  handleSend.displayName = 'handleSend';

  // Added display name
  handleSend.displayName = 'handleSend';

  // Added display name
  handleSend.displayName = 'handleSend';

  // Added display name
  handleSend.displayName = 'handleSend';

  // Added display name
  handleSend.displayName = 'handleSend';


    if (!draftMessage.trim()) return;

    // Add the user's message
    const userMsg = { from: 'You', text: draftMessage };
    setMessages([...messages, userMsg]);
    setDraftMessage('');

    // Simulate a support response after a short delay
    setTimeout(() => {
      const responseMsg = {
        from: 'Support',
        text: 'Thanks for your message. Our team will get back to you soon.',
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
  };

  const brandColor = '#48C2C5'; // Use the defined brand color

  return (
    <Box
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        width: isOpen ? '300px' : '80px',
        height: isOpen ? '400px' : '40px',
        backgroundColor: isOpen ? (theme?.colors?.background?.paper || '#FFFFFF') : brandColor,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {!isOpen && (
        <Box
          style={{
            backgroundColor: brandColor,
            color: '#FFFFFF',
            padding: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={togglePanel}
        >
          <Typography variant="body1&quot; style={{ color: "#FFFFFF' }}>
            Chat
          </Typography>
        </Box>
      )}

      {isOpen && (
        <>
          <Box
            style={{
              backgroundColor: brandColor,
              color: '#FFFFFF',
              padding: '8px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={togglePanel}
          >
            <Typography variant="body1&quot; style={{ color: "#FFFFFF' }}>
              Support Chat
            </Typography>
          </Box>

          <Box
            style={{
              flex: 1,
              padding: '8px',
              overflowY: 'auto',
              fontSize: '14px',
            }}
          >
            {messages.map((msg, index) => (
              <Box key={index} style={{ marginBottom: '8px' }}>
                <Typography variant="body2&quot;>
                  <strong>{msg.from}:</strong> {msg.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            style={{
              display: "flex',
              padding: '8px',
              borderTop: `1px solid ${theme?.colors?.divider || '#E0E0E0'}`,
            }}
          >
            <TextField
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message...&quot;
              style={{ 
                flex: 1, 
                marginRight: "8px'
              }}
            />
            <Button 
              onClick={handleSend} 
              style={{ 
                backgroundColor: brandColor, 
                minWidth: '60px',
                color: '#FFFFFF'
              }}
            >
              Send
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default ChatSupportPanel;
