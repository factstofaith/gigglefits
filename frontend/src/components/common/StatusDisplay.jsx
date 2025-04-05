import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling/"; // StatusDisplay.jsx
// -----------------------------------------------------------------------------
// Component for displaying loading, error, and empty states consistently throughout the app
import React from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon, Info as InfoIcon, SentimentDissatisfied as EmptyIcon } from '@mui/icons-material';

/**
 * A component to display various status states like loading, error, or empty data
 * 
 * @param {Object} props Component props
 * @param {boolean} props.loading Whether the component is in a loading state
 * @param {string|null} props.error Error message to display, or null if no error
 * @param {boolean} props.isEmpty Whether the data is empty (only used if !loading && !error)
 * @param {string} props.emptyMessage Message to display when isEmpty is true
 * @param {Function} props.onRetry Callback function for retry button
 * @param {Object} props.customStyles Custom styles for the container
 * @param {React.ReactNode} props.children Content to render when not in a status state
 */
export default function StatusDisplay({
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = "No data available",
  onRetry = null,
  customStyles = {},
  children
}) {
  // Render loading state
  if (loading) {
    return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px" p={4} {...customStyles}>

        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary" sx={{
        mt: 2
      }}>
          Loading...
        </Typography>
      </Box>;
  }

  // Render error state
  if (error) {
    return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px" p={4} {...customStyles}>

        <ErrorIcon color="error" style={{
        fontSize: 48
      }} />
        <Typography variant="body1" color="error" sx={{
        mt: 2,
        textAlign: 'center'
      }}>
          {error}
        </Typography>
        {onRetry && <Button variant="outlined" color="primary" onClick={onRetry} sx={{
        mt: 2
      }}>

            Try Again
          </Button>}

      </Box>;
  }

  // Render empty state
  if (isEmpty) {
    return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px" p={4} {...customStyles}>

        <EmptyIcon color="action" style={{
        fontSize: 48
      }} />
        <Typography variant="body1" color="text.secondary" sx={{
        mt: 2,
        textAlign: 'center'
      }}>
          {emptyMessage}
        </Typography>
      </Box>;
  }

  // Render children when not in a status state
  return children;
}