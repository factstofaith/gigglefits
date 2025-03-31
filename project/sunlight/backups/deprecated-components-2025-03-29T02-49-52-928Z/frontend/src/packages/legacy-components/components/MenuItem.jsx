/**
 * @component MenuItem
 * @description A simple wrapper that maintains backward compatibility with Material UI's MenuItem API.
 * Since we don't have a complete custom MenuItem component yet, this is a minimal wrapper
 * to help with the migration process.
 *
 * This would normally wrap a custom design system component, but for now it just adds the
 * appropriate classes for testing and future migration.
 */

import React from 'react';
import { MenuItem } from '../../design-system';
;

const MenuItem = props => {
  const { className, ...rest } = props;

  return (
    <MenuItem className={`ds-menu-item ds-menu-item-legacy ${className || ''}`} {...rest} />
  );
};


MenuItem.displayName = 'MenuItem';
export default MenuItem;
