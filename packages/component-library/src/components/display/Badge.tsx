import React from 'react';
import MuiBadge, { BadgeProps as MuiBadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

/**
 * Badge color options
 */
export type BadgeColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/**
 * Badge variant options
 */
export type BadgeVariant = 'standard' | 'dot';

/**
 * Badge component props interface
 */
export interface BadgeProps extends Omit<MuiBadgeProps, 'color' | 'variant'> {
  /**
   * The content to be displayed in the badge
   */
  badgeContent?: React.ReactNode;
  
  /**
   * The color of the badge
   * @default 'primary'
   */
  color?: BadgeColor;
  
  /**
   * If true, the badge will be invisible
   * @default false
   */
  invisible?: boolean;
  
  /**
   * Max count to show
   * @default 99
   */
  max?: number;
  
  /**
   * The variant to use
   * @default 'standard'
   */
  variant?: BadgeVariant;
  
  /**
   * Wrapped badge item
   */
  children: React.ReactNode;
  
  /**
   * The horizontal position of the badge
   * @default 'right'
   */
  horizontalPosition?: 'left' | 'right';
  
  /**
   * The vertical position of the badge
   * @default 'top'
   */
  verticalPosition?: 'top' | 'bottom';
  
  /**
   * If true, the badge will have a smaller size
   * @default false
   */
  compact?: boolean;
}

const StyledBadge = styled(MuiBadge, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ theme, compact }) => ({
  ...(compact && {
    '& .MuiBadge-badge': {
      fontSize: '0.65rem',
      height: '16px',
      minWidth: '16px',
      padding: '0 4px',
    },
  }),
}));

/**
 * Badge component for showing notification counts or status indicators
 * 
 * @example
 * // Basic usage
 * <Badge badgeContent={4} color="primary">
 *   <MailIcon />
 * </Badge>
 * 
 * @example
 * // Using the dot variant
 * <Badge variant="dot" color="error">
 *   <NotificationsIcon />
 * </Badge>
 * 
 * @example
 * // With custom positioning
 * <Badge badgeContent={99} max={99} horizontalPosition="left" verticalPosition="bottom" color="error">
 *   <MailIcon />
 * </Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  badgeContent,
  color = 'primary',
  invisible = false,
  max = 99,
  variant = 'standard',
  children,
  horizontalPosition = 'right',
  verticalPosition = 'top',
  compact = false,
  ...rest
}) => {
  return (
    <StyledBadge
      badgeContent={badgeContent}
      color={color}
      invisible={invisible}
      max={max}
      variant={variant}
      anchorOrigin={{
        vertical: verticalPosition,
        horizontal: horizontalPosition,
      }}
      compact={compact}
      {...rest}
    >
      {children}
    </StyledBadge>
  );
};

export default Badge;