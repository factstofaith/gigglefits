// PortalModal.jsx
// -----------------------------------------------------------------------------
// A "portal" based modal that reduces Layout/ResizeObserver triggers, because
// it's mounted outside of the main React root flow. 
// 
// Still uses your brand colors. No repeated animations on mount/unmount
// that might cause cyclical measuring. 
//
// Dependencies: 
//   - React and ReactDOM from 'react-dom' (for createPortal)
//   - A <div id="modal-root"></div> in your public/index.html or a static container
//
// Usage:
//   <PortalModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
//     <h2>My Modal</h2>
//     <p>Content goes here</p>
//   </PortalModal>
//
// This approach doesn't guarantee removing the "ResizeObserver loop" warning
// in all cases, but it usually helps by removing the modal from the measured
// layout of the main page.

import React from 'react';
import ReactDOM from 'react-dom';

function PortalModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  // The overlay and modal container styles are minimal, but you can adjust
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(59,61,61,0.5)', // black #3B3D3D with alpha
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  };

  const modalStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '1.5rem',
    minWidth: '300px',
    maxWidth: '600px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#48C2C5',
    border: 'none',
    borderRadius: '4px',
    color: '#FFFFFF',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer'
  };

  // The content of the modal:
  const modalContent = (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button 
          style={closeButtonStyle}
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );

  // We "portal" this to #modal-root to keep it separate from the main layout flow.
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default PortalModal;
