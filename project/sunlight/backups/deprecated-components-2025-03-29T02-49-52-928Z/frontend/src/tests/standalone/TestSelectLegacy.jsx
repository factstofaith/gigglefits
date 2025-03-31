// TestSelectLegacy.jsx
// A standalone version of SelectLegacy for testing without Material UI or other dependencies

import React, { useState, useRef, useEffect } from 'react';

/**
 * Simplified MenuItem component for SelectLegacy
 */
const MenuItem = React.forwardRef(
  ({ children, value, disabled = false, onClick, ...props }, ref) => {
    const handleClick = () => {
  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';


      if (!disabled && onClick) {
        onClick(value);
      }
    };

    return (
      <div
        ref={ref}
        className={`select-item ${disabled ? 'select-item-disabled' : ''}`}
        onClick={handleClick}
        data-value={value}
        data-testid={`menu-item-${value}`}
        role="option&quot;
        aria-selected={false}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MenuItem.displayName = "MenuItem';

/**
 * A simplified implementation of SelectLegacy for testing purposes
 * This mimics the API of Material UI Select with our design system under the hood
 */
const SelectLegacy = React.forwardRef(
  (
    {
      children,
      defaultValue,
      value,
      onChange,
      label,
      placeholder = 'Select an option',
      variant = 'outlined',
      size = 'medium',
      disabled = false,
      fullWidth = false,
      error = false,
      helperText,
      required = false,
      multiple = false,
      name,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    // Internal state for controlled/uncontrolled component
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? value : defaultValue || ''
    );
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Update internal value when controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Map variants to CSS classes
    const variantClass =
      {
        outlined: 'select-outlined',
        filled: 'select-filled',
        standard: 'select-standard',
      }[variant] || 'select-outlined';

    // Map sizes to CSS classes
    const sizeClass =
      {
        small: 'select-small',
        medium: 'select-medium',
        large: 'select-large',
      }[size] || 'select-medium';

    // Combine all classes
    const selectClass = `select ${variantClass} ${sizeClass} ${fullWidth ? 'select-full-width' : ''} ${disabled ? 'select-disabled' : ''} ${error ? 'select-error' : ''} ${className}`;

    // Extract options from children for rendering
    const options = React.Children.toArray(children).filter(Boolean);

    // Handle option selection
    const handleOptionClick = optionValue => {
      const newValue = optionValue;

      // Update internal state
      setInternalValue(newValue);
      setIsOpen(false);

      // Call onChange if provided
      if (onChange) {
        // Create fake event
        const event = {
          target: { value: newValue, name },
        };
        onChange(event, {
          value: newValue,
          name,
          child: options.find(opt => opt.props.value === optionValue),
        });
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

    // Close dropdown if clicking outside
    useEffect(() => {
      const handleClickOutside = event => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Find selected option text
    const selectedOption = options.find(opt => opt.props.value === internalValue);
    const displayText = selectedOption ? selectedOption.props.children : placeholder;

    return (
      <div ref={selectRef} className="select-container&quot; data-testid="select-legacy-container">
        {label && (
          <label className={`select-label ${required ? 'select-label-required' : ''}`} htmlFor={id}>
            {label}
          </label>
        )}

        <div
          ref={ref}
          className={selectClass}
          onClick={toggleDropdown}
          tabIndex={disabled ? -1 : 0}
          role="combobox&quot;
          aria-expanded={isOpen}
          aria-disabled={disabled}
          aria-required={required}
          aria-haspopup="listbox"
          data-testid="select-legacy"
          id={id}
          {...props}
        >
          <div className="select-value&quot;>{displayText}</div>
          <div className={`select-icon ${isOpen ? "select-icon-open' : ''}`}>▼</div>

          {isOpen && (
            <div className="select-dropdown&quot; role="listbox">
              {options.map(child => {
                // Clone the child with additional props
                return React.cloneElement(child, {
                  onClick: handleOptionClick,
                  key: child.props.value,
                });
              })}
            </div>
          )}
        </div>

        {helperText && (
          <div className={`select-helper-text ${error ? 'select-error-text' : ''}`}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

SelectLegacy.displayName = 'SelectLegacy';

export { MenuItem };
export default SelectLegacy;
