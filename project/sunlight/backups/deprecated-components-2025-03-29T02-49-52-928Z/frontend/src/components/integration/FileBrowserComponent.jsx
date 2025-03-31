import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, CircularProgress, Button, List, ListItem, ListItemIcon, ListItemText, Breadcrumbs, TextField, InputAdornment, Divider, Tooltip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '../../design-system';
;;
import {
  Folder as FolderIcon,
  Description as FileIcon,
  Search as SearchIcon,
  ArrowUpward as UpIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  CloudDownload as DownloadIcon,
  Info as InfoIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  CreateNewFolder as NewFolderIcon,
  Link as LinkIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled, alpha } from '../../design-system';
import { IconButton } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
// Map of file extensions to icon colors for visual cues
const FILE_TYPE_COLORS = {
  // Data files
  csv: '#4caf50',    // green
  json: '#ff9800',   // orange
  xml: '#9c27b0',    // purple
  xlsx: '#2196f3',   // blue
  xls: '#2196f3',    // blue
  parquet: '#795548', // brown
  avro: '#607d8b',   // blue-grey
  
  // Text files
  txt: '#9e9e9e',    // grey
  log: '#9e9e9e',    // grey
  md: '#9e9e9e',     // grey
  
  // Images
  jpg: '#f44336',    // red
  jpeg: '#f44336',   // red
  png: '#f44336',    // red
  gif: '#f44336',    // red
  
  // Default
  default: '#757575' // grey
};

// Styled components
const BrowserContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden`,
  border: `1px solid ${theme.palette.divider}`
}));

const BrowserHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: `flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const BrowserToolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.05)
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  maxWidth: `300px',
  flex: 1
}));

const BrowserContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(0),
  backgroundColor: alpha(theme.palette.background.paper, 0.5)
}));

const StyledListItem = styled(ListItem)(({ theme, isFile, isSelected }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  },
  ...(isSelected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    '&:hover`: {
      backgroundColor: alpha(theme.palette.primary.main, 0.25)
    }
  })
}));

const BrowserFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: `flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const FileIcon2 = styled(FileIcon)(({ color }) => ({
  color: color || FILE_TYPE_COLORS.default
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column'
});

const EmptyStateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column',
  padding: 24
});

/**
 * Component for browsing files and folders in storage platforms (S3, Azure, SharePoint)
 * Supports navigation, search, selection, and basic actions
 */
const FileBrowserComponent = ({
  storageType = 's3',
  containerName = '',
  credentials = {},
  onSelect,
  initialPath = '/',
  allowMultiSelect = false,
  showPreview = true,
  height = 400,
  mode = 'browser' // browser, selector
}) => {
  // Added display name
  FileBrowserComponent.displayName = 'FileBrowserComponent';

  // Added display name
  FileBrowserComponent.displayName = 'FileBrowserComponent';

  // Added display name
  FileBrowserComponent.displayName = 'FileBrowserComponent';

  // Added display name
  FileBrowserComponent.displayName = 'FileBrowserComponent';

  // Added display name
  FileBrowserComponent.displayName = 'FileBrowserComponent';


  // State for current path and content
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [fileMetadata, setFileMetadata] = useState(null);

  // State for dropdown menus
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [itemMenuAnchor, setItemMenuAnchor] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);

  // State for filters
  const [fileFilter, setFileFilter] = useState('all'); // all, folder, file, or specific extension

  // Mock function to load contents - this would call API in real implementation
  const loadContents = useCallback((path) => {
  // Added display name
  loadContents.displayName = 'loadContents';

    setLoading(true);
    setError(null);
    
    // Simulating API call with setTimeout
    setTimeout(() => {
      try {
        // This is mock data - in a real implementation, this would come from the backend
        // Different mock data based on the storage type
        let mockContents = [];
        
        // AWS S3 mock data
        if (storageType === 's3') {
          if (path === '/' || path === '') {
            mockContents = [
              { type: 'folder', name: 'data', path: '/data', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'reports', path: '/reports', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'configs', path: '/configs', lastModified: new Date().toISOString(), size: 0 },
              { type: 'file', name: 'README.txt', path: '/README.txt', lastModified: new Date().toISOString(), size: 1024, extension: 'txt' }
            ];
          } else if (path === '/data') {
            mockContents = [
              { type: 'folder', name: 'sales', path: '/data/sales', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'inventory', path: '/data/inventory', lastModified: new Date().toISOString(), size: 0 },
              { type: 'file', name: 'customers.csv', path: '/data/customers.csv', lastModified: new Date().toISOString(), size: 25600, extension: 'csv' },
              { type: 'file', name: 'products.json', path: '/data/products.json', lastModified: new Date().toISOString(), size: 18400, extension: 'json' }
            ];
          } else if (path === '/reports') {
            mockContents = [
              { type: 'file', name: 'sales_2024.xlsx', path: '/reports/sales_2024.xlsx', lastModified: new Date().toISOString(), size: 52000, extension: 'xlsx' },
              { type: 'file', name: 'monthly_summary.csv', path: '/reports/monthly_summary.csv', lastModified: new Date().toISOString(), size: 35000, extension: 'csv' },
              { type: 'file', name: 'quarterly_report.pdf', path: '/reports/quarterly_report.pdf', lastModified: new Date().toISOString(), size: 240000, extension: 'pdf' }
            ];
          }
          // Add more mock paths as needed
        }
        // Azure Blob Storage mock data
        else if (storageType === 'azure') {
          if (path === '/' || path === '') {
            mockContents = [
              { type: 'folder', name: 'exports', path: '/exports', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'imports', path: '/imports', lastModified: new Date().toISOString(), size: 0 },
              { type: 'file', name: 'settings.json', path: '/settings.json', lastModified: new Date().toISOString(), size: 2048, extension: 'json' }
            ];
          } else if (path === '/exports') {
            mockContents = [
              { type: 'file', name: 'export_01.csv', path: '/exports/export_01.csv', lastModified: new Date().toISOString(), size: 15000, extension: 'csv' },
              { type: 'file', name: 'export_02.csv', path: '/exports/export_02.csv', lastModified: new Date().toISOString(), size: 18000, extension: 'csv' },
              { type: 'file', name: 'schema.xml', path: '/exports/schema.xml', lastModified: new Date().toISOString(), size: 5000, extension: 'xml' }
            ];
          }
          // Add more mock paths as needed
        }
        // SharePoint mock data
        else if (storageType === 'sharepoint') {
          if (path === '/' || path === '') {
            mockContents = [
              { type: 'folder', name: 'Documents', path: '/Documents', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'Templates', path: '/Templates', lastModified: new Date().toISOString(), size: 0 },
              { type: 'folder', name: 'Shared', path: '/Shared', lastModified: new Date().toISOString(), size: 0 }
            ];
          } else if (path === '/Documents') {
            mockContents = [
              { type: 'file', name: 'Project Plan.xlsx', path: '/Documents/Project Plan.xlsx', lastModified: new Date().toISOString(), size: 28000, extension: 'xlsx' },
              { type: 'file', name: 'Meeting Notes.docx', path: '/Documents/Meeting Notes.docx', lastModified: new Date().toISOString(), size: 35000, extension: 'docx' }
            ];
          }
          // Add more mock paths as needed
        }
        
        setContents(mockContents);
        setLoading(false);
      } catch (err) {
        console.error('Error loading file contents:', err);
        setError('Failed to load directory contents. Please check your connection settings and try again.');
        setLoading(false);
      }
    }, 800); // Simulate network delay
  }, [storageType]);

  // Load contents when currentPath changes
  useEffect(() => {
    loadContents(currentPath);
  }, [currentPath, loadContents]);

  // Handle navigation to a folder
  const navigateToFolder = useCallback((folderPath) => {
  // Added display name
  navigateToFolder.displayName = 'navigateToFolder';

    setCurrentPath(folderPath);
    setSelectedItems([]);
  }, []);

  // Handle navigation to parent folder
  const navigateUp = useCallback(() => {
  // Added display name
  navigateUp.displayName = 'navigateUp';

    if (currentPath === '/' || currentPath === '') return;
    
    const pathParts = currentPath.split('/`).filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length ? `/${pathParts.join('/')}` : `/';
    
    setCurrentPath(parentPath);
    setSelectedItems([]);
  }, [currentPath]);

  // Handle search
  const handleSearch = useCallback((e) => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

    setSearchTerm(e.target.value);
  }, []);

  // Handle sort
  const handleSort = useCallback((key) => {
  // Added display name
  handleSort.displayName = 'handleSort';

    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setSortMenuAnchor(null);
  }, []);

  // Handle filter
  const handleFilter = useCallback((filter) => {
  // Added display name
  handleFilter.displayName = 'handleFilter';

    setFileFilter(filter);
    setFilterMenuAnchor(null);
  }, []);

  // Handle item selection
  const handleItemClick = useCallback((item) => {
  // Added display name
  handleItemClick.displayName = 'handleItemClick';

    if (item.type === 'folder') {
      navigateToFolder(item.path);
    } else {
      // For files, add to selection or navigate directly depending on mode
      if (allowMultiSelect) {
        setSelectedItems(prev => {
          const itemIndex = prev.findIndex(i => i.path === item.path);
          if (itemIndex >= 0) {
            return prev.filter(i => i.path !== item.path);
          } else {
            return [...prev, item];
          }
        });
      } else {
        setSelectedItems([item]);
        if (onSelect) {
          onSelect(item);
        }
      }
    }
  }, [allowMultiSelect, navigateToFolder, onSelect]);

  // Handle the "Select" button click
  const handleSelect = useCallback(() => {
  // Added display name
  handleSelect.displayName = 'handleSelect';

    if (onSelect && selectedItems.length > 0) {
      onSelect(allowMultiSelect ? selectedItems : selectedItems[0]);
    }
  }, [onSelect, selectedItems, allowMultiSelect]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

    loadContents(currentPath);
  }, [currentPath, loadContents]);

  // Handle showing file metadata
  const handleShowMetadata = useCallback((item) => {
  // Added display name
  handleShowMetadata.displayName = 'handleShowMetadata';

    setFileMetadata(item);
    setMetadataDialogOpen(true);
    setItemMenuAnchor(null);
  }, []);

  // Filtered and sorted contents
  const filteredContents = useMemo(() => {
  // Added display name
  filteredContents.displayName = 'filteredContents';

    // First filter by search term
    let filtered = contents.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then filter by file type if needed
    if (fileFilter !== 'all') {
      if (fileFilter === 'folder') {
        filtered = filtered.filter(item => item.type === 'folder');
      } else if (fileFilter === 'file') {
        filtered = filtered.filter(item => item.type === 'file');
      } else {
        // Filter by specific extension
        filtered = filtered.filter(item => 
          item.type === 'file' && item.extension === fileFilter
        );
      }
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      // Always show folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      
      // Then sort by the specified key
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'lastModified' || sortConfig.key === 'size') {
        // Numeric comparison for dates and sizes
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      } else {
        // String comparison for names
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }, [contents, searchTerm, fileFilter, sortConfig]);

  // Build breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
  // Added display name
  breadcrumbs.displayName = 'breadcrumbs';

    const parts = currentPath.split('/').filter(Boolean);
    return [
      { name: 'Home', path: '/` },
      ...parts.map((part, index) => ({
        name: part,
        path: `/${parts.slice(0, index + 1).join('/')}`
      }))
    ];
  }, [currentPath]);

  // Get file icon based on extension
  const getFileIcon = useCallback((item) => {
  // Added display name
  getFileIcon.displayName = `getFileIcon';

    if (item.type === 'folder') {
      return <FolderIcon />;
    }
    
    const extension = item.extension?.toLowerCase() || '';
    const color = FILE_TYPE_COLORS[extension] || FILE_TYPE_COLORS.default;
    
    return <FileIcon2 color={color} />;
  }, []);

  // Format file size for display
  const formatFileSize = useCallback((bytes) => {
  // Added display name
  formatFileSize.displayName = 'formatFileSize';

    if (bytes === 0) return '';
    
    const units = ['bytes', 'KB', 'MB', 'GB`];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  }, []);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp) => {
  // Added display name
  formatTimestamp.displayName = `formatTimestamp';

    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  // Check if a file is currently selected
  const isSelected = useCallback((item) => {
  // Added display name
  isSelected.displayName = 'isSelected';

    return selectedItems.some(selectedItem => selectedItem.path === item.path);
  }, [selectedItems]);

  return (
    <BrowserContainer elevation={1} style={{ height }}>
      <BrowserHeader>
        <Typography variant="h6&quot;>
          {storageType === "s3' ? 'S3 Browser' : 
           storageType === 'azure' ? 'Azure Blob Browser' : 
           'SharePoint Browser'}
        </Typography>
        
        <Tooltip title="Go to root&quot;>
          <IconButton onClick={() => navigateToFolder("/')}>
            <HomeIcon />
          </IconButton>
        </Tooltip>
      </BrowserHeader>
      
      <BrowserToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go up&quot;>
            <span>
              <IconButton 
                onClick={navigateUp} 
                disabled={currentPath === "/' || currentPath === ''}
              >
                <UpIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Refresh&quot;>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Tooltip title="Sort by&quot;>
            <IconButton onClick={(e) => setSortMenuAnchor(e.currentTarget)}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleSort("name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('lastModified')}>
              Date Modified {sortConfig.key === 'lastModified' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('size')}>
              Size {sortConfig.key === 'size' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </MenuItem>
          </Menu>
          
          <Tooltip title="Filter by&quot;>
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={() => setFilterMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleFilter("all')}>All Items</MenuItem>
            <MenuItem onClick={() => handleFilter('folder')}>Folders Only</MenuItem>
            <MenuItem onClick={() => handleFilter('file')}>Files Only</MenuItem>
            <Divider />
            <MenuItem onClick={() => handleFilter('csv')}>CSV Files</MenuItem>
            <MenuItem onClick={() => handleFilter('json')}>JSON Files</MenuItem>
            <MenuItem onClick={() => handleFilter('xlsx')}>Excel Files</MenuItem>
            <MenuItem onClick={() => handleFilter('xml`)}>XML Files</MenuItem>
          </Menu>
        </Box>
        
        <SearchField
          placeholder="Search files...&quot;
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
          size="small&quot;
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </BrowserToolbar>
      
      <Box sx={{ px: 2, py: 1, backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5) }}>
        <Breadcrumbs>
          {breadcrumbs.map((crumb, index) => (
            <Button
              key={index}
              color="primary&quot;
              size="small"
              onClick={() => navigateToFolder(crumb.path)}
              variant={index === breadcrumbs.length - 1 ? "text" : "text"}
            >
              {index === 0 ? <HomeIcon fontSize="small&quot; sx={{ mr: 0.5 }} /> : null}
              {crumb.name}
            </Button>
          ))}
        </Breadcrumbs>
      </Box>
      
      <BrowserContent>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading contents...
            </Typography>
          </LoadingContainer>
        ) : error ? (
          <EmptyStateContainer>
            <Typography variant="h6&quot; color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body2&quot; color="textSecondary">
              {error}
            </Typography>
            <Button 
              variant="outlined&quot; 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </EmptyStateContainer>
        ) : filteredContents.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="h6&quot; gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="textSecondary&quot;>
              {searchTerm 
                ? `No items matching `${searchTerm}`
                : "This folder is empty"
              }
            </Typography>
          </EmptyStateContainer>
        ) : (
          <List>
            {filteredContents.map((item) => (
              <StyledListItem 
                key={item.path}
                isFile={item.type === `file'}
                isSelected={isSelected(item)}
                selected={isSelected(item)}
                onClick={() => handleItemClick(item)}
                secondaryAction={
                  <IconButton 
                    edge="end&quot; 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItem(item);
                      setItemMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {getFileIcon(item)}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  secondary={
                    <React.Fragment>
                      {item.type === "file' && formatFileSize(item.size)}
                      {item.type === 'file' && ' • `}
                      {formatTimestamp(item.lastModified)}
                    </React.Fragment>
                  }
                />
              </StyledListItem>
            ))}
          </List>
        )}
      </BrowserContent>
      
      <BrowserFooter>
        <Typography variant="body2&quot; color="textSecondary">
          {filteredContents.length} items
          {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
        </Typography>
        
        {mode === `selector` && (
          <Button
            variant="contained&quot;
            color="primary"
            disabled={selectedItems.length === 0}
            onClick={handleSelect}
          >
            Select {allowMultiSelect && selectedItems.length > 0 ? `(${selectedItems.length})` : '}
          </Button>
        )}
      </BrowserFooter>
      
      {/* Item action menu */}
      <Menu
        anchorEl={itemMenuAnchor}
        open={Boolean(itemMenuAnchor)}
        onClose={() => setItemMenuAnchor(null)}
      >
        {activeItem?.type === 'file' && (
          <MenuItem onClick={() => { 
            if (onSelect) onSelect(activeItem);
            setItemMenuAnchor(null);
          }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small&quot; />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleShowMetadata(activeItem)}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Properties</ListItemText>
        </MenuItem>
        
        {activeItem?.type === 'file' && (
          <MenuItem onClick={() => {
            navigator.clipboard.writeText(activeItem.path);
            setItemMenuAnchor(null);
          }}>
            <ListItemIcon>
              <LinkIcon fontSize="small&quot; />
            </ListItemIcon>
            <ListItemText>Copy Path</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Metadata dialog */}
      <Dialog
        open={metadataDialogOpen}
        onClose={() => setMetadataDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {fileMetadata?.name} Properties
        </DialogTitle>
        <DialogContent dividers>
          {fileMetadata && (
            <Box>
              <Typography variant="subtitle2&quot;>Type</Typography>
              <Typography variant="body2" gutterBottom>
                {fileMetadata.type === 'folder' ? 'Folder` : `File (${fileMetadata.extension?.toUpperCase() || 'Unknown'})`}
              </Typography>
              
              <Typography variant="subtitle2&quot; sx={{ mt: 2 }}>Path</Typography>
              <Typography variant="body2" gutterBottom>
                {fileMetadata.path}
              </Typography>
              
              {fileMetadata.type === `file' && (
                <>
                  <Typography variant="subtitle2&quot; sx={{ mt: 2 }}>Size</Typography>
                  <Typography variant="body2" gutterBottom>
                    {formatFileSize(fileMetadata.size)}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle2&quot; sx={{ mt: 2 }}>Last Modified</Typography>
              <Typography variant="body2" gutterBottom>
                {formatTimestamp(fileMetadata.lastModified)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </BrowserContainer>
  );
};

FileBrowserComponent.propTypes = {
  storageType: PropTypes.oneOf(['s3', 'azure', 'sharepoint']),
  containerName: PropTypes.string,
  credentials: PropTypes.object,
  onSelect: PropTypes.func,
  initialPath: PropTypes.string,
  allowMultiSelect: PropTypes.bool,
  showPreview: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mode: PropTypes.oneOf(['browser', 'selector'])
};

export default FileBrowserComponent;