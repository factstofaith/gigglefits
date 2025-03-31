/**
 * Integration Status Panel
 * 
 * Displays the current status of an integration.
 * 
 * @module components/integration/panels/IntegrationStatusPanel
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * IntegrationStatusPanel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.integration - Integration object
 * @returns {JSX.Element} Integration status panel
 */
const IntegrationStatusPanel = ({ integration }) => {
  const { theme } = useTheme();
  
  // Get status color based on status
  const statusColor = useMemo(() => {
    switch (integration.status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.grey[500];
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  }, [integration.status, theme.palette]);
  
  // Mock status metrics
  const metrics = useMemo(() => ({
    lastRun: new Date(Date.now() - 3600000).toLocaleString(),
    nextRun: new Date(Date.now() + 3600000).toLocaleString(),
    successRate: '98.5%',
    averageDuration: '45.3s',
    totalRuns: 128,
  }), []);
  
  // Memoize styles
  const styles = useMemo(() => ({
    container: {
      padding: '20px',
    },
    statusHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
    },
    statusIndicator: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: statusColor,
      marginRight: '8px',
    },
    statusText: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'capitalize',
      color: theme.palette.text.primary,
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginTop: '20px',
    },
    metricCard: {
      padding: '16px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      boxShadow: theme.shadows[1],
    },
    metricLabel: {
      fontSize: '14px',
      color: theme.palette.text.secondary,
      marginBottom: '8px',
    },
    metricValue: {
      fontSize: '18px',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  }), [statusColor, theme]);

  return (
    <div style={styles.container}>
      <div style={styles.statusHeader}>
        <div style={styles.statusIndicator}></div>
        <div style={styles.statusText}>{integration.status}</div>
      </div>
      
      <p>Current status information and metrics for this integration.</p>
      
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Last Run</div>
          <div style={styles.metricValue}>{metrics.lastRun}</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Next Scheduled Run</div>
          <div style={styles.metricValue}>{metrics.nextRun}</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Success Rate</div>
          <div style={styles.metricValue}>{metrics.successRate}</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Average Duration</div>
          <div style={styles.metricValue}>{metrics.averageDuration}</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Total Runs</div>
          <div style={styles.metricValue}>{metrics.totalRuns}</div>
        </div>
      </div>
    </div>
  );
};

IntegrationStatusPanel.propTypes = {
  /** Integration object */
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
  }).isRequired,
};

export default React.memo(IntegrationStatusPanel);