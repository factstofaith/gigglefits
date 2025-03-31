// InputField.jsx
// -----------------------------------------------------------------------------
// Modern input field with brand color highlight on focus.

import React, { useState } from 'react';
import { Box } from '../../design-system'
import { Typography } from '../../design-system'
import { TextField } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
// Design system import already exists;
// Removed duplicate import
function InputField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  style, 
  error,
  helperText,
  ...props 
}) {
  // Added display name
  InputField.displayName = 'InputField';

  const { theme } = useTheme();

  const containerStyle = {
    marginBottom: '16px',
    ...style,
  };

  return (
    <Box style={containerStyle}>
      {label && (
        <Typography 
          as="label&quot; 
          variant="body2" 
          style={{ 
            display: 'block', 
            marginBottom: '4px',
            color: theme?.colors?.text?.primary || '#3B3D3D',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
      )}
      
      <TextField
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        fullWidth
        {...props}
      />
      
      {helperText && (
        <Typography 
          variant="caption&quot; 
          style={{ 
            display: "block', 
            marginTop: '4px',
            color: error 
              ? (theme?.colors?.error?.main || '#d32f2f') 
              : (theme?.colors?.text?.secondary || '#757575')
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default InputField;
