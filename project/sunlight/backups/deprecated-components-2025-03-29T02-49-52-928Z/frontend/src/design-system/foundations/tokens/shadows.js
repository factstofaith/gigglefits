/**
 * @file shadows.js
 * @description Shadow tokens for the TAP Integration Platform design system.
 * Defines elevation levels through consistent shadow styles.
 */

/**
 * Shadow tokens
 * Consistent elevation levels with corresponding shadows
 */
const shadows = {
  // None - no shadow
  none: 'none',

  // Level 1 - subtle shadow for cards, buttons, etc.
  1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Level 2 - medium shadow for dropdowns, popovers
  2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

  // Level 3 - more pronounced shadow for modals, dialogs
  3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  // Level 4 - strong shadow for floating action buttons, important elements
  4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Level 5 - very strong shadow for elevated elements
  5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Special shadows for specific components
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  modal: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  popover: '0 2px 5px 0 rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
  tooltip: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',

  // Inner shadow (for pressed buttons, inputs, etc.)
  inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Focus ring - for keyboard focus states
  focus: '0 0 0 3px rgba(46, 126, 237, 0.3)',
};

export default shadows;
