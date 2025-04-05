/**
 * A11yTreeView - Accessible tree visualization
 * 
 * An accessibility-enhanced version of the TreeView component that provides:
 * - Keyboard navigation of tree elements
 * - Screen reader announcements for important information
 * - Text-based alternative view of the data
 * - Full ARIA attributes for assistive technology
 * 
 * Part of the zero technical debt accessibility implementation.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, FormControlLabel, Typography, Paper, Switch, Table, TableHead, TableBody, TableRow, TableCell, Tooltip, Button, IconButton, Tabs, Tab, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useA11yAnnouncement, useA11yKeyboard, useA11yFocus } from "@/hooks/a11y";

// Import original component
import TreeView from '../tree/TreeView';

/**
 * Accessibility-enhanced tree visualization component
 * 
 * @param {Object} props - Component props 
 * @returns {JSX.Element} Rendered component
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const A11yTreeView = (props) => {
  // Extract visualization-specific props
  const {
    data: vizData,
    accessibilityLabel,
    accessibilitySummary,
    showAccessibleAlternatives = true,
    ...otherProps
  } = props;

  // Refs for focus management
  const componentRef = useRef(null);
  const textViewRef = useRef(null);

  // State for accessibility options
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const [a11yView, setA11yView] = useState('visual');
  const [keyboardNavigationActive, setKeyboardNavigationActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  // Use accessibility hooks
  const {
    announcePolite,
    announceAssertive
  } = useA11yAnnouncement();
  const {
    focusElement
  } = useA11yFocus();

  // Support keyboard navigation of tree nodes
  const {
    getArrowKeyHandler
  } = useA11yKeyboard();

  // Track expanded state for tree nodes
  const [expandedNodes, setExpandedNodes] = useState({});

  // Generate tree structure for navigation
  const treeNavigation = React.useMemo(() => {
    return {
      children: generateTreeNavigationMap(treeData),
      parent: generateParentMap(treeData)
    };
  }, [treeData]);

  // Handle node selection and navigation
  const handleKeyNavigation = React.useCallback((event, currentNodeId) => {
    // Custom handler for tree structure
    const handleArrowKey = (e) => {
      const key = e.key;
      if (key === 'ArrowDown') {
        // Move to next visible node
        const nextNodeId = findNextVisibleNode(currentNodeId, treeNavigation, expandedNodes);
        if (nextNodeId) {
          setSelectedNode(nextNodeId);
          announcePolite(`Moved to ${getNodeLabel(nextNodeId)}`);
        }
      } else if (key === 'ArrowUp') {
        // Move to previous visible node
        const prevNodeId = findPrevVisibleNode(currentNodeId, treeNavigation, expandedNodes);
        if (prevNodeId) {
          setSelectedNode(prevNodeId);
          announcePolite(`Moved to ${getNodeLabel(prevNodeId)}`);
        }
      } else if (key === 'ArrowRight') {
        // Expand node if collapsed
        if (!expandedNodes[currentNodeId] && hasChildren(currentNodeId, treeNavigation)) {
          setExpandedNodes({
            ...expandedNodes,
            [currentNodeId]: true
          });
          announcePolite(`Expanded ${getNodeLabel(currentNodeId)}`);
        }
      } else if (key === 'ArrowLeft') {
        // Collapse node if expanded, or move to parent
        if (expandedNodes[currentNodeId]) {
          setExpandedNodes({
            ...expandedNodes,
            [currentNodeId]: false
          });
          announcePolite(`Collapsed ${getNodeLabel(currentNodeId)}`);
        } else {
          const parentId = treeNavigation.parent[currentNodeId];
          if (parentId) {
            setSelectedNode(parentId);
            announcePolite(`Moved to parent ${getNodeLabel(parentId)}`);
          }
        }
      }
    };
    handleArrowKey(event);
  }, [treeNavigation, expandedNodes, announcePolite]);

  /**
   * Generate text-based representation of the tree
   */
  const generateTextRepresentation = React.useCallback(() => {
    // Create structured text description of the tree

    // Count nodes and levels
    const nodeCount = countNodes(treeData);
    const maxDepth = findMaxDepth(treeData);

    // Title and summary
    let summaryText = `Tree with ${nodeCount} nodes across ${maxDepth} levels.\n\n`;

    // Generate hierarchical text representation
    summaryText += 'Hierarchy:\n';

    // Recursive function to print tree
    const printNode = (node, depth, isLast = false) => {
      const indent = '  '.repeat(depth);
      const prefix = depth > 0 ? isLast ? '└─ ' : '├─ ' : '';

      // Add this node
      summaryText += `${indent}${prefix}${node.label || node.name || node.id}\n`;

      // Process children if any
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const isLastChild = index === node.children.length - 1;
          printNode(child, depth + 1, isLastChild);
        });
      }
    };

    // Start with root node
    printNode(treeData, 0);
    return summaryText;
  }, [treeData]);

  /**
   * Generate tabular representation of the data
   */
  const generateTabularData = React.useCallback(() => {
    // Transform the visualization data into a tabular format
    // This will vary based on the visualization type
    if (!vizData) return [];

    // Generate appropriate columns and rows
    return transformToTableData(vizData);
  }, [vizData]);

  /**
   * Handle keyboard shortcuts for the component
   */
  const handleKeyDown = useCallback((event) => {
    // Only handle keys when keyboard navigation is active
    if (!keyboardNavigationActive) return;

    // Handle keyboard navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      handleKeyNavigation(event, selectedElement);
    }

    // Handle activation/selection
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (selectedElement !== null) {
        announcePolite(`Selected element ${getElementDescription(selectedElement)}`);
        // Trigger appropriate action for element selection
      }
    }

    // Toggle alternative views
    if (event.key === 't' && event.altKey) {
      event.preventDefault();
      setA11yView((view) => view === 'visual' ? 'table' : view === 'table' ? 'text' : 'visual');
      announcePolite(`Switched to ${a11yView === 'visual' ? 'table' : a11yView === 'table' ? 'text' : 'visual'} view`);
    }
  }, [keyboardNavigationActive, selectedElement, handleKeyNavigation, announcePolite, a11yView]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (keyboardNavigationActive && componentRef.current) {
      // Add event listener to component
      componentRef.current.addEventListener('keydown', handleKeyDown);

      // Announce keyboard navigation mode
      announcePolite(`Keyboard navigation active. Use arrow keys to navigate, Enter to select.`);

      // Focus the component
      componentRef.current.focus();
    }
    return () => {
      if (componentRef.current) {
        componentRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [keyboardNavigationActive, handleKeyDown, announcePolite]);

  // Generate a description for screen readers when content changes
  useEffect(() => {
    if (vizData && accessibilityLabel) {
      const summary = accessibilitySummary || `tree with ${Object.keys(vizData).length} elements`;
      announcePolite(summary);
    }
  }, [vizData, accessibilityLabel, accessibilitySummary, announcePolite]);

  /**
   * Toggle accessibility panel
   */
  const toggleA11yPanel = () => {
    setShowA11yPanel((prev) => !prev);
    if (!showA11yPanel) {
      announcePolite('Accessibility options panel opened');
    }
  };

  /**
   * Handle view change
   */
  const handleViewChange = (event, newView) => {
    setA11yView(newView);
    announcePolite(`View changed to ${newView}`);
  };

  /**
   * Toggle keyboard navigation
   */
  const toggleKeyboardNavigation = () => {
    setKeyboardNavigationActive((prev) => !prev);
  };

  /**
   * Get accessibility shortcuts help
   */
  const getA11yShortcuts = () => {
    return [{
      key: 'Alt + A',
      description: 'Toggle accessibility panel'
    }, {
      key: 'Alt + T',
      description: 'Switch between visualization views'
    }, {
      key: 'Alt + K',
      description: 'Toggle keyboard navigation'
    }, {
      key: 'Arrow keys',
      description: 'Navigate between elements when keyboard navigation is active'
    }, {
      key: 'Enter',
      description: 'Select or activate the focused element'
    }, {
      key: 'Escape',
      description: 'Exit keyboard navigation or close dialogs'
    }];
  };

  /**
   * Render tabular view of the data
   */
  const renderTableView = () => {
    const tableData = generateTabularData();
    if (!tableData || !tableData.length) {
      return <Typography variant="body2">
          No data available for tabular view.
        </Typography>;
    }

    // Extract columns from the first row
    const columns = Object.keys(tableData[0]);
    return <Box sx={{
      overflowX: 'auto',
      mb: 2
    }}>
        <Table aria-label="Tabular representation of visualization data">
          <TableHead>
            <TableRow>
              {columns.map((column) => <TableCell key={column}>
                  {column}
                </TableCell>)}

            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, rowIndex) => <TableRow key={rowIndex}>
                {columns.map((column) => <TableCell key={`${rowIndex}-${column}`}>
                    {row[column]}
                  </TableCell>)}

              </TableRow>)}

          </TableBody>
        </Table>
      </Box>;
  };

  /**
   * Render text view of the data
   */
  const renderTextView = () => {
    const textDescription = generateTextRepresentation();
    return <Box component="pre" sx={{
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      backgroundColor: 'background.paper',
      p: 2,
      borderRadius: 1,
      maxHeight: '400px',
      overflowY: 'auto'
    }} ref={textViewRef} tabIndex={0} aria-label="Text representation of visualization data">

        {textDescription}
      </Box>;
  };

  /**
   * Render accessibility controls
   */
  const renderA11yControls = () => {
    return <Box sx={{
      mb: 2,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
        <Tooltip title="Accessibility options">
          <IconButton onClick={toggleA11yPanel} aria-label="Toggle accessibility options" color={showA11yPanel ? 'primary' : 'default'}>

            <KeyboardIcon />
          </IconButton>
        </Tooltip>
      </Box>;
  };

  /**
   * Render accessibility panel
   */
  const renderA11yPanel = () => {
    if (!showA11yPanel) return null;
    return <Paper elevation={3} sx={{
      p: 2,
      mb: 2
    }} aria-labelledby="a11y-panel-title">

        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
          <Typography variant="h6" id="a11y-panel-title">
            Accessibility Options
          </Typography>
          <IconButton onClick={toggleA11yPanel} aria-label="Close accessibility panel" size="small">

            <CloseIcon />
          </IconButton>
        </Box>
        
        <Tabs value={a11yView} onChange={handleViewChange} variant="fullWidth" aria-label="Visualization view options">

          <Tab value="visual" label="Visual" icon={<InfoIcon />} iconPosition="start" aria-label="Visual tree view" />

          <Tab value="table" label="Table" icon={<TableViewIcon />} iconPosition="start" aria-label="Tabular data view" />

          <Tab value="text" label="Text" icon={<TextSnippetIcon />} iconPosition="start" aria-label="Text description view" />

        </Tabs>
        
        <Box sx={{
        mt: 2
      }}>
          <FormControlLabel control={<Switch checked={keyboardNavigationActive} onChange={toggleKeyboardNavigation} name="keyboard-navigation" color="primary" />} label="Enable keyboard navigation" />

        </Box>
        
        {keyboardNavigationActive && <Box sx={{
        mt: 1,
        mb: 2
      }}>
            <Typography variant="body2" color="text.secondary">
              Use arrow keys to navigate between elements, Enter to select
            </Typography>
            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 1
        }}>
              <IconButton aria-label="Navigate up" size="small">
                <KeyboardArrowUpIcon />
              </IconButton>
              <Box sx={{
            display: 'flex',
            flexDirection: 'column'
          }}>
                <IconButton aria-label="Navigate left" size="small">
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <IconButton aria-label="Navigate right" size="small">
                  <KeyboardArrowRightIcon />
                </IconButton>
              </Box>
              <IconButton aria-label="Navigate down" size="small">
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
          </Box>}

        
        <Box sx={{
        mt: 2
      }}>
          <Button variant="outlined" size="small" onClick={() => {
          const shortcuts = getA11yShortcuts();
          let message = 'Keyboard shortcuts:\n';
          shortcuts.forEach((shortcut) => {
            message += `${shortcut.key}: ${shortcut.description}\n`;
          });
          announcePolite(message);

          // Also show visually
          alert('Keyboard Shortcuts:\n\n' + shortcuts.map((s) => `${s.key}: ${s.description}`).join('\n'));
        }}>

            Keyboard Shortcuts
          </Button>
        </Box>
      </Paper>;
  };

  /**
   * Helper functions for the visualization data
   */
  const getElementDescription = (elementId) => {
    // Return a readable description of the element
    // Implementation depends on visualization data structure
    return `Element ${elementId}`;
  };
  const transformToTableData = (data) => {
    // Transform visualization data to tabular format
    // Implementation depends on visualization data structure
    if (!data) return [];

    // Example implementation - customize based on actual data structure
    try {
      // For flat data
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          id: index,
          ...item
        }));
      }

      // For hierarchical data
      if (data.nodes && Array.isArray(data.nodes)) {
        return data.nodes.map((node, index) => ({
          id: node.id || index,
          label: node.label || node.name || `Node ${index}`,
          type: node.type || 'unknown',
          ...node.data
        }));
      }

      // For other structures, flatten as best we can
      return [data];
    } catch (error) {
      console.error('Error transforming visualization data to table:', error);
      return [];
    }
  };

  // Render the component based on current view
  return <div ref={componentRef} tabIndex={keyboardNavigationActive ? 0 : -1} aria-label={accessibilityLabel || `tree visualization`} style={{
    outline: keyboardNavigationActive ? '2px solid #1976d2' : 'none'
  }}>

      {/* Accessibility controls */}
      {showAccessibleAlternatives && renderA11yControls()}
      
      {/* Accessibility panel */}
      {showAccessibleAlternatives && renderA11yPanel()}
      
      {/* Content based on selected view */}
      {a11yView === 'visual' ? <TreeView data={vizData} {...otherProps} aria-hidden={a11yView !== 'visual'} /> : a11yView === 'table' ? renderTableView() : renderTextView()}

      
      {/* Hidden semantic description for screen readers */}
      <div className="sr-only" aria-live="polite">
        {accessibilitySummary}
      </div>
    </div>;
};
A11yTreeView.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  accessibilityLabel: PropTypes.string,
  accessibilitySummary: PropTypes.string,
  showAccessibleAlternatives: PropTypes.bool
};
export default A11yTreeView;