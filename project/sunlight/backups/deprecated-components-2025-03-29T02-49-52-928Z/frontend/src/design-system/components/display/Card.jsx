/**
 * Card Component
 * 
 * Adapter for the Material UI Card component with TAP Integration Platform styling
 */
import React from 'react';
import { CardActions, CardContent, CardHeader, MuiCard, styled } from '@design-system';
;
;
;
;
;

// Styled MUI Card component
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

/**
 * Card component adapter
 */
const Card = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return (
    <StyledCard ref={ref} {...rest}>
      {children}
    </StyledCard>
  );
});

Card.displayName = 'Card';

// Also export MUI CardContent, CardHeader, and CardActions for convenience
export { CardContent, CardHeader, CardActions };

export default Card;
