/**
 * Card component
 * 
 * Card is a flexible container that provides a consistent appearance
 * for grouping related content and actions.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiCard, MuiCardActions, MuiCardContent, MuiCardHeader } from '@design-system';
;
;
;
;

const Card = React.forwardRef(({ children, variant = 'outlined', ...props }, ref) => {
  Card.displayName = 'Card';
  
  return (
    <MuiCard variant={variant} ref={ref} {...props}>
      {children}
    </MuiCard>
  );
});

// Header component
const Header = (props) => {
  // Added display name
  Header.displayName = 'Header';

  // Added display name
  Header.displayName = 'Header';

  Header.displayName = 'Card.Header';
  return <MuiCardHeader {...props} />;
};

// Content component
const Content = (props) => {
  // Added display name
  Content.displayName = 'Content';

  // Added display name
  Content.displayName = 'Content';

  Content.displayName = 'Card.Content';
  return <MuiCardContent {...props} />;
};

// Actions component
const Actions = (props) => {
  // Added display name
  Actions.displayName = 'Actions';

  // Added display name
  Actions.displayName = 'Actions';

  Actions.displayName = 'Card.Actions';
  return <MuiCardActions {...props} />;
};

// Add sub-components
Card.Header = Header;
Card.Content = Content;
Card.Actions = Actions;

Card.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['outlined', 'elevation']),
  elevation: PropTypes.number,
  square: PropTypes.bool,
  sx: PropTypes.object,
};

export default Card;
