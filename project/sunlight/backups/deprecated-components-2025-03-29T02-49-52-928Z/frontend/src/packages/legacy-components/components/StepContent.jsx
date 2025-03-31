import {MuiStepContent as MuiStepContent} from '../adapter';
/**
 * @component StepContent
 * @description A simple wrapper that maintains backward compatibility with Material UI's MuiStepContent API.
 * Since we don't have a complete custom MuiStepContent component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { MuiStepContent } from '../../design-system';
;

const StepContent = props => {
  const { className, ...rest } = props;

  return (
    <MuiStepContent
      className={`ds-step-content ds-step-content-legacy ${className || ''}`}
      {...rest}
    />
  );
};


StepContent.displayName = 'StepContent';
export default StepContent;
