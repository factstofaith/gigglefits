/**
 * @component Avatar
 * @description A compatibility wrapper for the legacy Avatar component. This component
 * maps the legacy Avatar API (from Material UI) to the new design system Avatar component.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '@design-system/components/display/Avatar';

/**
 * AvatarLegacy - Migration wrapper for Material UI Avatar component
 *
 * @param {Object} props - All props from the original Avatar component
 * @returns {React.ReactElement} Rendered Avatar component from design system
 */
const Avatar = React.forwardRef(
  (
    {
      alt,
      children,
      className,
      color,
      component,
      imgProps,
      sizes,
      src,
      srcSet,
      style,
      variant = 'circular',
      sx = {},
      ...otherProps
    },
    ref
  ) => {
    // Combine style and sx props
    const combinedSx = {
      ...style,
      ...sx,
    };

    // Handle custom component
    const RenderedComponent = component || Avatar;

    // Handle srcSet if provided
    const enhancedImgProps = {
      ...imgProps,
      ...(srcSet && { srcSet }),
      ...(sizes && { sizes }),
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'AvatarLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Avatar component.'
      );
    }

    if (component) {
      return (
        <RenderedComponent ref={ref} className={className} style={style} {...otherProps}>
          {children}
        </RenderedComponent>
      );
    }

    return (
      <Avatar
        ref={ref}
        alt={alt}
        src={src}
        variant={variant}
        imgProps={enhancedImgProps}
        className={className}
        sx={combinedSx}
        {...otherProps}
      >
        {children}
      </Avatar>
    );
  }
);

AvatarLegacy.propTypes = {
  alt: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  color: PropTypes.string,
  component: PropTypes.elementType,
  imgProps: PropTypes.object,
  sizes: PropTypes.string,
  src: PropTypes.string,
  srcSet: PropTypes.string,
  style: PropTypes.object,
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  sx: PropTypes.object,
};

Avatar.displayName = 'Avatar';

export default Avatar;
