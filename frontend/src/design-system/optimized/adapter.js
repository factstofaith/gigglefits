/**
 * Design System Adapter
 * 
 * This adapter provides a unified interface for UI components.
 */

// Common components
export const Box = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const ThemeProvider = ({ theme, children }) => children;

// Layout components
export const Container = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const Grid = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const Stack = ({ children, direction = 'column', spacing = 0, ...props }) => (
  <div {...props} style={{ 
    display: 'flex', 
    flexDirection: direction,
    gap: typeof spacing === 'number' ? `${spacing * 8}px` : spacing,
    ...props.style 
  }}>
    {children}
  </div>
);

export const Paper = ({ children, ...props }) => (
  <div {...props} style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '4px', ...props.style }}>{children}</div>
);

// Typography
export const Typography = ({ variant, children, ...props }) => {
  const Component = variant === 'h1' ? 'h1' : 
                   variant === 'h2' ? 'h2' : 
                   variant === 'h3' ? 'h3' : 
                   variant === 'h4' ? 'h4' : 
                   variant === 'h5' ? 'h5' : 
                   variant === 'h6' ? 'h6' : 'p';
  return <Component {...props}>{children}</Component>;
};

// Display components
export const Card = ({ children, ...props }) => (
  <div {...props} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', ...props.style }}>{children}</div>
);

export const CardContent = ({ children, ...props }) => (
  <div {...props} style={{ padding: '16px', ...props.style }}>{children}</div>
);

export const CardActions = ({ children, ...props }) => (
  <div {...props} style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end', ...props.style }}>{children}</div>
);

export const List = ({ children, ...props }) => (
  <ul {...props} style={{ listStyle: 'none', padding: 0, margin: 0, ...props.style }}>{children}</ul>
);

export const ListItem = ({ children, ...props }) => (
  <li {...props} style={{ padding: '8px 0', ...props.style }}>{children}</li>
);

export const ListItemText = ({ primary, secondary, ...props }) => (
  <div {...props}>
    <div>{primary}</div>
    {secondary && <div style={{ fontSize: '0.875rem', color: '#666' }}>{secondary}</div>}
  </div>
);

export const Divider = ({ ...props }) => (
  <hr {...props} style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0', ...props.style }} />
);

// App components
export const AppBar = ({ children, position, ...props }) => (
  <header {...props} style={{ 
    padding: '8px 16px', 
    backgroundColor: '#1976d2', 
    color: 'white',
    position: position === 'fixed' ? 'fixed' : 'relative',
    top: position === 'fixed' ? 0 : 'auto',
    width: '100%',
    zIndex: 1000,
    ...props.style 
  }}>
    {children}
  </header>
);

export const Toolbar = ({ children, ...props }) => (
  <div {...props} style={{ display: 'flex', alignItems: 'center', ...props.style }}>{children}</div>
);

// Feedback components
export const Alert = ({ severity, children, ...props }) => {
  const colors = {
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
    warning: { bg: '#fff3cd', border: '#ffeeba', text: '#856404' },
    error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
  };
  const style = colors[severity] || colors.info;
  
  return (
    <div {...props} style={{ 
      padding: '12px 16px', 
      borderRadius: '4px',
      backgroundColor: style.bg,
      borderColor: style.border,
      color: style.text,
      ...props.style 
    }}>
      {children}
    </div>
  );
};

export const Dialog = ({ open, children, ...props }) => {
  if (!open) return null;
  
  return (
    <div {...props} style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1300,
      ...props.style 
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '4px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export const DialogTitle = ({ children, ...props }) => (
  <div {...props} style={{ padding: '16px 24px', borderBottom: '1px solid #e0e0e0', ...props.style }}>
    <Typography variant="h6">{children}</Typography>
  </div>
);

export const DialogContent = ({ children, ...props }) => (
  <div {...props} style={{ padding: '16px 24px', ...props.style }}>{children}</div>
);

export const DialogActions = ({ children, ...props }) => (
  <div {...props} style={{ padding: '8px 24px', display: 'flex', justifyContent: 'flex-end', ...props.style }}>{children}</div>
);

export const Tooltip = ({ title, children, ...props }) => (
  <div {...props} title={title}>{children}</div>
);

export const IconButton = ({ children, ...props }) => (
  <button {...props} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', ...props.style }}>{children}</button>
);

// Icons
export const KeyboardArrowUpIcon = () => null;

// Form components
export const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export const TextField = ({ label, ...props }) => (
  <div>
    {label && <label>{label}</label>}
    <input {...props} />
  </div>
);

export const Checkbox = ({ label, ...props }) => (
  <div>
    <input type="checkbox" {...props} />
    {label && <label>{label}</label>}
  </div>
);

// Navigation components
export const Tab = ({ label, ...props }) => (
  <button {...props}>{label}</button>
);

export const Tabs = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
