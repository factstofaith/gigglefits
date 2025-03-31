/**
 * @component DatePicker
 * @description Date input component for selecting dates with calendar
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme/ThemeProvider';
import Box from '../layout/Box';
import Typography from '../core/Typography';
import TextField from './TextField';

/**
 * DatePicker Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.id] - DatePicker element ID
 * @param {string} [props.name] - DatePicker name attribute
 * @param {string} [props.label] - DatePicker label text
 * @param {string} [props.placeholder] - DatePicker placeholder text
 * @param {string} [props.helperText] - Helper text displayed below the DatePicker
 * @param {string} [props.errorText] - Error text displayed instead of helper text when error is true
 * @param {boolean} [props.error=false] - Whether the DatePicker has an error
 * @param {boolean} [props.disabled=false] - Whether the DatePicker is disabled
 * @param {boolean} [props.required=false] - Whether the DatePicker is required
 * @param {string|Date} [props.value] - Current value (controlled)
 * @param {string|Date} [props.defaultValue] - Default value (uncontrolled)
 * @param {string} [props.format='MM/DD/YYYY'] - Date format
 * @param {boolean} [props.disablePast=false] - Whether to disable past dates
 * @param {boolean} [props.disableFuture=false] - Whether to disable future dates
 * @param {Date|string} [props.minDate] - Minimum selectable date
 * @param {Date|string} [props.maxDate] - Maximum selectable date
 * @param {Array<Date|string>} [props.disableDates] - Array of dates to disable
 * @param {string} [props.variant='outlined'] - TextField variant (outlined, filled, standard)
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {Function} [props.onFocus] - Focus handler
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement} DatePicker component
 */
