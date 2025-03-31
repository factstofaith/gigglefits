/**
 * @component Slider
 * @description An enhanced slider component for selecting values from a range,
 * with marks, labels, and accessibility features.
 * 
 * @typedef {import('../../types/form').SliderProps} SliderProps
 */
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * SliderAdapted component
 * 
 * @type {React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLDivElement>>}
 */
const Slider = React.memo(React.forwardRef(({
  // Value props
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  
  // Range slider
  range = false,
  
  // Marks and labels
  marks = false,
  valueLabelDisplay = 'off',
  valueLabelFormat = value => value,
  
  // Appearance
  color = 'primary',
  size = 'medium',
  orientation = 'horizontal',
  track = 'normal',
  disabled = false,
  
  // Accessibility
  ariaLabel,
  ariaLabelledby,
  
  // Additional props
  ...rest
}, ref) => {
  // State for controlled/uncontrolled value handling
  const isRange = range && Array.isArray(defaultValue || controlledValue);
  const initialValue = isRange 
    ? (controlledValue !== undefined ? controlledValue : defaultValue || [min, max])
    : (controlledValue !== undefined ? controlledValue : defaultValue || min);
  
  const [internalValue, setInternalValue] = useState(initialValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  // State for slider interaction
  const [dragging, setDragging] = useState(false);
  const [thumbIndex, setThumbIndex] = useState(0);
  
  // Handle updates to controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);
  
  // Get percentage position for value
  const getPercentage = useCallback((value) => {
  // Added display name
  getPercentage.displayName = 'getPercentage';

    return ((value - min) / (max - min)) * 100;
  }, [min, max]);
  
  // Convert percentage to value
  const percentToValue = useCallback((percent) => {
  // Added display name
  percentToValue.displayName = 'percentToValue';

    const rawValue = ((percent / 100) * (max - min)) + min;
    // Round to nearest step
    const steps = Math.round((rawValue - min) / step);
    return min + (steps * step);
  }, [min, max, step]);
  
  // Calculate mark positions
  const getMarks = useCallback(() => {
  // Added display name
  getMarks.displayName = 'getMarks';

    if (marks === false) return [];
    if (marks === true) {
      // Generate marks at each step
      const count = Math.floor((max - min) / step) + 1;
      return Array.from({ length: count }, (_, i) => ({
        value: min + (i * step),
        label: (min + (i * step)).toString()
      }));
    }
    
    // If marks is an array of { value, label } objects
    if (Array.isArray(marks)) {
      return marks;
    }
    
    // If marks is an object with values as keys
    return Object.entries(marks).map(([value, label]) => ({
      value: Number(value),
      label
    }));
  }, [marks, min, max, step]);
  
  // Handle mouse/touch down
  const handleMouseDown = useCallback((event, index = 0) => {
    if (disabled) return;
    
    // Set dragging state and capture which thumb is being dragged (for range slider)
    setDragging(true);
    setThumbIndex(index);
    
    // Add event listeners for mouse/touch move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  }, [disabled]);
  
  // Handle mouse/touch move
  const handleMouseMove = useCallback((event) => {
  // Added display name
  handleMouseMove.displayName = 'handleMouseMove';

    if (!dragging) return;
    
    // Prevent page scrolling while dragging
    event.preventDefault();
    
    // Get slider element
    const slider = document.getElementById('slider-root');
    if (!slider) return;
    
    // Calculate new value based on mouse/touch position
    const rect = slider.getBoundingClientRect();
    const clientPos = event.touches ? event.touches[0].clientX : event.clientX;
    
    // Calculate percentage
    const percent = Math.max(0, Math.min(100, 
      ((clientPos - rect.left) / rect.width) * 100
    ));
    
    // Convert to value
    const newValue = percentToValue(percent);
    
    // Update value
    let updatedValue;
    if (isRange) {
      updatedValue = [...value];
      updatedValue[thumbIndex] = newValue;
      
      // Ensure min thumb <= max thumb
      if (thumbIndex === 0 && updatedValue[0] > updatedValue[1]) {
        updatedValue[0] = updatedValue[1];
      } else if (thumbIndex === 1 && updatedValue[1] < updatedValue[0]) {
        updatedValue[1] = updatedValue[0];
      }
    } else {
      updatedValue = newValue;
    }
    
    // Update state
    if (controlledValue === undefined) {
      setInternalValue(updatedValue);
    }
    
    // Call onChange handler
    if (onChange) {
      onChange(updatedValue);
    }
  }, [dragging, thumbIndex, value, isRange, percentToValue, onChange, controlledValue]);
  
  // Handle mouse/touch up
  const handleMouseUp = useCallback(() => {
  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';

    setDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);
  }, [handleMouseMove]);
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, index = 0) => {
    if (disabled) return;
    
    let newValue;
    if (isRange) {
      newValue = [...value];
    } else {
      newValue = value;
    }
    
    // Handle arrow keys
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        if (isRange) {
          newValue[index] = Math.max(min, newValue[index] - step);
        } else {
          newValue = Math.max(min, newValue - step);
        }
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        if (isRange) {
          newValue[index] = Math.min(max, newValue[index] + step);
        } else {
          newValue = Math.min(max, newValue + step);
        }
        break;
      case 'Home':
        event.preventDefault();
        if (isRange) {
          newValue[index] = min;
        } else {
          newValue = min;
        }
        break;
      case 'End':
        event.preventDefault();
        if (isRange) {
          newValue[index] = max;
        } else {
          newValue = max;
        }
        break;
      default:
        return;
    }
    
    // Update state
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    // Call onChange handler
    if (onChange) {
      onChange(newValue);
    }
  }, [disabled, isRange, value, min, max, step, onChange, controlledValue]);
  
  // Render label for value
  const renderValueLabel = (val) => {
  // Added display name
  renderValueLabel.displayName = 'renderValueLabel';

  // Added display name
  renderValueLabel.displayName = 'renderValueLabel';

  // Added display name
  renderValueLabel.displayName = 'renderValueLabel';

  // Added display name
  renderValueLabel.displayName = 'renderValueLabel';

  // Added display name
  renderValueLabel.displayName = 'renderValueLabel';


    if (valueLabelDisplay === 'off') return null;
    
    const formattedValue = valueLabelFormat(val);
    const showAlways = valueLabelDisplay === 'on';
    const showOnHover = valueLabelDisplay === 'auto' && dragging;
    
    if (showAlways || showOnHover) {
      return (
        <Box
          sx={{
            position: 'absolute',
            bottom: orientation === 'horizontal' ? '24px' : 'auto',
            left: orientation === 'horizontal' ? '50%' : '24px',
            transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
            backgroundColor: `${color}.main`,
            color: 'white',
            padding: '2px 4px',
            borderRadius: '2px',
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s ease',
            zIndex: 1
          }}
        >
          {formattedValue}
        </Box>
      );
    }
    
    return null;
  };
  
  // Calculate sizes based on size prop
  const getTrackHeight = () => {
  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';


    return size === 'small' ? 2 : size === 'medium' ? 4 : 6;
  };
  
  const getThumbSize = () => {
  // Added display name
  getThumbSize.displayName = 'getThumbSize';

  // Added display name
  getThumbSize.displayName = 'getThumbSize';

  // Added display name
  getThumbSize.displayName = 'getThumbSize';

  // Added display name
  getThumbSize.displayName = 'getThumbSize';

  // Added display name
  getThumbSize.displayName = 'getThumbSize';


    return size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  };
  
  // Size calculations
  const trackHeight = getTrackHeight();
  const thumbSize = getThumbSize();
  
  // Get actual values for rendering
  const actualValues = isRange ? value : [min, value];
  
  // Calculate positions for rendering
  const startPercent = getPercentage(actualValues[0]);
  const endPercent = getPercentage(isRange ? actualValues[1] : actualValues[0]);
  
  // Set track color based on disabled or color prop
  const trackColor = disabled ? '#e0e0e0' : `var(--${color}-main, #1976d2)`;
  const railColor = '#e0e0e0';
  
  return (
    <Box
      ref={ref}
      id="slider-root&quot;
      component="div"
      sx={{
        position: 'relative',
        width: orientation === 'horizontal' ? '100%' : trackHeight,
        height: orientation === 'horizontal' ? trackHeight * 3 : '100%', // Taller to accommodate thumb and labels
        padding: thumbSize / 2,
        boxSizing: 'content-box',
        cursor: disabled ? 'default' : 'pointer',
        touchAction: 'none',
        ...(rest.sx || {})
      }}
      role="slider&quot;
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={isRange ? value.join(",') : value}
      aria-orientation={orientation}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => handleKeyDown(e, 0)}
      {...rest}
    >
      {/* Rail (background track) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: orientation === 'horizontal' ? (thumbSize / 2) - (trackHeight / 2) : 0,
          bottom: orientation === 'horizontal' ? 'auto' : 0,
          height: orientation === 'horizontal' ? trackHeight : '100%',
          width: orientation === 'horizontal' ? '100%' : trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: railColor,
        }}
      />
      
      {/* Active track */}
      <Box
        sx={{
          position: 'absolute',
          left: orientation === 'horizontal' ? `${startPercent}%` : (thumbSize / 2) - (trackHeight / 2),
          right: orientation === 'horizontal' ? `${100 - endPercent}%` : 'auto',
          top: orientation === 'horizontal' ? (thumbSize / 2) - (trackHeight / 2) : `${startPercent}%`,
          bottom: orientation === 'horizontal' ? 'auto' : `${100 - endPercent}%`,
          height: orientation === 'horizontal' ? trackHeight : 'auto',
          width: orientation === 'horizontal' ? 'auto' : trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: track === 'normal' ? trackColor : track === 'inverted' ? railColor : 'transparent',
          zIndex: 1
        }}
      />
      
      {/* Marks */}
      {getMarks().map((mark) => {
        const markPercent = getPercentage(mark.value);
        const isActive = mark.value >= actualValues[0] && mark.value <= actualValues[1];
        
        return (
          <React.Fragment key={mark.value}>
            {/* Mark dot */}
            <Box
              sx={{
                position: 'absolute',
                left: orientation === 'horizontal' ? `${markPercent}%` : (thumbSize / 2) - 3,
                top: orientation === 'horizontal' ? (thumbSize / 2) - 3 : `${markPercent}%`,
                transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isActive ? trackColor : railColor,
                zIndex: 2
              }}
            />
            
            {/* Mark label */}
            {mark.label && (
              <Typography
                variant="caption&quot;
                component="span"
                sx={{
                  position: 'absolute',
                  left: orientation === 'horizontal' ? `${markPercent}%` : thumbSize + 4,
                  top: orientation === 'horizontal' ? thumbSize + 4 : `${markPercent}%`,
                  transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
                  color: disabled ? 'text.disabled' : 'text.secondary',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {mark.label}
              </Typography>
            )}
          </React.Fragment>
        );
      })}
      
      {/* Thumbs */}
      {isRange ? (
        <>
          {/* First thumb (min value) */}
          <Box
            sx={{
              position: 'absolute',
              left: orientation === 'horizontal' ? `${startPercent}%` : (thumbSize / 2) - (thumbSize / 2),
              top: orientation === 'horizontal' ? (thumbSize / 2) - (thumbSize / 2) : `${startPercent}%`,
              transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
              width: thumbSize,
              height: thumbSize,
              borderRadius: '50%',
              backgroundColor: disabled ? '#bdbdbd' : trackColor,
              boxShadow: dragging && thumbIndex === 0 ? '0 0 0 8px rgba(25, 118, 210, 0.16)' : 'none',
              zIndex: 3,
              '&:hover': {
                boxShadow: disabled ? 'none' : '0 0 0 8px rgba(25, 118, 210, 0.16)',
                cursor: disabled ? 'default' : 'grab'
              },
              transition: dragging ? 'none' : 'box-shadow 0.2s ease'
            }}
            role="slider&quot;
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[0]}
            aria-orientation={orientation}
            tabIndex={disabled ? -1 : 0}
            onMouseDown={(e) => handleMouseDown(e, 0)}
            onTouchStart={(e) => handleMouseDown(e, 0)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
          >
            {renderValueLabel(value[0])}
          </Box>
          
          {/* Second thumb (max value) */}
          <Box
            sx={{
              position: "absolute',
              left: orientation === 'horizontal' ? `${endPercent}%` : (thumbSize / 2) - (thumbSize / 2),
              top: orientation === 'horizontal' ? (thumbSize / 2) - (thumbSize / 2) : `${endPercent}%`,
              transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
              width: thumbSize,
              height: thumbSize,
              borderRadius: '50%',
              backgroundColor: disabled ? '#bdbdbd' : trackColor,
              boxShadow: dragging && thumbIndex === 1 ? '0 0 0 8px rgba(25, 118, 210, 0.16)' : 'none',
              zIndex: 3,
              '&:hover': {
                boxShadow: disabled ? 'none' : '0 0 0 8px rgba(25, 118, 210, 0.16)',
                cursor: disabled ? 'default' : 'grab'
              },
              transition: dragging ? 'none' : 'box-shadow 0.2s ease'
            }}
            role="slider&quot;
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[1]}
            aria-orientation={orientation}
            tabIndex={disabled ? -1 : 0}
            onMouseDown={(e) => handleMouseDown(e, 1)}
            onTouchStart={(e) => handleMouseDown(e, 1)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
          >
            {renderValueLabel(value[1])}
          </Box>
        </>
      ) : (
        // Single thumb for non-range slider
        <Box
          sx={{
            position: "absolute',
            left: orientation === 'horizontal' ? `${endPercent}%` : (thumbSize / 2) - (thumbSize / 2),
            top: orientation === 'horizontal' ? (thumbSize / 2) - (thumbSize / 2) : `${endPercent}%`,
            transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
            width: thumbSize,
            height: thumbSize,
            borderRadius: '50%',
            backgroundColor: disabled ? '#bdbdbd' : trackColor,
            boxShadow: dragging ? '0 0 0 8px rgba(25, 118, 210, 0.16)' : 'none',
            zIndex: 3,
            '&:hover': {
              boxShadow: disabled ? 'none' : '0 0 0 8px rgba(25, 118, 210, 0.16)',
              cursor: disabled ? 'default' : 'grab'
            },
            transition: dragging ? 'none' : 'box-shadow 0.2s ease'
          }}
          role="slider&quot;
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation={orientation}
          tabIndex={disabled ? -1 : 0}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onKeyDown={handleKeyDown}
        >
          {renderValueLabel(value)}
        </Box>
      )}
    </Box>
  );
}));

SliderAdapted.propTypes = {
  // Value props
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  defaultValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  
  // Range slider
  range: PropTypes.bool,
  
  // Marks and labels
  marks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.node
      })
    ),
    PropTypes.object // { [value]: label }
  ]),
  valueLabelDisplay: PropTypes.oneOf(["on', 'auto', 'off']),
  valueLabelFormat: PropTypes.func,
  
  // Appearance
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  track: PropTypes.oneOf(['normal', 'inverted', 'false']),
  disabled: PropTypes.bool,
  
  // Accessibility
  ariaLabel: PropTypes.string,
  ariaLabelledby: PropTypes.string,
};

Slider.displayName = 'Slider';

export default Slider;