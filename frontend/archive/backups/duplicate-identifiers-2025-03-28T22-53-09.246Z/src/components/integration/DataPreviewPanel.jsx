/**
 * @component DataPreviewPanel
 * @description Provides a real-time data preview for each node in the integration flow,
 * allowing users to see sample data, track transformations, and debug data issues.
 *
 * Key features:
 * - Live data preview for selected nodes
 * - Data transformation visualization
 * - Tabular and JSON views
 * - Filtering and searching capabilities
 * - Record count and statistics
 * - Debug mode with detailed execution info
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Import all design system components from the adapter layer
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Chip,
  Alert,
  CircularProgress,
  Table,
  Paper,
  IconButton,
  Divider,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tab,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Collapse,
  Stack,
  Switch,
  FormControlLabel,
  LinearProgress,
  useTheme
} from '../../design-system/adapter';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import ViewListIcon from '@mui/icons-material/ViewList';
import StorageIcon from '@mui/icons-material/Storage';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DownloadIcon from '@mui/icons-material/Download';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BugReportIcon from '@mui/icons-material/BugReport';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Function to format JSON with syntax highlighting (simplified mock)
const JSONFormatter = ({ data }) => {
  // Added display name
  JSONFormatter.displayName = 'JSONFormatter';

  // Added display name
  JSONFormatter.displayName = 'JSONFormatter';

  // Added display name
  JSONFormatter.displayName = 'JSONFormatter';


  // Use our design system theme
  const theme = useTheme();
  
  // In a real implementation, you'd use a library like react-json-view
  return (
    <pre
      style={{
        margin: 0,
        fontSize: '0.85rem',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        color: theme.palette.text.primary,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

/**
 * NodePreview component - Shows data preview for a single node
 */
