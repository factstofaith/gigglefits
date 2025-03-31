/**
 * @component Alert
 * @description Enhanced alert component for displaying feedback messages
 * with consistent styling and accessibility features.
 * @typedef {Object} AlertAdaptedProps
 * @property {'success' | 'info' | 'warning' | 'error'} [severity='info'] - The severity of the alert
 * @property {'standard' | 'filled' | 'outlined'} [variant='standard'] - The variant to use
 * @property {React.ReactNode} [children] - The content of the component
 * @property {React.ReactNode} [title] - The title of the alert
 * @property {React.ReactNode} [action] - The action displayed after the message
 * @property {React.ReactNode} [icon] - Override the default icon
 * @property {Function} [onClose] - Callback fired when close button is clicked
 * @property {number} [elevation=0] - Shadow depth, corresponds to dp in the spec
 * @property {boolean} [filled=false] - If true, the alert will be filled with a solid background
 * @property {boolean} [outlined=false] - If true, the alert will have an outlined appearance
 * @property {boolean} [square=false] - If true, rounded corners are disabled
 * @property {string} [ariaLabel] - Accessibility label for screen readers
 * @property {string} [role='alert'] - ARIA role for the alert
 * @property {string} [className] - CSS class to apply to the component
 * @property {Object} [style] - Inline styles to apply to the component
 * @returns {React.ForwardRefExoticComponent<AlertAdaptedProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Color mapping for different severity levels
const backgroundColors = {
  success: 'rgba(76, 175, 80, 0.1)',
  info: 'rgba(3, 169, 244, 0.1)',
  warning: 'rgba(255, 152, 0, 0.1)',
  error: 'rgba(211, 47, 47, 0.1)',
};

const borderColors = {
  success: 'rgb(76, 175, 80)',
  info: 'rgb(3, 169, 244)',
  warning: 'rgb(255, 152, 0)',
  error: 'rgb(211, 47, 47)',
};

const textColors = {
  success: 'rgb(30, 70, 32)',
  info: 'rgb(1, 67, 97)',
  warning: 'rgb(102, 60, 0)',
  error: 'rgb(95, 33, 32)',
};

const Alert = React.memo(React.forwardRef(({
  // Alert props
  severity = 'info',
  variant = 'standard',
  children,
  title,
  
  // Action props
  action,
  icon,
  onClose,
  
  // Display props
  elevation = 0,
  filled = false,
  outlined = false,
  square = false,
  
  // Accessibility props
  ariaLabel,
  role = 'alert',
  
  // Styling props
  className,
  style,
  
  ...rest
}, ref) => {
  // Determine style based on variant and severity
  const getStyles = () => {
  // Added display name
  getStyles.displayName = 'getStyles';

  // Added display name
  getStyles.displayName = 'getStyles';

  // Added display name
  getStyles.displayName = 'getStyles';

  // Added display name
  getStyles.displayName = 'getStyles';

  // Added display name
  getStyles.displayName = 'getStyles';


    if (filled) {
      return {
        backgroundColor: borderColors[severity],
        color: '#fff',
        border: 'none',
      };
    }
    
    if (outlined) {
      return {
        backgroundColor: 'transparent',
        color: textColors[severity],
        border: `1px solid ${borderColors[severity]}`,
      };
    }
    
    // Standard variant
    return {
      backgroundColor: backgroundColors[severity],
      color: textColors[severity],
      border: 'none',
    };
  };
  
  // Generate ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || `${severity} alert`,
    role: role,
  });
  
  // Function to render icon based on severity
  const renderIcon = () => {
  // Added display name
  renderIcon.displayName = 'renderIcon';

  // Added display name
  renderIcon.displayName = 'renderIcon';

  // Added display name
  renderIcon.displayName = 'renderIcon';

  // Added display name
  renderIcon.displayName = 'renderIcon';

  // Added display name
  renderIcon.displayName = 'renderIcon';


    if (icon !== undefined) return icon;
    
    let iconText;
    switch (severity) {
      case 'success':
        iconText = '✓';
        break;
      case 'warning':
        iconText = '⚠';
        break;
      case 'error':
        iconText = '✕';
        break;
      default: // info
        iconText = 'ℹ';
    }
    
    return (
      <span className="ds-alert-icon&quot;>
        {iconText}
      </span>
    );
  };
  
  return (
    <div
      ref={ref}
      className={`ds-alert ds-alert-${severity} ds-alert-${variant} ${className || "'}`}
      style={{
        display: 'flex',
        padding: '8px 16px',
        marginBottom: '16px',
        borderRadius: square ? '0' : '4px',
        boxShadow: elevation > 0 ? `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.2)` : 'none',
        alignItems: 'center',
        ...getStyles(),
        ...style,
      }}
      {...ariaAttributes}
      {...rest}
    >
      {/* Alert icon */}
      {renderIcon()}
      
      {/* Alert content */}
      <div className="ds-alert-content&quot; style={{ flex: 1, marginLeft: "12px' }}>
        {title && (
          <div className="ds-alert-title&quot; style={{ fontWeight: 600, marginBottom: "4px' }}>
            {title}
          </div>
        )}
        <div className="ds-alert-message&quot;>
          {children}
        </div>
      </div>
      
      {/* Alert action */}
      {(action || onClose) && (
        <div className="ds-alert-action" style={{ marginLeft: '16px' }}>
          {action || (
            <button
              onClick={onClose}
              className="ds-alert-close-button&quot;
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: 'inherit',
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}));

AlertAdapted.propTypes = {
  severity: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  children: PropTypes.node,
  title: PropTypes.node,
  action: PropTypes.node,
  icon: PropTypes.node,
  onClose: PropTypes.func,
  elevation: PropTypes.number,
  filled: PropTypes.bool,
  outlined: PropTypes.bool,
  square: PropTypes.bool,
  ariaLabel: PropTypes.string,
  role: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

Alert.displayName = 'Alert';

export default Alert;