import { Stepper } from '../adapter';
/**
 * @component Stepper
 * @description A simple wrapper that maintains backward compatibility with Material UI's Stepper API.
 * Since we don't have a complete custom Stepper component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { Stepper } from '../../design-system';

;

const Stepper = props => {
  const { className, ...rest } = props;

  return <MuiStepper className={`ds-stepper ds-stepper-legacy ${className || ''}`} {...rest} />;
};


Stepper.displayName = 'Stepper';
export default Stepper;