const DatePicker = forwardRef(
  (
    {
      id,
      name,
      label,
      placeholder = 'MM/DD/YYYY',
      helperText,
      errorText,
      error = false,
      disabled = false,
      required = false,
      value,
      defaultValue = '',
      format = 'MM/DD/YYYY',
      disablePast = false,
      disableFuture = false,
      minDate,
      maxDate,
      disableDates = [],
      variant = 'outlined',
      onChange,
      onBlur,
      onFocus,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    // Get theme context
    const { theme } = useTheme();

    // Generate a unique ID if none provided
    const datePickerId = id || `tap-datepicker-${Math.random().toString(36).substr(2, 9)}`;

    // Local state
    const isControlled = value !== undefined;
    const [inputValue, setInputValue] = useState(() => {
      // Convert Date object to string if needed
      if (isControlled) {
        return formatDateToString(value);
      }
      return defaultValue ? formatDateToString(defaultValue) : '';
    });

    const [isOpen, setIsOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(() => {
      // Use current value if available, otherwise use today
      const initialDate = isControlled ? value : defaultValue;
      return initialDate ? parseDate(initialDate) : new Date();
    });

    // Extract year, month from calendar date for rendering
    const calendarYear = calendarDate.getFullYear();
    const calendarMonth = calendarDate.getMonth();

    // Refs
    const calendarRef = useRef(null);
    const inputRef = useRef(null);

    // Parse date from various formats
    function parseDate(dateValue) {
  // Added display name
  parseDate.displayName = 'parseDate';

      if (dateValue instanceof Date) {
        return dateValue;
      }

      if (typeof dateValue === 'string') {
        // Try to parse the string based on format
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }

        // Additional parsing for format MM/DD/YYYY
        if (format === 'MM/DD/YYYY') {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            const month = parseInt(parts[0], 10) - 1;
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }

        // Additional parsing for format DD/MM/YYYY
        if (format === 'DD/MM/YYYY') {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }

        // Additional parsing for format YYYY-MM-DD
        if (format === 'YYYY-MM-DD') {
          const parts = dateValue.split('-');
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      }

      // Default to today if parsing fails
      return new Date();
    }

    // Format date object to string based on format
    function formatDateToString(dateValue) {
  // Added display name
  formatDateToString.displayName = 'formatDateToString';

      if (!dateValue) return '';

      const date = parseDate(dateValue);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      if (format === 'MM/DD/YYYY') {
        return `${month}/${day}/${year}`;
      }

      if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
      }

      if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
      }

      // Default to MM/DD/YYYY
      return `${month}/${day}/${year}`;
    }

    // Check if a date is disabled
    function isDateDisabled(date) {
  // Added display name
  isDateDisabled.displayName = 'isDateDisabled';

      // Disabled past dates
      if (disablePast && date < new Date().setHours(0, 0, 0, 0)) {
        return true;
      }

      // Disabled future dates
      if (disableFuture && date > new Date().setHours(0, 0, 0, 0)) {
        return true;
      }

      // Min date check
      if (minDate && date < parseDate(minDate).setHours(0, 0, 0, 0)) {
        return true;
      }

      // Max date check
      if (maxDate && date > parseDate(maxDate).setHours(0, 0, 0, 0)) {
        return true;
      }

      // Specific disabled dates
      if (disableDates.length > 0) {
        return disableDates.some(disabledDate => {
          const parsedDisabledDate = parseDate(disabledDate);
          return (
            parsedDisabledDate.getDate() === date.getDate() &&
            parsedDisabledDate.getMonth() === date.getMonth() &&
            parsedDisabledDate.getFullYear() === date.getFullYear()
          );
        });
      }

      return false;
    }

    // Generate calendar days for the current month view
    function generateCalendarDays() {
  // Added display name
  generateCalendarDays.displayName = 'generateCalendarDays';

      const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
      const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      // Day of week for the first day of month (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDayOfMonth.getDay();

      // Generate days from previous month to fill the first row
      const prevMonthDays = [];
      if (firstDayOfWeek > 0) {
        const prevMonth = new Date(calendarYear, calendarMonth, 0);
        const prevMonthDaysCount = prevMonth.getDate();

        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevMonthDaysCount - i;
          const date = new Date(calendarYear, calendarMonth - 1, day);
          prevMonthDays.push({
            date,
            day,
            currentMonth: false,
            disabled: isDateDisabled(date),
          });
        }
      }

      // Generate days for current month
      const currentMonthDays = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(calendarYear, calendarMonth, day);
        currentMonthDays.push({
          date,
          day,
          currentMonth: true,
          disabled: isDateDisabled(date),
        });
      }

      // Generate days for next month to fill the last row
      const nextMonthDays = [];
      const totalDaysRendered = prevMonthDays.length + currentMonthDays.length;
      const remainingCells = Math.ceil(totalDaysRendered / 7) * 7 - totalDaysRendered;

      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(calendarYear, calendarMonth + 1, day);
        nextMonthDays.push({
          date,
          day,
          currentMonth: false,
          disabled: isDateDisabled(date),
        });
      }

      return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }

    // Handle date selection from calendar
    function handleDateSelect(date) {
  // Added display name
  handleDateSelect.displayName = 'handleDateSelect';

      if (isDateDisabled(date)) return;

      const formattedDate = formatDateToString(date);

      if (!isControlled) {
        setInputValue(formattedDate);
      }

      if (onChange) {
        onChange({
          target: {
            name,
            value: formattedDate,
            date: date, // Pass the date object for convenience
          },
        });
      }

      setIsOpen(false);
      inputRef.current?.focus();
    }

    // Handle month navigation
    function handlePrevMonth() {
  // Added display name
  handlePrevMonth.displayName = 'handlePrevMonth';

      setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
    }

    function handleNextMonth() {
  // Added display name
  handleNextMonth.displayName = 'handleNextMonth';

      setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
    }

    // Handle year navigation
    function handlePrevYear() {
  // Added display name
  handlePrevYear.displayName = 'handlePrevYear';

      setCalendarDate(new Date(calendarYear - 1, calendarMonth, 1));
    }

    function handleNextYear() {
  // Added display name
  handleNextYear.displayName = 'handleNextYear';

      setCalendarDate(new Date(calendarYear + 1, calendarMonth, 1));
    }

    // Handle input change
    function handleInputChange(e) {
  // Added display name
  handleInputChange.displayName = 'handleInputChange';

      const newValue = e.target.value;

      if (!isControlled) {
        setInputValue(newValue);
      }

      if (onChange) {
        onChange({
          target: {
            name,
            value: newValue,
            date: parseDate(newValue),
          },
        });
      }
    }

    // Handle input focus
    function handleInputFocus(e) {
  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';

      if (onFocus) {
        onFocus(e);
      }
    }

    // Handle input click to open calendar
    function handleInputClick() {
  // Added display name
  handleInputClick.displayName = 'handleInputClick';

      if (!disabled) {
        setIsOpen(true);
      }
    }

    // Handle input blur
    function handleInputBlur(e) {
  // Added display name
  handleInputBlur.displayName = 'handleInputBlur';

      // Format the date on blur
      const parsedDate = parseDate(inputValue);
      const isValid = !isNaN(parsedDate.getTime());

      if (isValid && !isControlled) {
        const formattedDate = formatDateToString(parsedDate);
        setInputValue(formattedDate);

        if (onChange && formattedDate !== inputValue) {
          onChange({
            target: {
              name,
              value: formattedDate,
              date: parsedDate,
            },
          });
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    }

    // Close calendar when clicking outside
    useEffect(() => {
      function handleClickOutside(e) {
  // Added display name
  handleClickOutside.displayName = 'handleClickOutside';

        if (
          calendarRef.current &&
          !calendarRef.current.contains(e.target) &&
          inputRef.current &&
          !inputRef.current.contains(e.target)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Update input value when controlled value changes
    useEffect(() => {
      if (isControlled) {
        setInputValue(formatDateToString(value));
      }
    }, [value, isControlled]);

    // Calendar days for the current view
    const calendarDays = generateCalendarDays();

    // Month names for calendar header
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Day names for calendar header
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Calendar styles
    const calendarStyles = {
      position: 'absolute',
      zIndex: theme.zIndex.dropdown,
      top: 'calc(100% + 4px)',
      left: 0,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.md,
      width: '280px',
      padding: theme.spacing.sm,
      display: isOpen ? 'block' : 'none',
      outline: 'none',
      border: `1px solid ${theme.colors.divider}`,
    };

    // Calendar header styles
    const calendarHeaderStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    };

    // Month/year selector styles
    const monthYearSelectorStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Navigation button styles
    const navButtonStyles = {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: theme.spacing.xs,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.text.primary,
      '&:hover': {
        backgroundColor: theme.colors.action.hover,
      },
    };

    // Calendar grid styles
    const calendarGridStyles = {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: theme.spacing.xs,
    };

    // Calendar day styles
    const getDayStyles = day => {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        cursor: day.disabled ? 'not-allowed' : 'pointer',
        color: day.disabled
          ? theme.colors.text.disabled
          : day.currentMonth
            ? theme.colors.text.primary
            : theme.colors.text.secondary,
        backgroundColor: 'transparent',
        '&:hover': day.disabled ? {} : { backgroundColor: theme.colors.action.hover },
        ...(day.date &&
        inputValue &&
        parseDate(inputValue).toDateString() === day.date.toDateString()
          ? {
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.common.white,
              '&:hover': { backgroundColor: theme.colors.primary.dark },
            }
          : {}),
      };
    };

    // Today button styles
    const todayButtonStyles = {
      width: '100%',
      margin: `${theme.spacing.sm} 0 0`,
      padding: theme.spacing.xs,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.colors.primary.main}`,
      borderRadius: theme.borderRadius.sm,
      color: theme.colors.primary.main,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.colors.primary.light,
        color: theme.colors.primary.contrastText,
      },
    };

    // Wrapper styles
    const wrapperStyles = {
      position: 'relative',
      width: '100%',
      ...style,
    };

    // Convert styles object to CSS strings for pseudo-elements
    const convertStyleToCss = styleObj => {
      let cssString = '';
      Object.entries(styleObj).forEach(([key, value]) => {
        if (typeof value === 'object') return;
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, match => `-${match.toLowerCase()}`);
        cssString += `${kebabKey}: ${value}; `;
      });
      return cssString;
    };

    // Date icon SVG
    const CalendarIcon = () => (
      <svg
        width="18&quot;
        height="18"
        viewBox="0 0 24 24&quot;
        fill="none"
        xmlns="http://www.w3.org/2000/svg&quot;
        style={{ color: theme.colors.text.secondary }}
      >
        <path
          d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM7 12H12V17H7V12Z"
          fill="currentColor&quot;
        />
      </svg>
    );

    // Left arrow SVG
    const LeftArrow = () => (
      <svg
        width="18"
        height="18&quot;
        viewBox="0 0 24 24"
        fill="none&quot;
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z&quot;
          fill="currentColor"
        />
      </svg>
    );

    // Right arrow SVG
    const RightArrow = () => (
      <svg
        width="18&quot;
        height="18"
        viewBox="0 0 24 24&quot;
        fill="none"
        xmlns="http://www.w3.org/2000/svg&quot;
      >
        <path d="M8.59 7.41L10 6L16 12L10 18L8.59 16.59L13.17 12L8.59 7.41Z" fill="currentColor&quot; />
      </svg>
    );

    // Double left arrow SVG
    const DoubleLeftArrow = () => (
      <svg
        width="18"
        height="18&quot;
        viewBox="0 0 24 24"
        fill="none&quot;
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.41 7.41L10 6L4 12L10 18L11.41 16.59L6.83 12L11.41 7.41Z&quot; fill="currentColor" />
        <path
          d="M18.41 7.41L17 6L11 12L17 18L18.41 16.59L13.83 12L18.41 7.41Z&quot;
          fill="currentColor"
        />
      </svg>
    );

    // Double right arrow SVG
    const DoubleRightArrow = () => (
      <svg
        width="18&quot;
        height="18"
        viewBox="0 0 24 24&quot;
        fill="none"
        xmlns="http://www.w3.org/2000/svg&quot;
      >
        <path d="M5.59 7.41L7 6L13 12L7 18L5.59 16.59L10.17 12L5.59 7.41Z" fill="currentColor&quot; />
        <path
          d="M12.59 7.41L14 6L20 12L14 18L12.59 16.59L17.17 12L12.59 7.41Z"
          fill="currentColor&quot;
        />
      </svg>
    );

    return (
      <Box className={`tap-datepicker-wrapper ${className}`} style={wrapperStyles}>
        {/* Text input for the date */}
        <div className="tap-datepicker-input-container" style={{ position: 'relative' }}>
          <TextField
            ref={el => {
              // Forward the ref to parent component
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }

              // Store a local ref
              inputRef.current = el;
            }}
            id={datePickerId}
            name={name}
            label={label}
            placeholder={placeholder}
            helperText={error ? errorText : helperText}
            error={error}
            disabled={disabled}
            required={required}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            variant={variant}
            endAdornment={<CalendarIcon />}
            {...rest}
          />
        </div>

        {/* Calendar dropdown */}
        <div
          ref={calendarRef}
          className="tap-datepicker-calendar&quot;
          style={calendarStyles}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Date picker"
        >
          {/* Calendar header */}
          <div className="tap-datepicker-header&quot; style={calendarHeaderStyles}>
            <button
              type="button"
              className="tap-datepicker-prev-year&quot;
              style={navButtonStyles}
              onClick={handlePrevYear}
              aria-label="Previous year"
            >
              <DoubleLeftArrow />
            </button>
            <button
              type="button&quot;
              className="tap-datepicker-prev-month"
              style={navButtonStyles}
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <LeftArrow />
            </button>

            <div className="tap-datepicker-month-year&quot; style={monthYearSelectorStyles}>
              <Typography variant="subtitle2">
                {monthNames[calendarMonth]} {calendarYear}
              </Typography>
            </div>

            <button
              type="button&quot;
              className="tap-datepicker-next-month"
              style={navButtonStyles}
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <RightArrow />
            </button>
            <button
              type="button&quot;
              className="tap-datepicker-next-year"
              style={navButtonStyles}
              onClick={handleNextYear}
              aria-label="Next year"
            >
              <DoubleRightArrow />
            </button>
          </div>

          {/* Weekday header */}
          <div className="tap-datepicker-weekdays&quot; style={calendarGridStyles}>
            {dayNames.map(day => (
              <div
                key={day}
                className="tap-datepicker-weekday"
                style={{
                  textAlign: 'center',
                  fontWeight: theme.typography.fontWeights.medium,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSizes.xs,
                  padding: `${theme.spacing.xs} 0`,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="tap-datepicker-days&quot; style={calendarGridStyles}>
            {calendarDays.map((day, index) => {
              const dayStyles = getDayStyles(day);

              return (
                <div
                  key={`${day.currentMonth}-${day.day}-${index}`}
                  className={`tap-datepicker-day ${day.currentMonth ? "current-month' : ''} ${day.disabled ? 'disabled' : ''}`}
                  style={dayStyles}
                  onClick={() => !day.disabled && handleDateSelect(day.date)}
                  role="button&quot;
                  tabIndex={day.disabled ? -1 : 0}
                  aria-disabled={day.disabled}
                  aria-label={day.date.toDateString()}
                  onKeyDown={e => {
                    if ((e.key === "Enter' || e.key === ' ') && !day.disabled) {
                      e.preventDefault();
                      handleDateSelect(day.date);
                    }
                  }}
                >
                  {day.day}
                </div>
              );
            })}
          </div>

          {/* Today button */}
          <button
            type="button&quot;
            className="tap-datepicker-today"
            style={todayButtonStyles}
            onClick={() => handleDateSelect(new Date())}
            disabled={isDateDisabled(new Date())}
          >
            Today
          </button>
        </div>

        {/* Styles for hover effects */}
        <style jsx>{`
          .tap-datepicker-prev-year:hover,
          .tap-datepicker-prev-month:hover,
          .tap-datepicker-next-month:hover,
          .tap-datepicker-next-year:hover {
            ${convertStyleToCss(navButtonStyles['&:hover'])}
          }

          .tap-datepicker-day:not(.disabled):hover {
            ${convertStyleToCss({ backgroundColor: theme.colors.action.hover })}
          }

          .tap-datepicker-today:hover:not(:disabled) {
            ${convertStyleToCss(todayButtonStyles['&:hover'])}
          }
        `}</style>
      </Box>
    );
  }
);

DatePicker.displayName = 'DatePicker';

DatePicker.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  format: PropTypes.oneOf(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  disablePast: PropTypes.bool,
  disableFuture: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  disableDates: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  ),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default DatePicker;
