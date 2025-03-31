/**
 * @component HistoryPanel
 * @description A panel that displays and manages flow change history with visualization of changes.
 * Allows users to navigate through their recent modifications with undo/redo functionality.
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Paper, Divider, Tooltip, Badge } from '../../design-system';
import IconButton from '@mui/material/IconButton';;

// Icons
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Box from '@mui/material/Box';
/**
 * Formats a timestamp into a readable format
 * @param {number} timestamp - The timestamp to format
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (timestamp) => {
  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';


  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * Analyzes changes between two flow states
 * @param {Object} prevState - Previous flow state
 * @param {Object} currentState - Current flow state
 * @returns {Object} Summary of changes
 */
const analyzeChanges = (prevState, currentState) => {
  // Added display name
  analyzeChanges.displayName = 'analyzeChanges';

  // Added display name
  analyzeChanges.displayName = 'analyzeChanges';

  // Added display name
  analyzeChanges.displayName = 'analyzeChanges';


  if (!prevState || !currentState) {
    return { added: 0, modified: 0, deleted: 0, summary: 'Initial state' };
  }
  
  const prevNodeIds = new Set(prevState.nodes.map(node => node.id));
  const currentNodeIds = new Set(currentState.nodes.map(node => node.id));
  
  const prevEdgeIds = new Set(prevState.edges.map(edge => edge.id));
  const currentEdgeIds = new Set(currentState.edges.map(edge => edge.id));
  
  // Find added nodes and edges
  const addedNodes = [...currentNodeIds].filter(id => !prevNodeIds.has(id));
  const addedEdges = [...currentEdgeIds].filter(id => !prevEdgeIds.has(id));
  
  // Find deleted nodes and edges
  const deletedNodes = [...prevNodeIds].filter(id => !currentNodeIds.has(id));
  const deletedEdges = [...prevEdgeIds].filter(id => !prevEdgeIds.has(id));
  
  // Find modified nodes
  const modifiedNodes = currentState.nodes.filter(currentNode => {
    if (!prevNodeIds.has(currentNode.id)) return false;
    
    const prevNode = prevState.nodes.find(node => node.id === currentNode.id);
    return JSON.stringify(prevNode.data) !== JSON.stringify(currentNode.data);
  });
  
  // Prepare summary
  const changes = {
    nodesAdded: addedNodes.length,
    nodesDeleted: deletedNodes.length,
    nodesModified: modifiedNodes.length,
    edgesAdded: addedEdges.length,
    edgesDeleted: deletedEdges.length,
    summary: '',
  };
  
  // Generate summary text
  const parts = [];
  if (changes.nodesAdded > 0) {
    parts.push(`Added ${changes.nodesAdded} node${changes.nodesAdded !== 1 ? 's' : ''}`);
  }
  if (changes.nodesDeleted > 0) {
    parts.push(`Deleted ${changes.nodesDeleted} node${changes.nodesDeleted !== 1 ? 's' : ''}`);
  }
  if (changes.nodesModified > 0) {
    parts.push(`Modified ${changes.nodesModified} node${changes.nodesModified !== 1 ? 's' : ''}`);
  }
  if (changes.edgesAdded > 0) {
    parts.push(`Added ${changes.edgesAdded} connection${changes.edgesAdded !== 1 ? 's' : ''}`);
  }
  if (changes.edgesDeleted > 0) {
    parts.push(`Deleted ${changes.edgesDeleted} connection${changes.edgesDeleted !== 1 ? 's' : ''}`);
  }
  
  changes.summary = parts.join(', ') || 'No changes';
  changes.added = changes.nodesAdded + changes.edgesAdded;
  changes.deleted = changes.nodesDeleted + changes.edgesDeleted;
  changes.modified = changes.nodesModified;
  
  return changes;
};

/**
 * History Panel component
 */
