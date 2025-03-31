/**
 * Integration Action Panel
 * 
 * Provides actions for the integration like run, edit, delete.
 * 
 * @module components/integration/panels/IntegrationActionPanel
 */

import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useDialog } from '../../../contexts/DialogContext';
import { Button } from '../../common/Button';

/**
 * IntegrationActionPanel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.integration - Integration object
 * @param {Function} props.onRun - Run callback
 * @param {Function} props.onUpdate - Update callback
 * @param {Function} props.onDelete - Delete callback
 * @returns {JSX.Element} Integration action panel
 */
const IntegrationActionPanel = ({ integration, onRun, onUpdate, onDelete }) => {
  const { theme } = useTheme();
  const { openDialog } = useDialog();
  const [isRunning, setIsRunning] = useState(false);
  
  // Handle run click
  const handleRun = useCallback(async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    try {
      await onRun(integration.id);
      // Show success message
      openDialog('notification', {
        type: 'success',
        title: 'Integration Started',
        message: `${integration.name} has been started successfully.`,
      });
    } catch (error) {
      // Show error message
      openDialog('notification', {
        type: 'error',
        title: 'Integration Failed',
        message: `Failed to start ${integration.name}: ${error.message}`,
      });
    } finally {
      setIsRunning(false);
    }
  }, [integration, onRun, openDialog]);
  
  // Handle delete click
  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    
    // Show confirmation dialog
    openDialog('confirmation', {
      title: 'Delete Integration',
      message: `Are you sure you want to delete ${integration.name}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        onDelete(integration.id);
      },
    });
  }, [integration, onDelete, openDialog]);
  
  // Memoize styles
  const styles = useMemo(() => ({
    container: {
      padding: '20px',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px',
      color: theme.palette.text.primary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px',
    },
    card: {
      padding: '20px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      boxShadow: theme.shadows[1],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: '200px',
    },
    cardIcon: {
      fontSize: '40px',
      marginBottom: '16px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    cardDescription: {
      fontSize: '14px',
      color: theme.palette.text.secondary,
      marginBottom: '16px',
    },
    dangerSection: {
      padding: '20px',
      borderRadius: '4px',
      border: `1px solid ${theme.palette.error.main}`,
      backgroundColor: `${theme.palette.error.main}10`,
    },
    dangerTitle: {
      color: theme.palette.error.main,
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    dangerDescription: {
      marginBottom: '16px',
      color: theme.palette.text.secondary,
    },
  }), [theme]);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Common Actions</h3>
        
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🔄</div>
            <div style={styles.cardTitle}>Run Integration</div>
            <div style={styles.cardDescription}>
              Execute this integration immediately regardless of schedule.
            </div>
            <Button onClick={handleRun} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Now'}
            </Button>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardIcon}>✏️</div>
            <div style={styles.cardTitle}>Edit Integration</div>
            <div style={styles.cardDescription}>
              Modify the configuration or settings for this integration.
            </div>
            <Button onClick={() => onUpdate?.(integration)}>
              Edit
            </Button>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardIcon}>📄</div>
            <div style={styles.cardTitle}>View Logs</div>
            <div style={styles.cardDescription}>
              View detailed logs for recent executions.
            </div>
            <Button>
              View Logs
            </Button>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardIcon}>📈</div>
            <div style={styles.cardTitle}>View Analytics</div>
            <div style={styles.cardDescription}>
              See performance analytics and metrics.
            </div>
            <Button>
              Analytics
            </Button>
          </div>
        </div>
      </div>
      
      <div style={styles.section}>
        <div style={styles.dangerSection}>
          <h3 style={styles.dangerTitle}>Danger Zone</h3>
          <p style={styles.dangerDescription}>
            The following actions are destructive and cannot be undone. Please proceed with caution.
          </p>
          
          <Button variant="danger" onClick={handleDelete}>
            Delete Integration
          </Button>
        </div>
      </div>
    </div>
  );
};

IntegrationActionPanel.propTypes = {
  /** Integration object */
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  
  /** Run callback */
  onRun: PropTypes.func,
  
  /** Update callback */
  onUpdate: PropTypes.func,
  
  /** Delete callback */
  onDelete: PropTypes.func,
};

export default React.memo(IntegrationActionPanel);