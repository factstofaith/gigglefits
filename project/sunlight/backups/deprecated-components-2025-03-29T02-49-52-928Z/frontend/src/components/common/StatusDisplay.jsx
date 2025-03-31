// StatusDisplay.jsx
// -----------------------------------------------------------------------------
// Component for displaying loading, error, and empty states consistently throughout the app

import React from 'react';
// Import design system components
import { Box, Card } from '../../design-system'
import { Typography, Button } from '../../design-system'
import { CircularProgress } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';

// Icons - keep Material UI icons for now
import {
import { Box } from '../../design-system';
// Design system import already exists;
;
ErrorOutline as ErrorIcon,
  Info as InfoIcon,
  SentimentDissatisfied as EmptyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

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
  emptyMessage = 'No data available',
  onRetry = null,
  customStyles = {},
  children,
}) {
  // Added display name
  StatusDisplay.displayName = 'StatusDisplay';

  const { theme } = useTheme();

  // Render loading state
  if (loading) {
    return (
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          padding: '32px',
          backgroundColor: theme?.colors?.background?.paper || '#ffffff',
          border: `1px dashed ${theme?.colors?.primary?.main ? `${theme.colors.primary.main}33` : '#1976d233'}`,
          borderRadius: '8px',
          transition: 'opacity 0.3s',
          ...customStyles,
        }}
      >
        <Box style={{ position: 'relative' }}>
          <CircularProgress
            size={60}
            thickness={4}
            style={{
              color: theme?.colors?.primary?.main || '#1976d2',
            }}
          />
        </Box>
        <Typography 
          variant="body1&quot; 
          style={{ 
            marginTop: "24px', 
            fontWeight: 500,
            color: theme?.colors?.text?.secondary || '#666666'
          }}
        >
          Loading...
        </Typography>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          padding: '32px',
          border: `1px solid ${theme?.colors?.error?.main ? `${theme.colors.error.main}4D` : '#d32f2f4D'}`,
          backgroundColor: theme?.colors?.error?.main ? `${theme.colors.error.main}0D` : '#d32f2f0D',
          borderRadius: '8px',
          transition: 'opacity 0.3s',
          ...customStyles,
        }}
      >
        <Box
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme?.colors?.error?.main ? `${theme.colors.error.main}1A` : '#d32f2f1A',
          }}
        >
          <ErrorIcon 
            style={{ 
              fontSize: '40px',
              color: theme?.colors?.error?.main || '#d32f2f'
            }} 
          />
        </Box>
        <Typography
          variant="h6&quot;
          style={{ 
            marginTop: "16px', 
            textAlign: 'center', 
            fontWeight: 'medium',
            color: theme?.colors?.error?.main || '#d32f2f'
          }}
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body2&quot;
          style={{ 
            marginTop: "8px', 
            textAlign: 'center', 
            maxWidth: '400px',
            color: theme?.colors?.text?.secondary || '#666666'
          }}
        >
          {error}
        </Typography>
        {onRetry && (
          <Button
            variant="outlined&quot;
            color="error"
            onClick={onRetry}
            style={{ marginTop: '24px' }}
          >
            <Box as="span&quot; display="flex" alignItems="center&quot;>
              <RefreshIcon style={{ marginRight: "8px' }} />
              Try Again
            </Box>
          </Button>
        )}
      </Card>
    );
  }

  // Render empty state
  if (isEmpty) {
    return (
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          padding: '32px',
          border: `1px dashed ${theme?.colors?.divider || '#e0e0e0'}`,
          backgroundColor: theme?.colors?.grey?.[100] || '#f5f5f5',
          borderRadius: '8px',
          transition: 'opacity 0.3s',
          ...customStyles,
        }}
      >
        <Box
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme?.colors?.grey?.[200] || '#eeeeee',
          }}
        >
          <EmptyIcon
            style={{
              fontSize: '40px',
              color: theme?.colors?.grey?.[400] || '#bdbdbd',
            }}
          />
        </Box>
        <Typography
          variant="h6&quot;
          style={{ 
            marginTop: "16px', 
            textAlign: 'center', 
            fontWeight: 'medium',
            color: theme?.colors?.text?.primary || '#212121'
          }}
        >
          No Data Found
        </Typography>
        <Typography
          variant="body2&quot;
          style={{ 
            marginTop: "8px', 
            textAlign: 'center', 
            maxWidth: '400px',
            color: theme?.colors?.text?.secondary || '#666666'
          }}
        >
          {emptyMessage}
        </Typography>
      </Card>
    );
  }

  // Render children when not in a status state
  return children;
}
