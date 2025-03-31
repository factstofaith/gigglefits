// TransformNode.jsx
// -----------------------------------------------------------------------------
// Transform node for manipulating data in the integration flow

import React, { useMemo } from 'react';
import BaseNode, { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';

// Import design system components
import {MuiBox as MuiBox} from '@design-system/components/layout/Box';
import { Typography } from '@design-system/components/core/Typography';

// Import our design system theme hook
import { useTheme } from '@design-system/foundations/theme';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
// Removed duplicate import

const TransformNode = ({ data, selected }) => {
  // Added display name
  TransformNode.displayName = 'TransformNode';

  // Added display name
  TransformNode.displayName = 'TransformNode';

  // Added display name
  TransformNode.displayName = 'TransformNode';

  // Added display name
  TransformNode.displayName = 'TransformNode';

  // Added display name
  TransformNode.displayName = 'TransformNode';


  // Use our design system theme
  const { theme } = useTheme();
  
  // Determine transform icon based on transform type
  const getTransformIcon = () => {
  // Added display name
  getTransformIcon.displayName = 'getTransformIcon';

  // Added display name
  getTransformIcon.displayName = 'getTransformIcon';

  // Added display name
  getTransformIcon.displayName = 'getTransformIcon';

  // Added display name
  getTransformIcon.displayName = 'getTransformIcon';

  // Added display name
  getTransformIcon.displayName = 'getTransformIcon';


    const transformType = (data.transformType || '').toLowerCase();

    if (transformType.includes('filter')) {
      return FilterAltIcon;
    } else if (transformType.includes('map') || transformType.includes('transform')) {
      return CompareArrowsIcon;
    } else if (transformType.includes('join') || transformType.includes('merge')) {
      return MergeTypeIcon;
    } else if (transformType.includes('sort')) {
      return SortIcon;
    } else if (transformType.includes('aggregate')) {
      return FilterListIcon;
    }

    // Default icon
    return TuneIcon;
  };

  const TransformIconComponent = getTransformIcon();

  // Define enhanced input/output connections based on transform type
  const getConnectionConfig = () => {
  // Added display name
  getConnectionConfig.displayName = 'getConnectionConfig';

  // Added display name
  getConnectionConfig.displayName = 'getConnectionConfig';

  // Added display name
  getConnectionConfig.displayName = 'getConnectionConfig';

  // Added display name
  getConnectionConfig.displayName = 'getConnectionConfig';

  // Added display name
  getConnectionConfig.displayName = 'getConnectionConfig';


    const transformType = (data.transformType || '').toLowerCase();
    let inputConnections = [];
    let outputConnections = [];

    if (transformType.includes('join') || transformType.includes('merge')) {
      // Join/Merge transform: 2 inputs, 1 output
      inputConnections = [
        {
          id: "input-primary",
          label: "Primary",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "input-secondary",
          label: "Secondary",
          connectionType: CONNECTION_TYPES.DATA
        }
      ];
      
      outputConnections = [
        {
          id: "output-main",
          label: "Result",
          connectionType: CONNECTION_TYPES.DATA
        }
      ];
    } 
    else if (transformType.includes('fork') || transformType.includes('split')) {
      // Fork/Split transform: 1 input, multiple outputs
      inputConnections = [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ];
      
      // Create output connections based on outputs config if available
      if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
        outputConnections = data.outputs.map((output, index) => ({
          id: `output-${index}`,
          label: output.label || `Output ${index + 1}`,
          connectionType: CONNECTION_TYPES.DATA
        }));
      } else {
        // Default outputs if no specific configuration
        outputConnections = [
          { id: "output-0", label: "Output 1", connectionType: CONNECTION_TYPES.DATA },
          { id: "output-1", label: "Output 2", connectionType: CONNECTION_TYPES.DATA }
        ];
      }
    }
    else {
      // Default standard transform: 1 input, 1 output
      inputConnections = [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ];
      
      outputConnections = [
        {
          id: "output-main",
          label: "Output",
          connectionType: CONNECTION_TYPES.DATA
        }
      ];
    }

    return { inputConnections, outputConnections };
  };

  // Get enhanced connections
  const { inputConnections, outputConnections } = useMemo(() => getConnectionConfig(), 
    [data.transformType, data.outputs]);
  
  // For backward compatibility - legacy input/output counts
  const getIOConfig = () => {
  // Added display name
  getIOConfig.displayName = 'getIOConfig';

  // Added display name
  getIOConfig.displayName = 'getIOConfig';

  // Added display name
  getIOConfig.displayName = 'getIOConfig';

  // Added display name
  getIOConfig.displayName = 'getIOConfig';

  // Added display name
  getIOConfig.displayName = 'getIOConfig';


    const transformType = (data.transformType || '').toLowerCase();

    if (transformType.includes('join') || transformType.includes('merge')) {
      return { inputs: 2, outputs: 1 };
    } else if (transformType.includes('fork') || transformType.includes('split')) {
      return { inputs: 1, outputs: data.outputs?.length || 2 };
    }

    // Default: 1 input, 1 output
    return { inputs: 1, outputs: 1 };
  };

  const { inputs, outputs } = getIOConfig();

  return (
    <BaseNode
      data={{ 
        ...data, 
        inputs, 
        outputs,
        inputConnections,
        outputConnections,
        connections: data.connections || { inputs: {}, outputs: {} }
      }}
      selected={selected}
      type="Transform&quot;
      nodeColor="#F2994A"
      icon={TransformIconComponent}
    >
      {/* Transform expression preview */}
      {data.expression && (
        <MuiBox
          style={{
            backgroundColor: '#F2994A10',
            padding: 6,
            borderRadius: 8,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          <Typography 
            variant="caption&quot; 
            style={{ fontFamily: "monospace' }}
          >
            {data.expression.length > 30
              ? `${data.expression.substring(0, 30)}...`
              : data.expression}
          </Typography>
        </MuiBox>
      )}
    </BaseNode>
  );
};

export default TransformNode;
