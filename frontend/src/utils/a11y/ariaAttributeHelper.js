/**
 * ARIA Attribute Helper
 * 
 * Utility functions for consistent ARIA attribute generation.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module utils/a11y/ariaAttributeHelper
 */

/**
 * Get ARIA attributes for a button element based on its purpose
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.purpose='button'] - Purpose of the button
 * @param {string} [options.label] - Accessible label
 * @param {boolean} [options.expanded] - Whether the button controls an expanded element
 * @param {string} [options.controls] - ID of the element controlled by the button
 * @param {boolean|string} [options.haspopup] - Whether the button has a popup
 * @param {string} [options.description] - Description of the button
 * @param {string} [options.current] - Current state of the button
 * @param {boolean} [options.selected] - Whether the button is selected
 * @param {boolean} [options.pressed] - Whether the button is pressed
 * @returns {Object} ARIA attributes
 */
export const getButtonAttributes = ({
  purpose = 'button',
  label,
  expanded,
  controls,
  haspopup,
  description,
  current,
  selected,
  pressed
} = {}) => {
  const attributes = {};
  
  // Basic attributes
  if (label) attributes['aria-label'] = label;
  if (expanded !== undefined) attributes['aria-expanded'] = expanded;
  if (controls) attributes['aria-controls'] = controls;
  if (haspopup !== undefined) attributes['aria-haspopup'] = haspopup;
  if (description) attributes['aria-describedby'] = description;
  if (current) attributes['aria-current'] = current;
  if (selected !== undefined) attributes['aria-selected'] = selected;
  if (pressed !== undefined) attributes['aria-pressed'] = pressed;
  
  // Role-specific attributes based on purpose
  switch (purpose) {
    case 'tab':
      attributes.role = 'tab';
      break;
    case 'menuitem':
      attributes.role = 'menuitem';
      break;
    case 'link':
      attributes.role = 'link';
      break;
    case 'switch':
      attributes.role = 'switch';
      break;
    case 'checkbox':
      attributes.role = 'checkbox';
      break;
    case 'radio':
      attributes.role = 'radio';
      break;
    default:
      // Default button role is implicit for button elements
      break;
  }
  
  return attributes;
};

/**
 * Get ARIA attributes for a dialog element
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.titleId] - ID of the dialog title element
 * @param {string} [options.descriptionId] - ID of the dialog description element
 * @param {boolean} [options.modal=true] - Whether the dialog is modal
 * @returns {Object} ARIA attributes
 */
export const getDialogAttributes = ({
  titleId,
  descriptionId,
  modal = true
} = {}) => {
  const attributes = {
    role: modal ? 'dialog' : 'alertdialog',
    'aria-modal': modal ? 'true' : undefined
  };
  
  if (titleId) attributes['aria-labelledby'] = titleId;
  if (descriptionId) attributes['aria-describedby'] = descriptionId;
  
  return attributes;
};

/**
 * Get ARIA attributes for a menu element
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.orientation='vertical'] - Orientation of the menu
 * @param {string} [options.labelId] - ID of the menu label element
 * @param {string} [options.label] - Accessible label for the menu
 * @param {string} [options.role='menu'] - Role of the menu
 * @returns {Object} ARIA attributes
 */
export const getMenuAttributes = ({
  orientation = 'vertical',
  labelId,
  label,
  role = 'menu'
} = {}) => {
  const attributes = {
    role,
    'aria-orientation': orientation
  };
  
  if (labelId) attributes['aria-labelledby'] = labelId;
  if (label) attributes['aria-label'] = label;
  
  return attributes;
};

/**
 * Get ARIA attributes for a form field
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.labelId] - ID of the label element
 * @param {string} [options.label] - Accessible label
 * @param {string} [options.descriptionId] - ID of the description element
 * @param {boolean} [options.required] - Whether the field is required
 * @param {boolean} [options.invalid] - Whether the field is invalid
 * @param {string} [options.errorId] - ID of the error message element
 * @param {string} [options.placeholder] - Placeholder text
 * @returns {Object} ARIA attributes
 */
