import { useEffect, useState } from 'react';

/**
 * Hook for checking if a media query matches
 * @param {string} query - Media query to check
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = query => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = event => {
      setMatches(event.matches);
    };

    // Modern API
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
