import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Select component for dropdown selection
 */
export const Select = React.forwardRef(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onChange,
      options = [],
      placeholder = 'Select an option',
      variant = 'outlined',
      size = 'medium',
      disabled = false,
      required = false,
      error = false,
      multiple = false,
      fullWidth = false,
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, typography } = theme;
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);

    // Local state for dropdown open/close
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(
      value || defaultValue || (multiple ? [] : '')
    );
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Handle controlling the select
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : selectedValue;

    // Update dropdown position when it opens
    useEffect(() => {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = event => {
        if (
          selectRef.current &&
          dropdownRef.current &&
          !selectRef.current.contains(event.target) &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle option selection
    const handleOptionSelect = option => {
      if (disabled) return;

      let newValue;
      if (multiple) {
        // For multiple selection, toggle the selected value
        newValue = Array.isArray(currentValue) ? [...currentValue] : [];
        const index = newValue.findIndex(v => v === option.value);

        if (index === -1) {
          newValue.push(option.value);
        } else {
          newValue.splice(index, 1);
        }
      } else {
        // For single selection, just set the value
        newValue = option.value;
        setIsOpen(false);
      }

      if (!isControlled) {
        setSelectedValue(newValue);
      }

      if (onChange) {
        const mockEvent = {
          target: { name, value: newValue },
          currentTarget: { name, value: newValue },
        };
        onChange(mockEvent);
      }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
  // Added display name
  toggleDropdown.displayName = 'toggleDropdown';

  // Added display name
  toggleDropdown.displayName = 'toggleDropdown';

  // Added display name
  toggleDropdown.displayName = 'toggleDropdown';

  // Added display name
  toggleDropdown.displayName = 'toggleDropdown';

  // Added display name
  toggleDropdown.displayName = 'toggleDropdown';


      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    // Get size-specific styles
    const getSizeStyles = size => {
      switch (size) {
        case 'small':
          return {
            padding: `${spacing.xs} ${spacing.sm}`,
            fontSize: typography.fontSizes.sm,
            height: '32px',
          };
        case 'large':
          return {
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSizes.lg,
            height: '48px',
          };
        case 'medium':
        default:
          return {
            padding: `${spacing.xs} ${spacing.md}`,
            fontSize: typography.fontSizes.md,
            height: '40px',
          };
      }
    };

    // Get variant-specific styles
    const getVariantStyles = variant => {
      const borderColor = error
        ? colors.error.main
        : isOpen
          ? colors.primary.main
          : colors.text.disabled;

      switch (variant) {
        case 'filled':
          return {
            border: 'none',
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: '4px 4px 0 0',
            backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.09)' : 'rgba(0, 0, 0, 0.06)',
          };
        case 'standard':
          return {
            border: 'none',
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: 0,
            backgroundColor: 'transparent',
            paddingLeft: 0,
            paddingRight: 0,
          };
        case 'outlined':
        default:
          return {
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            backgroundColor: 'transparent',
          };
      }
    };

    // Size styles based on prop
    const sizeStyles = getSizeStyles(size);

    // Variant styles based on prop
    const variantStyles = getVariantStyles(variant);

    // Determine text color based on disabled/error state
    const getTextColor = () => {
  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';

  // Added display name
  getTextColor.displayName = 'getTextColor';


      if (disabled) return colors.text.disabled;
      if (error) return colors.error.main;
      return colors.text.primary;
    };

    // Get selected option label
    const getSelectedLabel = () => {
  // Added display name
  getSelectedLabel.displayName = 'getSelectedLabel';

  // Added display name
  getSelectedLabel.displayName = 'getSelectedLabel';

  // Added display name
  getSelectedLabel.displayName = 'getSelectedLabel';

  // Added display name
  getSelectedLabel.displayName = 'getSelectedLabel';

  // Added display name
  getSelectedLabel.displayName = 'getSelectedLabel';


      if (multiple) {
        if (!Array.isArray(currentValue) || currentValue.length === 0) {
          return placeholder;
        }

        const selectedOptions = options.filter(option => currentValue.includes(option.value));

        return selectedOptions.map(option => option.label).join(', ');
      } else {
        if (!currentValue && currentValue !== 0) {
          return placeholder;
        }

        const selectedOption = options.find(option => option.value === currentValue);
        return selectedOption ? selectedOption.label : placeholder;
      }
    };

    // Check if an option is selected
    const isOptionSelected = optionValue => {
      if (multiple) {
        return Array.isArray(currentValue) && currentValue.includes(optionValue);
      }
      return currentValue === optionValue;
    };

    // Base select container styles
    const selectContainerStyles = {
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: fullWidth ? '100%' : '220px',
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: typography.fontFamilies.primary,
      fontWeight: typography.fontWeights.regular,
      color: getTextColor(),
      userSelect: 'none',
      ...sizeStyles,
      ...variantStyles,
      ...(disabled && {
        opacity: 0.7,
        pointerEvents: 'none',
      }),
      ...style,
    };

    // Dropdown styles
    const dropdownStyles = {
      position: 'absolute',
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: `${dropdownPosition.width}px`,
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: colors.background.paper,
      boxShadow:
        '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
      borderRadius: '4px',
      zIndex: 1300,
    };

    // Option styles
    const optionBaseStyles = {
      padding: `${spacing.xs} ${spacing.md}`,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.action.hover,
      },
    };

    return (
      <>
        <div
          ref={selectRef}
          id={id}
          role="combobox&quot;
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-required={required}
          aria-disabled={disabled}
          onClick={toggleDropdown}
          style={selectContainerStyles}
          {...props}
        >
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getSelectedLabel()}
          </div>
          <div style={{ marginLeft: spacing.sm }}>
            <svg
              width="10&quot;
              height="5"
              viewBox="0 0 10 5&quot;
              style={{
                transform: isOpen ? "rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <path d="M0 0L5 5L10 0H0Z&quot; fill={getTextColor()} />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            role="listbox"
            aria-multiselectable={multiple}
            style={dropdownStyles}
          >
            {options.length > 0 ? (
              options.map(option => {
                const isSelected = isOptionSelected(option.value);
                return (
                  <div
                    key={option.value}
                    role="option&quot;
                    aria-selected={isSelected}
                    onClick={() => handleOptionSelect(option)}
                    style={{
                      ...optionBaseStyles,
                      backgroundColor: isSelected ? colors.action.selected : "transparent',
                      fontWeight: isSelected
                        ? typography.fontWeights.medium
                        : typography.fontWeights.regular,
                    }}
                  >
                    <Box display="flex&quot; alignItems="center">
                      {multiple && (
                        <Box
                          display="inline-block&quot;
                          mr="sm"
                          width="16px&quot;
                          height="16px"
                          border={`1px solid ${isSelected ? colors.primary.main : colors.text.secondary}`}
                          bgcolor={isSelected ? colors.primary.main : 'transparent'}
                          style={{
                            borderRadius: '2px',
                            position: 'relative',
                          }}
                        >
                          {isSelected && (
                            <svg
                              width="16&quot;
                              height="16"
                              viewBox="0 0 24 24&quot;
                              style={{ position: "absolute', top: '-4px', left: '-4px' }}
                            >
                              <path
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z&quot;
                                fill="white"
                              />
                            </svg>
                          )}
                        </Box>
                      )}
                      {option.label}
                    </Box>
                  </div>
                );
              })
            ) : (
              <Typography style={{ padding: spacing.md }} align="center&quot;>
                No options available
              </Typography>
            )}
          </div>
        )}

        {/* Hidden native select for form submission */}
        <select
          ref={ref}
          name={name}
          value={currentValue}
          multiple={multiple}
          disabled={disabled}
          required={required}
          onChange={() => {}} // Handled by our custom logic
          style={{ display: "none' }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </>
    );
  }
);

Select.displayName = 'Select';

export default Select;
