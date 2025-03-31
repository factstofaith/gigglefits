/**
 * Avatar Component
 *
 * A versatile display component for user avatars, icons, or letters.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@design-system';
import Box from '@mui/material/Box';
;;

/**
 * Avatar - Displays user avatar, icon, or letter in a circular or square format
 *
 * @param {Object} props - Component properties
 * @param {string} [props.alt] - Alternative text description for the avatar
 * @param {React.ReactNode} [props.children] - Content to display inside the avatar (typically a letter or icon)
 * @param {string} [props.className] - Additional CSS class names
 * @param {Object} [props.sx] - Custom styles object
 * @param {string} [props.src] - Image source URL
 * @param {Object} [props.imgProps] - Additional props for the img element
 * @param {string} [props.variant='circular'] - Shape variant ('circular' or 'square' or 'rounded')
 * @param {string} [props.size='medium'] - Size variant ('small', 'medium', 'large', or custom size through sx)
 * @returns {React.ReactElement} Rendered Avatar component
 */
const Avatar = React.forwardRef(
  (
    {
      alt,
      children,
      className,
      sx = {},
      src,
      imgProps = {},
      variant = 'circular',
      size = 'medium',
      ...otherProps
    },
    ref
  ) => {
    // Size mapping
    const sizeMapping = {
      small: '32px',
      medium: '40px',
      large: '56px',
    };

    // Determine shape based on variant
    const borderRadius = variant === 'circular' ? '50%' : variant === 'rounded' ? '8px' : '4px'; // square variant

    // Base styles
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeMapping[size] || size,
      height: sizeMapping[size] || size,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: 'primary.main',
      color: 'white',
      fontSize: size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.25rem',
      position: 'relative',
      ...sx,
    };

    // Render image if src is provided
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


      if (src) {
        return (
          <img
            src={src}
            alt={alt || 'avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            {...imgProps}
          />
        );
      }

      return children;
    };

    return (
      <Box
        ref={ref}
        className={className}
        sx={baseStyles}
        role="img&quot;
        aria-label={alt}
        {...otherProps}
      >
        {renderContent()}
      </Box>
    );
  }
);

Avatar.propTypes = {
  alt: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  sx: PropTypes.object,
  src: PropTypes.string,
  imgProps: PropTypes.object,
  variant: PropTypes.oneOf(["circular', 'rounded', 'square']),
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.string, // Custom size
  ]),
};

Avatar.displayName = 'Avatar';

export { Avatar };
export default Avatar;
