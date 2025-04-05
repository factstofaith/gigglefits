import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; // ChatSupportPanel.jsx
// -----------------------------------------------------------------------------
// Chat widget that appears in the corner for user support
import React, { useState } from 'react';
import Button from './Button';
function ChatSupportPanel() {
  const [formError, setFormError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    from: 'Support',
    text: 'Hello! How can we help you today?'
  }]);
  const [draftMessage, setDraftMessage] = useState('');

  // Toggle open/close
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  const handleSend = () => {
    if (!draftMessage.trim()) return;

    // Add the user's message
    const userMsg = {
      from: 'You',
      text: draftMessage
    };
    setMessages([...messages, userMsg]);
    setDraftMessage('');

    // Simulate a support response after a short delay
    setTimeout(() => {
      const responseMsg = {
        from: 'Support',
        text: 'Thanks for your message. Our team will get back to you soon.'
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
  };
  const panelStyle = {
    position: 'fixed',
    right: '1rem',
    bottom: '1rem',
    width: isOpen ? '300px' : '80px',
    height: isOpen ? '400px' : '40px',
    backgroundColor: isOpen ? '#FFFFFF' : '#48C2C5',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999
  };
  const headerStyle = {
    backgroundColor: '#48C2C5',
    color: '#FFFFFF',
    padding: '0.5rem',
    textAlign: 'center',
    cursor: 'pointer'
  };
  const messagesStyle = {
    flex: 1,
    padding: '0.5rem',
    overflowY: 'auto',
    fontSize: '0.9rem'
  };
  const inputContainerStyle = {
    display: 'flex',
    padding: '0.5rem',
    borderTop: '1px solid #E0E0E0'
  };
  const inputStyle = {
    flex: 1,
    marginRight: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #DDD',
    padding: '0.3rem'
  };
  return <div style={panelStyle}>
      {!isOpen && <div style={{
      ...headerStyle,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={togglePanel}>

          Chat
        </div>}

      
      {isOpen && <>
          <div style={headerStyle} onClick={togglePanel}>
            Support Chat
          </div>
          
          <div style={messagesStyle}>
            {messages.map((msg, index) => <div key={index} style={{
          marginBottom: '0.5rem'
        }}>
                <strong>{msg.from}:</strong> {msg.text}
              </div>)}

          </div>
          
          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type a message..." value={draftMessage} onChange={e => setDraftMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} />

            <Button onClick={handleSend} style={{
          backgroundColor: '#48C2C5',
          minWidth: '60px'
        }}>

              Send
            </Button>
          </div>
        </>}

    </div>;
}
export default ChatSupportPanel;