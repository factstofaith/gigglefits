/**
 * Help Context
 * 
 * A context provider for managing context-sensitive help and guided tours across the application.
 * Centralizes help content, tour definitions, and user help preferences.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

// Initial help content organized by feature area
const initialHelpContent = {
  // Integration section help items
  integration: {
    creation: {
      title: 'Integration Creation',
      content: 'Create a new integration by specifying its name, description, and type. An integration defines how data moves between systems.'
    },
    configuration: {
      title: 'Configuration',
      content: 'Configure your integration with source/destination details, transformation rules, and scheduling options.'
    },
    schedule: {
      title: 'Scheduling',
      content: 'Set up when your integration should run automatically. Supports one-time, recurring, and event-based schedules.'
    },
    azureBlob: {
      title: 'Azure Blob Storage',
      content: 'Connect to Azure Blob Storage to use it as a source or destination for your integration data.'
    },
    fieldMapping: {
      title: 'Field Mapping',
      content: 'Map fields from your source data to your destination schema, with optional transformations.'
    }
  },
  
  // Transformation help items
  transformation: {
    dataType: {
      title: 'Data Type Conversion',
      content: 'Convert data between different types such as string, number, boolean, date, etc.'
    },
    textFormat: {
      title: 'Text Formatting',
      content: 'Apply text formatting operations like case conversion, trimming, concatenation, etc.'
    },
    formulas: {
      title: 'Custom Formulas',
      content: 'Create custom formulas to transform your data using expressions with various functions and operators.'
    }
  },
  
  // Admin section help items
  admin: {
    users: {
      title: 'User Management',
      content: 'Manage user accounts, roles, and permissions for accessing different parts of the platform.'
    },
    monitoring: {
      title: 'Monitoring Dashboard',
      content: 'View the status and performance metrics of your integrations, including success rates, execution times, and error logs.'
    }
  },
  
  // General help items
  general: {
    navigation: {
      title: 'Navigation',
      content: 'Use the navigation menu to access different areas of the platform including integrations, datasets, templates, and admin features.'
    },
    settings: {
      title: 'Settings',
      content: 'Configure your user preferences, notifications, and account settings.'
    }
  }
};

// Initial tour definitions
const initialTours = [
  {
    id: 'integration-basics',
    title: 'Integration Basics',
    description: 'Learn the fundamentals of creating and managing integrations',
    duration: '2',
    steps: [
      {
        content: 'Welcome to the Integration Platform! This tour will guide you through the basics of creating and managing integrations.',
        overlay: true,
        pulse: false
      },
      {
        elementSelector: '.integration-list',
        content: 'This is the integration list where you can see all your existing integrations and their status.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.create-integration-button',
        content: 'Click here to create a new integration. This will open a dialog where you can define the basic properties of your integration.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.integration-filters',
        content: 'Use these filters to quickly find specific integrations by status, type, or other properties.',
        overlay: true,
        pulse: true
      },
      {
        content: 'That\'s the basics of working with integrations! You can now explore more features or take other guided tours to learn more.',
        overlay: true,
        pulse: false
      }
    ]
  },
  {
    id: 'data-transformation',
    title: 'Data Transformation Tour',
    description: 'Learn how to transform and map data between systems',
    duration: '3',
    steps: [
      {
        content: 'This tour will show you how to transform data between different systems using our transformation nodes.',
        overlay: true,
        pulse: false
      },
      {
        elementSelector: '.transformation-nodes',
        content: 'These are transformation nodes that you can add to your integration flow to modify data as it passes through.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.node-palette',
        content: 'The node palette contains all available transformation types. You can drag and drop them onto your integration flow.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.field-mapping',
        content: 'The field mapping interface allows you to connect source fields to destination fields, with transformations in between.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.formula-editor',
        content: 'The formula editor lets you create custom transformations using expressions with various functions and operators.',
        overlay: true,
        pulse: true
      },
      {
        content: 'Now you know how to transform data in your integrations! You can create complex transformations by combining multiple nodes.',
        overlay: true,
        pulse: false
      }
    ]
  },
  {
    id: 'scheduling',
    title: 'Integration Scheduling',
    description: 'Learn how to schedule integrations to run automatically',
    duration: '2',
    steps: [
      {
        content: 'This tour will show you how to schedule your integrations to run automatically at specific times or on specific events.',
        overlay: true,
        pulse: false
      },
      {
        elementSelector: '.schedule-configuration',
        content: 'The scheduling tab lets you configure when your integration should run. You can choose from various schedule types.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.schedule-options',
        content: 'Choose from options like on-demand, recurring, or event-based schedules. Each has different configuration options.',
        overlay: true,
        pulse: true
      },
      {
        elementSelector: '.cron-builder',
        content: 'For advanced scheduling, you can use the cron expression builder to create complex schedules with precise timing.',
        overlay: true,
        pulse: true
      },
      {
        content: 'Now you know how to schedule your integrations to run automatically! You can monitor execution results in the history tab.',
        overlay: true,
        pulse: false
      }
    ]
  }
];

// Create the context
const HelpContext = createContext();

/**
 * Hook to use the help context
 * @returns {Object} Help context values and functions
 */
