/**
 * @file zIndex.js
 * @description Z-index tokens for the TAP Integration Platform design system.
 * Defines consistent z-index values for UI layering.
 */

/**
 * Z-index tokens
 * Defines a scale of z-index values to maintain consistent stacking order
 */
const zIndex = {
  // Base layers
  hide: -1, // Hidden elements (below the page)
  base: 0, // Base elements (default stacking context)
  raised: 1, // Slightly raised elements (e.g., cards)

  // UI component layers
  dropdown: 1000, // Dropdowns and select menus
  sticky: 1100, // Sticky headers and footers
  banner: 1200, // Banners and notifications that don't block interaction

  // Overlay layers
  overlay: 1300, // Overlay backgrounds
  modal: 1400, // Modal dialogs
  popover: 1500, // Popovers and tooltips

  // Top layers
  toast: 1600, // Toast notifications
  spinner: 1700, // Loading spinners

  // Special layers
  tooltip: 1800, // Tooltips (always on top of other elements)
  dragging: 1900, // Elements being dragged

  // Maximum layer (reserved for critical UI)
  max: 9999, // Critical UI elements that must always be on top
};

export default zIndex;
