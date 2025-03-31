/**
 * @component Tooltip
 * @description An enhanced tooltip component that shows additional information on hover
 * with custom placement, delay, and accessibility features.
 * 
 * @typedef {import('../../types/feedback').TooltipProps} TooltipProps
 * @type {React.FC<TooltipProps>}
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Popper, Fade } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * TooltipAdapted component
 * 
 * @type {React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<HTMLDivElement>>}
 */
const Tooltip = React.memo(({
  children,
  title,
  placement = 'bottom',
  arrow = false,
  enterDelay = 400,
  leaveDelay = 0,
  open: openProp,
  disableHoverListener = false,
  disableTouchListener = false,
  disableFocusListener = false,
  
  // Appearance
  maxWidth = 300,
  
  // Accessibility
  ariaLabel,
  
  // Additional props
  ...rest
}) => {
  // Reference for the tooltip anchor element
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Controlled/uncontrolled state handling
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  
  // Timer references for delays
  const enterTimer = React.useRef();
  const leaveTimer = React.useRef();
  
  // Clear timers on unmount
  React.useEffect(() => {
    return () => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
    };
  }, []);
  
  // Handle mouse enter
  const handleMouseEnter = useCallback((event) => {
  // Added display name
  handleMouseEnter.displayName = 'handleMouseEnter';

    if (disableHoverListener) return;
    
    clearTimeout(leaveTimer.current);
    
    // Anchor element for the tooltip
    setAnchorEl(event.currentTarget);
    
    // Set delayed open
    enterTimer.current = setTimeout(() => {
      setOpenState(true);
    }, enterDelay);
  }, [disableHoverListener, enterDelay]);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
  // Added display name
  handleMouseLeave.displayName = 'handleMouseLeave';

    if (disableHoverListener) return;
    
    clearTimeout(enterTimer.current);
    
    // Set delayed close
    leaveTimer.current = setTimeout(() => {
      setOpenState(false);
    }, leaveDelay);
  }, [disableHoverListener, leaveDelay]);
  
  // Handle focus
  const handleFocus = useCallback((event) => {
  // Added display name
  handleFocus.displayName = 'handleFocus';

    if (disableFocusListener) return;
    
    setAnchorEl(event.currentTarget);
    setOpenState(true);
  }, [disableFocusListener]);
  
  // Handle blur
  const handleBlur = useCallback(() => {
  // Added display name
  handleBlur.displayName = 'handleBlur';

    if (disableFocusListener) return;
    
    setOpenState(false);
  }, [disableFocusListener]);
  
  // Handle touch
  const handleTouchStart = useCallback((event) => {
  // Added display name
  handleTouchStart.displayName = 'handleTouchStart';

    if (disableTouchListener) return;
    
    setAnchorEl(event.currentTarget);
    setOpenState(true);
  }, [disableTouchListener]);
  
  // Determine arrow placement styling
  const getArrowStyles = () => {
  // Added display name
  getArrowStyles.displayName = 'getArrowStyles';

  // Added display name
  getArrowStyles.displayName = 'getArrowStyles';

  // Added display name
  getArrowStyles.displayName = 'getArrowStyles';

  // Added display name
  getArrowStyles.displayName = 'getArrowStyles';

  // Added display name
  getArrowStyles.displayName = 'getArrowStyles';


    if (!arrow) return {};
    
    // Arrow styling based on placement
    const arrowStyles = {
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'inherit',
        transform: 'rotate(45deg)',
      }
    };
    
    // Position the arrow based on placement
    if (placement === 'top') {
      arrowStyles['&::before'].bottom = -4;
      arrowStyles['&::before'].left = 'calc(50% - 4px)';
    } else if (placement === 'bottom') {
      arrowStyles['&::before'].top = -4;
      arrowStyles['&::before'].left = 'calc(50% - 4px)';
    } else if (placement === 'left') {
      arrowStyles['&::before'].right = -4;
      arrowStyles['&::before'].top = 'calc(50% - 4px)';
    } else if (placement === 'right') {
      arrowStyles['&::before'].left = -4;
      arrowStyles['&::before'].top = 'calc(50% - 4px)';
    }
    
    return arrowStyles;
  };
  
  return (
    <React.Fragment>
      {/* Wrap children with event handlers */}
      <Box
        component="span&quot;
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onTouchStart={handleTouchStart}
        aria-label={ariaLabel || (typeof title === "string' ? title : undefined)}
        sx={{ display: 'inline-flex' }}
      >
        {children}
      </Box>
      
      {/* Tooltip content */}
      <Popper
        open={open && Boolean(anchorEl) && Boolean(title)}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{
          zIndex: 1500,
          pointerEvents: 'none',
        }}
        {...rest}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Box
              role="tooltip&quot;
              sx={{
                backgroundColor: "rgba(97, 97, 97, 0.92)',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '4px',
                maxWidth,
                wordWrap: 'break-word',
                fontWeight: 500,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                marginTop: placement === 'bottom' ? '8px' : 0,
                marginBottom: placement === 'top' ? '8px' : 0,
                marginLeft: placement === 'right' ? '8px' : 0,
                marginRight: placement === 'left' ? '8px' : 0,
                ...getArrowStyles(),
                ...(rest.sx || {})
              }}
            >
              {title}
            </Box>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  );
});

TooltipAdapted.propTypes = {
  // Content
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  
  // Placement
  placement: PropTypes.oneOf([
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end'
  ]),
  
  // Appearance
  arrow: PropTypes.bool,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  // Behavior
  enterDelay: PropTypes.number,
  leaveDelay: PropTypes.number,
  open: PropTypes.bool,
  disableHoverListener: PropTypes.bool,
  disableTouchListener: PropTypes.bool,
  disableFocusListener: PropTypes.bool,
  
  // Accessibility
  ariaLabel: PropTypes.string,
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;