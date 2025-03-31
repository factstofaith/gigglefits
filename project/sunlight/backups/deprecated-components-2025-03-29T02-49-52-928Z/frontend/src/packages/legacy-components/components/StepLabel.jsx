import { StepLabel } from '../adapter';
/**
 * @component StepLabel
 * @description A simple wrapper that maintains backward compatibility with Material UI's StepLabel API.
 * Since we don't have a complete custom StepLabel component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { StepLabel } from '../../design-system';

;

const StepLabel = props => {
  const { className, ...rest } = props;

  return (
    <MuiStepLabel className={`ds-step-label ds-step-label-legacy ${className || ''}`} {...rest} />
  );
};


StepLabel.displayName = 'StepLabel';
export default StepLabel;
