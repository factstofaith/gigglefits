import { ToggleButton } from '../adapter';
/**
 * @component ToggleButton
 * @description A simple wrapper that maintains backward compatibility with Material UI's ToggleButton API.
 * Since we don't have a complete custom ToggleButton component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { ToggleButton } from '../../design-system';

;

const ToggleButton = props => {
  const { className, ...rest } = props;

  return (
    <MuiToggleButton
      className={`ds-toggle-button ds-toggle-button-legacy ${className || ''}`}
      {...rest}
    />
  );
};


ToggleButton.displayName = 'ToggleButton';
export default ToggleButton;
