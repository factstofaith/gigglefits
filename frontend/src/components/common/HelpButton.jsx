import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Help Button Component
                                                                                      * 
                                                                                      * A global help button that provides access to contextual help and guided tours.
                                                                                      * Floating button that appears in the corner of the screen.
                                                                                      * 
                                                                                      * @component
                                                                                      */
import React, { useState, useCallback } from 'react';
import { Box, Fab, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Divider, Badge, Zoom, Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, List, ListItem, IconButton } from '@mui/material';
import { Help as HelpIcon, OndemandVideo as TourIcon, LiveHelp as LiveHelpIcon, Close as CloseIcon, Lightbulb as TipIcon, Info as InfoIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useHelp } from "@/contexts/HelpContext";
import GuidedTour from './GuidedTour';

/**
 * HelpButton component providing access to help and tours
 * @returns {JSX.Element} The HelpButton component
 */
const HelpButton = () => {
  const [formError, setFormError] = useState(null);
  // State for menu and dialogs
  const [anchorEl, setAnchorEl] = useState(null);
  const [showTourSelector, setShowTourSelector] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  // Get help context
  const {
    tours,
    startTour,
    helpPreferences,
    toggleHelpVisibility,
    toggleToursVisibility,
    resetTourCompletion,
    activeTourId,
    handleTourComplete
  } = useHelp();

  // Handle menu open/close
  const handleMenuOpen = useCallback(event => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Handle tour selection
  const handleTourSelect = useCallback(() => {
    handleMenuClose();
    setShowTourSelector(true);
  }, [handleMenuClose]);

  // Handle tour start
  const handleStartTour = useCallback(tourId => {
    setShowTourSelector(false);
    startTour(tourId);
  }, [startTour]);

  // Handle help center
  const handleHelpCenter = useCallback(() => {
    handleMenuClose();
    setShowHelpCenter(true);
  }, [handleMenuClose]);

  // Determine if there are unfinished tours
  const hasUnfinishedTours = tours.some(tour => !helpPreferences.completedTours.includes(tour.id));
  return <>
      {/* Floating help button */}
      <Zoom in={true}>
        <Fab color="primary" size="medium" aria-label="Help" onClick={handleMenuOpen} sx={{
        position: 'fixed',
        bottom: {
          xs: 16,
          sm: 24
        },
        right: {
          xs: 16,
          sm: 24
        },
        zIndex: 1000
      }}>

          <Badge color="error" variant="dot" invisible={!hasUnfinishedTours}>

            <HelpIcon />
          </Badge>
        </Fab>
      </Zoom>
      
      {/* Help menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{
      vertical: 'top',
      horizontal: 'center'
    }} transformOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}>

        <MenuItem onClick={handleTourSelect}>
          <ListItemIcon>
            <TourIcon />
          </ListItemIcon>
          <ListItemText primary="Guided Tours" secondary="Interactive step-by-step guides" />

          {hasUnfinishedTours && <Badge color="error" variant="dot" sx={{
          ml: 1
        }} />}


        </MenuItem>
        
        <MenuItem onClick={handleHelpCenter}>
          <ListItemIcon>
            <LiveHelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help Center" secondary="Browse all help topics" />

        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={toggleHelpVisibility}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary={`${helpPreferences.showHelp ? 'Hide' : 'Show'} Help Icons`} secondary="Toggle contextual help tooltips" />

        </MenuItem>
        
        <MenuItem onClick={toggleToursVisibility}>
          <ListItemIcon>
            <TourIcon />
          </ListItemIcon>
          <ListItemText primary={`${helpPreferences.showTours ? 'Disable' : 'Enable'} Tours`} secondary="Toggle guided tour suggestions" />

        </MenuItem>
        
        <MenuItem onClick={resetTourCompletion}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Reset Tour Progress" secondary="Mark all tours as not completed" />

        </MenuItem>
      </Menu>
      
      {/* Tour selection dialog */}
      <Dialog open={showTourSelector} onClose={() => setShowTourSelector(false)} maxWidth="sm" fullWidth>

        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Guided Tours</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setShowTourSelector(false)} aria-label="close">

              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Select a guided tour to learn about different features of the application.
          </Typography>
          
          {tours.map(tour => <Paper key={tour.id} elevation={0} sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.light'
          }
        }} onClick={() => handleStartTour(tour.id)}>

              <Box display="flex" alignItems="flex-start">
                <TourIcon color="primary" sx={{
              mr: 2,
              mt: 0.5,
              fontSize: '1.5rem'
            }} />

                <Box flex={1}>
                  <Typography variant="subtitle1" sx={{
                mb: 0.5
              }}>
                    {tour.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tour.description}
                  </Typography>
                  <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}>
                    <InfoIcon sx={{
                  fontSize: '0.875rem',
                  mr: 0.5
                }} />
                    {tour.steps.length} steps • {tour.duration} min
                    {helpPreferences.completedTours.includes(tour.id) && <Typography component="span" sx={{
                  ml: 2,
                  color: 'success.main',
                  fontSize: '0.75rem',
                  fontWeight: 'medium'
                }}>

                        Completed
                      </Typography>}

                  </Box>
                </Box>
              </Box>
            </Paper>)}

        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowTourSelector(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Help center dialog */}
      <Dialog open={showHelpCenter} onClose={() => setShowHelpCenter(false)} maxWidth="md" fullWidth>

        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Help Center</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setShowHelpCenter(false)} aria-label="close">

              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: 'row'
          },
          gap: 2
        }}>
            {/* Help topics navigation */}
            <Box sx={{
            width: {
              xs: '100%',
              md: '240px'
            },
            borderRight: {
              xs: 'none',
              md: '1px solid'
            },
            borderBottom: {
              xs: '1px solid',
              md: 'none'
            },
            borderColor: 'divider',
            pb: {
              xs: 2,
              md: 0
            },
            pr: {
              xs: 0,
              md: 2
            }
          }}>

              <Typography variant="subtitle1" sx={{
              mb: 1,
              fontWeight: 'medium'
            }}>
                Help Topics
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{
                display: 'block',
                mb: 0.5
              }}>
                  <Button sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  pl: 1
                }} fullWidth>

                    Getting Started
                  </Button>
                </ListItem>
                <ListItem disablePadding sx={{
                display: 'block',
                mb: 0.5
              }}>
                  <Button sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  pl: 1
                }} fullWidth>

                    Integrations
                  </Button>
                </ListItem>
                <ListItem disablePadding sx={{
                display: 'block',
                mb: 0.5
              }}>
                  <Button sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  pl: 1
                }} fullWidth>

                    Data Transformation
                  </Button>
                </ListItem>
                <ListItem disablePadding sx={{
                display: 'block',
                mb: 0.5
              }}>
                  <Button sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  pl: 1
                }} fullWidth>

                    Scheduling
                  </Button>
                </ListItem>
                <ListItem disablePadding sx={{
                display: 'block',
                mb: 0.5
              }}>
                  <Button sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  pl: 1
                }} fullWidth>

                    Troubleshooting
                  </Button>
                </ListItem>
              </List>
            </Box>
            
            {/* Help content */}
            <Box sx={{
            flex: 1
          }}>
              <Typography variant="h6" sx={{
              mb: 2
            }}>
                Getting Started with Integrations
              </Typography>
              
              <Typography variant="body1" paragraph>
                Integrations allow you to transfer and transform data between different systems. Here's how to get started:
              </Typography>
              
              <Typography variant="subtitle1" sx={{
              mt: 3,
              mb: 1
            }}>
                Creating Your First Integration
              </Typography>
              
              <Typography variant="body2" paragraph>
                1. Navigate to the Integrations page and click "Create Integration"
              </Typography>
              
              <Typography variant="body2" paragraph>
                2. Fill in the basic information including name, description, and integration type
              </Typography>
              
              <Typography variant="body2" paragraph>
                3. Configure your source connection by selecting the data source type and entering the required credentials
              </Typography>
              
              <Typography variant="body2" paragraph>
                4. Configure your destination connection where the data will be sent
              </Typography>
              
              <Typography variant="body2" paragraph>
                5. Set up field mapping to define how data fields from the source map to the destination
              </Typography>
              
              <Typography variant="body2" paragraph>
                6. Configure scheduling options to determine when the integration will run
              </Typography>
              
              <Typography variant="body2" paragraph>
                7. Save and test your integration to ensure it works as expected
              </Typography>
              
              <Box sx={{
              bgcolor: 'info.lightest',
              p: 2,
              borderRadius: 1,
              mt: 3,
              display: 'flex',
              alignItems: 'flex-start'
            }}>

                <TipIcon color="info" sx={{
                mr: 1,
                mt: 0.5
              }} />
                <Box>
                  <Typography variant="subtitle2" color="info.dark">
                    Pro Tip
                  </Typography>
                  <Typography variant="body2">
                    Use the guided tours to learn more about specific features. You can access tours by clicking the Help button in the bottom right corner.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowHelpCenter(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Guided tour component */}
      <GuidedTour tours={tours} activeTourId={activeTourId} onTourComplete={handleTourComplete} autoStart={helpPreferences.showTours} />

    </>;
};
export default HelpButton;