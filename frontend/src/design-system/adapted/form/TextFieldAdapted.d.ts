import React from 'react';
import { TextFieldProps } from '../../types/form';

/**
 * TextFieldAdapted component
 * 
 * An adapter wrapper for Material UI TextField component that provides
 * enhanced functionality, including validation, formatting, and accessibility features.
 */
declare const TextFieldAdapted: React.ForwardRefExoticComponent<
  TextFieldProps & React.RefAttributes<HTMLInputElement>
>;

export default TextFieldAdapted;