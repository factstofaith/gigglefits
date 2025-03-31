/**
 * @component InputLabel
 * @description A simple wrapper that maintains backward compatibility with Material UI's InputLabel API.
 * Since we don't have a complete custom InputLabel component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { InputLabel } from '../../design-system';
;

const InputLabel = props => {
  const { className, ...rest } = props;

  return (
    <InputLabel
      className={`ds-input-label ds-input-label-legacy ${className || ''}`}
      {...rest}
    />
  );
};


InputLabel.displayName = 'InputLabel';
export default InputLabel;
