import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Handle } from '@utils/reactFlowAdapter';
import {MuiBox as MuiBox} from '@design-system/legacy';
import MuiBox from '@mui/material/Box';

/**
 * A simplified node representation for performance optimization
 * 
 * This component renders a minimal version of a node when it's outside
 * the viewport or when detailed rendering is not needed. It preserves
 * the node's connection points while using minimal resources.
 */
const SimplifiedNode = ({ id, data, selected }) => {
  // Added display name
  SimplifiedNode.displayName = 'SimplifiedNode';

  // Added display name
  SimplifiedNode.displayName = 'SimplifiedNode';

  // Added display name
  SimplifiedNode.displayName = 'SimplifiedNode';

  // Added display name
  SimplifiedNode.displayName = 'SimplifiedNode';

  // Added display name
  SimplifiedNode.displayName = 'SimplifiedNode';


  // Determine styling based on node type
  const getNodeColor = () => {
  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';


    const type = data?.type || '';
    
    if (type.includes('source')) return '#91c5ff';
    if (type.includes('transform')) return '#a5d6a7';
    if (type.includes('destination')) return '#ffcc80';
    if (type.includes('router')) return '#ce93d8';
    if (type.includes('trigger')) return '#ef9a9a';
    if (type.includes('action')) return '#b39ddb';
    if (type.includes('dataset')) return '#80deea';
    if (type.includes('application')) return '#fff59d';
    
    return '#e0e0e0';
  };
  
  return (
    <MuiBox
      sx={{
        width: '100%',
        height: '100%',
        minWidth: '30px',
        minHeight: '15px',
        maxWidth: '50px',
        maxHeight: '30px',
        background: getNodeColor(),
        border: `1px solid ${selected ? '#1976d2' : '#999'}`,
        borderRadius: '3px',
        opacity: 0.7,
        transition: 'opacity 0.3s',
        '&:hover': {
          opacity: 1
        }
      }}
    >
      {/* Source handle */}
      <Handle
        type="source&quot;
        position="right"
        style={{ 
          width: '6px', 
          height: '6px', 
          background: '#555',
          visibility: data?.hideHandles ? 'hidden' : 'visible'
        }}
      />
      
      {/* Target handle */}
      <Handle
        type="target&quot;
        position="left"
        style={{ 
          width: '6px', 
          height: '6px', 
          background: '#555',
          visibility: data?.hideHandles ? 'hidden' : 'visible'
        }}
      />
    </MuiBox>
  );
};

SimplifiedNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object,
  selected: PropTypes.bool
};

SimplifiedNode.displayName = 'SimplifiedNode';

// Use memo for preventing unnecessary re-renders
export default memo(SimplifiedNode);