export const getFormFieldAttributes = ({
  labelId,
  label,
  descriptionId,
  required,
  invalid,
  errorId,
  placeholder
} = {}) => {
  const attributes = {};
  
  if (labelId) attributes['aria-labelledby'] = labelId;
  if (label) attributes['aria-label'] = label;
  if (descriptionId) attributes['aria-describedby'] = descriptionId;
  if (required !== undefined) attributes['aria-required'] = required;
  if (invalid !== undefined) attributes['aria-invalid'] = invalid;
  if (errorId && invalid) {
    attributes['aria-errormessage'] = errorId;
  }
  if (placeholder) attributes['aria-placeholder'] = placeholder;
  
  return attributes;
};

/**
 * Get ARIA attributes for an interactive list
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.role='list'] - Role of the list
 * @param {string} [options.labelId] - ID of the list label element
 * @param {string} [options.label] - Accessible label for the list
 * @param {boolean} [options.multiselectable] - Whether multiple items can be selected
 * @returns {Object} ARIA attributes
 */
export const getListAttributes = ({
  role = 'list',
  labelId,
  label,
  multiselectable
} = {}) => {
  const attributes = {
    role
  };
  
  if (labelId) attributes['aria-labelledby'] = labelId;
  if (label) attributes['aria-label'] = label;
  if (role === 'listbox' && multiselectable !== undefined) {
    attributes['aria-multiselectable'] = multiselectable;
  }
  
  return attributes;
};

/**
 * Get ARIA attributes for a list item
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.role='listitem'] - Role of the list item
 * @param {boolean} [options.selected] - Whether the item is selected
 * @param {boolean} [options.checked] - Whether the item is checked
 * @param {string} [options.level] - Level of the item (for tree items)
 * @param {boolean} [options.expanded] - Whether the item is expanded (for tree items)
 * @returns {Object} ARIA attributes
 */
export const getListItemAttributes = ({
  role = 'listitem',
  selected,
  checked,
  level,
  expanded
} = {}) => {
  const attributes = {
    role
  };
  
  if (selected !== undefined) attributes['aria-selected'] = selected;
  if (checked !== undefined) attributes['aria-checked'] = checked;
  if (level) attributes['aria-level'] = level;
  if (expanded !== undefined) attributes['aria-expanded'] = expanded;
  
  return attributes;
};

/**
 * Get ARIA attributes for a live region
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.live='polite'] - Live region politeness level
 * @param {boolean} [options.atomic=true] - Whether the region is atomic
 * @param {string} [options.relevant='additions text'] - What changes are relevant
 * @param {boolean} [options.busy] - Whether the region is busy with updates
 * @returns {Object} ARIA attributes
 */
export const getLiveRegionAttributes = ({
  live = 'polite',
  atomic = true,
  relevant = 'additions text',
  busy
} = {}) => {
  const attributes = {
    'aria-live': live,
    'aria-atomic': atomic ? 'true' : 'false',
    'aria-relevant': relevant
  };
  
  if (busy !== undefined) attributes['aria-busy'] = busy;
  
  return attributes;
};

/**
 * Get ARIA attributes for a tabbed interface
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.labelId] - ID of the tablist label element
 * @param {string} [options.label] - Accessible label for the tablist
 * @param {string} [options.orientation='horizontal'] - Orientation of the tablist
 * @returns {Object} ARIA attributes
 */
export const getTablistAttributes = ({
  labelId,
  label,
  orientation = 'horizontal'
} = {}) => {
  const attributes = {
    role: 'tablist',
    'aria-orientation': orientation
  };
  
  if (labelId) attributes['aria-labelledby'] = labelId;
  if (label) attributes['aria-label'] = label;
  
  return attributes;
};

/**
 * Get standard ARIA attributes for landmark regions
 * 
 * @param {string} [landmark='main'] - Landmark type
 * @param {string} [label] - Accessible label for the landmark
 * @returns {Object} ARIA attributes
 */
export const getLandmarkAttributes = (landmark = 'main', label) => {
  const attributes = {};
  
  // Map landmark names to roles
  switch (landmark) {
    case 'main':
      attributes.role = 'main';
      break;
    case 'navigation':
      attributes.role = 'navigation';
      break;
    case 'banner':
      attributes.role = 'banner';
      break;
    case 'complementary':
      attributes.role = 'complementary';
      break;
    case 'contentinfo':
      attributes.role = 'contentinfo';
      break;
    case 'form':
      attributes.role = 'form';
      break;
    case 'search':
      attributes.role = 'search';
      break;
    case 'region':
      attributes.role = 'region';
      break;
    default:
      attributes.role = landmark;
  }
  
  if (label) attributes['aria-label'] = label;
  
  return attributes;
};