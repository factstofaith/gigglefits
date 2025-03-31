/**
 * MiniMapNode.jsx
 * -----------------------------------------------------------------------------
 * Custom node renderer for the React Flow minimap component.
 * Provides specialized rendering for different node types to make them
 * easy to identify in the minimap view.
 */

import React, { memo } from 'react';

/**
 * Custom node renderer for the minimap
 * Makes different node types visually distinct in the minimap view
 * 
 * @param {Object} props - Node properties
 * @returns {React.ReactElement} Rendered minimap node
 */
const MiniMapNode = ({ style, ...props }) => {
  // Added display name
  MiniMapNode.displayName = 'MiniMapNode';

  // Added display name
  MiniMapNode.displayName = 'MiniMapNode';

  // Added display name
  MiniMapNode.displayName = 'MiniMapNode';

  // Added display name
  MiniMapNode.displayName = 'MiniMapNode';

  // Added display name
  MiniMapNode.displayName = 'MiniMapNode';


  // Determine node color based on type
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


    const nodeType = props.type?.toLowerCase() || '';
    
    if (nodeType.includes('source')) return '#2E7EED';
    if (nodeType.includes('destination')) return '#27AE60';
    if (nodeType.includes('transform')) return '#F2994A';
    if (nodeType.includes('dataset')) return '#9B51E0';
    if (nodeType.includes('trigger')) return '#EB5757';
    if (nodeType.includes('router')) return '#BB6BD9';
    if (nodeType.includes('action')) return '#F2C94C';
    
    return '#888888'; // Default gray
  };
  
  // Custom styling for the minimap node
  const nodeStyle = {
    ...style,
    background: getNodeColor(),
    borderRadius: 3,
    width: 8,
    height: 8,
    border: '0.5px solid #FFF'
  };
  
  return (
    <div style={nodeStyle} />
  );
};

export default memo(MiniMapNode);