export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

/**
 * Help provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Help provider component
 */
export const HelpProvider = ({ children }) => {
  // State for help content and tours
  const [helpContent, setHelpContent] = useState(initialHelpContent);
  const [tours, setTours] = useState(initialTours);
  const [activeTourId, setActiveTourId] = useState(null);
  const [helpPreferences, setHelpPreferences] = useState({
    showHelp: true,
    showTours: true,
    completedTours: []
  });
  
  // Load help preferences from localStorage
  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem('tap_help_preferences');
      if (storedPreferences) {
        setHelpPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error('Error loading help preferences:', error);
    }
  }, []);
  
  // Save help preferences to localStorage
  const saveHelpPreferences = useCallback((newPreferences) => {
    try {
      localStorage.setItem('tap_help_preferences', JSON.stringify(newPreferences));
      setHelpPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving help preferences:', error);
    }
  }, []);
  
  // Toggle help visibility
  const toggleHelpVisibility = useCallback(() => {
    const newPreferences = {
      ...helpPreferences,
      showHelp: !helpPreferences.showHelp
    };
    saveHelpPreferences(newPreferences);
  }, [helpPreferences, saveHelpPreferences]);
  
  // Toggle tours visibility
  const toggleToursVisibility = useCallback(() => {
    const newPreferences = {
      ...helpPreferences,
      showTours: !helpPreferences.showTours
    };
    saveHelpPreferences(newPreferences);
  }, [helpPreferences, saveHelpPreferences]);
  
  // Start a tour
  const startTour = useCallback((tourId) => {
    if (tours.find(tour => tour.id === tourId)) {
      setActiveTourId(tourId);
    }
  }, [tours]);
  
  // Handle tour completion
  const handleTourComplete = useCallback((tourId) => {
    const newCompletedTours = [...helpPreferences.completedTours, tourId];
    const newPreferences = {
      ...helpPreferences,
      completedTours: newCompletedTours
    };
    saveHelpPreferences(newPreferences);
    setActiveTourId(null);
  }, [helpPreferences, saveHelpPreferences]);
  
  // Get help content for a specific key
  const getHelpContent = useCallback((section, key) => {
    if (helpContent[section] && helpContent[section][key]) {
      return helpContent[section][key];
    }
    return null;
  }, [helpContent]);
  
  // Add custom help content
  const addHelpContent = useCallback((section, key, content) => {
    setHelpContent(prevContent => ({
      ...prevContent,
      [section]: {
        ...(prevContent[section] || {}),
        [key]: content
      }
    }));
  }, []);
  
  // Add a new tour
  const addTour = useCallback((tour) => {
    if (!tour.id || !tour.title || !tour.steps || !Array.isArray(tour.steps)) {
      throw new Error('Invalid tour configuration');
    }
    
    setTours(prevTours => {
      const existingIndex = prevTours.findIndex(t => t.id === tour.id);
      if (existingIndex >= 0) {
        // Replace existing tour
        const newTours = [...prevTours];
        newTours[existingIndex] = tour;
        return newTours;
      } else {
        // Add new tour
        return [...prevTours, tour];
      }
    });
  }, []);
  
  // Reset tour completion status
  const resetTourCompletion = useCallback(() => {
    const newPreferences = {
      ...helpPreferences,
      completedTours: []
    };
    saveHelpPreferences(newPreferences);
  }, [helpPreferences, saveHelpPreferences]);
  
  // Provide the context value
  const contextValue = {
    helpContent,
    tours,
    activeTourId,
    helpPreferences,
    getHelpContent,
    addHelpContent,
    addTour,
    startTour,
    toggleHelpVisibility,
    toggleToursVisibility,
    resetTourCompletion,
    handleTourComplete
  };
  
  return (
    <HelpContext.Provider value={contextValue}>
      {children}
    </HelpContext.Provider>
  );
};

HelpProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default HelpContext;