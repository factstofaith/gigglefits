/**
 * @component AccordionSummary
 * @description The summary/header component of an accordion that controls expansion.
 * 
 * @typedef {import('../../types/feedback').AccordionSummaryProps} AccordionSummaryProps
 * @type {React.FC<AccordionSummaryProps>}
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box,
  Typography 
} from '../../design-system/adapter';

// Import directly to avoid circular dependencies
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * AccordionSummaryAdapted - The clickable header of an accordion
 */
const AccordionSummary = React.memo(({
  children,
  expanded = false,
  disabled = false,
  expandIcon = <ExpandMoreIcon />,
  onChange,
  focusRipple = false,
  disableRipple = false,
  
  // Accessibility
  ariaControls,
  
  // Additional props
  ...rest
}) => {
  // Handle click event
  const handleClick = useCallback((event) => {
  // Added display name
  handleClick.displayName = 'handleClick';

    if (disabled) return;
    
    if (onChange) {
      onChange(event);
    }
  }, [disabled, onChange]);
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((event) => {
  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onChange) {
        onChange(event);
      }
    }
  }, [disabled, onChange]);
  
  return (
    <Box
      component="div&quot;
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-expanded={expanded}
      aria-controls={ariaControls}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: expanded ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: disabled ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
        },
        ...(rest.sx || {})
      }}
      {...rest}
    >
      <Box sx={{ flex: 1 }}>
        {typeof children === 'string' ? (
          <Typography variant="subtitle1&quot; component="div">
            {children}
          </Typography>
        ) : (
          children
        )}
      </Box>
      
      {expandIcon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 1,
            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: disabled ? 'text.disabled' : 'inherit'
          }}
        >
          {expandIcon}
        </Box>
      )}
    </Box>
  );
});

AccordionSummaryAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  expandIcon: PropTypes.node,
  
  // State
  expanded: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  
  // Behavior
  focusRipple: PropTypes.bool,
  disableRipple: PropTypes.bool,
  
  // Accessibility
  ariaControls: PropTypes.string,
};

AccordionSummary.displayName = 'AccordionSummary';

export default AccordionSummary;