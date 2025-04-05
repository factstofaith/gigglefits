/**
 * Accessibility-Enhanced Integration Detail View
 *
 * A component for viewing and editing integration details with enhanced accessibility.
 * Part of the zero technical debt accessibility implementation.
 *
 * @component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, IconButton, Paper, Tab, Tabs, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

// Import accessibility components
import A11yButton from '../common/A11yButton';

// Import accessibility hooks
import { useA11yAnnouncement, useA11yKeyboard, useA11yFocus } from "@/hooks/a11y";

// Import our enhanced configuration components
import AzureBlobConfiguration from './AzureBlobConfiguration';
import A11yScheduleConfiguration from './A11yScheduleConfiguration';

// Import services
import { getIntegrationById, updateIntegration, runIntegration } from "@/services/integrationService";
import authService from "@/services/authService";

/**
 * Enhanced TabPanel component for tab content with improved accessibility
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab panel content
 * @param {number} props.value - Current tab value
 * @param {number} props.index - This tab's index
 * @param {string} props.id - Base ID for this tab panel
 * @returns {JSX.Element} The accessible tab panel
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
function A11yTabPanel({
  children,
  value,
  index,
  id,
  ...other
}) {
  return <div role="tabpanel" hidden={value !== index} id={`${id}-tabpanel-${index}`} aria-labelledby={`${id}-tab-${index}`} tabIndex={value === index ? 0 : -1} {...other}>

      {value === index && <Box>
          {children}
        </Box>}

    </div>;
}

/**
 * Accessibility-enhanced Integration Detail View component
 * 
 * @param {Object} props - Component props
 * @param {string} props.integrationId - ID of the integration to display
 * @returns {JSX.Element} The enhanced integration detail view
 */
