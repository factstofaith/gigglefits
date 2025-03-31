// AlertBox.jsx
// -----------------------------------------------------------------------------
// Displays an alert in brand colors, with optional close.

import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '../../design-system/legacy';

/**
 * AlertBox component displays alert messages with various severity types
 *
 * @param {Object} props - Component props
 * @param {string} [props.type='info'] - Alert type (success, error, warning, info)
 * @param {string|React.ReactNode} props.message - The alert message content
 * @param {Function} [props.onClose] - Optional callback when alert is closed
 * @return {React.ReactElement} The rendered AlertBox
 */
function AlertBox({ type = 'info', message, onClose }) {
  // Added display name
  AlertBox.displayName = 'AlertBox';

  // Map legacy type prop to severity for AlertLegacy
  const severityMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const severity = severityMap[type] || 'info';

  return (
    <AlertLegacy
      severity={severity}
      onClose={onClose}
      closable={Boolean(onClose)}
      variant="filled&quot;
      sx={{ margin: "1rem 0' }}
    >
      {typeof message === 'string' ? <Typography variant="body2&quot;>{message}</Typography> : message}
    </AlertLegacy>
  );
}

AlertBox.propTypes = {
  type: PropTypes.oneOf(["success', 'error', 'warning', 'info']),
  message: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default AlertBox;
