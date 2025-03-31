/**
 * Application Footer
 * 
 * Footer component with links and copyright information.
 * 
 * @module components/layout/Footer
 */

import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Footer Component
 * 
 * @returns {JSX.Element} Application footer
 */
const Footer = () => {
  const { theme } = useTheme();
  
  // Memoize styles to prevent recreation on each render
  const styles = useMemo(() => ({
    footer: {
      padding: '16px 24px',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      borderTop: `1px solid ${theme.palette.divider}`,
      marginLeft: '240px', // Match sidebar width
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    copyright: {
      fontSize: '0.875rem',
    },
    links: {
      display: 'flex',
      gap: '24px',
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      fontSize: '0.875rem',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  }), [theme]);

  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div style={styles.copyright}>
          © 2025 TAP Integration Platform. All rights reserved.
        </div>
        
        <div style={styles.links}>
          <a href="#terms" style={styles.link}>Terms of Service</a>
          <a href="#privacy" style={styles.link}>Privacy Policy</a>
          <a href="#help" style={styles.link}>Help & Support</a>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);