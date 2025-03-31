/**
 * Integration History Panel
 * 
 * Displays the execution history of an integration.
 * 
 * @module components/integration/panels/IntegrationHistoryPanel
 */

import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * IntegrationHistoryPanel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.integration - Integration object
 * @returns {JSX.Element} Integration history panel
 */
const IntegrationHistoryPanel = ({ integration }) => {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState(null);
  
  // Mock history data
  const historyData = useMemo(() => [
    {
      id: '1',
      startTime: new Date(Date.now() - 36000000).toLocaleString(),
      endTime: new Date(Date.now() - 35955000).toLocaleString(),
      status: 'success',
      duration: '45s',
      records: 128,
      trigger: 'scheduled',
      logs: ['Started execution', 'Connected to data source', 'Processed 128 records', 'Completed successfully'],
    },
    {
      id: '2',
      startTime: new Date(Date.now() - 72000000).toLocaleString(),
      endTime: new Date(Date.now() - 71950000).toLocaleString(),
      status: 'success',
      duration: '50s',
      records: 135,
      trigger: 'scheduled',
      logs: ['Started execution', 'Connected to data source', 'Processed 135 records', 'Completed successfully'],
    },
    {
      id: '3',
      startTime: new Date(Date.now() - 108000000).toLocaleString(),
      endTime: new Date(Date.now() - 107950000).toLocaleString(),
      status: 'error',
      duration: '50s',
      records: 0,
      trigger: 'scheduled',
      logs: ['Started execution', 'Error connecting to data source: Connection timeout', 'Execution failed'],
      error: 'Connection timeout',
    },
    {
      id: '4',
      startTime: new Date(Date.now() - 144000000).toLocaleString(),
      endTime: new Date(Date.now() - 143950000).toLocaleString(),
      status: 'success',
      duration: '50s',
      records: 142,
      trigger: 'manual',
      logs: ['Started execution', 'Connected to data source', 'Processed 142 records', 'Completed successfully'],
    },
    {
      id: '5',
      startTime: new Date(Date.now() - 180000000).toLocaleString(),
      endTime: new Date(Date.now() - 179940000).toLocaleString(),
      status: 'success',
      duration: '60s',
      records: 156,
      trigger: 'scheduled',
      logs: ['Started execution', 'Connected to data source', 'Processed 156 records', 'Completed successfully'],
    },
  ], []);
  
  // Get selected execution
  const selectedExecution = useMemo(() => {
    if (!selectedId) return historyData[0]; // Default to first
    return historyData.find(entry => entry.id === selectedId) || historyData[0];
  }, [selectedId, historyData]);
  
  // Handle row click
  const handleRowClick = useCallback((id) => {
    setSelectedId(id);
  }, []);
  
  // Get status color
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'running':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  }, [theme.palette]);
  
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
    historyTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '24px',
    },
    tableHeader: {
      textAlign: 'left',
      padding: '8px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
      fontSize: '14px',
      fontWeight: 500,
    },
    tableRow: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    selectedRow: {
      backgroundColor: `${theme.palette.primary.main}10`,
    },
    tableCell: {
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      fontSize: '14px',
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
    },
    statusDot: (status) => ({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: getStatusColor(status),
      marginRight: '8px',
    }),
    statusText: {
      textTransform: 'capitalize',
    },
    detailsPanel: {
      padding: '16px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      boxShadow: theme.shadows[1],
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    detailItem: {
      marginBottom: '8px',
    },
    detailLabel: {
      fontSize: '14px',
      color: theme.palette.text.secondary,
      marginBottom: '4px',
    },
    detailValue: {
      fontSize: '16px',
      fontWeight: 500,
    },
    logsContainer: {
      marginTop: '16px',
      backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
      padding: '12px',
      borderRadius: '4px',
      maxHeight: '200px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '14px',
    },
    logEntry: {
      margin: '4px 0',
      whiteSpace: 'pre-wrap',
    },
    errorMessage: {
      color: theme.palette.error.main,
      fontWeight: 500,
    },
  }), [theme, getStatusColor]);

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Execution History</h3>
      
      <table style={styles.historyTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Start Time</th>
            <th style={styles.tableHeader}>Duration</th>
            <th style={styles.tableHeader}>Records</th>
            <th style={styles.tableHeader}>Trigger</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map((entry) => (
            <tr 
              key={entry.id}
              onClick={() => handleRowClick(entry.id)}
              style={{
                ...styles.tableRow,
                ...(selectedExecution.id === entry.id ? styles.selectedRow : {}),
              }}
            >
              <td style={styles.tableCell}>
                <div style={styles.statusIndicator}>
                  <div style={styles.statusDot(entry.status)}></div>
                  <span style={styles.statusText}>{entry.status}</span>
                </div>
              </td>
              <td style={styles.tableCell}>{entry.startTime}</td>
              <td style={styles.tableCell}>{entry.duration}</td>
              <td style={styles.tableCell}>{entry.records}</td>
              <td style={styles.tableCell}>{entry.trigger}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selectedExecution && (
        <div style={styles.detailsPanel}>
          <h3 style={styles.sectionTitle}>Execution Details</h3>
          
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Start Time</div>
              <div style={styles.detailValue}>{selectedExecution.startTime}</div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>End Time</div>
              <div style={styles.detailValue}>{selectedExecution.endTime}</div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Duration</div>
              <div style={styles.detailValue}>{selectedExecution.duration}</div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Status</div>
              <div style={styles.detailValue}>
                <div style={styles.statusIndicator}>
                  <div style={styles.statusDot(selectedExecution.status)}></div>
                  <span style={styles.statusText}>{selectedExecution.status}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Records Processed</div>
              <div style={styles.detailValue}>{selectedExecution.records}</div>
            </div>
            
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Trigger</div>
              <div style={styles.detailValue}>{selectedExecution.trigger}</div>
            </div>
          </div>
          
          {selectedExecution.error && (
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Error</div>
              <div style={{...styles.detailValue, ...styles.errorMessage}}>
                {selectedExecution.error}
              </div>
            </div>
          )}
          
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Logs</div>
            <div style={styles.logsContainer}>
              {selectedExecution.logs.map((log, index) => (
                <div key={index} style={styles.logEntry}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

IntegrationHistoryPanel.propTypes = {
  /** Integration object */
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default React.memo(IntegrationHistoryPanel);