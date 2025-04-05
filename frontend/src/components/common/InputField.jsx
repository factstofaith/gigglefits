
import React, { useState } from 'react';
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from '@/error-handling';

function InputField({ label, type = 'text', value, onChange, placeholder, style }) {
  const [formError, setFormError] = useState(null);
  const { handleError } = useErrorHandler('InputField');
  // We'll handle focus style changes with local state or inline approach
  const [focused, setFocused] = useState(false);
  const containerStyle = {
    marginBottom: '1rem',
    ...style
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.3rem',
    color: '#3B3D3D'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '6px',
    border: focused ? '2px solid #48C2C5' : '1px solid #DDD',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      {formError && (
        <div style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          {formError}
        </div>
      )}
      {label && <label style={labelStyle}>{label}</label>}
      <input
      type={type}
      value={value}
      onChange={(e) => {
          try {
            // Clear form error when user makes changes
            if (formError) setFormError(null);
            onChange(e);
          } catch (err) {
            setFormError(err.message || 'Invalid input');
            handleError(err, { field: label || 'unknown', value: e.target.value });
          }
        }}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)} />
      
    </div>);

}

export default withErrorBoundary(InputField, {
  boundary: 'InputField'
});