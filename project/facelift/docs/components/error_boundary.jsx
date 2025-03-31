import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RefreshOutlined as RefreshIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { trackError } from './analytics_service';

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
}));

const ErrorIconWrapper = styled(Box)(({ theme }) => ({
  fontSize: 60,
  marginBottom: theme.spacing(2),
  color: theme.palette.error.main,
}));

/**
 * ErrorBoundary component
 * 
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the component tree.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the analytics service
    trackError('react_error_boundary', error.message, {
      component: this.props.componentName || 'Unknown',
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    // Set the error info in state
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, errorInfo, this.handleReset)
          : fallback;
      }
      
      // Default error UI
      return (
        <ErrorContainer elevation={3}>
          <ErrorIconWrapper>
            <ErrorIcon fontSize="inherit" />
          </ErrorIconWrapper>
          
          <Typography variant="h5" component="h2" gutterBottom>
            {this.props.title || 'Something went wrong'}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {this.props.message || 'An error occurred while rendering this component.'}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
          >
            {this.props.resetButtonText || 'Try Again'}
          </Button>
          
          {showDetails && (
            <Box mt={3} width="100%">
              <Divider />
              <Box mt={2} textAlign="left">
                <Typography variant="subtitle2" gutterBottom>
                  Error Details:
                </Typography>
                <Box 
                  bgcolor="rgba(0,0,0,0.05)" 
                  p={1} 
                  borderRadius={1} 
                  overflow="auto" 
                  maxHeight={200}
                  component="pre"
                  fontSize="0.75rem"
                >
                  {error?.toString()}
                  {errorInfo?.componentStack}
                </Box>
              </Box>
            </Box>
          )}
        </ErrorContainer>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /**
   * Custom fallback UI to display when an error occurs
   */
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  
  /**
   * Title to display in the error message
   */
  title: PropTypes.string,
  
  /**
   * Message to display in the error message
   */
  message: PropTypes.string,
  
  /**
   * Text for the reset button
   */
  resetButtonText: PropTypes.string,
  
  /**
   * Whether to show error details (defaults to true in development, false in production)
   */
  showDetails: PropTypes.bool,
  
  /**
   * Name of the component that the error boundary is wrapping (for logging)
   */
  componentName: PropTypes.string,
  
  /**
   * Callback to execute when an error occurs
   */
  onError: PropTypes.func,
  
  /**
   * Callback to execute when the error boundary is reset
   */
  onReset: PropTypes.func,
  
  /**
   * Children to render
   */
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;