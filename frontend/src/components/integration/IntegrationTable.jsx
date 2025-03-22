// IntegrationTable.jsx
// -----------------------------------------------------------------------------
// A table with columns for Name, Type, Source, Destination, Schedule, Status, and Actions

import React from 'react';
import IntegrationTableRow from './IntegrationTableRow';

function IntegrationTable({ integrations, onFieldMapping, onModify, onViewRunLog }) {
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

  return (
    <table style={tableStyle}>
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
        {integrations.map((intg) => (
          <IntegrationTableRow 
            key={intg.id} 
            integration={intg} 
            onFieldMapping={onFieldMapping}
            onModify={onModify}
            onViewRunLog={onViewRunLog}
          />
        ))}
      </tbody>
    </table>
  );
}

export default IntegrationTable;