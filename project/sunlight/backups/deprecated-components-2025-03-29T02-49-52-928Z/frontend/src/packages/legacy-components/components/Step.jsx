import { Step } from '../adapter';
/**
 * @component Step
 * @description A simple wrapper that maintains backward compatibility with Material UI's Step API.
 * Since we don't have a complete custom Step component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { Step } from '../../design-system';

;

const Step = props => {
  const { className, ...rest } = props;

  return <MuiStep className={`ds-step ds-step-legacy ${className || ''}`} {...rest} />;
};


Step.displayName = 'Step';
export default Step;
