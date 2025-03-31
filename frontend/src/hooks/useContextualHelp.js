/**
 * Contextual Help Hook
 * 
 * A custom hook for working with contextual help and guided tours.
 * Provides an easy-to-use interface for implementing help features across components.
 */

import { useCallback } from 'react';
import { useHelp } from '../contexts/HelpContext';

/**
 * Custom hook for implementing contextual help and guided tours
 * 
 * @param {string} section - The section identifier (e.g., 'integration', 'transformation')
 * @returns {Object} Helper functions and data for implementing contextual help
 */
const useContextualHelp = (section) => {
  const {
    helpContent,
    tours,
    startTour,
    addHelpContent,
    getHelpContent,
    helpPreferences,
    handleTourComplete,
  } = useHelp();

  /**
   * Get help content for a specific feature in this section
   * 
   * @param {string} key - The key for the specific feature
   * @returns {Object|null} The help content or null if not found
   */
  const getHelp = useCallback(
    (key) => getHelpContent(section, key),
    [section, getHelpContent]
  );

  /**
   * Add new help content for this section
   * 
   * @param {string} key - The key for the specific feature
   * @param {Object} content - The help content to add
   */
  const addHelp = useCallback(
    (key, content) => addHelpContent(section, key, content),
    [section, addHelpContent]
  );
  
  /**
   * Check if help is enabled
   * 
   * @returns {boolean} Whether help is enabled
   */
  const isHelpEnabled = helpPreferences.showHelp;
  
  /**
   * Get all tours related to this section
   * 
   * @returns {Array} Tours related to this section
   */
  const getSectionTours = useCallback(
    () => tours.filter(tour => tour.id.startsWith(`${section}-`)),
    [section, tours]
  );
  
  /**
   * Start a tour specific to this section
   * 
   * @param {string} tourId - The ID of the tour to start
   */
  const startSectionTour = useCallback(
    (tourId) => {
      const fullTourId = tourId.includes('-') ? tourId : `${section}-${tourId}`;
      startTour(fullTourId);
    },
    [section, startTour]
  );
  
  /**
   * Check if a tour has been completed
   * 
   * @param {string} tourId - The ID of the tour to check
   * @returns {boolean} Whether the tour has been completed
   */
  const isTourCompleted = useCallback(
    (tourId) => {
      const fullTourId = tourId.includes('-') ? tourId : `${section}-${tourId}`;
      return helpPreferences.completedTours.includes(fullTourId);
    },
    [section, helpPreferences.completedTours]
  );

  return {
    getHelp,
    addHelp,
    isHelpEnabled,
    tours,
    getSectionTours,
    startTour: startSectionTour,
    isTourCompleted,
    completeTour: handleTourComplete,
  };
};

export default useContextualHelp;