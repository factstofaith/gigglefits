// IntegrationTableRow.jsx
// -----------------------------------------------------------------------------
// A single row in the table of integrations

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import IntegrationHealthBar from '../common/IntegrationHealthBar';

function IntegrationTableRow({ integration, onFieldMapping, onModify, onViewRunLog }) {
  const navigate = useNavigate();
  
  const {
    id,
    name,
    type,
    source,
    destination,
    schedule,
    health
  } = integration;
  
  const handleRowClick = () => {
    navigate(`/integrations/${id}`);
  };

  const handleFieldMapping = () => {
    onFieldMapping(id);
  };
  
  const handleModify = () => {
    onModify(id);
  };
  
  const handleViewRunLog = () => {
    onViewRunLog(id);
  };

  const cellStyle = {
    border: '1px solid #E0E0E0',
    padding: '0.75rem',
    color: '#3B3D3D'
  };
  
  const rowStyle = {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f5f5f5'
    }
  };

  return (
    <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
      <td style={cellStyle}>{name}</td>
      <td style={cellStyle}>{type}</td>
      <td style={cellStyle}>{source}</td>
      <td style={cellStyle}>{destination}</td>
      <td style={cellStyle}>{schedule || 'On demand'}</td>
      <td style={cellStyle}><IntegrationHealthBar health={health} /></td>
      <td style={{ ...cellStyle, cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
        <Button 
          style={{ backgroundColor: '#48C2C5', marginRight: '0.3rem' }}
          onClick={handleFieldMapping}
        >
          Field Mapping
        </Button>
        <Button 
          style={{ backgroundColor: '#FC741C', marginRight: '0.3rem' }}
          onClick={handleModify}
        >
          Modify
        </Button>
        <Button 
          style={{ backgroundColor: '#FFAA3B' }}
          onClick={handleViewRunLog}
        >
          View Run Log
        </Button>
      </td>
    </tr>
  );
}

export default IntegrationTableRow;