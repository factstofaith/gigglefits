import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Node Panel
                                                                                      *
                                                                                      * A panel component that displays available node types for the flow canvas.
                                                                                      * Users can drag nodes from this panel onto the canvas.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Chip } from '@mui/material';
import {
// Node type icons
Storage as StorageIcon, CloudUpload as CloudUploadIcon, Transform as TransformIcon, FilterAlt as FilterIcon,
// UI icons
ExpandMore as ExpandMoreIcon, Search as SearchIcon, Refresh as RefreshIcon, Info as InfoIcon,
// Source node icons
CloudDownload as CloudDownloadIcon, Storage as DatabaseIcon,
// Using Storage icon as a replacement for Database icon
Api as ApiIcon,
// Transform node icons
SwapHoriz as SwapHorizIcon, Functions as FunctionsIcon, Code as CodeIcon, AutoAwesome as AutoAwesomeIcon,
// Filter node icons
Rule as RuleIcon, FilterList as FilterListIcon, FindReplace as FindReplaceIcon } from '@mui/icons-material';

/**
 * Node definition with metadata
 * 
 * @typedef {Object} NodeDefinition
 * @property {string} id - Unique node identifier
 * @property {string} type - Node type (matches react-flow type)
 * @property {string} label - Display label for the node
 * @property {Function} icon - Icon component to display
 * @property {string} category - Category this node belongs to
 * @property {Array<string>} [permissions] - Required permissions to use this node
 * @property {string} [description] - Description of what the node does
 */

/**
 * All available node definitions
 */
