import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  Typography, 
  Chip, 
  IconButton, 
  Collapse, 
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  LinearProgress,
  useTheme
} from '../../design-system/adapter';
import SpeedIcon from '@mui/icons-material/Speed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MemoryIcon from '@mui/icons-material/Memory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TuneIcon from '@mui/icons-material/Tune';
import { OPTIMIZATION_SETTINGS } from '@utils/flowOptimizer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
/**
 * A component for monitoring and controlling flow canvas performance optimizations
 * 
 * This component displays real-time performance metrics and provides controls
 * for configuring optimization settings.
 */
const FlowPerformanceMonitor = ({ 
  renderStats, 
  performanceMetrics, 
  recommendations,
  optimizationConfig,
  onOptimizationConfigChange,
  isExpanded = false,
  position = 'top-right'
}) => {
  // Added display name
  FlowPerformanceMonitor.displayName = 'FlowPerformanceMonitor';

  // Added display name
  FlowPerformanceMonitor.displayName = 'FlowPerformanceMonitor';

  // Added display name
  FlowPerformanceMonitor.displayName = 'FlowPerformanceMonitor';


  const [expanded, setExpanded] = useState(isExpanded);
  const [activeTab, setActiveTab] = useState('metrics');
  
  // Calculate FPS rating
  const getFpsRating = (fps) => {
  // Added display name
  getFpsRating.displayName = 'getFpsRating';

  // Added display name
  getFpsRating.displayName = 'getFpsRating';

  // Added display name
  getFpsRating.displayName = 'getFpsRating';


    if (fps >= 50) return { label: 'Excellent', color: 'success' };
    if (fps >= 30) return { label: 'Good', color: 'success' };
    if (fps >= 15) return { label: 'Fair', color: 'warning' };
    return { label: 'Poor', color: 'error' };
  };

  // Handle optimization setting toggle
  const handleToggleOptimization = (setting) => {
  // Added display name
  handleToggleOptimization.displayName = 'handleToggleOptimization';

  // Added display name
  handleToggleOptimization.displayName = 'handleToggleOptimization';

  // Added display name
  handleToggleOptimization.displayName = 'handleToggleOptimization';


    if (onOptimizationConfigChange) {
      onOptimizationConfigChange({
        ...optimizationConfig,
        [setting]: !optimizationConfig[setting]
      });
    }
  };
  
  // Position styles
  const getPositionStyles = () => {
  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';


    switch (position) {
      case 'top-left':
        return { top: 10, left: 10 };
      case 'top-right':
        return { top: 10, right: 10 };
      case 'bottom-left':
        return { bottom: 10, left: 10 };
      case 'bottom-right':
        return { bottom: 10, right: 10 };
      default:
        return { top: 10, right: 10 };
    }
  };
  
  // Format byte size to human-readable string
  const formatBytes = (bytes) => {
  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';


    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get optimization setting label
  const getOptimizationLabel = (setting) => {
  // Added display name
  getOptimizationLabel.displayName = 'getOptimizationLabel';

  // Added display name
  getOptimizationLabel.displayName = 'getOptimizationLabel';

  // Added display name
  getOptimizationLabel.displayName = 'getOptimizationLabel';


    switch(setting) {
      case OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION:
        return 'Node Virtualization';
      case OPTIMIZATION_SETTINGS.EDGE_BUNDLING:
        return 'Edge Bundling';
      case OPTIMIZATION_SETTINGS.DETAILED_LEVEL:
        return 'Detail Level Adaptation';
      case OPTIMIZATION_SETTINGS.VIEWPORT_CULLING:
        return 'Viewport Culling';
      case OPTIMIZATION_SETTINGS.BATCHED_UPDATES:
        return 'Batched Updates';
      case OPTIMIZATION_SETTINGS.MEMOIZATION:
        return 'Memoization';
      default:
        return setting;
    }
  };
  
  // Get optimization setting description
  const getOptimizationDescription = (setting) => {
  // Added display name
  getOptimizationDescription.displayName = 'getOptimizationDescription';

  // Added display name
  getOptimizationDescription.displayName = 'getOptimizationDescription';

  // Added display name
  getOptimizationDescription.displayName = 'getOptimizationDescription';


    switch(setting) {
      case OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION:
        return 'Only render nodes in full detail when they are visible in the viewport';
      case OPTIMIZATION_SETTINGS.EDGE_BUNDLING:
        return 'Group and bundle multiple edges between the same nodes';
      case OPTIMIZATION_SETTINGS.DETAILED_LEVEL:
        return 'Adjust node and edge detail based on zoom level';
      case OPTIMIZATION_SETTINGS.VIEWPORT_CULLING:
        return 'Skip rendering elements that are outside the viewport';
      case OPTIMIZATION_SETTINGS.BATCHED_UPDATES:
        return 'Group multiple state updates together to reduce render cycles';
      case OPTIMIZATION_SETTINGS.MEMOIZATION:
        return 'Cache components to prevent unnecessary re-renders';
      default:
        return 'Optimization setting';
    }
  };
  
  // Optimization effectiveness based on flow size
  const getOptimizationEffectiveness = (setting, flowSize) => {
  // Added display name
  getOptimizationEffectiveness.displayName = 'getOptimizationEffectiveness';

  // Added display name
  getOptimizationEffectiveness.displayName = 'getOptimizationEffectiveness';

  // Added display name
  getOptimizationEffectiveness.displayName = 'getOptimizationEffectiveness';


    const nodeCount = renderStats.nodeCount || 0;
    const isLargeFlow = nodeCount > 300;
    const isMediumFlow = nodeCount > 100 && nodeCount <= 300;
    
    switch(setting) {
      case OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION:
        return isLargeFlow ? 'High' : isMediumFlow ? 'Medium' : 'Low';
      case OPTIMIZATION_SETTINGS.EDGE_BUNDLING:
        return renderStats.edgeCount > 200 ? 'High' : renderStats.edgeCount > 50 ? 'Medium' : 'Low';
      case OPTIMIZATION_SETTINGS.DETAILED_LEVEL:
        return isLargeFlow ? 'Medium' : 'Low';
      case OPTIMIZATION_SETTINGS.VIEWPORT_CULLING:
        return isLargeFlow ? 'High' : isMediumFlow ? 'Medium' : 'Low';
      case OPTIMIZATION_SETTINGS.BATCHED_UPDATES:
        return isLargeFlow ? 'High' : 'Medium';
      case OPTIMIZATION_SETTINGS.MEMOIZATION:
        return isLargeFlow ? 'High' : 'Medium';
      default:
        return 'Medium';
    }
  };
  
  // Get color for optimization effectiveness
  const getEffectivenessColor = (effectiveness) => {
  // Added display name
  getEffectivenessColor.displayName = 'getEffectivenessColor';

  // Added display name
  getEffectivenessColor.displayName = 'getEffectivenessColor';

  // Added display name
  getEffectivenessColor.displayName = 'getEffectivenessColor';


    switch(effectiveness) {
      case 'High': return 'success';
      case 'Medium': return 'info';
      case 'Low': return 'default';
      default: return 'default';
    }
  };
  
  // Render metrics tab content
  const renderMetricsTab = () => (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SpeedIcon fontSize="small" sx={{ mr: 1 }} />
          Performance Metrics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={`${performanceMetrics.fps || 0} FPS`} 
            color={getFpsRating(performanceMetrics.fps).color}
            size="small"
          />
          <Chip 
            label={`${performanceMetrics.renderTime?.toFixed(1) || 0} ms render`} 
            color={performanceMetrics.renderTime > 100 ? 'warning' : 'default'}
            size="small"
          />
          {performanceMetrics.memoryUsage > 0 && (
            <Chip 
              label={formatBytes(performanceMetrics.memoryUsage)} 
              color={performanceMetrics.memoryUsage > 100 * 1024 * 1024 ? 'warning' : 'default'}
              size="small"
            />
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Rendering Statistics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Nodes: {renderStats.visibleNodeCount} / {renderStats.nodeCount} visible
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Edges: {renderStats.visibleEdgeCount} / {renderStats.edgeCount} visible
          </Typography>
          {renderStats.bundledEdgeCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Bundled edges: {renderStats.bundledEdgeCount}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Last update: {new Date(renderStats.lastUpdateTime).toLocaleTimeString()}
          </Typography>
        </Box>
        
        {/* Visibility ratio visualization */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Node visibility:</Typography>
          <LinearProgress 
            variant="determinate" 
            value={(renderStats.visibleNodeCount / (renderStats.nodeCount || 1)) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Edge visibility:</Typography>
          <LinearProgress 
            variant="determinate" 
            value={(renderStats.visibleEdgeCount / (renderStats.edgeCount || 1)) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      </Box>
      
      {recommendations?.recommendations.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recommendations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {recommendations.recommendations.map((rec, idx) => (
                <Typography key={idx} variant="caption">• {rec}</Typography>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
  
  // Render optimization settings tab content
  const renderSettingsTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TuneIcon fontSize="small" sx={{ mr: 1 }} />
        Optimization Settings
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        {Object.values(OPTIMIZATION_SETTINGS).map((setting) => {
          const effectiveness = getOptimizationEffectiveness(setting, renderStats.nodeCount);
          
          return (
            <Box key={setting} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={optimizationConfig?.[setting] || false}
                      onChange={() => handleToggleOptimization(setting)}
                    />
                  }
                  label={
                    <Typography variant="body2">{getOptimizationLabel(setting)}</Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
                  {getOptimizationDescription(setting)}
                </Typography>
              </Box>
              <Tooltip title={`Impact for current flow: ${effectiveness}`}>
                <Chip 
                  label={effectiveness} 
                  size="small" 
                  color={getEffectivenessColor(effectiveness)}
                  sx={{ ml: 1 }}
                />
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
  
  return (
    <Card 
      elevation={2}
      sx={{
        position: 'absolute',
        ...getPositionStyles(),
        maxWidth: expanded ? '350px' : 'auto',
        zIndex: 5,
        overflow: 'visible'
      }}
    >
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MemoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight="medium">
            Flow Performance
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            size="small" 
            label={`${performanceMetrics.fps || 0} FPS`} 
            color={getFpsRating(performanceMetrics.fps).color}
            sx={{ mr: 1 }}
          />
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label="Metrics"
              clickable
              color={activeTab === 'metrics' ? 'primary' : 'default'}
              onClick={() => setActiveTab('metrics')}
              size="small"
            />
            <Chip
              label="Settings"
              clickable
              color={activeTab === 'settings' ? 'primary' : 'default'}
              onClick={() => setActiveTab('settings')}
              size="small"
            />
          </Box>
          
          {activeTab === 'metrics' && renderMetricsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </Box>
      </Collapse>
    </Card>
  );
};

FlowPerformanceMonitor.propTypes = {
  renderStats: PropTypes.shape({
    nodeCount: PropTypes.number,
    visibleNodeCount: PropTypes.number,
    edgeCount: PropTypes.number,
    visibleEdgeCount: PropTypes.number,
    bundledEdgeCount: PropTypes.number,
    lastUpdateTime: PropTypes.number,
    fps: PropTypes.number
  }),
  performanceMetrics: PropTypes.shape({
    renderTime: PropTypes.number,
    updateTime: PropTypes.number,
    fps: PropTypes.number,
    memoryUsage: PropTypes.number
  }),
  recommendations: PropTypes.shape({
    config: PropTypes.object,
    recommendations: PropTypes.arrayOf(PropTypes.string)
  }),
  optimizationConfig: PropTypes.object,
  onOptimizationConfigChange: PropTypes.func,
  isExpanded: PropTypes.bool,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

FlowPerformanceMonitor.defaultProps = {
  renderStats: {
    nodeCount: 0,
    visibleNodeCount: 0,
    edgeCount: 0,
    visibleEdgeCount: 0,
    bundledEdgeCount: 0,
    lastUpdateTime: 0,
    fps: 0
  },
  performanceMetrics: {
    renderTime: 0,
    updateTime: 0,
    fps: 0,
    memoryUsage: 0
  },
  recommendations: {
    recommendations: []
  },
  optimizationConfig: {},
  isExpanded: false,
  position: 'top-right'
};

export default FlowPerformanceMonitor;