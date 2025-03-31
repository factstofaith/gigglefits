import React from 'react';
import MuiAvatar, { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

/**
 * Avatar variant options
 */
export type AvatarVariant = 'circular' | 'square' | 'rounded';

/**
 * Avatar size options
 */
export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Avatar component props interface
 */
export interface AvatarProps extends Omit<MuiAvatarProps, 'variant'> {
  /**
   * The content of the avatar, typically an image, icon, or text
   */
  children?: React.ReactNode;
  
  /**
   * The src attribute for the img element
   */
  src?: string;
  
  /**
   * The srcSet attribute for the img element
   */
  srcSet?: string;
  
  /**
   * The shape of the avatar
   * @default 'circular'
   */
  variant?: AvatarVariant;
  
  /**
   * The size of the avatar
   * @default 'medium'
   */
  size?: AvatarSize;
  
  /**
   * The alt attribute for the img element
   */
  alt?: string;
  
  /**
   * Used to render icon or text elements inside the Avatar if src is not set
   */
  children?: React.ReactNode;
  
  /**
   * If true, the avatar will have a border
   * @default false
   */
  bordered?: boolean;
  
  /**
   * Color to use for the border
   * @default 'primary'
   */
  borderColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) => !['size', 'bordered', 'borderColor'].includes(prop as string),
})<{
  size?: AvatarSize;
  bordered?: boolean;
  borderColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}>(({ theme, size, bordered, borderColor = 'primary' }) => ({
  ...(size === 'small' && {
    width: 24,
    height: 24,
    fontSize: '0.75rem',
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    width: 56,
    height: 56,
    fontSize: '1.5rem',
  }),
  ...(size === 'xlarge' && {
    width: 72,
    height: 72,
    fontSize: '2rem',
  }),
  ...(bordered && {
    border: `2px solid ${theme.palette[borderColor].main}`,
  }),
}));

/**
 * Avatar component for user profile pictures and icons
 * 
 * @example
 * // Basic usage with image
 * <Avatar src="/path/to/image.jpg" alt="User" />
 * 
 * @example
 * // With text fallback
 * <Avatar>JD</Avatar>
 * 
 * @example
 * // With custom size and variant
 * <Avatar size="large" variant="rounded">
 *   <FolderIcon />
 * </Avatar>
 * 
 * @example
 * // With border
 * <Avatar src="/path/to/image.jpg" bordered borderColor="primary" />
 */
export const Avatar: React.FC<AvatarProps> = ({
  children,
  src,
  srcSet,
  variant = 'circular',
  size = 'medium',
  alt,
  bordered = false,
  borderColor = 'primary',
  ...rest
}) => {
  return (
    <StyledAvatar
      src={src}
      srcSet={srcSet}
      variant={variant}
      alt={alt}
      size={size}
      bordered={bordered}
      borderColor={borderColor}
      {...rest}
    >
      {children}
    </StyledAvatar>
  );
};

export default Avatar;