const NODE_DEFINITIONS = [
// Source nodes
{
  id: 'sourceNode',
  type: 'sourceNode',
  label: 'Data Source',
  icon: StorageIcon,
  category: 'sources',
  description: 'Starting point for data flow'
}, {
  id: 's3SourceNode',
  type: 'sourceNode',
  data: {
    sourceType: 'S3'
  },
  label: 'S3 Source',
  icon: CloudDownloadIcon,
  category: 'sources',
  description: 'Import data from Amazon S3'
}, {
  id: 'azureBlobSourceNode',
  type: 'sourceNode',
  data: {
    sourceType: 'AZURE_BLOB'
  },
  label: 'Azure Blob Source',
  icon: CloudDownloadIcon,
  category: 'sources',
  description: 'Import data from Azure Blob Storage'
}, {
  id: 'sharepointSourceNode',
  type: 'sourceNode',
  data: {
    sourceType: 'SHAREPOINT'
  },
  label: 'SharePoint Source',
  icon: CloudDownloadIcon,
  category: 'sources',
  description: 'Import data from SharePoint'
}, {
  id: 'apiSourceNode',
  type: 'sourceNode',
  data: {
    sourceType: 'API'
  },
  label: 'API Source',
  icon: ApiIcon,
  category: 'sources',
  description: 'Import data from external API'
}, {
  id: 'databaseSourceNode',
  type: 'sourceNode',
  data: {
    sourceType: 'DATABASE'
  },
  label: 'Database Source',
  icon: DatabaseIcon,
  category: 'sources',
  description: 'Import data from database',
  permissions: ['database.read']
},
// Destination nodes
{
  id: 'destinationNode',
  type: 'destinationNode',
  label: 'Data Destination',
  icon: CloudUploadIcon,
  category: 'destinations',
  description: 'Endpoint for data flow'
}, {
  id: 's3DestinationNode',
  type: 'destinationNode',
  data: {
    destinationType: 'S3'
  },
  label: 'S3 Destination',
  icon: CloudUploadIcon,
  category: 'destinations',
  description: 'Export data to Amazon S3'
}, {
  id: 'azureBlobDestinationNode',
  type: 'destinationNode',
  data: {
    destinationType: 'AZURE_BLOB'
  },
  label: 'Azure Blob Destination',
  icon: CloudUploadIcon,
  category: 'destinations',
  description: 'Export data to Azure Blob Storage'
}, {
  id: 'sharepointDestinationNode',
  type: 'destinationNode',
  data: {
    destinationType: 'SHAREPOINT'
  },
  label: 'SharePoint Destination',
  icon: CloudUploadIcon,
  category: 'destinations',
  description: 'Export data to SharePoint'
}, {
  id: 'apiDestinationNode',
  type: 'destinationNode',
  data: {
    destinationType: 'API'
  },
  label: 'API Destination',
  icon: ApiIcon,
  category: 'destinations',
  description: 'Export data to external API'
}, {
  id: 'databaseDestinationNode',
  type: 'destinationNode',
  data: {
    destinationType: 'DATABASE'
  },
  label: 'Database Destination',
  icon: DatabaseIcon,
  category: 'destinations',
  description: 'Export data to database',
  permissions: ['database.write']
},
// Transformation nodes
{
  id: 'transformationNode',
  type: 'transformationNode',
  label: 'Transformation',
  icon: TransformIcon,
  category: 'transformations',
  description: 'Transform data passing through'
}, {
  id: 'mappingTransformationNode',
  type: 'transformationNode',
  data: {
    transformationType: 'MAPPING'
  },
  label: 'Field Mapping',
  icon: SwapHorizIcon,
  category: 'transformations',
  description: 'Map fields from source to destination'
}, {
  id: 'formulaTransformationNode',
  type: 'transformationNode',
  data: {
    transformationType: 'FORMULA'
  },
  label: 'Formula Transform',
  icon: FunctionsIcon,
  category: 'transformations',
  description: 'Apply formulas to transform data'
}, {
  id: 'scriptTransformationNode',
  type: 'transformationNode',
  data: {
    transformationType: 'SCRIPT'
  },
  label: 'Script Transform',
  icon: CodeIcon,
  category: 'transformations',
  description: 'Use custom script to transform data',
  permissions: ['script.execute']
}, {
  id: 'aiTransformationNode',
  type: 'transformationNode',
  data: {
    transformationType: 'AI'
  },
  label: 'AI Transform',
  icon: AutoAwesomeIcon,
  category: 'transformations',
  description: 'Use AI to enhance or analyze data',
  permissions: ['ai.access']
},
// Filter nodes
{
  id: 'filterNode',
  type: 'filterNode',
  label: 'Filter',
  icon: FilterIcon,
  category: 'filters',
  description: 'Filter data based on conditions'
}, {
  id: 'conditionFilterNode',
  type: 'filterNode',
  data: {
    filterType: 'CONDITION'
  },
  label: 'Condition Filter',
  icon: RuleIcon,
  category: 'filters',
  description: 'Filter data based on conditions'
}, {
  id: 'validationFilterNode',
  type: 'filterNode',
  data: {
    filterType: 'VALIDATION'
  },
  label: 'Validation Filter',
  icon: FilterIcon,
  category: 'filters',
  description: 'Validate data against rules'
}, {
  id: 'searchReplaceFilterNode',
  type: 'filterNode',
  data: {
    filterType: 'SEARCH_REPLACE'
  },
  label: 'Search & Replace',
  icon: FindReplaceIcon,
  category: 'filters',
  description: 'Find and replace values in data'
}, {
  id: 'listFilterNode',
  type: 'filterNode',
  data: {
    filterType: 'LIST_FILTER'
  },
  label: 'List Filter',
  icon: FilterListIcon,
  category: 'filters',
  description: 'Filter data using lists'
}];

// Predefined categories and their display order
const CATEGORIES = [{
  id: 'sources',
  label: 'Data Sources',
  icon: StorageIcon,
  defaultExpanded: true
}, {
  id: 'destinations',
  label: 'Data Destinations',
  icon: CloudUploadIcon,
  defaultExpanded: true
}, {
  id: 'transformations',
  label: 'Transformations',
  icon: TransformIcon,
  defaultExpanded: false
}, {
  id: 'filters',
  label: 'Filters',
  icon: FilterIcon,
  defaultExpanded: false
}];

/**
 * Node Panel component
 * 
 * @param {Object} props - Component props
 * @param {Array<string>} props.userPermissions - User permissions for showing/hiding nodes
 * @param {Function} props.onRefresh - Callback when the refresh button is clicked
 * @returns {JSX.Element} The NodePanel component
 */
