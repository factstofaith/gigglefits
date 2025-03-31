/**
 * @component Chip
 * @description A wrapper around the design system Chip component that maintains
 * backward compatibility with Material UI's Chip API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { Chip } from '@design-system/components/display';

const Chip = ({
  label,
  icon,
  avatar,
  deleteIcon,
  onDelete,
  color = 'default',
  size = 'medium',
  variant = 'filled',
  disabled = false,
  clickable = false,
  onClick,
  component,
  href,
  className,
  sx,
  ...rest
}) => {
  // Added display name
  Chip.displayName = 'Chip';

  // Added display name
  Chip.displayName = 'Chip';

  // Added display name
  Chip.displayName = 'Chip';

  // Added display name
  Chip.displayName = 'Chip';

  // Added display name
  Chip.displayName = 'Chip';


  // Map Material UI props to design system props
  return (
    <Chip
      label={label}
      icon={icon}
      avatar={avatar}
      deleteIcon={deleteIcon}
      onDelete={onDelete}
      color={color}
      size={size}
      variant={variant}
      disabled={disabled}
      clickable={clickable || !!onClick}
      onClick={onClick}
      component={component}
      href={href}
      className={`ds-chip ds-chip-legacy ${className || ''}`}
      style={sx}
      {...rest}
    />
  );
};

export default Chip;
