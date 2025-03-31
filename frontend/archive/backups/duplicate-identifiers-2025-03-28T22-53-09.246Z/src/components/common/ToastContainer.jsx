// ToastContainer.jsx
import React from 'react';
import { Box } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
import useNotification from '@hooks/useNotification';
import Toast from './Toast';
import Box from '@mui/material/Box';
const ToastContainer = () => {
  // Added display name
  ToastContainer.displayName = 'ToastContainer';

  // Added display name
  ToastContainer.displayName = 'ToastContainer';

  // Added display name
  ToastContainer.displayName = 'ToastContainer';


  const { toasts, removeNotification } = useNotification();
  const { theme } = useTheme();

  // Handle toast close
  const handleClose = id => () => {
    removeNotification(id, true);
  };

  return (
    <Box
      style={{
        position: 'fixed',
        top: theme?.spacing?.md || '16px',
        right: theme?.spacing?.md || '16px',
        zIndex: theme?.zIndex?.toast || 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: theme?.spacing?.sm || '8px',
      }}
    >
      {toasts.map((toast, index) => (
        <div 
          className="toast-animation-container" 
          key={toast.id}
          style={{ 
            marginBottom: theme?.spacing?.sm || '8px',
            animation: 'slideInLeft 0.3s ease forwards'
          }}
        >
          <Toast
            open={true}
            onClose={handleClose(toast.id)}
            message={toast.message}
            type={toast.type || 'info'}
            autoHideDuration={toast.duration || 5000}
            title={toast.title}
            action={toast.action}
          />
        </div>
      ))}
      <style jsx="true">{`
        @keyframes slideInLeft {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default ToastContainer;
