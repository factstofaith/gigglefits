/**
 * @component FormControl
 * @description A simple wrapper that maintains backward compatibility with Material UI's FormControl API.
 * Since we don't have a complete custom FormControl component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { MuiFormControl } from '../../design-system';
;

const FormControl = props => {
  const { className, ...rest } = props;

  return (
    <MuiFormControl
      className={`ds-form-control ds-form-control-legacy ${className || ''}`}
      {...rest}
    />
  );
};


FormControl.displayName = 'FormControl';
export default FormControl;