const NodePanel = memo(({
  userPermissions = [],
  onRefresh
}) => {
  /**
   * Check if user has permission to use a node
   * @param {NodeDefinition} node - The node definition to check
   * @returns {boolean} Whether the user has permission
   */
  const hasPermission = useCallback(node => {
    // If node doesn't require permissions, allow access
    if (!node.permissions || node.permissions.length === 0) {
      return true;
    }

    // Check if user has any of the required permissions
    return node.permissions.some(permission => userPermissions.includes(permission));
  }, [userPermissions]);

  /**
   * Handle dragging a node from the panel
   * @param {Event} event - The drag event
   * @param {NodeDefinition} node - The node being dragged
   */
  const onDragStart = useCallback((event, node) => {
    // Set the transfer data to the node type
    event.dataTransfer.setData('application/reactflow/type', node.type);

    // If node has custom data, include it
    if (node.data) {
      event.dataTransfer.setData('application/reactflow/data', JSON.stringify(node.data));
    }

    // Set the drag image
    event.dataTransfer.effectAllowed = 'move';
  }, []);
  return <Paper elevation={2} sx={{
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}>

      {/* Panel header */}
      <Box sx={{
      p: 1,
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      display: 'flex',
      alignItems: 'center'
    }}>
        <Typography variant="subtitle1" sx={{
        flexGrow: 1
      }}>
          Flow Nodes
        </Typography>
        
        <Tooltip title="Refresh Available Nodes">
          <IconButton size="small" onClick={onRefresh} sx={{
          color: 'inherit'
        }}>

            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Search input (placeholder for future implementation) */}
      <Box sx={{
      p: 1,
      display: 'flex',
      alignItems: 'center'
    }}>
        <SearchIcon sx={{
        mr: 1,
        color: 'text.secondary'
      }} />
        <Typography variant="body2" color="text.secondary">
          Search nodes...
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Node categories */}
      <Box sx={{
      flexGrow: 1,
      overflow: 'auto',
      p: 1
    }}>
        {CATEGORIES.map(category => {
        // Filter nodes by category and permission
        const categoryNodes = NODE_DEFINITIONS.filter(node => node.category === category.id && hasPermission(node));

        // Skip empty categories
        if (categoryNodes.length === 0) {
          return null;
        }
        return <Accordion key={category.id} defaultExpanded={category.defaultExpanded} disableGutters sx={{
          mb: 1
        }}>

              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{
              display: 'flex',
              alignItems: 'center'
            }}>
                  <category.icon sx={{
                mr: 1
              }} />
                  <Typography>{category.label}</Typography>
                  <Chip label={categoryNodes.length} size="small" sx={{
                ml: 1
              }} color="primary" />

                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{
            p: 0
          }}>
                <List dense disablePadding>
                  {categoryNodes.map(node => {
                const NodeIcon = node.icon;
                return <ListItem key={node.id} draggable onDragStart={event => onDragStart(event, node)} sx={{
                  cursor: 'grab',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  borderLeft: '3px solid',
                  borderLeftColor: node.category === 'sources' ? 'success.main' : node.category === 'destinations' ? 'info.main' : node.category === 'transformations' ? 'warning.main' : 'secondary.main'
                }}>

                        <ListItemIcon>
                          <NodeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={node.label} />

                        {node.description && <Tooltip title={node.description}>
                            <InfoIcon fontSize="small" color="action" />
                          </Tooltip>}

                      </ListItem>;
              })}
                </List>
              </AccordionDetails>
            </Accordion>;
      })}
      </Box>
      
      {/* Panel footer */}
      <Box sx={{
      p: 1,
      borderTop: 1,
      borderColor: 'divider'
    }}>
        <Typography variant="caption" color="text.secondary">
          Drag and drop nodes onto the canvas
        </Typography>
      </Box>
    </Paper>;
});
NodePanel.propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  onRefresh: PropTypes.func
};
export default withErrorBoundary(NodePanel, {
  boundary: 'NodePanel'
});