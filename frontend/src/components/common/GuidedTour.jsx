/**
 * Guided Tour Component
 * 
 * A component that provides step-by-step guided tours through different features of the application.
 * Tours can be configured with multiple steps, highlighting specific UI elements with descriptions.
 * 
 * @component
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Fade, 
  IconButton,
  Backdrop,
  Portal,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Store tour state in localStorage to resume interrupted tours
const STORAGE_KEY = 'tap_guided_tours';

/**
 * Calculate position for the tour spotlight
 * @param {HTMLElement} element - DOM element to highlight
 * @returns {Object} Position object with coordinates and dimensions
 */
const calculateElementPosition = (element) => {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom + scrollTop,
    right: rect.right + scrollLeft,
    centerX: rect.left + scrollLeft + rect.width / 2,
    centerY: rect.top + scrollTop + rect.height / 2
  };
};

/**
 * Calculate the best position for the tooltip based on element position
 * @param {Object} elementPosition - Element position object
 * @param {number} tooltipWidth - Width of the tooltip
 * @param {number} tooltipHeight - Height of the tooltip
 * @returns {Object} Position object for the tooltip
 */
const calculateTooltipPosition = (elementPosition, tooltipWidth = 320, tooltipHeight = 200) => {
  if (!elementPosition) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Try to position below the element first
  let position = {
    top: elementPosition.bottom + 10,
    left: elementPosition.centerX - tooltipWidth / 2
  };
  
  // Check if tooltip would go off-screen to the right
  if (position.left + tooltipWidth > windowWidth - 20) {
    position.left = windowWidth - tooltipWidth - 20;
  }
  
  // Check if tooltip would go off-screen to the left
  if (position.left < 20) {
    position.left = 20;
  }
  
  // If positioning below would go off-screen, try above
  if (position.top + tooltipHeight > windowHeight - 20) {
    position = {
      top: elementPosition.top - tooltipHeight - 10,
      left: position.left
    };
    
    // If still doesn't fit, position to the right or left of the element
    if (position.top < 20) {
      // Try right first
      if (elementPosition.right + tooltipWidth < windowWidth - 20) {
        position = {
          top: elementPosition.centerY - tooltipHeight / 2,
          left: elementPosition.right + 10
        };
      } 
      // Try left if right doesn't work
      else if (elementPosition.left - tooltipWidth > 20) {
        position = {
          top: elementPosition.centerY - tooltipHeight / 2,
          left: elementPosition.left - tooltipWidth - 10
        };
      }
      // Default to center of screen if all else fails
      else {
        position = {
          top: windowHeight / 2 - tooltipHeight / 2,
          left: windowWidth / 2 - tooltipWidth / 2
        };
      }
    }
  }
  
  return position;
};

/**
 * Tour Spotlight component to highlight UI elements
 * @param {Object} props - Component props 
 * @returns {JSX.Element} Tour spotlight component
 */
const TourSpotlight = ({ elementSelector, visible, pulse }) => {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    if (!visible) return;
    
    const updatePosition = () => {
      const element = document.querySelector(elementSelector);
      if (element) {
        setPosition(calculateElementPosition(element));
        
        // Scroll element into view if needed
        const rect = element.getBoundingClientRect();
        const isInViewport = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    
    updatePosition();
    
    // Update position on window resize
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [elementSelector, visible]);
  
  if (!visible || !position) return null;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
        borderRadius: '4px',
        zIndex: 9998,
        pointerEvents: 'none',
        '&::after': pulse ? {
          content: '""',
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '6px',
          animation: 'pulse 1.5s infinite'
        } : {}
      }}
    />
  );
};

/**
 * Tour Tooltip component to display step information
 * @param {Object} props - Component props
 * @returns {JSX.Element} Tour tooltip component
 */
