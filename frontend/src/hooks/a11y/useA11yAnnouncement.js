/**
 * Accessibility Announcement Hook
 * 
 * A custom hook for managing accessibility announcements for screen readers.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module hooks/a11y/useA11yAnnouncement
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Enum for announcement politeness levels
 */
export const PolitenessLevel = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive'
};

/**
 * Custom hook for managing screen reader announcements
 * 
 * @param {Object} options - Configuration options
 * @param {number} [options.maxQueue=10] - Maximum queue size
 * @param {boolean} [options.clearOnUnmount=true] - Whether to clear announcements on unmount
 * @returns {Object} Object containing announcement functions and state
 */
const useA11yAnnouncement = ({
  maxQueue = 10,
  clearOnUnmount = true
} = {}) => {
  // Store announcements in a queue
  const [announcements, setAnnouncements] = useState([]);
  
  // Track whether the component is mounted
  const isMounted = useRef(true);

  // Store announcement elements for direct access
  const politeAnnouncementRef = useRef(null);
  const assertiveAnnouncementRef = useRef(null);

  /**
   * Create a unique ID for announcement elements
   */
  const getUniqueId = useCallback(() => {
    return `announcement-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  /**
   * Generate the announcement element IDs if not already set
   */
  const politeAnnouncementId = useRef(getUniqueId());
  const assertiveAnnouncementId = useRef(getUniqueId());

  /**
   * Add an announcement to the queue
   */
  const announce = useCallback((message, politeness = PolitenessLevel.POLITE) => {
    if (!message || typeof message !== 'string') return;

    setAnnouncements(prev => {
      // Add new announcement to the queue
      const newQueue = [
        ...prev,
        {
          id: getUniqueId(),
          message,
          politeness,
          timestamp: new Date().getTime()
        }
      ];

      // Limit queue size
      return newQueue.slice(-maxQueue);
    });
  }, [maxQueue, getUniqueId]);

  /**
   * Convenience method for polite announcements
   */
  const announcePolite = useCallback((message) => {
    announce(message, PolitenessLevel.POLITE);
  }, [announce]);

  /**
   * Convenience method for assertive announcements
   */
  const announceAssertive = useCallback((message) => {
    announce(message, PolitenessLevel.ASSERTIVE);
  }, [announce]);

  /**
   * Process the announcement queue
   */
  useEffect(() => {
    if (announcements.length === 0) return;

    // Get the latest announcement
    const latestAnnouncement = announcements[announcements.length - 1];
    
    // Find the appropriate element
    const element = latestAnnouncement.politeness === PolitenessLevel.ASSERTIVE
      ? assertiveAnnouncementRef.current
      : politeAnnouncementRef.current;
    
    // Update the announcement text
    if (element) {
      // Clear first, then set (required for some screen readers)
      element.textContent = '';

      // Use a timeout to ensure screen readers recognize the change
      setTimeout(() => {
        if (isMounted.current && element) {
          element.textContent = latestAnnouncement.message;
        }
      }, 50);
    }
  }, [announcements]);

  /**
   * Create the announcement elements if they don't exist
   */
  useEffect(() => {
    // Create elements if they don't exist
    if (!politeAnnouncementRef.current) {
      const politeElement = document.getElementById(politeAnnouncementId.current);
      
      if (politeElement) {
        politeAnnouncementRef.current = politeElement;
      } else {
        const newElement = document.createElement('div');
        newElement.id = politeAnnouncementId.current;
        newElement.className = 'sr-only';
        newElement.setAttribute('aria-live', 'polite');
        newElement.setAttribute('aria-atomic', 'true');
        document.body.appendChild(newElement);
        politeAnnouncementRef.current = newElement;
      }
    }
    
    if (!assertiveAnnouncementRef.current) {
      const assertiveElement = document.getElementById(assertiveAnnouncementId.current);
      
      if (assertiveElement) {
        assertiveAnnouncementRef.current = assertiveElement;
      } else {
        const newElement = document.createElement('div');
        newElement.id = assertiveAnnouncementId.current;
        newElement.className = 'sr-only';
        newElement.setAttribute('aria-live', 'assertive');
        newElement.setAttribute('aria-atomic', 'true');
        document.body.appendChild(newElement);
        assertiveAnnouncementRef.current = newElement;
      }
    }
    
    return () => {
      isMounted.current = false;
      
      // Clean up announcement elements if clearOnUnmount is true
      if (clearOnUnmount) {
        if (politeAnnouncementRef.current) {
          politeAnnouncementRef.current.textContent = '';
        }
        
        if (assertiveAnnouncementRef.current) {
          assertiveAnnouncementRef.current.textContent = '';
        }
      }
    };
  }, [clearOnUnmount, politeAnnouncementId, assertiveAnnouncementId]);

  /**
   * Clear all announcements
   */
  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
    
    if (politeAnnouncementRef.current) {
      politeAnnouncementRef.current.textContent = '';
    }
    
    if (assertiveAnnouncementRef.current) {
      assertiveAnnouncementRef.current.textContent = '';
    }
  }, []);

  return {
    announce,
    announcePolite,
    announceAssertive,
    clearAnnouncements,
    announcements,
    politeAnnouncementId: politeAnnouncementId.current,
    assertiveAnnouncementId: assertiveAnnouncementId.current
  };
};

export default useA11yAnnouncement;