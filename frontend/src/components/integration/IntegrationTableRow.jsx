// IntegrationTableRow.jsx
// -----------------------------------------------------------------------------
// A single row in the table of integrations
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import IntegrationHealthBar from '../common/IntegrationHealthBar';
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
function IntegrationTableRow({
  integration,
  onFieldMapping,
  onModify,
  onViewRunLog
}) {
  const navigate = useNavigate();

  // Error handling
  const {
    error,
    handleError
  } = useErrorHandler('IntegrationTableRow');
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
    try {
      navigate(`/integrations/${id}`);
    } catch (err) {
      handleError(err, {
        action: 'rowClick',
        integrationId: id
      });
    }
  };
  const handleFieldMapping = () => {
    try {
      onFieldMapping(id);
    } catch (err) {
      handleError(err, {
        action: 'fieldMapping',
        integrationId: id
      });
    }
  };
  const handleModify = () => {
    try {
      onModify(id);
    } catch (err) {
      handleError(err, {
        action: 'modify',
        integrationId: id
      });
    }
  };
  const handleViewRunLog = () => {
    try {
      onViewRunLog(id);
    } catch (err) {
      handleError(err, {
        action: 'viewRunLog',
        integrationId: id
      });
    }
  };
  const cellStyle = {
    border: '1px solid #E0E0E0',
    padding: '0.75rem',
    color: '#3B3D3D'
  };

  // If there's an error in this row, show a simplified error row
  if (error) {
    return <tr>
        <td colSpan={7} style={{
        ...cellStyle,
        color: '#e53935',
        textAlign: 'center'
      }}>
          Error with integration: {name || id || 'Unknown'} - {error.message}
        </td>
      </tr>;
  }
  return <tr style={{
    cursor: 'pointer'
  }} onClick={handleRowClick}>
      <td style={cellStyle}>{name}</td>
      <td style={cellStyle}>{type}</td>
      <td style={cellStyle}>{source}</td>
      <td style={cellStyle}>{destination}</td>
      <td style={cellStyle}>{schedule || 'On demand'}</td>
      <td style={cellStyle}><IntegrationHealthBar health={health} /></td>
      <td style={{
      ...cellStyle,
      cursor: 'default'
    }} onClick={e => e.stopPropagation()}>
        <Button style={{
        backgroundColor: '#48C2C5',
        marginRight: '0.3rem'
      }} onClick={handleFieldMapping}>

          Field Mapping
        </Button>
        <Button style={{
        backgroundColor: '#FC741C',
        marginRight: '0.3rem'
      }} onClick={handleModify}>

          Modify
        </Button>
        <Button style={{
        backgroundColor: '#FFAA3B'
      }} onClick={handleViewRunLog}>

          View Run Log
        </Button>
      </td>
    </tr>;
}
export default withErrorBoundary(IntegrationTableRow, {
  boundary: 'IntegrationTableRow',
  fallback: ({
    error,
    resetError
  }) => <tr>
      <td colSpan={7} style={{
      padding: '0.75rem',
      color: '#e53935',
      textAlign: 'center',
      border: '1px solid #E0E0E0'
    }}>
        <div>
          <div style={{
          marginBottom: '0.5rem'
        }}>Error in integration row: {error?.message}</div>
          <button onClick={resetError} style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: '#48C2C5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>

            Retry
          </button>
        </div>
      </td>
    </tr>
});