const TourTooltip = ({ 
  step, 
  totalSteps, 
  title, 
  content, 
  position, 
  onNext, 
  onPrev, 
  onClose, 
  onSkip 
}) => {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: position?.top || '50%',
        left: position?.left || '50%',
        width: 320,
        maxWidth: 'calc(100vw - 40px)',
        transform: position ? 'none' : 'translate(-50%, -50%)',
        zIndex: 9999,
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        p: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {title || 'Guided Tour'}
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            color="inherit"
            onClick={onClose}
            aria-label="Close tour"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="body2">
          {content}
        </Typography>
      </Box>
      
      <Box sx={{ px: 1, py: 0.5 }}>
        <LinearProgress 
          variant="determinate" 
          value={(step / totalSteps) * 100} 
          sx={{ height: 4, mb: 1 }} 
        />
      </Box>
      
      <Box sx={{ 
        p: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          onClick={onSkip}
          size="small"
          sx={{ minWidth: 'auto' }}
        >
          Skip
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {step > 1 && (
            <Button
              onClick={onPrev}
              variant="outlined"
              size="small"
              startIcon={<PrevIcon />}
            >
              Back
            </Button>
          )}
          
          <Button
            onClick={onNext}
            variant="contained"
            color="primary"
            size="small"
            endIcon={step < totalSteps ? <NextIcon /> : <CheckCircleIcon />}
          >
            {step < totalSteps ? 'Next' : 'Finish'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * Tour selection dialog component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Tour selection dialog
 */
const TourSelectionDialog = ({ open, onClose, tours, onSelectTour }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Available Guided Tours
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          Select a guided tour to learn about different features of the application.
        </Typography>
        
        {tours.map((tour) => (
          <Paper
            key={tour.id}
            elevation={0}
            sx={{
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
            }}
            onClick={() => onSelectTour(tour.id)}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
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
              <InfoIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
              {tour.steps.length} steps • {tour.duration} min
            </Box>
          </Paper>
        ))}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * GuidedTour component
 * @param {Object} props - Component props
 * @returns {JSX.Element} The GuidedTour component
 */
const GuidedTour = ({
  tours,
  activeTourId,
  onTourComplete,
  onTourSkip,
  autoStart = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTourId, setCurrentTourId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [showTourSelector, setShowTourSelector] = useState(false);
  const [completedTours, setCompletedTours] = useState([]);
  
  // Find current tour data
  const currentTour = tours.find(tour => tour.id === currentTourId);
  const currentStepData = currentTour?.steps[currentStep - 1];
  
  // Load completed tours from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCompletedTours(parsedData.completedTours || []);
        
        // Check for interrupted tour
        if (parsedData.interrupted && autoStart) {
          setCurrentTourId(parsedData.tourId);
          setCurrentStep(parsedData.step);
          setIsActive(true);
        }
      }
    } catch (error) {
      console.error('Error loading tour data:', error);
    }
  }, [autoStart]);
  
  // Save tour state to localStorage
  const saveTourState = useCallback((tourId, step, interrupted = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tourId,
        step,
        interrupted,
        completedTours
      }));
    } catch (error) {
      console.error('Error saving tour state:', error);
    }
  }, [completedTours]);
  
  // Start a tour
  const startTour = useCallback((tourId) => {
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;
    
    setCurrentTourId(tourId);
    setCurrentStep(1);
    setIsActive(true);
    saveTourState(tourId, 1, true);
    setShowTourSelector(false);
  }, [tours, saveTourState]);
  
  // Move to next step
  const nextStep = useCallback(() => {
    if (!currentTour) return;
    
    if (currentStep < currentTour.steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveTourState(currentTourId, newStep, true);
    } else {
      // Tour complete
      const newCompletedTours = [...completedTours, currentTourId];
      setCompletedTours(newCompletedTours);
      setIsActive(false);
      
      saveTourState(null, 1, false);
      
      if (onTourComplete) {
        onTourComplete(currentTourId);
      }
    }
  }, [currentTour, currentStep, currentTourId, completedTours, saveTourState, onTourComplete]);
  
  // Move to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveTourState(currentTourId, newStep, true);
    }
  }, [currentStep, currentTourId, saveTourState]);
  
  // Close the tour
  const closeTour = useCallback(() => {
    setIsActive(false);
    saveTourState(null, 1, false);
  }, [saveTourState]);
  
  // Skip the tour
  const skipTour = useCallback(() => {
    setIsActive(false);
    saveTourState(null, 1, false);
    
    if (onTourSkip) {
      onTourSkip(currentTourId, currentStep);
    }
  }, [currentTourId, currentStep, saveTourState, onTourSkip]);
  
  // Open tour selector
  const openTourSelector = useCallback(() => {
    setShowTourSelector(true);
  }, []);
  
  // Update element position when step changes
  useEffect(() => {
    if (!isActive || !currentStepData) return;
    
    const updateTooltipPosition = () => {
      if (currentStepData.elementSelector) {
        const element = document.querySelector(currentStepData.elementSelector);
        if (element) {
          const elementPosition = calculateElementPosition(element);
          const position = calculateTooltipPosition(
            elementPosition,
            320,
            200
          );
          setTooltipPosition(position);
        } else {
          // Element not found, use default position
          setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        }
      } else {
        // No element to highlight, use default position
        setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      }
    };
    
    // Update position after a short delay to allow for DOM updates
    const timer = setTimeout(updateTooltipPosition, 100);
    
    return () => clearTimeout(timer);
  }, [isActive, currentStepData, currentStep]);
  
  // Auto start tour if specified
  useEffect(() => {
    if (activeTourId && !isActive && autoStart) {
      startTour(activeTourId);
    }
  }, [activeTourId, isActive, autoStart, startTour]);
  
  // Render the tour components when active
  if (isActive && currentTour && currentStepData) {
    return (
      <Portal>
        {/* Backdrop - only if requested in step config */}
        {currentStepData.overlay && (
          <Backdrop
            open={true}
            sx={{ 
              zIndex: 9997,
              bgcolor: 'rgba(0,0,0,0.7)' 
            }}
            onClick={currentStepData.clickThrough ? null : (e) => e.stopPropagation()}
          />
        )}
        
        {/* Spotlight on element */}
        {currentStepData.elementSelector && (
          <TourSpotlight
            elementSelector={currentStepData.elementSelector}
            visible={isActive}
            pulse={currentStepData.pulse}
          />
        )}
        
        {/* Tooltip with step information */}
        <Fade in={isActive}>
          <TourTooltip
            step={currentStep}
            totalSteps={currentTour.steps.length}
            title={currentTour.title}
            content={currentStepData.content}
            position={tooltipPosition}
            onNext={nextStep}
            onPrev={prevStep}
            onClose={closeTour}
            onSkip={skipTour}
          />
        </Fade>
      </Portal>
    );
  }
  
  // Tour selection dialog
  return (
    <TourSelectionDialog
      open={showTourSelector}
      onClose={() => setShowTourSelector(false)}
      tours={tours}
      onSelectTour={startTour}
    />
  );
};

GuidedTour.propTypes = {
  tours: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      steps: PropTypes.arrayOf(
        PropTypes.shape({
          elementSelector: PropTypes.string,
          title: PropTypes.string,
          content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
          overlay: PropTypes.bool,
          pulse: PropTypes.bool,
          clickThrough: PropTypes.bool
        })
      ).isRequired
    })
  ).isRequired,
  activeTourId: PropTypes.string,
  onTourComplete: PropTypes.func,
  onTourSkip: PropTypes.func,
  autoStart: PropTypes.bool
};

// Add custom CSS for animations
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
document.head.appendChild(styleEl);

export default GuidedTour;