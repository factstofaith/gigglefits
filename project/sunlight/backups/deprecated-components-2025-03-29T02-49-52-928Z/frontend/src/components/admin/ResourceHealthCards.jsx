// ResourceHealthCards.jsx
// -----------------------------------------------------------------------------
// Component to display health status cards for Azure resources

import React, { useState, useEffect } from 'react';
import {MuiBox as MuiBox, Typography, CircularProgress, Alert, Grid} from '../../design-system';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Help as HelpIcon,
  Web as WebIcon,
  Storage as StorageIcon,
  Storage as DatabaseIcon, // Using Storage icon as Database icon
  Lock as LockIcon,
  Settings as SettingsIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useTheme } from '@design-system/foundations/theme';
import { useAzureConfig } from '@contexts/AzureConfigContext';
import * as azureMonitorService from '@services/azureMonitorService';
// Removed duplicate import

/**
 * Component to display health status cards for Azure resources
 */
const ResourceHealthCards = () => {
  // Added display name
  ResourceHealthCards.displayName = 'ResourceHealthCards';

  // Added display name
  ResourceHealthCards.displayName = 'ResourceHealthCards';

  // Added display name
  ResourceHealthCards.displayName = 'ResourceHealthCards';

  // Added display name
  ResourceHealthCards.displayName = 'ResourceHealthCards';

  // Added display name
  ResourceHealthCards.displayName = 'ResourceHealthCards';


  const { theme } = useTheme();
  const { resources, resourcesLoading, resourcesError } = useAzureConfig();
  
  // State for resource health
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load resource health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await azureMonitorService.getResourceHealth();
        setHealthData(result);
      } catch (err) {
        console.error('Error fetching resource health:', err);
        setError('Failed to load resource health data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthData();
  }, [resources]);
  
  // Get icon by resource type
  const getResourceIcon = (resourceType) => {
  // Added display name
  getResourceIcon.displayName = 'getResourceIcon';

  // Added display name
  getResourceIcon.displayName = 'getResourceIcon';

  // Added display name
  getResourceIcon.displayName = 'getResourceIcon';

  // Added display name
  getResourceIcon.displayName = 'getResourceIcon';

  // Added display name
  getResourceIcon.displayName = 'getResourceIcon';


    if (!resourceType) return <HelpIcon />;
    
    if (resourceType.includes('Microsoft.Web/sites')) {
      return <WebIcon />;
    } else if (resourceType.includes('Microsoft.Storage')) {
      return <StorageIcon />;
    } else if (resourceType.includes('Microsoft.Sql') || resourceType.includes('DBforPostgreSQL')) {
      return <DatabaseIcon />;
    } else if (resourceType.includes('Microsoft.KeyVault')) {
      return <LockIcon />;
    } else if (resourceType.includes('Microsoft.Network')) {
      return <PublicIcon />;
    } else {
      return <SettingsIcon />;
    }
  };
  
  // Get status icon and color
  const getStatusInfo = (status) => {
  // Added display name
  getStatusInfo.displayName = 'getStatusInfo';

  // Added display name
  getStatusInfo.displayName = 'getStatusInfo';

  // Added display name
  getStatusInfo.displayName = 'getStatusInfo';

  // Added display name
  getStatusInfo.displayName = 'getStatusInfo';

  // Added display name
  getStatusInfo.displayName = 'getStatusInfo';


    if (!status) {
      return {
        icon: <HelpIcon />,
        color: theme?.colors?.grey?.[500] || '#9e9e9e',
        text: 'Unknown'
      };
    }
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'available' || normalizedStatus === 'ok') {
      return {
        icon: <CheckCircleIcon />,
        color: theme?.colors?.success?.main || '#4caf50',
        text: 'Available'
      };
    } else if (normalizedStatus === 'degraded' || normalizedStatus === 'warning') {
      return {
        icon: <WarningIcon />,
        color: theme?.colors?.warning?.main || '#ff9800',
        text: 'Degraded'
      };
    } else if (normalizedStatus === 'unavailable' || normalizedStatus === 'error') {
      return {
        icon: <ErrorIcon />,
        color: theme?.colors?.error?.main || '#f44336',
        text: 'Unavailable'
      };
    } else {
      return {
        icon: <HelpIcon />,
        color: theme?.colors?.grey?.[500] || '#9e9e9e',
        text: 'Unknown'
      };
    }
  };
  
  // If no resources yet, show placeholder
  if (!resources || resources.length === 0) {
    return (
      <MuiBox 
        padding="xl&quot; 
        textAlign="center"
        border="1px solid&quot;
        borderColor="divider"
        borderRadius="md&quot;
      >
        <Typography variant="heading3" marginBottom="md&quot;>No Resources Found</Typography>
        <Typography variant="body1">
          No Azure resources have been discovered yet. Use the "Discover Resources" button 
          to scan your Azure subscription for resources.
        </Typography>
      </MuiBox>
    );
  }
  
  // If loading, show loading indicator
  if (loading || resourcesLoading) {
    return (
      <MuiBox 
        display="flex&quot; 
        justifyContent="center" 
        alignItems="center&quot; 
        padding="xl"
      >
        <CircularProgress />
      </MuiBox>
    );
  }
  
  // If error, show error message
  if (error || resourcesError) {
    return (
      <Alert severity="error&quot;>
        {error || resourcesError}
      </Alert>
    );
  }
  
  // Group resources by type
  const resourcesByType = {};
  resources.forEach(resource => {
    const type = resource.type;
    if (!resourcesByType[type]) {
      resourcesByType[type] = [];
    }
    resourcesByType[type].push(resource);
  });
  
  return (
    <MuiBox>
      <Typography variant="heading3" marginBottom="lg&quot;>Resource Health Status</Typography>
      
      {Object.entries(resourcesByType).map(([type, typeResources]) => (
        <MuiBox key={type} marginBottom="xl">
          <Typography variant="heading4&quot; marginBottom="md">
            {type.split('/').pop()}
          </Typography>
          
          <Grid container spacing={3}>
            {typeResources.map(resource => {
              const resourceHealth = healthData[resource.id] || { status: 'Unknown' };
              const statusInfo = getStatusInfo(resourceHealth.status);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={resource.id}>
                  <MuiBox
                    padding="lg&quot;
                    border="1px solid"
                    borderColor="divider&quot;
                    borderRadius="md"
                    boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
                    style={{ 
                      height: "100%',
                      borderLeft: `4px solid ${statusInfo.color}`
                    }}
                  >
                    <MuiBox 
                      display="flex&quot; 
                      justifyContent="space-between"
                      marginBottom="sm&quot;
                    >
                      <MuiBox style={{ display: "flex', alignItems: 'center', gap: '8px' }}>
                        {getResourceIcon(resource.type)}
                        <Typography variant="heading4&quot; noMargin>
                          {resource.name}
                        </Typography>
                      </MuiBox>
                      
                      <MuiBox 
                        style={{ 
                          display: "flex', 
                          alignItems: 'center',
                          color: statusInfo.color
                        }}
                      >
                        {statusInfo.icon}
                      </MuiBox>
                    </MuiBox>
                    
                    <Typography 
                      variant="body2&quot; 
                      style={{ marginBottom: "8px' }}
                    >
                      <strong>Status:</strong> {statusInfo.text}
                    </Typography>
                    
                    <Typography variant="body2&quot;>
                      <strong>Location:</strong> {resource.location}
                    </Typography>
                    
                    {resourceHealth.details && (
                      <Typography 
                        variant="body2" 
                        style={{ marginTop: '8px' }}
                        color="textSecondary"
                      >
                        {resourceHealth.details}
                      </Typography>
                    )}
                  </MuiBox>
                </Grid>
              );
            })}
          </Grid>
        </MuiBox>
      ))}
    </MuiBox>
  );
};

export default ResourceHealthCards;