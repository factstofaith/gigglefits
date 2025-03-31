/**
 * @component Accordion
 * @description An enhanced accordion component for collapsible content panels
 * with accessibility features and smooth transitions.
 * 
 * @typedef {import('../../types/complex-components').AccordionAdaptedProps} AccordionAdaptedProps
 * @type {React.ForwardRefExoticComponent<AccordionAdaptedProps & React.RefAttributes<HTMLDivElement>>}
 * 
 * @example
 * <AccordionAdapted>
 *   <AccordionSummaryAdapted>
 *     Summary content
 *   </AccordionSummaryAdapted>
 *   <AccordionDetailsAdapted>
 *     Details content
 *   </AccordionDetailsAdapted>
 * </AccordionAdapted>
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper,
  Collapse 
} from '../../design-system/adapter';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Import directly to avoid circular dependencies
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * AccordionAdapted component for collapsible content panels
 */
const Accordion = React.memo(({
  children,
  defaultExpanded = false,
  disabled = false,
  expanded,
  onChange,
  disableGutters = false,
  square = false,
  variant = 'elevation',
  elevation = 1,
  TransitionComponent = Collapse,
  TransitionProps = {},
  
  // Accessibility props
  ariaLabel,
  ariaControls,
  
  // Additional props
  ...rest
}) => {
  // State for controlled/uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Accordion',
    controls: ariaControls,
    expanded: isExpanded
  });

  // Handle expand/collapse
  const handleChange = useCallback((event) => {
  // Added display name
  handleChange.displayName = 'handleChange';

    if (disabled) return;
    
    // For uncontrolled mode
    if (!isControlled) {
      setInternalExpanded(!internalExpanded);
    }
    
    // Call onChange prop if provided
    if (onChange) {
      onChange(event, !isExpanded);
    }
  }, [disabled, isControlled, internalExpanded, isExpanded, onChange]);
  
  // Find and clone the summary and details children with necessary props
  const processedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    const childType = child.type.displayName;
    
    if (childType === 'AccordionSummaryAdapted') {
      return React.cloneElement(child, {
        expanded: isExpanded,
        disabled: disabled,
        onChange: handleChange,
        'aria-expanded': isExpanded
      });
    }
    
    if (childType === 'AccordionDetailsAdapted') {
      return (
        <TransitionComponent
          in={isExpanded}
          timeout="auto&quot;
          {...TransitionProps}
        >
          {child}
        </TransitionComponent>
      );
    }
    
    return child;
  });
  
  return (
    <Paper
      variant={variant}
      elevation={elevation}
      square={square}
      {...ariaAttributes}
      {...rest}
      sx={{
        overflow: "hidden',
        mb: 1,
        mt: 1,
        ...(disableGutters ? { px: 0 } : {}),
        ...(rest.sx || {})
      }}
    >
      <Box
        role="region&quot;
        disabled={disabled}
      >
        {processedChildren}
      </Box>
    </Paper>
  );
});

AccordionAdapted.propTypes = {
  // Children
  children: PropTypes.node,
  
  // Expansion state
  defaultExpanded: PropTypes.bool,
  expanded: PropTypes.bool,
  onChange: PropTypes.func,
  
  // Appearance
  disabled: PropTypes.bool,
  disableGutters: PropTypes.bool,
  square: PropTypes.bool,
  variant: PropTypes.oneOf(["elevation', 'outlined']),
  elevation: PropTypes.number,
  
  // Transition
  TransitionComponent: PropTypes.elementType,
  TransitionProps: PropTypes.object,
  
  // Accessibility
  ariaLabel: PropTypes.string,
  ariaControls: PropTypes.string,
};

Accordion.displayName = 'Accordion';

export default Accordion;