const A11yIntegrationDetailView = ({
  integrationId
}) => {
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningIntegration, setRunningIntegration] = useState(false);

  // Refs for focus management
  const tabsRef = useRef(null);
  const saveButtonRef = useRef(null);

  // A11y hooks
  const {
    announcePolite,
    announceAssertive
  } = useA11yAnnouncement();
  const {
    registerKeyHandler
  } = useA11yKeyboard();
  const {
    containerRef
  } = useA11yFocus({
    trapFocus: isEditing
  });

  // Fetch integration data
  useEffect(() => {
    const isMounted = {
      current: true
    };
    const controller = new AbortController();
    const fetchIntegration = async () => {
      try {
        setLoading(true);
        const data = await getIntegrationById(integrationId, {
          signal: controller.signal
        });

        // Only update state if component is still mounted
        if (!isMounted.current) return;

        // Initialize with default configs if not present
        if (!data.azureBlobConfig) {
          data.azureBlobConfig = {
            authMethod: 'connectionString',
            containerName: ''
          };
        }
        if (!data.schedule || typeof data.schedule === 'string') {
          data.schedule = {
            type: data.schedule || 'onDemand',
            cronExpression: '',
            timezone: 'UTC'
          };
        }
        setIntegration(data);
        setLoading(false);
        announcePolite(`Integration details for ${data.name} loaded successfully`);
      } catch (err) {
        if (!isMounted.current) return;
        // Don't set error state for aborted requests
        if (err.name !== 'AbortError') {
          setError('Failed to load integration details');
          setLoading(false);
          announceAssertive('Failed to load integration details');
        }
      }
    };
    const checkUserRole = async () => {
      try {
        const isAdmin = await authService.isAdmin();
        if (isMounted.current) {
          setIsSuperUser(isAdmin);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };
    fetchIntegration();
    checkUserRole();

    // Clean up function for when component unmounts
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [integrationId, announcePolite, announceAssertive]);

  // Register keyboard shortcuts
  useEffect(() => {
    // Register keyboard handlers
    const handleNextTab = e => {
      e.preventDefault();
      setActiveTab(prev => prev < 2 ? prev + 1 : prev);
    };
    const handlePrevTab = e => {
      e.preventDefault();
      setActiveTab(prev => prev > 0 ? prev - 1 : prev);
    };
    const handleToggleEdit = e => {
      e.preventDefault();
      toggleEditMode();
    };
    const handleRunShortcut = e => {
      e.preventDefault();
      if (!runningIntegration) {
        handleRunIntegration();
      }
    };
    const cleanup = registerKeyHandler({
      'Alt+ArrowRight': handleNextTab,
      'Alt+ArrowLeft': handlePrevTab,
      'Alt+e': handleToggleEdit,
      'Alt+r': handleRunShortcut
    });

    // Announce keyboard shortcuts when component loads
    announcePolite('Press Alt+Right and Alt+Left to navigate tabs. Alt+E to toggle edit mode. Alt+R to run the integration.');
    return cleanup;
  }, [registerKeyHandler, announcePolite, runningIntegration]);

  // Handle tab changes - memoize to prevent recreation on each render
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    announcePolite(`Tab changed to ${['Overview', 'Configuration', 'Schedule'][newValue]}`);
  }, [announcePolite]);

  // Handle edit mode toggle - memoize to prevent recreation on each render
  const toggleEditMode = useCallback(() => {
    setIsEditing(prevState => {
      const newState = !prevState;

      // Announce the state change to screen readers
      if (newState) {
        announcePolite('Edit mode enabled. You can now modify integration settings.');
      } else {
        announcePolite('Edit mode disabled. Integration settings are now read-only.');
      }
      return newState;
    });
  }, [announcePolite]);

  // Handle Azure Blob configuration changes - memoize to prevent recreation on each render
  const handleBlobConfigChange = useCallback(config => {
    setIntegration(prev => ({
      ...prev,
      azureBlobConfig: config
    }));
    announcePolite('Azure Blob configuration updated');
  }, [announcePolite]);

  // Handle schedule changes - memoize to prevent recreation on each render
  const handleScheduleChange = useCallback(schedule => {
    setIntegration(prev => ({
      ...prev,
      schedule
    }));
    announcePolite('Schedule configuration updated');
  }, [announcePolite]);

  // Save integration changes - memoize to prevent recreation on each render
  const handleSave = useCallback(async () => {
    const isMounted = {
      current: true
    };
    const controller = new AbortController();
    try {
      setSaving(true);
      announcePolite('Saving changes...');
      await updateIntegration(integrationId, integration, {
        signal: controller.signal
      });
      if (isMounted.current) {
        setIsEditing(false);
        setSaving(false);
        announcePolite('Changes saved successfully');
      }
    } catch (err) {
      if (!isMounted.current) return;

      // Don't set error state for aborted requests
      if (err.name !== 'AbortError') {
        setError('Failed to save changes');
        setSaving(false);
        announceAssertive('Failed to save changes. Please try again.');
      }
    }
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [integrationId, integration, announcePolite, announceAssertive]);

  // Run integration - memoize to prevent recreation on each render
  const handleRunIntegration = useCallback(async () => {
    const isMounted = {
      current: true
    };
    const controller = new AbortController();
    let timer = null;
    try {
      setRunningIntegration(true);
      announcePolite('Running integration...');
      await runIntegration(integrationId, {
        signal: controller.signal
      });

      // In a real app, you might want to poll for status updates
      // or redirect to a run history page
      timer = setTimeout(() => {
        if (isMounted.current) {
          setRunningIntegration(false);
          announcePolite('Integration run completed');
        }
      }, 2000);
    } catch (err) {
      if (!isMounted.current) return;

      // Don't set error state for aborted requests
      if (err.name !== 'AbortError') {
        setError('Failed to run integration');
        setRunningIntegration(false);
        announceAssertive('Failed to run integration. Please try again.');
      }
    }
    return () => {
      isMounted.current = false;
      if (timer) clearTimeout(timer);
      controller.abort();
    };
  }, [integrationId, announcePolite, announceAssertive]);

  // Show loading state
  if (loading) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      p: {
        xs: 2,
        sm: 3,
        md: 4
      }
    }} role="status" aria-label="Loading integration details">

        <CircularProgress />
      </Box>;
  }

  // Show error state
  if (error) {
    return <Paper sx={{
      p: {
        xs: 2,
        sm: 3
      },
      m: {
        xs: 1,
        sm: 2
      },
      bgcolor: 'error.light',
      color: 'error.contrastText'
    }} role="alert">

        <Typography variant="body1" sx={{
        fontWeight: 'medium'
      }}>{error}</Typography>
        <A11yButton sx={{
        mt: 2
      }} variant="outlined" size="small" color="inherit" onClick={() => window.location.reload()} a11yLabel="Reload page" a11yAnnouncement="Reloading page to try again">

          Reload
        </A11yButton>
      </Paper>;
  }

  // Check if Azure Blob is used as source or destination
  const isAzureBlobUsed = integration?.source === 'Azure Blob Container' || integration?.destination === 'Azure Blob Container';
  return <Card sx={{
    mx: {
      xs: 1,
      sm: 2,
      md: 3
    },
    mt: {
      xs: 1,
      sm: 2
    }
  }} ref={containerRef}>

      <CardHeader title={<Typography variant="h5" sx={{
      fontSize: {
        xs: '1.25rem',
        sm: '1.5rem'
      },
      wordBreak: 'break-word'
    }} tabIndex={0}>

            {integration?.name || 'Integration Details'}
          </Typography>} subheader={<Typography variant="subtitle1" color="text.secondary" sx={{
      fontSize: {
        xs: '0.875rem',
        sm: '1rem'
      },
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 0.5
    }}>

            <span>{integration?.source || ''}</span>
            <span aria-hidden="true">→</span>
            <span className="sr-only">to</span>
            <span>{integration?.destination || ''}</span>
          </Typography>} sx={{
      flexDirection: {
        xs: 'column',
        sm: 'row'
      },
      alignItems: {
        xs: 'flex-start',
        sm: 'center'
      },
      '.MuiCardHeader-action': {
        m: {
          xs: '16px 0 0 0',
          sm: 0
        }
      }
    }} action={<Box sx={{
      display: 'flex',
      gap: 1,
      flexWrap: {
        xs: 'wrap',
        sm: 'nowrap'
      },
      width: {
        xs: '100%',
        sm: 'auto'
      }
    }}>
            <A11yButton variant="contained" color="primary" startIcon={<PlayArrowIcon />} onClick={handleRunIntegration} disabled={runningIntegration} size={{
        xs: 'small',
        sm: 'medium'
      }} sx={{
        flexGrow: {
          xs: 1,
          sm: 0
        }
      }} a11yLabel="Run integration now" a11yAnnouncement={runningIntegration ? "Integration is running" : "Starting integration run"} a11yControls="integration-run-status">

              {runningIntegration ? 'Running...' : 'Run Now'}
            </A11yButton>
            <IconButton onClick={toggleEditMode} color={isEditing ? 'primary' : 'default'} size={{
        xs: 'small',
        sm: 'medium'
      }} aria-label={isEditing ? "Exit edit mode" : "Enter edit mode"} aria-pressed={isEditing}>

              <EditIcon />
            </IconButton>
          </Box>} />


      
      <Divider />
      
      <Box sx={{
      borderBottom: 1,
      borderColor: 'divider',
      overflow: 'auto'
    }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="integration tabs" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile ref={tabsRef} sx={{
        minHeight: {
          xs: '48px',
          sm: 'inherit'
        },
        '& .MuiTab-root': {
          minHeight: {
            xs: '48px',
            sm: 'inherit'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem'
          },
          p: {
            xs: '6px 12px',
            sm: '12px 16px'
          }
        }
      }}>

          <Tab label="Overview" icon={<SettingsIcon fontSize="small" />} iconPosition="start" id="integration-tab-0" aria-controls="integration-tabpanel-0" />

          <Tab label="Configuration" icon={<SettingsIcon fontSize="small" />} iconPosition="start" disabled={!isAzureBlobUsed} id="integration-tab-1" aria-controls="integration-tabpanel-1" />

          <Tab label="Schedule" icon={<HistoryIcon fontSize="small" />} iconPosition="start" id="integration-tab-2" aria-controls="integration-tabpanel-2" />

        </Tabs>
      </Box>
      
      <CardContent sx={{
      px: {
        xs: 2,
        sm: 3
      },
      py: {
        xs: 2,
        sm: 3
      }
    }}>
        {/* Overview Tab */}
        <A11yTabPanel value={activeTab} index={0} id="integration">
          <Grid container spacing={{
          xs: 2,
          sm: 3
        }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{
              p: {
                xs: 2,
                sm: 3
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}>

                <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }} tabIndex={0}>

                  Basic Information
                </Typography>
                
                <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }} role="list" aria-label="Integration details">

                  <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }} role="listitem">

                    <Typography variant="body2" sx={{
                    fontWeight: 'medium',
                    minWidth: {
                      xs: '80px',
                      sm: '100px'
                    }
                  }} component="span">

                      Type:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {integration?.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }} role="listitem">

                    <Typography variant="body2" sx={{
                    fontWeight: 'medium',
                    minWidth: {
                      xs: '80px',
                      sm: '100px'
                    }
                  }} component="span">

                      Source:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {integration?.source}
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }} role="listitem">

                    <Typography variant="body2" sx={{
                    fontWeight: 'medium',
                    minWidth: {
                      xs: '80px',
                      sm: '100px'
                    }
                  }} component="span">

                      Destination:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {integration?.destination}
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }} role="listitem">

                    <Typography variant="body2" sx={{
                    fontWeight: 'medium',
                    minWidth: {
                      xs: '80px',
                      sm: '100px'
                    }
                  }} component="span">

                      Created:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {new Date(integration?.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }} role="listitem">

                    <Typography variant="body2" sx={{
                    fontWeight: 'medium',
                    minWidth: {
                      xs: '80px',
                      sm: '100px'
                    }
                  }} component="span">

                      Updated:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {new Date(integration?.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{
              p: {
                xs: 2,
                sm: 3
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>

                <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }} tabIndex={0}>

                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                whiteSpace: 'pre-wrap'
              }} tabIndex={0}>

                  {integration?.description || 'No description provided.'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </A11yTabPanel>
        
        {/* Configuration Tab */}
        <A11yTabPanel value={activeTab} index={1} id="integration">
          {isAzureBlobUsed ? <AzureBlobConfiguration config={integration?.azureBlobConfig} onChange={handleBlobConfigChange} readOnly={!isEditing} isSuperUser={isSuperUser} /> : <Typography color="textSecondary" tabIndex={0}>
              No additional configuration needed for the selected source/destination.
            </Typography>}

        </A11yTabPanel>
        
        {/* Schedule Tab */}
        <A11yTabPanel value={activeTab} index={2} id="integration">
          <A11yScheduleConfiguration schedule={integration?.schedule} onChange={handleScheduleChange} readOnly={!isEditing} />

        </A11yTabPanel>
      </CardContent>
      
      {/* Hidden status region for screen readers */}
      <div id="integration-run-status" aria-live="polite" className="sr-only" role="status">

        {runningIntegration ? 'Integration is running' : ''}
      </div>
      
      {isEditing && <Box sx={{
      display: 'flex',
      justifyContent: {
        xs: 'center',
        sm: 'flex-end'
      },
      flexDirection: {
        xs: 'column',
        sm: 'row'
      },
      p: {
        xs: 2,
        sm: 3
      },
      gap: {
        xs: 1,
        sm: 2
      }
    }}>
          <A11yButton onClick={toggleEditMode} sx={{
        width: {
          xs: '100%',
          sm: 'auto'
        }
      }} variant="outlined" a11yLabel="Cancel editing" a11yAnnouncement="Cancelling edit mode, no changes saved">

            Cancel
          </A11yButton>
          <A11yButton variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{
        width: {
          xs: '100%',
          sm: 'auto'
        }
      }} ref={saveButtonRef} a11yLabel="Save all changes" a11yAnnouncement={saving ? "Saving changes" : "All changes saved"}>

            {saving ? 'Saving...' : 'Save Changes'}
          </A11yButton>
        </Box>}

      
      {/* Screen reader only class for hidden elements */}
      <style jsx="true">{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </Card>;
};
export default A11yIntegrationDetailView;