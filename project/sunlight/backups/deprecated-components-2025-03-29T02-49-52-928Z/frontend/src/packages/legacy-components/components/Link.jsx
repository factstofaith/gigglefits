import React from 'react';

/**
 * Legacy wrapper for Link component
 * This provides backward compatibility with Material UI's Link component
 */
const Link = ({
  href,
  target,
  rel,
  children,
  color = 'primary',
  underline = 'hover',
  ...props
}) => {
  // Added display name
  Link.displayName = 'Link';

  // Added display name
  Link.displayName = 'Link';

  // Added display name
  Link.displayName = 'Link';

  // Added display name
  Link.displayName = 'Link';

  // Added display name
  Link.displayName = 'Link';


  const style = {
    color: color === 'primary' ? '#1976d2' : color,
    textDecoration: underline === 'none' ? 'none' : 'underline',
    cursor: 'pointer',
    ...props.style,
  };

  return (
    <a href={href} target={target} rel={rel} style={style} {...props}>
      {children}
    </a>
  );
};

export default Link;
