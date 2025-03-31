/**
 * @component EnhancedNodePalette
 * @description A comprehensive node palette for the flow canvas that organizes node types into categories,
 * provides quick search, filtering, and favorites with optimized rendering for performance.
 *
 * Features:
 * - Categorized display of node types
 * - Searchable node repository
 * - Favorite/recent nodes section
 * - Drag-and-drop support with preview
 * - List and grid view options
 * - Admin-only node types
 *
 * @param {Object} props - Component props
 * @param {Object} props.components - Available component definitions by category
 * @param {Function} props.onDragStart - Function to call when drag starts
 * @param {Function} props.onNodeSelect - Function to call when a node is selected
 * @param {boolean} [props.isAdmin=false] - Whether the user has admin privileges
 * @param {string} [props.viewMode="grid"] - View mode (grid or list)
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Paper,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Card,
  CardContent,
  Badge,
  Switch,
  FormControlLabel,
  Collapse,
  Button,
  useTheme,
} from '../../design-system/adapter';

// Import icons from Material UI
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TuneIcon from '@mui/icons-material/Tune';
import DatasetIcon from '@mui/icons-material/Dataset';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ApiIcon from '@mui/icons-material/Api';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import WebhookIcon from '@mui/icons-material/Webhook';
import SchemaIcon from '@mui/icons-material/Schema';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';

// Component mapping for different node types
const componentIcons = {
  source: StorageIcon,
  api: ApiIcon,
  file: CloudUploadIcon,
  database: StorageIcon,
  transform: TuneIcon,
  filter: FilterAltIcon,
  map: CompareArrowsIcon,
  join: MergeTypeIcon,
  dataset: DatasetIcon,
  trigger: PlayCircleFilledIcon,
  router: CallSplitIcon,
  action: NotificationsIcon,
  webhook: WebhookIcon,
  condition: CallSplitIcon,
  destination: CloudUploadIcon,
};

// Category colors
const categoryColors = {
  sources: '#2E7EED',
  destinations: '#27AE60',
  transforms: '#F2994A',
  datasets: '#9B51E0',
  triggers: '#EB5757',
  routers: '#BB6BD9',
  actions: '#F2C94C',
};

// Mock favorites storage
const getFavorites = () => {
  // Added display name
  getFavorites.displayName = 'getFavorites';

  // Added display name
  getFavorites.displayName = 'getFavorites';

  try {
    return JSON.parse(localStorage.getItem('flow-node-favorites') || '[]');
  } catch {
    return [];
  }
};

const saveFavorites = favorites => {
  localStorage.setItem('flow-node-favorites', JSON.stringify(favorites));
};

// Mock recently used nodes
const getRecentlyUsed = () => {
  // Added display name
  getRecentlyUsed.displayName = 'getRecentlyUsed';

  // Added display name
  getRecentlyUsed.displayName = 'getRecentlyUsed';

  try {
    return JSON.parse(localStorage.getItem('flow-recent-nodes') || '[]');
  } catch {
    return [];
  }
};

const saveRecentlyUsed = nodes => {
  localStorage.setItem('flow-recent-nodes', JSON.stringify(nodes));
};

const addToRecentlyUsed = node => {
  const recent = getRecentlyUsed();
  const newRecent = [
    { ...node, timestamp: Date.now() },
    ...recent.filter(n => n.type !== node.type).slice(0, 4),
  ];
  saveRecentlyUsed(newRecent);
};

const EnhancedNodePalette = ({
  components,
  onDragStart,
  onNodeSelect,
  isAdmin = false,
  viewMode = 'grid',
}) => {
  // Added display name
  EnhancedNodePalette.displayName = 'EnhancedNodePalette';

  // Added display name
  EnhancedNodePalette.displayName = 'EnhancedNodePalette';

  // Move all useTheme calls to the top level
  const theme = useTheme();
  const errorColor = theme.palette.error.main;
  const infoColor = theme.palette.info.main;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAdminNodes, setShowAdminNodes] = useState(true);
  const [displayMode, setDisplayMode] = useState(viewMode);
  const [favorites, setFavorites] = useState(getFavorites());
  const [recentlyUsed, setRecentlyUsed] = useState(getRecentlyUsed());

  // Pre-calculate expanded state for all categories
  const initializeExpandedCategories = useCallback(() => {
    const expanded = {};
    Object.keys(components).forEach(category => {
      expanded[category] = true;
    });
    setExpandedCategories(expanded);
  }, [components]);

  // Initialize expanded categories
  React.useEffect(() => {
    initializeExpandedCategories();
  }, [initializeExpandedCategories]);

  // Filter components based on search query and admin status
  const filteredComponents = useMemo(() => {
    if (!searchQuery && !showAdminNodes) {
      // Just filter by admin status
      return Object.keys(components).reduce((acc, category) => {
        acc[category] = components[category].filter(component => !component.adminOnly || isAdmin);
        return acc;
      }, {});
    }

    if (!searchQuery && showAdminNodes) {
      // No filtering needed
      return components;
    }

    const query = searchQuery.toLowerCase();
    return Object.keys(components).reduce((acc, category) => {
      acc[category] = components[category].filter(
        component =>
          // Filter by search
          (component.label.toLowerCase().includes(query) ||
            component.description?.toLowerCase().includes(query) ||
            component.type.toLowerCase().includes(query) ||
            component.keywords?.some(keyword => keyword.toLowerCase().includes(query))) &&
          // Filter by admin status
          (!component.adminOnly || (component.adminOnly && showAdminNodes && isAdmin))
      );
      return acc;
    }, {});
  }, [components, searchQuery, showAdminNodes, isAdmin]);

  // Toggle favorite status of a node
  const toggleFavorite = useCallback(
    node => {
      const newFavorites = favorites.some(fav => fav.type === node.type)
        ? favorites.filter(fav => fav.type !== node.type)
        : [...favorites, node];

      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    },
    [favorites]
  );

  // Check if a node is a favorite
  const isFavorite = useCallback(
    node => {
      return favorites.some(fav => fav.type === node.type);
    },
    [favorites]
  );

  // Handle node selection
  const handleNodeSelect = useCallback(
    node => {
      addToRecentlyUsed(node);
      setRecentlyUsed(getRecentlyUsed());
      onNodeSelect(node);
    },
    [onNodeSelect]
  );

  // Toggle category expansion
  const toggleCategory = useCallback(category => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback(
    event => {
      setSearchQuery(event.target.value);

      // Expand all categories when searching
      if (event.target.value) {
        const expanded = {};
        Object.keys(components).forEach(category => {
          expanded[category] = true;
        });
        setExpandedCategories(expanded);
      }
    },
    [components]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Render a node in grid view
  const renderGridNode = useCallback(
    (component, category) => {
      // Use theme from component scope, don't call useTheme here
      const Icon = componentIcons[component.type] || StorageIcon;
      const color = categoryColors[category] || '#888';
      const isNodeFavorite = isFavorite(component);

      return (
        <Grid item xs={6} key={component.type}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: 'grab',
              borderLeft: `3px solid ${color}`,
              transition: 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: 3,
                '& .drag-handle': {
                  opacity: 1,
                },
              },
            }}
            draggable
            onDragStart={event => onDragStart(event, component.type, component)}
            onClick={() => handleNodeSelect(component)}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 1,
                opacity: isNodeFavorite ? 1 : 0,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  toggleFavorite(component);
                }}
              >
                {isNodeFavorite ? (
                  <FavoriteIcon fontSize="small" color="error" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Box>

            {component.adminOnly && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  zIndex: 1,
                }}
              >
                <Tooltip title="Admin only">
                  <LockIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            )}

            <Box
              className="drag-handle"
              sx={{
                opacity: 0,
                position: 'absolute',
                bottom: 4,
                right: 4,
                zIndex: 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 1, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: `${color}1A`, // 10% opacity in hex
                    color: color,
                    width: 32,
                    height: 32,
                    mr: 1,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                  {component.label}
                </Typography>
              </Box>

              {component.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                  sx={{
                    height: 32,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {component.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    },
    [onDragStart, handleNodeSelect, isFavorite, toggleFavorite, theme] // Add theme dependency
  );

  // Render a node in list view
  const renderListNode = useCallback(
    (component, category) => {
      // Use theme from component scope
      const Icon = componentIcons[component.type] || StorageIcon;
      const color = categoryColors[category] || '#888';
      const isNodeFavorite = isFavorite(component);

      return (
        <ListItem
          key={component.type}
          button
          dense
          draggable
          onDragStart={event => onDragStart(event, component.type, component)}
          onClick={() => handleNodeSelect(component)}
          sx={{
            borderLeft: `3px solid ${color}`,
            mb: 0.5,
            borderRadius: 1,
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: 1,
              '& .drag-handle': {
                visibility: 'visible',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: `${color}1A`, // 10% opacity in hex
                color: color,
                width: 28,
                height: 28,
              }}
            >
              <Icon fontSize="small" />
            </Box>
          </ListItemIcon>

          <ListItemText
            primary={component.label}
            secondary={component.adminOnly ? 'Admin only' : null}
            primaryTypographyProps={{ variant: 'body2' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />

          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              size="small"
              onClick={e => {
                e.stopPropagation();
                toggleFavorite(component);
              }}
            >
              {isNodeFavorite ? (
                <FavoriteIcon fontSize="small" color="error" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>

            <Box 
              component="span" 
              className="drag-handle" 
              sx={{ 
                visibility: 'hidden', 
                marginLeft: 1,
                transition: 'visibility 0.2s ease',
              }}
            >
              <DragIndicatorIcon fontSize="small" color="action" />
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      );
    },
    [onDragStart, handleNodeSelect, isFavorite, toggleFavorite, theme] // Add theme dependency
  );

  // Render a category of nodes
  const renderCategory = useCallback(
    (category, components) => {
      if (components.length === 0) return null;

      // Use theme from component scope
      const color = categoryColors[category] || '#888';
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const isExpanded = expandedCategories[category] || false;

      return (
        <Box key={category} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}0D`, // 5% opacity in hex
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: `${color}1A`, // 10% opacity in hex
              },
            }}
            onClick={() => toggleCategory(category)}
          >
            <Box
              sx={{
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}33`, // 20% opacity in hex
                mr: 1,
              }}
            >
              <Typography variant="caption" fontWeight="bold" sx={{ color }}>
                {components.length}
              </Typography>
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                color,
                flexGrow: 1,
              }}
            >
              {categoryName}
            </Typography>

            <IconButton
              size="small"
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease',
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Box sx={{ mt: 1 }}>
              {displayMode === 'grid' ? (
                <Grid container spacing={1}>
                  {components.map(component => renderGridNode(component, category))}
                </Grid>
              ) : (
                <List dense>
                  {components.map(component => renderListNode(component, category))}
                </List>
              )}
            </Box>
          </Collapse>
        </Box>
      );
    },
    [expandedCategories, toggleCategory, displayMode, renderGridNode, renderListNode, theme] // Add theme dependency
  );

  // Render favorites section
  const renderFavorites = useCallback(() => {
    if (favorites.length === 0) return null;

    // Use errorColor from component scope instead of calling useTheme
    const isExpanded = expandedCategories['favorites'] ?? true;

    return (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            bgcolor: `${errorColor}0D`, // 5% opacity
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              bgcolor: `${errorColor}1A`, // 10% opacity
            },
          }}
          onClick={() => toggleCategory('favorites')}
        >
          <FavoriteIcon color="error" sx={{ mr: 1 }} fontSize="small" />

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              color: errorColor,
              flexGrow: 1,
            }}
          >
            Favorites
          </Typography>

          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1 }}>
            {displayMode === 'grid' ? (
              <Grid container spacing={1}>
                {favorites.map(component => {
                  // Determine which category this favorite belongs to
                  let category = '';
                  for (const [cat, comps] of Object.entries(components)) {
                    if (comps.some(c => c.type === component.type)) {
                      category = cat;
                      break;
                    }
                  }
                  return renderGridNode(component, category);
                })}
              </Grid>
            ) : (
              <List dense>
                {favorites.map(component => {
                  // Determine which category this favorite belongs to
                  let category = '';
                  for (const [cat, comps] of Object.entries(components)) {
                    if (comps.some(c => c.type === component.type)) {
                      category = cat;
                      break;
                    }
                  }
                  return renderListNode(component, category);
                })}
              </List>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }, [
    favorites,
    expandedCategories,
    toggleCategory,
    displayMode,
    renderGridNode,
    renderListNode,
    components,
    errorColor, // Add errorColor dependency
  ]);

  // Render recently used section
  const renderRecentlyUsed = useCallback(() => {
    if (recentlyUsed.length === 0) return null;

    // Use infoColor from component scope
    const isExpanded = expandedCategories['recent'] ?? true;

    return (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            bgcolor: `${infoColor}0D`, // 5% opacity
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              bgcolor: `${infoColor}1A`, // 10% opacity
            },
          }}
          onClick={() => toggleCategory('recent')}
        >
          <AccessTimeIcon color="info" sx={{ mr: 1 }} fontSize="small" />

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              color: infoColor,
              flexGrow: 1,
            }}
          >
            Recently Used
          </Typography>

          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1 }}>
            {displayMode === 'grid' ? (
              <Grid container spacing={1}>
                {recentlyUsed.map(component => {
                  // Determine which category this recent node belongs to
                  let category = '';
                  for (const [cat, comps] of Object.entries(components)) {
                    if (comps.some(c => c.type === component.type)) {
                      category = cat;
                      break;
                    }
                  }
                  return renderGridNode(component, category);
                })}
              </Grid>
            ) : (
              <List dense>
                {recentlyUsed.map(component => {
                  // Determine which category this recent node belongs to
                  let category = '';
                  for (const [cat, comps] of Object.entries(components)) {
                    if (comps.some(c => c.type === component.type)) {
                      category = cat;
                      break;
                    }
                  }
                  return renderListNode(component, category);
                })}
              </List>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }, [
    recentlyUsed,
    expandedCategories,
    toggleCategory,
    displayMode,
    renderGridNode,
    renderListNode,
    components,
    infoColor, // Add infoColor dependency
  ]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search and view controls */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Tooltip title="List View">
              <IconButton
                size="small"
                color={displayMode === 'list' ? 'primary' : 'default'}
                onClick={() => setDisplayMode('list')}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Grid View">
              <IconButton
                size="small"
                color={displayMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setDisplayMode('grid')}
              >
                <ViewModuleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {isAdmin && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showAdminNodes}
                  onChange={e => setShowAdminNodes(e.target.checked)}
                />
              }
              label={<Typography variant="caption">Show Admin</Typography>}
              labelPlacement="start"
            />
          )}
        </Box>
      </Box>

      {/* Node categories */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Favorites section */}
        {renderFavorites()}

        {/* Recently used section */}
        {renderRecentlyUsed()}

        {/* Divider between favorites/recent and categories */}
        {(favorites.length > 0 || recentlyUsed.length > 0) && <Divider sx={{ my: 2 }} />}

        {/* Node categories */}
        {Object.keys(filteredComponents).map(category =>
          renderCategory(category, filteredComponents[category])
        )}

        {/* Empty state */}
        {Object.values(filteredComponents).every(arr => arr.length === 0) && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No nodes match your search
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

EnhancedNodePalette.propTypes = {
  components: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  viewMode: PropTypes.oneOf(['grid', 'list'])
};

export default React.memo(EnhancedNodePalette);