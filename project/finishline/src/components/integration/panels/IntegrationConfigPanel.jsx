/**
 * Integration Configuration Panel
 * 
 * Displays and allows editing of integration configuration.
 * 
 * @module components/integration/panels/IntegrationConfigPanel
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * IntegrationConfigPanel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.integration - Integration object
 * @returns {JSX.Element} Integration configuration panel
 */
const IntegrationConfigPanel = ({ integration }) => {
  const { theme } = useTheme();
  
  // Prepare configuration entries for display
  const configEntries = useMemo(() => {
    if (!integration.config) return [];
    
    return Object.entries(integration.config).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      isSecret: key.toLowerCase().includes('key') || 
               key.toLowerCase().includes('token') || 
               key.toLowerCase().includes('password'),
    }));
  }, [integration.config]);
  
  // Memoize styles
  const styles = useMemo(() => ({
    container: {
      padding: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px',
      color: theme.palette.text.primary,
    },
    configTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
    },
    tableHeader: {
      textAlign: 'left',
      padding: '8px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
      fontSize: '14px',
      fontWeight: 500,
    },
    tableCell: {
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      fontSize: '14px',
    },
    keyCell: {
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    secretValue: {
      fontFamily: 'monospace',
      color: theme.palette.text.disabled,
    },
    badge: {
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: theme.palette.primary.main + '20',
      color: theme.palette.primary.main,
      marginLeft: '8px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: theme.palette.text.secondary,
    },
  }), [theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Configuration</h3>
      
      {configEntries.length > 0 ? (
        <table style={styles.configTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Value</th>
            </tr>
          </thead>
          <tbody>
            {configEntries.map((entry) => (
              <tr key={entry.key}>
                <td style={{ ...styles.tableCell, ...styles.keyCell }}>
                  {entry.key}
                  {entry.isSecret && (
                    <span style={styles.badge}>Secret</span>
                  )}
                </td>
                <td style={styles.tableCell}>
                  {entry.isSecret ? (
                    <span style={styles.secretValue}>••••••••••••</span>
                  ) : (
                    entry.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.emptyState}>
          No configuration settings available.
        </div>
      )}
      
      <h3 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Type</h3>
      <p>{integration.type}</p>
      
      {integration.schedule && (
        <>
          <h3 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Schedule</h3>
          <p>{integration.schedule}</p>
        </>
      )}
    </div>
  );
};

IntegrationConfigPanel.propTypes = {
  /** Integration object */
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    config: PropTypes.object,
    schedule: PropTypes.string,
  }).isRequired,
};

export default React.memo(IntegrationConfigPanel);