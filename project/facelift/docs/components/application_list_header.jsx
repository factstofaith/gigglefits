import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';

// Styled components
const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  width: '300px',
  '.MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

const ActionRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const ViewToggleButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
}));

/**
 * ApplicationListHeader component
 * 
 * A comprehensive header component for the application list with search,
 * filtering, sorting, and view mode controls.
 */
const ApplicationListHeader = ({
  title = 'Applications',
  searchQuery = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  onRefresh,
  onCreateClick,
  onFilterClick,
  activeFilters = [],
  onClearFilter,
  onClearAllFilters,
  sortOptions = [],
  activeSort = null,
  onSortChange,
  totalCount = 0,
  isAdmin = false,
  refreshing = false,
}) => {
  const theme = useTheme();
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const [actionsAnchorEl, setActionsAnchorEl] = React.useState(null);

  // Handle sort menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (sortId) => {
    onSortChange(sortId);
    handleSortClose();
  };

  // Handle actions menu
  const handleActionsClick = (event) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActionsAnchorEl(null);
  };

  // Function to get the sort direction icon
  const getSortDirectionIcon = () => {
    if (!activeSort) return null;
    
    const sort = sortOptions.find(opt => opt.id === activeSort);
    if (!sort) return null;
    
    return sort.direction === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <HeaderContainer>
      <HeaderRow>
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {totalCount} {totalCount === 1 ? 'application' : 'applications'} available
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateClick}
              sx={{ mr: 1 }}
            >
              Create Application
            </Button>
          )}
          
          <Tooltip title="Refresh applications">
            <IconButton 
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="refresh applications"
              color="default"
            >
              {refreshing ? (
                <RefreshIcon className="rotating-icon" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="More actions">
            <IconButton
              onClick={handleActionsClick}
              aria-label="more actions"
              aria-controls="actions-menu"
              aria-haspopup="true"
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            id="actions-menu"
            anchorEl={actionsAnchorEl}
            keepMounted
            open={Boolean(actionsAnchorEl)}
            onClose={handleActionsClose}
          >
            <MenuItem onClick={handleActionsClose}>
              <SaveAltIcon fontSize="small" sx={{ mr: 1 }} />
              Export List
            </MenuItem>
            <MenuItem onClick={handleActionsClose}>
              <SortIcon fontSize="small" sx={{ mr: 1 }} />
              Advanced Sort
            </MenuItem>
            {activeFilters.length > 0 && (
              <MenuItem onClick={onClearAllFilters}>
                <ClearIcon fontSize="small" sx={{ mr: 1 }} />
                Clear All Filters
              </MenuItem>
            )}
          </Menu>
        </Box>
      </HeaderRow>
      
      <HeaderRow>
        <ActionRow>
          <SearchField
            placeholder="Search applications..."
            value={searchQuery}
            onChange={onSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange({ target: { value: '' } })}
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
          
          <Tooltip title="Filter applications">
            <Badge
              badgeContent={activeFilters.length}
              color="primary"
              invisible={activeFilters.length === 0}
            >
              <IconButton
                onClick={onFilterClick}
                aria-label="filter applications"
              >
                <FilterListIcon />
              </IconButton>
            </Badge>
          </Tooltip>
          
          <Tooltip title="Sort applications">
            <IconButton
              onClick={handleSortClick}
              aria-label="sort applications"
              aria-controls="sort-menu"
              aria-haspopup="true"
              color={activeSort ? 'primary' : 'default'}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            id="sort-menu"
            anchorEl={sortAnchorEl}
            keepMounted
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            {sortOptions.map((option) => (
              <MenuItem 
                key={option.id}
                onClick={() => handleSortSelect(option.id)}
                selected={activeSort === option.id}
              >
                {option.label}
                {activeSort === option.id && getSortDirectionIcon()}
              </MenuItem>
            ))}
          </Menu>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Tooltip title="Grid view">
            <ViewToggleButton 
              active={viewMode === 'grid' ? 1 : 0}
              onClick={() => onViewModeChange('grid')}
              aria-label="grid view"
            >
              <ViewModuleIcon />
            </ViewToggleButton>
          </Tooltip>
          
          <Tooltip title="List view">
            <ViewToggleButton 
              active={viewMode === 'list' ? 1 : 0}
              onClick={() => onViewModeChange('list')}
              aria-label="list view"
            >
              <ViewListIcon />
            </ViewToggleButton>
          </Tooltip>
        </ActionRow>
        
        <Box>
          {activeSort && (
            <Typography variant="body2" color="text.secondary">
              Sorted by: {sortOptions.find(opt => opt.id === activeSort)?.label}
              {' '}
              {sortOptions.find(opt => opt.id === activeSort)?.direction === 'asc' ? 'ascending' : 'descending'}
            </Typography>
          )}
        </Box>
      </HeaderRow>
      
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Active filters:
          </Typography>
          
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={`${filter.label}: ${filter.value}`}
              onDelete={() => onClearFilter(filter.id)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          
          <FilterChip
            label="Clear all"
            onClick={onClearAllFilters}
            size="small"
            color="default"
            variant="outlined"
            deleteIcon={<ClearIcon />}
            onDelete={onClearAllFilters}
          />
        </Box>
      )}
    </HeaderContainer>
  );
};

ApplicationListHeader.propTypes = {
  /**
   * Title for the applications section
   */
  title: PropTypes.string,
  
  /**
   * Current search query
   */
  searchQuery: PropTypes.string,
  
  /**
   * Callback function when search query changes
   */
  onSearchChange: PropTypes.func.isRequired,
  
  /**
   * Current view mode ('grid' or 'list')
   */
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  
  /**
   * Callback function when view mode changes
   */
  onViewModeChange: PropTypes.func.isRequired,
  
  /**
   * Callback function to refresh applications
   */
  onRefresh: PropTypes.func.isRequired,
  
  /**
   * Callback function to create a new application
   */
  onCreateClick: PropTypes.func.isRequired,
  
  /**
   * Callback function to open filter panel
   */
  onFilterClick: PropTypes.func.isRequired,
  
  /**
   * Array of active filters
   */
  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Callback function to clear a specific filter
   */
  onClearFilter: PropTypes.func.isRequired,
  
  /**
   * Callback function to clear all filters
   */
  onClearAllFilters: PropTypes.func.isRequired,
  
  /**
   * Available sort options
   */
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      direction: PropTypes.oneOf(['asc', 'desc']).isRequired,
    })
  ),
  
  /**
   * ID of the active sort option
   */
  activeSort: PropTypes.string,
  
  /**
   * Callback function when sort option changes
   */
  onSortChange: PropTypes.func.isRequired,
  
  /**
   * Total count of applications
   */
  totalCount: PropTypes.number,
  
  /**
   * Whether the current user has admin permissions
   */
  isAdmin: PropTypes.bool,
  
  /**
   * Whether applications are currently refreshing
   */
  refreshing: PropTypes.bool,
};

export default ApplicationListHeader;