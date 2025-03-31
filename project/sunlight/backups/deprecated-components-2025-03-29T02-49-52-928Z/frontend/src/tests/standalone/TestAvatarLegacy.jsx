// TestAvatarLegacy.jsx
// A standalone version of AvatarLegacy for testing without Material UI or other dependencies

import React from 'react';

/**
 * A simplified implementation of AvatarLegacy for testing purposes
 * This mimics the API of Material UI Avatar with our design system under the hood
 */
const AvatarLegacy = React.forwardRef(
  (
    {
      alt,
      children,
      className = '',
      color = 'default',
      component,
      imgProps = {},
      sizes,
      src,
      srcSet,
      style = {},
      variant = 'circular',
      ...props
    },
    ref
  ) => {
    // Map variants to CSS classes
    const variantClass =
      {
        circular: 'avatar-circular',
        rounded: 'avatar-rounded',
        square: 'avatar-square',
      }[variant] || 'avatar-circular';

    // Map colors to CSS classes
    const colorClass =
      {
        default: 'avatar-default',
        primary: 'avatar-primary',
        secondary: 'avatar-secondary',
      }[color] || 'avatar-default';

    // Combine all classes
    const avatarClass = `avatar ${variantClass} ${colorClass} ${className}`;

    // Handle image props
    const imageAttributes = {
      ...imgProps,
      src,
      alt: alt || 'avatar',
      sizes,
      srcSet,
    };

    // Handle custom component rendering
    if (component) {
      const CustomComponent = component;
      return (
        <CustomComponent
          ref={ref}
          className={avatarClass}
          style={style}
          data-testid="avatar-legacy-custom"
          {...props}
        >
          {children}
        </CustomComponent>
      );
    }

    // Determine content to render
    const content = src ? (
      <img
        {...imageAttributes}
        className="avatar-img&quot;
        data-testid="avatar-image"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      children
    );

    return (
      <div
        ref={ref}
        className={avatarClass}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          width: '40px',
          height: '40px',
          ...style,
        }}
        data-testid="avatar-legacy"
        {...props}
      >
        {content}
      </div>
    );
  }
);

AvatarLegacy.displayName = 'AvatarLegacy';

export default AvatarLegacy;
