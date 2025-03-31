/**
 * @component Avatar
 * @description An enhanced avatar component for user profile images and placeholders
 * with various shapes, sizes, and fallback options.
 * @typedef {import('../../types/display').AvatarProps} AvatarProps
 * @type {React.FC<AvatarProps>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * AvatarAdapted component
 */
const Avatar = React.memo(({
  alt = '',
  children,
  imgProps = {},
  sizes = '',
  src,
  srcSet = '',
  variant = 'circular',
  size = 'medium',
  color = 'default',
  
  // Additional props
  ...rest
}) => {
  // Determine avatar size based on prop
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
    xlarge: 80
  };
  
  // If size is a number, use it directly, otherwise look up in sizeMap
  const avatarSize = typeof size === 'number' ? size : sizeMap[size] || sizeMap.medium;
  
  // Determine background color based on color prop
  const getBackgroundColor = () => {
  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';


    if (color === 'default') return '#bdbdbd';
    if (color === 'primary') return 'var(--primary-main, #1976d2)';
    if (color === 'secondary') return 'var(--secondary-main, #9c27b0)';
    if (color === 'error') return 'var(--error-main, #d32f2f)';
    if (color === 'info') return 'var(--info-main, #0288d1)';
    if (color === 'success') return 'var(--success-main, #2e7d32)';
    if (color === 'warning') return 'var(--warning-main, #ed6c02)';
    return color; // If color is a custom string (e.g. #ff0000)
  };
  
  // Get border radius based on variant
  const getBorderRadius = () => {
  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';


    if (variant === 'circular') return '50%';
    if (variant === 'rounded') return '4px';
    if (variant === 'square') return '0';
    return '50%'; // Default to circular
  };
  
  // Generate initials from alt text
  const generateInitials = () => {
  // Added display name
  generateInitials.displayName = 'generateInitials';

  // Added display name
  generateInitials.displayName = 'generateInitials';

  // Added display name
  generateInitials.displayName = 'generateInitials';

  // Added display name
  generateInitials.displayName = 'generateInitials';

  // Added display name
  generateInitials.displayName = 'generateInitials';


    if (!alt) return '';
    
    return alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Determine what to render inside avatar
  const renderContent = () => {
  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';


    // If src is provided, render image
    if (src) {
      return (
        <img
          alt={alt}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: getBorderRadius()
          }}
          {...imgProps}
        />
      );
    }
    
    // If children are provided, render them
    if (children) {
      return children;
    }
    
    // Otherwise, render initials
    return generateInitials();
  };
  
  return (
    <Box
      component="div&quot;
      sx={{
        position: "relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: avatarSize,
        height: avatarSize,
        fontSize: avatarSize / 2,
        lineHeight: 1,
        borderRadius: getBorderRadius(),
        overflow: 'hidden',
        userSelect: 'none',
        backgroundColor: getBackgroundColor(),
        color: '#fff',
        ...(rest.sx || {})
      }}
      {...rest}
    >
      {renderContent()}
    </Box>
  );
});

AvatarAdapted.propTypes = {
  // Image props
  alt: PropTypes.string,
  src: PropTypes.string,
  srcSet: PropTypes.string,
  sizes: PropTypes.string,
  imgProps: PropTypes.object,
  
  // Content
  children: PropTypes.node,
  
  // Appearance
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    PropTypes.number
  ]),
  color: PropTypes.oneOfType([
    PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string
  ]),
};

Avatar.displayName = 'Avatar';

export default Avatar;