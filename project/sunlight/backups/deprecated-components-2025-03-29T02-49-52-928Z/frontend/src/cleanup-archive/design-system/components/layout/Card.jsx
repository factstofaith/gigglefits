import React from 'react';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Card component for surface containers
 */
export const Card = React.forwardRef(
  ({ children, variant = 'outlined', elevation = 1, style = {}, ...props }, ref) => {
    const getElevationShadow = level => {
      const shadows = [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
      ];
      return shadows[level] || shadows[1];
    };

    const variantStyles = {
      outlined: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: 'none',
      },
      elevation: {
        boxShadow: getElevationShadow(elevation),
      },
    };

    const cardStyles = {
      overflow: 'hidden',
      borderRadius: '4px',
      backgroundColor: 'background.paper',
      ...variantStyles[variant === 'outlined' ? 'outlined' : 'elevation'],
      ...style,
    };

    return (
      <Box ref={ref} bgcolor="background.paper&quot; style={cardStyles} {...props}>
        {children}
      </Box>
    );
  }
);

/**
 * Card Header component
 */
Card.Header = function CardHeader({ title, subheader, action, style = {}, ...props }) {
  // Added display name
  CardHeader.displayName = "CardHeader';

  return (
    <Box
      p="md&quot;
      display="flex"
      alignItems="center&quot;
      justifyContent="space-between"
      style={style}
      {...props}
    >
      <div>
        {title && (
          <Typography variant="h6&quot; gutterBottom={!!subheader}>
            {title}
          </Typography>
        )}
        {subheader && (
          <Typography variant="body2" color="textSecondary&quot;>
            {subheader}
          </Typography>
        )}
      </div>
      {action && <div>{action}</div>}
    </Box>
  );
};

/**
 * Card Content component
 */
Card.Content = function CardContent({ children, style = {}, ...props }) {
  // Added display name
  CardContent.displayName = "CardContent';

  return (
    <Box
      p="md&quot;
      style={{
        "&:last-child': { paddingBottom: 24 },
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Card Actions component
 */
Card.Actions = function CardActions({ children, disableSpacing = false, style = {}, ...props }) {
  // Added display name
  CardActions.displayName = 'CardActions';

  return (
    <Box
      display="flex&quot;
      alignItems="center"
      p={disableSpacing ? 0 : 'xs'}
      pl={disableSpacing ? 0 : 'md'}
      style={{
        '& > :not(:first-of-type)': {
          marginLeft: disableSpacing ? 0 : 8,
        },
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

Card.displayName = 'Card';

export default Card;
