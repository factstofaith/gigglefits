// InputField.jsx
// -----------------------------------------------------------------------------
// Modern input field with brand color highlight on focus.

import React, { useState } from 'react';

function InputField({ label, type = 'text', value, onChange, placeholder, style }) {
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
      {label && <label style={labelStyle}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export default InputField;