const HistoryPanel = ({
  history = [],
  currentIndex = 0,
  onRestoreState,
  onUndo,
  onRedo,
  onClearHistory,
  canUndo = false,
  canRedo = false,
  maxHeight = '100%',
}) => {
  // Added display name
  HistoryPanel.displayName = 'HistoryPanel';

  // Added display name
  HistoryPanel.displayName = 'HistoryPanel';

  // Added display name
  HistoryPanel.displayName = 'HistoryPanel';


  const [selectedItem, setSelectedItem] = useState(null);
  
  // Update selected item when currentIndex changes
  useEffect(() => {
    setSelectedItem(currentIndex);
  }, [currentIndex]);
  
  // Generate history items with change analysis
  const historyItems = useMemo(() => {
  // Added display name
  historyItems.displayName = 'historyItems';

    if (!history || history.length === 0) {
      return [];
    }
    
    return history.map((item, index) => {
      // For first item, there's no previous state
      const prevState = index === 0 ? null : history[index - 1];
      const changes = analyzeChanges(prevState, item);
      
      return {
        ...item,
        index,
        isCurrent: index === currentIndex,
        timestamp: item.timestamp || Date.now() - (history.length - index) * 60000, // Approximate if no timestamp
        changes,
      };
    });
  }, [history, currentIndex]);
  
  // Handle restore state request
  const handleRestore = (index) => {
  // Added display name
  handleRestore.displayName = 'handleRestore';

  // Added display name
  handleRestore.displayName = 'handleRestore';

  // Added display name
  handleRestore.displayName = 'handleRestore';


    if (onRestoreState && index >= 0 && index < history.length) {
      onRestoreState(index);
      setSelectedItem(index);
    }
  };
  
  // Calculate if the panel has any history to show
  const hasHistory = history.length > 1;
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        height: maxHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">Flow History</Typography>
        </Box>
        
        <Box>
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton 
                size="small" 
                onClick={onUndo} 
                disabled={!canUndo}
                aria-label="Undo last action"
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton 
                size="small" 
                onClick={onRedo} 
                disabled={!canRedo}
                aria-label="Redo last undone action"
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Clear History">
            <span>
              <IconButton 
                size="small" 
                onClick={onClearHistory} 
                disabled={!hasHistory}
                aria-label="Clear history"
              >
                <ClearAllIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {!hasHistory ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No history available yet. Changes will be tracked as you modify your flow.
          </Typography>
        </Box>
      ) : (
        <List 
          sx={{ 
            overflow: 'auto',
            flexGrow: 1,
            py: 0,
          }}
        >
          {historyItems.map((item, idx) => {
            // Determine the icon based on the primary action
            let ActionIcon = EditIcon;
            if (item.changes.added > item.changes.modified && item.changes.added > item.changes.deleted) {
              ActionIcon = AddIcon;
            } else if (item.changes.deleted > item.changes.modified && item.changes.deleted > item.changes.added) {
              ActionIcon = DeleteIcon;
            } else if (item.changes.nodesAdded === 0 && item.changes.nodesDeleted === 0 && 
                       item.changes.edgesAdded > 0) {
              ActionIcon = LinkIcon;
            }
            
            return (
              <ListItem
                key={`history-item-${idx}`}
                button
                selected={idx === selectedItem}
                onClick={() => setSelectedItem(idx)}
                onDoubleClick={() => handleRestore(idx)}
                disabled={idx === currentIndex}
                sx={{
                  borderLeft: idx === currentIndex ? 3 : 0,
                  borderColor: 'primary.main',
                  pl: idx === currentIndex ? 1.7 : 2,
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Badge 
                    color={
                      item.changes.added > 0 ? 'success' : 
                      item.changes.deleted > 0 ? 'error' : 
                      item.changes.modified > 0 ? 'warning' : 'default'
                    }
                    variant="dot"
                    invisible={idx === 0}
                  >
                    {idx === 0 ? (
                      <HistoryIcon fontSize="small" />
                    ) : (
                      <ActionIcon fontSize="small" />
                    )}
                  </Badge>
                </ListItemIcon>
                
                <ListItemText
                  primary={idx === 0 ? 'Initial State' : item.changes.summary}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                      <Typography variant="caption">
                        {formatTimestamp(item.timestamp)}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                  }}
                />
                
                {idx !== currentIndex && (
                  <Tooltip title="Restore this state">
                    <IconButton 
                      size="small" 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(idx);
                      }}
                      sx={{ opacity: 0.7 }}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

HistoryPanel.propTypes = {
  /** Complete history of flow states */
  history: PropTypes.arrayOf(
    PropTypes.shape({
      nodes: PropTypes.array.isRequired,
      edges: PropTypes.array.isRequired,
      timestamp: PropTypes.number,
    })
  ),
  /** Current position in history */
  currentIndex: PropTypes.number,
  /** Callback to restore a specific state */
  onRestoreState: PropTypes.func,
  /** Callback to undo last action */
  onUndo: PropTypes.func,
  /** Callback to redo last undone action */
  onRedo: PropTypes.func,
  /** Callback to clear history */
  onClearHistory: PropTypes.func,
  /** Whether undo is available */
  canUndo: PropTypes.bool,
  /** Whether redo is available */
  canRedo: PropTypes.bool,
  /** Maximum height for the panel */
  maxHeight: PropTypes.string,
};

export default HistoryPanel;