const NodePreview = ({ nodeId, nodeType, nodeLabel, previewData, onFetchPreview, loading }) => {
  // Added display name
  NodePreview.displayName = 'NodePreview';

  // Added display name
  NodePreview.displayName = 'NodePreview';

  // Added display name
  NodePreview.displayName = 'NodePreview';


  // Use our design system theme
  const theme = useTheme();
  
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [showStats, setShowStats] = useState(false);

  // Prepare columns and data for the table view
  const { columns, rows, stats } = useMemo(() => {
    if (!previewData || !previewData.data || !Array.isArray(previewData.data)) {
      return { columns: [], rows: [], stats: {} };
    }

    // Extract columns from the first row
    const sampleRow = previewData.data[0] || {};
    const extractedColumns = Object.keys(sampleRow).map(key => ({
      id: key,
      label: key,
      type: typeof sampleRow[key],
    }));

    // Filter rows based on search term if provided
    let filteredRows = [...previewData.data];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredRows = filteredRows.filter(row => {
        if (filterColumn === 'all') {
          // Search in all columns
          return Object.values(row).some(value => String(value).toLowerCase().includes(term));
        } else {
          // Search in specific column
          return String(row[filterColumn] || '')
            .toLowerCase()
            .includes(term);
        }
      });
    }

    // Calculate basic stats for each column
    const statsData = {};
    if (previewData.data.length > 0) {
      extractedColumns.forEach(column => {
        const values = previewData.data.map(row => row[column.id]);
        const numericValues = values.filter(v => typeof v === 'number');

        statsData[column.id] = {
          count: values.length,
          nullCount: values.filter(v => v === null || v === undefined).length,
          uniqueCount: new Set(values.map(v => String(v))).size,
          min: numericValues.length > 0 ? Math.min(...numericValues) : null,
          max: numericValues.length > 0 ? Math.max(...numericValues) : null,
          avg:
            numericValues.length > 0
              ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length
              : null,
        };
      });
    }

    return { columns: extractedColumns, rows: filteredRows, stats: statsData };
  }, [previewData, searchTerm, filterColumn]);

  // Handle row expansion
  const toggleRowExpansion = rowIndex => {
    setExpandedRows(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format cell value based on type
  const formatCellValue = value => {
    if (value === null || value === undefined) {
      return (
        <Typography variant="body2" color="text.disabled">
          null
        </Typography>
      );
    }

    if (typeof value === 'object') {
      return (
        <Chip
          label={Array.isArray(value) ? `Array[${value.length}]` : 'Object'}
          size="small"
          variant="outlined"
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value.toString()}
          size="small"
          color={value ? 'success' : 'default'}
          variant="outlined"
        />
      );
    }

    return String(value);
  };

  // Show message when no data is available
  if (!previewData || !previewData.data) {
    return (
      <Box style={{ padding: '16px', textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
        >
          No preview data available for this node.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={() => onFetchPreview(nodeId)}
          disabled={loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? 'Loading...' : 'Generate Preview'}
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
        }}
      >
        <Box>
          <Typography variant="subtitle2">{nodeLabel || nodeType}</Typography>
          <Typography 
            variant="caption" 
            color={theme.palette.text.secondary}
          >
            {previewData.data.length} records
          </Typography>
        </Box>

        <Box>
          <Tooltip title="Table View">
            <Box 
              as="button"
              onClick={() => setViewMode('table')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: viewMode === 'table' 
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 4px',
              }}
            >
              <ViewListIcon style={{ fontSize: '20px' }} />
            </Box>
          </Tooltip>

          <Tooltip title="JSON View">
            <Box 
              as="button"
              onClick={() => setViewMode('json')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: viewMode === 'json' 
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 4px',
              }}
            >
              <CodeIcon style={{ fontSize: '20px' }} />
            </Box>
          </Tooltip>

          <Tooltip title="Statistics">
            <Box 
              as="button"
              onClick={() => setShowStats(!showStats)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: showStats 
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 4px',
              }}
            >
              <AssessmentIcon style={{ fontSize: '20px' }} />
            </Box>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <Box 
              as="button"
              onClick={() => onFetchPreview(nodeId)}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: loading 
                  ? theme.palette.action.disabled
                  : theme.palette.text.secondary,
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 4px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <RefreshIcon style={{ fontSize: '20px' }} />
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and filter toolbar */}
      <Box 
        style={{ 
          padding: '16px',
          borderBottom: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Box style={{ display: 'flex', gap: '8px' }}>
          <TextField
            placeholder="Search..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            startAdornment={<SearchIcon fontSize="small" />}
            endAdornment={searchTerm && (
              <Box 
                as="button"
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <DeleteIcon style={{ fontSize: '16px' }} />
              </Box>
            )}
          />

          <FormControl size="small" style={{ minWidth: '120px' }}>
            <InputLabel>Column</InputLabel>
            <Select
              value={filterColumn}
              label="Column"
              onChange={e => setFilterColumn(e.target.value)}
            >
              <MenuItem value="all">All Columns</MenuItem>
              <Divider />
              {columns.map(column => (
                <MenuItem key={column.id} value={column.id}>
                  {column.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Statistics panel */}
      <Collapse in={showStats}>
        <Box 
          style={{ 
            padding: '16px', 
            borderBottom: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
            Data Statistics
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Column</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Non-Null</TableCell>
                  <TableCell align="right">Unique</TableCell>
                  <TableCell align="right">Min</TableCell>
                  <TableCell align="right">Max</TableCell>
                  <TableCell align="right">Avg</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map(column => (
                  <TableRow key={column.id}>
                    <TableCell component="th" scope="row">
                      <Tooltip title={`Type: ${column.type}`}>
                        <Box>
                          <Typography variant="body2">{column.label}</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">{stats[column.id]?.count || 0}</TableCell>
                    <TableCell align="right">
                      {stats[column.id] ? stats[column.id].count - stats[column.id].nullCount : 0}
                    </TableCell>
                    <TableCell align="right">{stats[column.id]?.uniqueCount || 0}</TableCell>
                    <TableCell align="right">
                      {stats[column.id]?.min !== null ? stats[column.id]?.min : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {stats[column.id]?.max !== null ? stats[column.id]?.max : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {stats[column.id]?.avg !== null ? stats[column.id]?.avg.toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Collapse>

      {/* Loading indicator */}
      {loading && <LinearProgress style={{ width: '100%' }} />}

      {/* Data view - Table or JSON */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        {viewMode === 'table' ? (
          <>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}></TableCell>
                    {columns.map(column => (
                      <TableCell key={column.id}>
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                            {column.label}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={theme.colors?.text?.secondary || theme.palette.text.secondary}
                            style={{ marginLeft: '4px' }}
                          >
                            ({column.type})
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, rowIndex) => {
                      const actualIndex = page * rowsPerPage + rowIndex;
                      const isExpanded = !!expandedRows[actualIndex];

                      return (
                        <React.Fragment key={actualIndex}>
                          <TableRow hover>
                            <TableCell padding="checkbox">
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpansion(actualIndex)}
                              >
                                {isExpanded ? (
                                  <KeyboardArrowDownIcon fontSize="small" />
                                ) : (
                                  <KeyboardArrowRightIcon fontSize="small" />
                                )}
                              </IconButton>
                            </TableCell>

                            {columns.map(column => (
                              <TableCell key={column.id}>
                                {formatCellValue(row[column.id])}
                              </TableCell>
                            ))}
                          </TableRow>

                          {/* Expanded row details */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell />
                              <TableCell colSpan={columns.length}>
                                <Box
                                  style={{
                                    paddingTop: '8px',
                                    paddingBottom: '8px',
                                    backgroundColor: theme.palette.action.hover,
                                    borderRadius: '4px',
                                    paddingLeft: '16px',
                                    paddingRight: '16px',
                                  }}
                                >
                                  <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
                                    Row {actualIndex + 1} Details
                                  </Typography>
                                  <JSONFormatter data={row} />
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={columns.length + 1} 
                        align="center" 
                        style={{ paddingTop: '24px', paddingBottom: '24px' }}
                      >
                        <Typography 
                          variant="body2" 
                          color={theme.palette.text.secondary}
                        >
                          No data found matching your search criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box style={{ padding: '16px' }}>
            <JSONFormatter data={previewData.data} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * Main DataPreviewPanel component
 */
const DataPreviewPanel = ({
  nodes = [],
  edges = [],
  previewData = {},
  onFetchPreview,
  loading = false,
}) => {
  // Added display name
  DataPreviewPanel.displayName = 'DataPreviewPanel';

  // Added display name
  DataPreviewPanel.displayName = 'DataPreviewPanel';

  // Added display name
  DataPreviewPanel.displayName = 'DataPreviewPanel';


  // Use our design system theme
  const theme = useTheme();
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState('node');

  // Set first node as selected by default when nodes change
  useEffect(() => {
    if (nodes.length > 0 && !selectedNodeId) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  // Get selected node details
  const selectedNode = useMemo(() => {
  // Added display name
  selectedNode.displayName = 'selectedNode';

    return nodes.find(node => node.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  // Get preview data for selected node
  const selectedNodePreview = useMemo(() => {
  // Added display name
  selectedNodePreview.displayName = 'selectedNodePreview';

    return previewData[selectedNodeId] || null;
  }, [previewData, selectedNodeId]);

  // Build a node map to show connections
  const nodeMap = useMemo(() => {
  // Added display name
  nodeMap.displayName = 'nodeMap';

    const map = {};

    // Create base map with node info
    nodes.forEach(node => {
      map[node.id] = {
        ...node,
        incoming: [],
        outgoing: [],
      };
    });

    // Add connection info
    edges.forEach(edge => {
      if (map[edge.source]) {
        map[edge.source].outgoing.push({
          edge: edge.id,
          target: edge.target,
        });
      }

      if (map[edge.target]) {
        map[edge.target].incoming.push({
          edge: edge.id,
          source: edge.source,
        });
      }
    });

    return map;
  }, [nodes, edges]);

  // Handle node selection
  const handleNodeSelect = nodeId => {
    setSelectedNodeId(nodeId);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };

  // Render the flow view (simplified for demo)
  const renderFlowView = () => {
  // Added display name
  renderFlowView.displayName = 'renderFlowView';

  // Added display name
  renderFlowView.displayName = 'renderFlowView';

  // Added display name
  renderFlowView.displayName = 'renderFlowView';


    // In a real implementation, this would show a visualization of the entire flow with data
    return (
      <Box style={{ padding: '24px', textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          color={theme.palette.text.secondary}
        >
          Flow data visualization is not implemented in this demo. Select the Node tab to see
          individual node previews.
        </Typography>
      </Box>
    );
  };

  // Render the debug view
  const renderDebugView = () => {
  // Added display name
  renderDebugView.displayName = 'renderDebugView';

  // Added display name
  renderDebugView.displayName = 'renderDebugView';

  // Added display name
  renderDebugView.displayName = 'renderDebugView';


    // In a real implementation, this would show detailed debugging information
    return (
      <Box style={{ padding: '24px', textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          color={theme.palette.text.secondary}
        >
          Debugging tools are not implemented in this demo. Select the Node tab to see individual
          node previews.
        </Typography>
      </Box>
    );
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <Box 
        style={{ 
          borderBottom: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab value="node" label="Node Preview" />
          <Tab value="flow" label="Flow View" />
          <Tab value="debug" label="Debug" />
        </Tabs>
      </Box>

      {/* Node selector */}
      {activeTab === 'node' && (
        <Box 
          style={{ 
            padding: '16px',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel>Select Node</InputLabel>
            <Select
              value={selectedNodeId || ''}
              label="Select Node"
              onChange={e => handleNodeSelect(e.target.value)}
              disabled={nodes.length === 0}
            >
              {nodes.map(node => (
                <MenuItem key={node.id} value={node.id}>
                  {node.data.label || node.type || node.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Show node connections */}
          {selectedNodeId && nodeMap[selectedNodeId] && (
            <Box style={{ marginTop: '16px' }}>
              <Stack direction="row" spacing={1}>
                {nodeMap[selectedNodeId].incoming.length > 0 && (
                  <Chip
                    size="small"
                    icon={<NavigateBeforeIcon />}
                    label={`${nodeMap[selectedNodeId].incoming.length} Inputs`}
                    variant="outlined"
                  />
                )}

                {nodeMap[selectedNodeId].outgoing.length > 0 && (
                  <Chip
                    size="small"
                    icon={<NavigateNextIcon />}
                    label={`${nodeMap[selectedNodeId].outgoing.length} Outputs`}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* Content area */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'node' && selectedNode && (
          <NodePreview
            nodeId={selectedNode.id}
            nodeType={selectedNode.type}
            nodeLabel={selectedNode.data?.label}
            previewData={selectedNodePreview}
            onFetchPreview={onFetchPreview}
            loading={loading}
          />
        )}

        {activeTab === 'flow' && renderFlowView()}

        {activeTab === 'debug' && renderDebugView()}

        {!selectedNode && activeTab === 'node' && (
          <Box style={{ padding: '24px', textAlign: 'center' }}>
            <Typography 
              color={theme.palette.text.secondary}
            >
              Select a node to preview its data.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataPreviewPanel;
