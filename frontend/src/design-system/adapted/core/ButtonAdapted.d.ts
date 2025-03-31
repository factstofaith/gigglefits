import React from 'react';
import { ButtonProps } from '../../types/core';

/**
 * ButtonAdapted component
 * 
 * An adapter wrapper for the Material UI Button component that provides
 * a consistent interface during the migration process.
 */
declare const ButtonAdapted: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;

export default ButtonAdapted;