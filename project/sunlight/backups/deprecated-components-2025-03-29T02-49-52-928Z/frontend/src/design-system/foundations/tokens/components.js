/**
 * Component-specific tokens for customizing and standardizing component styling.
 * 
 * This approach ensures consistent appearance across the application and makes
 * it easy to update component styling in a single location.
 */

const components = {
  // Button component styling
  button: {
    borderRadius: '4px',
    fontWeight: 500,
    textTransform: 'none',
    padding: {
      small: '4px 10px',
      medium: '6px 16px',
      large: '8px 22px',
    },
    fontSize: {
      small: '0.8125rem',
      medium: '0.875rem',
      large: '0.9375rem',
    },
  },
  
  // Card component styling
  card: {
    borderRadius: '4px',
    padding: '16px',
    headerPadding: '16px',
    contentPadding: '16px',
    actionsPadding: '8px',
    transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  },
  
  // TextField component styling
  textField: {
    borderRadius: '4px',
    fontSize: '1rem',
    padding: {
      small: '8px 12px',
      medium: '12px 14px',
      large: '15px 16px',
    },
    labelOffset: {
      small: '6px',
      medium: '8px',
      large: '10px',
    },
  },
  
  // Modal component styling
  modal: {
    borderRadius: '4px',
    backdropOpacity: 0.5,
    padding: '16px 24px',
    headerPadding: '16px 24px',
    contentPadding: '8px 24px',
    actionsPadding: '8px 24px',
    maxWidth: {
      xs: '444px',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
    },
  },
  
  // Table component styling
  table: {
    borderRadius: '4px',
    headerHeight: '56px',
    rowHeight: '52px',
    cellPadding: '16px',
    fontSize: '0.875rem',
    headerFontWeight: 500,
    borderColor: 'rgba(224, 224, 224, 1)',
    striped: {
      odd: 'rgba(0, 0, 0, 0.02)',
      even: 'transparent',
    },
    hover: 'rgba(0, 0, 0, 0.04)',
  },
  
  // Form components
  form: {
    spacing: '16px',
    formControlMargin: '8px 0',
    labelMargin: '0 0 8px 0',
    helperTextMargin: '4px 0 0 0',
    checkboxSize: '24px',
    radioSize: '24px',
    switchHeight: '34px',
    switchWidth: '62px',
  },
  
  // Navigation components
  navigation: {
    tabHeight: '48px',
    tabMinWidth: '90px',
    menuItemHeight: '36px',
    menuPadding: '8px 0',
    breadcrumbSeparatorMargin: '8px',
    appBarHeight: '64px',
    drawerWidth: '240px',
  },
  
  // Feedback components
  feedback: {
    alertPadding: '6px 16px',
    alertMargin: '16px 0',
    snackbarMargin: '8px',
    progressSize: {
      small: 24,
      medium: 40,
      large: 56,
    },
  },
};

export default components;