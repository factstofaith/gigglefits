// IntegrationTable.jsx
// -----------------------------------------------------------------------------
// A table with columns for Name, Type, Source, Destination, Schedule, Status, and Actions

import React, { useState } from 'react';
import { Alert, CircularProgress, Box, Typography, Button } from '@mui/material';
import IntegrationTableRow from './IntegrationTableRow';
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
function IntegrationTable({
  integrations,
  onFieldMapping,
  onModify,
  onViewRunLog
}) {
  // Error handling
  const {
    error,
    handleError,
    clearError
  } = useErrorHandler('IntegrationTable');
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '1.5rem'
  };
  const headerStyle = {
    backgroundColor: '#F1F1F1'
  };
  const cellStyle = {
    border: '1px solid #E0E0E0',
    padding: '0.75rem',
    color: '#3B3D3D'
  };

  // Show error state if there's an error
  if (error) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={clearError}>
            Retry
          </Button>} sx={{
      mb: 2
    }}>

        <Typography variant="subtitle1" fontWeight="medium">
          Failed to load integrations
        </Typography>
        <Typography variant="body2">
          {error.message || 'An error occurred while loading integration data'}
        </Typography>
      </Alert>;
  }

  // Show empty state if no integrations
  if (!integrations || integrations.length === 0) {
    return <Box sx={{
      textAlign: 'center',
      py: 4,
      bgcolor: '#f5f5f5',
      borderRadius: 1
    }}>
        <Typography variant="body1" color="text.secondary">
          No integrations found
        </Typography>
      </Box>;
  }
  return <table style={tableStyle}>
      <thead style={headerStyle}>
        <tr>
          <th style={cellStyle}>Name</th>
          <th style={cellStyle}>Type</th>
          <th style={cellStyle}>Source</th>
          <th style={cellStyle}>Destination</th>
          <th style={cellStyle}>Schedule</th>
          <th style={cellStyle}>Status</th>
          <th style={cellStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {integrations.map(intg => {
        try {
          return <IntegrationTableRow key={intg.id} integration={intg} onFieldMapping={onFieldMapping} onModify={onModify} onViewRunLog={onViewRunLog} />;
        } catch (err) {
          handleError(err, {
            integrationId: intg.id,
            context: 'renderRow'
          });
          return <tr key={intg.id || 'error-row'}>
                <td colSpan={7} style={{
              ...cellStyle,
              color: '#e53935',
              textAlign: 'center'
            }}>
                  Failed to render this integration row
                </td>
              </tr>;
        }
      })}
      </tbody>
    </table>;
}
export default withErrorBoundary(IntegrationTable, {
  boundary: 'IntegrationTable',
  fallback: ({
    error,
    resetError
  }) => <Box sx={{
    width: '100%',
    p: 2,
    border: '1px solid #e0e0e0',
    borderRadius: 1
  }}>
      <Typography variant="h6" color="error" gutterBottom>
        Integration Table Error
      </Typography>
      <Typography variant="body2" paragraph>
        {error?.message || 'Failed to load the integration table. Please try again.'}
      </Typography>
      <Button variant="contained" color="primary" size="small" onClick={resetError}>

        Reload Table
      </Button>
    </Box>
});