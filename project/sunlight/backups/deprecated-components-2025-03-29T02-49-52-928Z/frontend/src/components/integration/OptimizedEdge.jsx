import React, { memo } from 'react';
import { getSmoothStepPath, EdgeText } from '@utils/reactFlowAdapter';
import PropTypes from 'prop-types';
import { useTheme } from '../../design-system';

/**
 * OptimizedEdge
 * A performance-optimized edge component for large flows.
 * Simplifies rendering for better performance.
 * 
 * @param {Object} props - Edge properties from ReactFlow
 * @returns {JSX.Element} Simplified edge
 */
function OptimizedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd
}) {
  // Added display name
  OptimizedEdge.displayName = 'OptimizedEdge';

  // Get theme from design system
  const theme = useTheme();
  
  // Calculate path
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  
  // Get edge type from data (default, success, error, warning)
  const edgeType = data?.type || 'default';
  
  // Map edge types to colors from theme
  const getEdgeColor = () => {
  // Added display name
  getEdgeColor.displayName = 'getEdgeColor';

  // Added display name
  getEdgeColor.displayName = 'getEdgeColor';

  // Added display name
  getEdgeColor.displayName = 'getEdgeColor';

  // Added display name
  getEdgeColor.displayName = 'getEdgeColor';

  // Added display name
  getEdgeColor.displayName = 'getEdgeColor';


    switch (edgeType) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.divider;
    }
  };
  
  // Default styles with theme-based colors
  const edgeStyle = {
    stroke: getEdgeColor(),
    strokeWidth: 1.5,
    ...(data?.isSimplified ? { strokeDasharray: '5,5' } : {}),
    ...style
  };
  
  // Skip label for simplified edges for better performance
  const showLabel = !data?.isSimplified && data?.label;
  
  // Get label style based on theme and edge type
  const getLabelStyle = () => {
  // Added display name
  getLabelStyle.displayName = 'getLabelStyle';

  // Added display name
  getLabelStyle.displayName = 'getLabelStyle';

  // Added display name
  getLabelStyle.displayName = 'getLabelStyle';

  // Added display name
  getLabelStyle.displayName = 'getLabelStyle';

  // Added display name
  getLabelStyle.displayName = 'getLabelStyle';


    const baseStyle = {
      fontSize: 10,
      padding: 4,
      borderRadius: 4,
      fontFamily: theme.typography.fontFamily,
      fill: theme.palette.text.primary,
      background: theme.palette.background.paper,
    };
    
    // Add background for error/warning/success labels
    if (edgeType !== 'default') {
      return {
        ...baseStyle,
        fontWeight: 500,
        fill: theme.palette.getContrastText(theme.palette[edgeType].light),
        background: theme.palette[edgeType].light
      };
    }
    
    return baseStyle;
  };
  
  return (
    <>
      <path 
        id={id} 
        d={edgePath} 
        style={edgeStyle} 
        markerEnd={markerEnd} 
        data-testid={`flow-edge-${id}`}
      />
      {showLabel && (
        <EdgeText
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          label={data.label}
          labelStyle={getLabelStyle()}
          labelBgStyle={{ fill: 'transparent' }}
          labelBgPadding={[2, 4]}
          style={{ fontSize: 10 }}
        />
      )}
    </>
  );
}

OptimizedEdge.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.string,
  targetPosition: PropTypes.string,
  data: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.oneOf(['default', 'success', 'error', 'warning', 'info']),
    isSimplified: PropTypes.bool,
    // Additional data properties that might be passed
    animated: PropTypes.bool,
    selected: PropTypes.bool
  }),
  style: PropTypes.object,
  markerEnd: PropTypes.string
};

// Use React.memo to prevent unnecessary re-renders
export default memo(OptimizedEdge, (prevProps, nextProps) => {
  // Check for position changes
  const positionsEqual = 
    prevProps.sourceX === nextProps.sourceX &&
    prevProps.sourceY === nextProps.sourceY &&
    prevProps.targetX === nextProps.targetX &&
    prevProps.targetY === nextProps.targetY;
  
  // If positions are different, we should re-render
  if (!positionsEqual) return false;
  
  // Check essential data properties that affect rendering
  const prevData = prevProps.data || {};
  const nextData = nextProps.data || {};
  
  // Check specific properties that would require re-rendering
  return (
    prevData.isSimplified === nextData.isSimplified &&
    prevData.type === nextData.type &&
    prevData.label === nextData.label &&
    prevData.animated === nextData.animated &&
    prevData.selected === nextData.selected
  );
});