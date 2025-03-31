import { CircularProgress, Link, Box, Typography } from '../../design-system';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Design system import already exists;
// Removed duplicate import
/**
 * Component that redirects to the hosted documentation URL
 * Simply opens the documentation in a new tab and redirects
 * back to the homepage.
 */
const DocumentRedirect = () => {
  // Added display name
  DocumentRedirect.displayName = 'DocumentRedirect';

  // Added display name
  DocumentRedirect.displayName = 'DocumentRedirect';

  // Added display name
  DocumentRedirect.displayName = 'DocumentRedirect';

  // Added display name
  DocumentRedirect.displayName = 'DocumentRedirect';

  // Added display name
  DocumentRedirect.displayName = 'DocumentRedirect';


  const navigate = useNavigate();
  
  // Get the documentation URL from environment variables
  const docUrl = process.env.REACT_APP_DOCUMENTATION_URL;
  
  useEffect(() => {
    if (!docUrl) {
      // If no documentation URL is configured, redirect after a delay
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // Open documentation URL in a new tab
      window.open(docUrl, '_blank');
      // Navigate back to the homepage
      navigate('/');
    }
  }, [docUrl, navigate]);
  
  // Default loading/redirect view
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '80vh',
        textAlign: 'center'
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h5&quot; sx={{ mt: 4 }}>
        {docUrl ? "Redirecting to documentation...' : 'Documentation URL not configured'}
      </Typography>
      <Typography variant="body1&quot; sx={{ mt: 2, maxWidth: 600 }}>
        {docUrl 
          ? "Opening documentation in a new tab. If nothing happens, please click the link below:'
          : 'The documentation URL has not been configured. Please check your application settings.'}
      </Typography>
      
      {docUrl && (
        <Link href={docUrl} target="_blank&quot; rel="noopener noreferrer" sx={{ mt: 2 }}>
          Open Documentation
        </Link>
      )}
    </Box>
  );
};

export default DocumentRedirect;