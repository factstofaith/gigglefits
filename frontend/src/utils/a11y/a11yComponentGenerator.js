/**
 * A11y Component Generator
 * 
 * A utility for automatically enhancing existing React components with
 * accessibility features, following our zero technical debt approach.
 * 
 * @module utils/a11y/a11yComponentGenerator
 */

import React from 'react';
import { useA11yAnnouncement, useA11yFocus, useA11yKeyboard, useA11yPrefersReducedMotion, useA11yNavigation } from "@/hooks/a11y";
import { getFormFieldAttributes, getButtonAttributes, getDialogAttributes } from './ariaAttributeHelper';

/**
 * Creates an accessibility-enhanced version of a component
 * 
 * @param {React.ComponentType} Component - The component to enhance
 * @param {Object} options - Enhancement options
 * @param {string} options.name - Name of the component for documentation
 * @param {string} options.type - Component type (button, dialog, form, etc.)
 * @param {Object} options.ariaOptions - ARIA attribute options
 * @param {Object} options.keyboardOptions - Keyboard navigation options
 * @param {Object} options.announcementOptions - Screen reader announcement options
 * @param {Object} options.focusOptions - Focus management options
 * @returns {React.ComponentType} Enhanced component with accessibility features
 */
export const createA11yComponent = (Component, {
  name,
  type = 'generic',
  ariaOptions = {},
  keyboardOptions = {},
  announcementOptions = {},
  focusOptions = {}
} = {}) => {
  // Define component-specific defaults based on type
  const getTypeDefaults = () => {
    switch (type) {
      case 'button':
        return {
          ariaOptions: {
            getAttributes: (props) => getButtonAttributes({
              purpose: 'button',
              label: props.a11yLabel || props['aria-label'],
              expanded: props.a11yExpanded || props['aria-expanded'],
              controls: props.a11yControls || props['aria-controls'],
              description: props.a11yDescription || props['aria-describedby']
            })
          },
          announcementOptions: {
            onClick: (props) => props.a11yAnnouncement
          }
        };
      case 'dialog':
        return {
          ariaOptions: {
            getAttributes: (props) => getDialogAttributes({
              titleId: props.a11yLabelledBy || 'a11y-dialog-title',
              descriptionId: props.a11yDescribedBy || 'a11y-dialog-description'
            })
          },
          focusOptions: {
            trapFocus: true,
            restoreFocus: true,
            autoFocus: true
          },
          announcementOptions: {
            onOpen: (props) => props.a11yAnnouncement || `${name || 'Dialog'} opened`
          },
          keyboardOptions: {
            Escape: (props) => props.onClose
          }
        };
      case 'form':
        return {
          ariaOptions: {
            getFieldAttributes: (fieldName, label, required) => getFormFieldAttributes({
              label,
              required,
              invalid: false,
              errorId: undefined
            })
          },
          announcementOptions: {
            onSubmit: (props) => `${name || 'Form'} submitted successfully`,
            onError: (props) => `${name || 'Form'} has errors. Please correct them.`
          }
        };
      default:
        return {};
    }
  };

  // Merge defaults with provided options
  const typeDefaults = getTypeDefaults();
  const mergedAriaOptions = {
    ...typeDefaults.ariaOptions,
    ...ariaOptions
  };
  const mergedKeyboardOptions = {
    ...typeDefaults.keyboardOptions,
    ...keyboardOptions
  };
  const mergedAnnouncementOptions = {
    ...typeDefaults.announcementOptions,
    ...announcementOptions
  };
  const mergedFocusOptions = {
    ...typeDefaults.focusOptions,
    ...focusOptions
  };

  // Create enhanced component
  const EnhancedComponent = React.forwardRef((props, ref) => {
    // Initialize accessibility hooks based on component needs
    const {
      announcePolite,
      announceAssertive
    } = useA11yAnnouncement();
    const {
      registerKeyHandler
    } = useA11yKeyboard();
    const {
      containerRef
    } = useA11yFocus(mergedFocusOptions);
    const prefersReducedMotion = useA11yPrefersReducedMotion();

    // Process ARIA attributes
    const getAriaAttributes = () => {
      if (mergedAriaOptions.getAttributes) {
        return mergedAriaOptions.getAttributes(props);
      }
      return {};
    };

    // Setup keyboard event handlers
    React.useEffect(() => {
      if (Object.keys(mergedKeyboardOptions).length === 0) return;
      const handlers = {};
      Object.keys(mergedKeyboardOptions).forEach((key) => {
        const handler = mergedKeyboardOptions[key];
        if (typeof handler === 'function') {
          handlers[key] = (e) => {
            e.preventDefault();
            handler(props)(e);
          };
        }
      });
      return registerKeyHandler(handlers);
    }, [props, registerKeyHandler]);

    // Handle announcements
    const processAnnouncements = (type, defaultMessage) => {
      const announcementFn = mergedAnnouncementOptions[type];
      if (announcementFn) {
        const message = typeof announcementFn === 'function' ? announcementFn(props) : announcementFn;
        if (message) {
          announcePolite(message);
        }
      } else if (defaultMessage) {
        announcePolite(defaultMessage);
      }
    };

    // Handle special events based on component type
    React.useEffect(() => {
      if (type === 'dialog' && props.open && mergedAnnouncementOptions.onOpen) {
        processAnnouncements('onOpen');
      }
    }, [props.open]);

    // Create enhanced props
    const enhancedProps = {
      ...props,
      ...getAriaAttributes(),
      // Only add ref if it's not a dialog (already handled by containerRef)
      ...(type !== 'dialog' ? {
        ref
      } : {}),
      // For dialogs, add the containerRef
      ...(type === 'dialog' ? {
        ref: containerRef
      } : {})
    };

    // Handle special prop transformations for different component types
    if (type === 'button' && mergedAnnouncementOptions.onClick) {
      const originalOnClick = props.onClick;
      enhancedProps.onClick = (e) => {
        processAnnouncements('onClick');
        if (originalOnClick) {
          originalOnClick(e);
        }
      };
    }
    if (type === 'form' && mergedAnnouncementOptions.onSubmit) {
      const originalOnSubmit = props.onSubmit;
      enhancedProps.onSubmit = (e) => {
        processAnnouncements('onSubmit');
        if (originalOnSubmit) {
          originalOnSubmit(e);
        }
      };
    }

    // Add reduced motion awareness if needed
    if (prefersReducedMotion && props.animation) {
      enhancedProps.animation = false;
    }
    return <Component {...enhancedProps} />;
  });

  // Add display name for debugging
  EnhancedComponent.displayName = `A11y${name || Component.displayName || Component.name || 'Component'}`;
  return EnhancedComponent;
};

/**
 * Higher-order component to enhance with accessibility features
 * 
 * @param {Object} options - Enhancement options
 * @returns {Function} HOC that enhances a component with accessibility
 */
export const withA11y = (options = {}) => {
  return (Component) => createA11yComponent(Component, options);
};

/**
 * Automatically enhances all exports from a component file
 * 
 * @param {Object} components - Object of components to enhance
 * @param {Object} options - Global enhancement options
 * @returns {Object} Enhanced components
 */
export const enhanceComponentExports = (components, options = {}) => {
  const enhanced = {};
  Object.keys(components).forEach((key) => {
    const component = components[key];
    if (typeof component === 'function') {
      // Determine component type by name
      let type = 'generic';
      if (/button/i.test(key)) type = 'button';
      if (/dialog|modal/i.test(key)) type = 'dialog';
      if (/form/i.test(key)) type = 'form';
      enhanced[`A11y${key}`] = createA11yComponent(component, {
        name: key,
        type,
        ...options
      });
    } else {
      enhanced[key] = component;
    }
  });
  return enhanced;
};
export default {
  createA11yComponent,
  withA11y,
  enhanceComponentExports
};