import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Styled components for enhanced visual presentation
 */
const StyledEmptyState = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.default,
  border: `1px dashed ${theme.palette.divider}`,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  opacity: 0.8,
}));

/**
 * EmptyStatePrompt component
 * 
 * Displays a visually appealing empty state message with optional action button.
 * Used when there is no data to display, providing guidance to the user on next steps.
 */
const EmptyStatePrompt = ({
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
  icon,
  minHeight = 300,
}) => {
  return (
    <StyledEmptyState sx={{ minHeight }}>
      <IconContainer>
        {icon}
      </IconContainer>
      
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        {description}
      </Typography>
      
      {showAction && actionLabel && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </StyledEmptyState>
  );
};

EmptyStatePrompt.propTypes = {
  /**
   * The main title displayed in the empty state
   */
  title: PropTypes.string.isRequired,
  
  /**
   * Detailed description explaining why the state is empty and what actions can be taken
   */
  description: PropTypes.string.isRequired,
  
  /**
   * Label for the call-to-action button
   */
  actionLabel: PropTypes.string,
  
  /**
   * Function to call when the action button is clicked
   */
  onAction: PropTypes.func,
  
  /**
   * Whether to show the action button
   */
  showAction: PropTypes.bool,
  
  /**
   * Icon element to display above the title
   */
  icon: PropTypes.node.isRequired,
  
  /**
   * Minimum height of the empty state container
   */
  minHeight: PropTypes.number,
};

export default EmptyStatePrompt;