import { ToggleButtonGroup } from '../adapter';
/**
 * @component ToggleButtonGroup
 * @description A simple wrapper that maintains backward compatibility with Material UI's ToggleButtonGroup API.
 * Since we don't have a complete custom ToggleButtonGroup component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { ToggleButtonGroup } from '../../design-system';

;

const ToggleButtonGroup = props => {
  const { className, ...rest } = props;

  return (
    <MuiToggleButtonGroup
      className={`ds-toggle-button-group ds-toggle-button-group-legacy ${className || ''}`}
      {...rest}
    />
  );
};


ToggleButtonGroup.displayName = 'ToggleButtonGroup';
export default ToggleButtonGroup;
