import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;
import {
import { Alert, Box, Button, Chip, CircularProgress, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip, Typography, alpha, styled } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
  Code as CodeIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Description as FileIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  Schema as SchemaIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
;
// Map of file extensions to icon colors for visual cues (same as FileBrowserComponent)
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
const PreviewContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const FileIcon2 = styled(FileIcon)(({ color }) => ({
  color: color || FILE_TYPE_COLORS.default
}));

const PreviewToolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.05)
}));

const PreviewContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  position: 'relative'
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

const JSONPreview = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  padding: theme.spacing(2),
  overflowX: 'auto',
  '& .json-key': {
    color: theme.palette.primary.dark
  },
  '& .json-string': {
    color: theme.palette.success.dark
  },
  '& .json-number': {
    color: theme.palette.secondary.dark
  },
  '& .json-boolean': {
    color: theme.palette.error.dark
  },
  '& .json-null': {
    color: theme.palette.text.disabled
  }
}));

const TextPreview = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  padding: theme.spacing(2),
  overflowX: 'auto'
}));

const TableControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5)
}));

const SchemaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05)
  }
}));

/**
 * Component for previewing file contents from various storage sources (S3, Azure, SharePoint)
 * Supports different views: table, raw/text, JSON, schema, and statistics
 */
const FilePreviewComponent = ({
  file = null,
  storageType = 's3',
  credentials = {},
  height = 400,
  onSchemaDetect = null,
  showToolbar = true
}) => {
  // Added display name
  FilePreviewComponent.displayName = 'FilePreviewComponent';

  // Added display name
  FilePreviewComponent.displayName = 'FilePreviewComponent';

  // Added display name
  FilePreviewComponent.displayName = 'FilePreviewComponent';

  // Added display name
  FilePreviewComponent.displayName = 'FilePreviewComponent';

  // Added display name
  FilePreviewComponent.displayName = 'FilePreviewComponent';


  // State for preview data and UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [schema, setSchema] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [detectedType, setDetectedType] = useState(null);

  // Load file preview data
  const loadPreviewData = useCallback(async () => {
  // Added display name
  loadPreviewData.displayName = 'loadPreviewData';

    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation - in a real app, this would call an API
      // to fetch the file contents from the storage provider
      setTimeout(() => {
        const fileExtension = file.extension?.toLowerCase() || '';
        
        // Set detected file type
        setDetectedType(fileExtension);
        
        // Mock data for different file types
        if (fileExtension === 'csv') {
          // Generate mock CSV data
          const headers = ['id', 'name', 'email', 'department', 'salary'];
          const rows = Array.from({ length: 50 }, (_, i) => [
            i + 1,
            `User ${i + 1}`,
            `user${i + 1}@example.com`,
            ['HR', 'Sales', 'Engineering', 'Marketing'][Math.floor(Math.random() * 4)],
            Math.floor(50000 + Math.random() * 50000)
          ]);
          
          setPreviewData({
            type: 'csv',
            headers,
            rows
          });
          
          // Generate mock schema
          setSchema(
            headers.map(header => ({
              name: header,
              type: header === 'id' ? 'integer' : 
                    header === 'salary' ? 'number' : 
                    'string',
              required: header === 'id' || header === 'name',
              nullable: header !== 'id',
              format: header === 'email' ? 'email' : undefined,
              description: `${header.charAt(0).toUpperCase() + header.slice(1)} field`
            }))
          );
          
          // Generate mock statistics
          setStatistics({
            rowCount: 50,
            columnCount: 5,
            fields: {
              id: { min: 1, max: 50, avg: 25.5, distinct: 50 },
              salary: { min: 50000, max: 100000, avg: 75000, distinct: 50 }
            }
          });
          
          // Set appropriate tab
          setActiveTab(0); // Table view
        }
        else if (fileExtension === 'json') {
          // Mock JSON data
          const jsonData = {
            employees: [
              { id: 1, name: "John Smith", role: "Developer", skills: ["JavaScript", "React", "Node.js"] },
              { id: 2, name: "Jane Doe", role: "Designer", skills: ["UI/UX", "Figma", "CSS"] },
              { id: 3, name: "Bob Johnson", role: "Manager", skills: ["Leadership", "Agile", "Communication"] }
            ],
            company: {
              name: "TechCorp",
              location: "San Francisco",
              founded: 2010
            },
            projects: [
              { id: "p1", name: "Website Redesign", status: "In Progress" },
              { id: "p2", name: "Mobile App", status: "Planning" }
            ]
          };
          
          setPreviewData({
            type: 'json',
            data: jsonData
          });
          
          // Generate mock schema for JSON
          setSchema([
            { name: 'employees', type: 'array', required: true, nullable: false },
            { name: 'employees[].id', type: 'integer', required: true, nullable: false },
            { name: 'employees[].name', type: 'string', required: true, nullable: false },
            { name: 'employees[].role', type: 'string', required: true, nullable: true },
            { name: 'employees[].skills', type: 'array', required: false, nullable: true },
            { name: 'company', type: 'object', required: true, nullable: false },
            { name: 'company.name', type: 'string', required: true, nullable: false },
            { name: 'company.location', type: 'string', required: false, nullable: true },
            { name: 'company.founded', type: 'integer', required: false, nullable: true },
            { name: 'projects', type: 'array', required: false, nullable: true },
            { name: 'projects[].id', type: 'string', required: true, nullable: false },
            { name: 'projects[].name', type: 'string', required: true, nullable: false },
            { name: 'projects[].status', type: 'string', required: false, nullable: true }
          ]);
          
          // Generate mock statistics
          setStatistics({
            objectCount: 1,
            arrayCount: 2,
            totalFields: 13,
            maxDepth: 3
          });
          
          // Set appropriate tab
          setActiveTab(1); // JSON view
        }
        else if (fileExtension === 'txt' || fileExtension === 'log' || fileExtension === 'md') {
          // Mock text data
          const textData = `# Sample Text File\n\nThis is a sample text file for preview in the TAP Integration Platform.\n\n## Features\n\n- Text preview\n- File analysis\n- Schema detection\n\n## Example Data\n\nHere is some example text content that would be in a real file.\nMultiple lines with various formatting.\n\n> This is a quoted section of text.\n\nRegular text continues here with more content.`;
          
          setPreviewData({
            type: 'text',
            data: textData
          });
          
          // Simple schema for text
          setSchema([
            { name: 'content', type: 'string', required: true, nullable: false }
          ]);
          
          // Simple stats for text
          setStatistics({
            lineCount: 16,
            wordCount: 78,
            charCount: 418
          });
          
          // Set appropriate tab
          setActiveTab(2); // Text view
        }
        else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
          // Mock Excel data - similar to CSV for this demo
          const headers = ['Product', 'Category', 'Price', 'Stock', 'LastUpdated'];
          const rows = Array.from({ length: 40 }, (_, i) => [
            `Product ${i + 1}`,
            ['Electronics', 'Clothing', 'Food', 'Home Goods'][Math.floor(Math.random() * 4)],
            (Math.random() * 500 + 10).toFixed(2),
            Math.floor(Math.random() * 200),
            new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ]);
          
          setPreviewData({
            type: 'excel',
            sheets: ['Sheet1', 'Sheet2'],
            activeSheet: 'Sheet1',
            headers,
            rows
          });
          
          // Generate mock schema
          setSchema(
            headers.map(header => ({
              name: header,
              type: header === 'Price' ? 'number' : 
                    header === 'Stock' ? 'integer' : 
                    header === 'LastUpdated' ? 'date' :
                    'string',
              required: header === 'Product',
              nullable: header !== 'Product' && header !== 'Category',
              format: header === 'LastUpdated' ? 'date' : undefined,
              description: `${header} column`
            }))
          );
          
          // Generate mock statistics
          setStatistics({
            sheetCount: 2,
            rowCount: 40,
            columnCount: 5
          });
          
          // Set appropriate tab
          setActiveTab(0); // Table view
        }
        else if (fileExtension === 'xml') {
          // Mock XML data
          const xmlData = `<?xml version="1.0&quot; encoding="UTF-8"?>
<inventory>
  <product id="1001&quot;>
    <name>Laptop</name>
    <category>Electronics</category>
    <price currency="USD">999.99</price>
    <inStock>true</inStock>
  </product>
  <product id="1002&quot;>
    <name>Smartphone</name>
    <category>Electronics</category>
    <price currency="USD">699.99</price>
    <inStock>true</inStock>
  </product>
  <product id="1003&quot;>
    <name>Headphones</name>
    <category>Accessories</category>
    <price currency="USD">149.99</price>
    <inStock>false</inStock>
  </product>
</inventory>`;
          
          setPreviewData({
            type: 'xml',
            data: xmlData
          });
          
          // Generate mock schema
          setSchema([
            { name: 'inventory', type: 'object', required: true, nullable: false },
            { name: 'inventory.product', type: 'array', required: true, nullable: false },
            { name: 'inventory.product.@id', type: 'string', required: true, nullable: false },
            { name: 'inventory.product.name', type: 'string', required: true, nullable: false },
            { name: 'inventory.product.category', type: 'string', required: true, nullable: false },
            { name: 'inventory.product.price', type: 'number', required: true, nullable: false },
            { name: 'inventory.product.price.@currency', type: 'string', required: true, nullable: false },
            { name: 'inventory.product.inStock', type: 'boolean', required: true, nullable: false }
          ]);
          
          // Generate mock statistics
          setStatistics({
            nodeCount: 15,
            elementCount: 12,
            attributeCount: 4,
            maxDepth: 3
          });
          
          // Set appropriate tab
          setActiveTab(2); // Text view
        }
        else {
          // Unsupported file type
          setPreviewData({
            type: 'unsupported',
            message: `Preview not available for ${fileExtension} files.`
          });
          
          // Set appropriate tab
          setActiveTab(2); // Text view as fallback
        }
        
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (err) {
      console.error('Error loading file preview:', err);
      setError('Failed to load file preview. Please check your connection and file permissions.');
      setLoading(false);
    }
  }, [file]);

  // Load preview data when file changes
  useEffect(() => {
    if (file) {
      loadPreviewData();
    } else {
      setPreviewData(null);
      setSchema(null);
      setStatistics(null);
    }
  }, [file, loadPreviewData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Send detected schema to parent if requested
  useEffect(() => {
    if (schema && onSchemaDetect) {
      onSchemaDetect(schema);
    }
  }, [schema, onSchemaDetect]);

  // Filtered data for table view based on search term
  const filteredData = useMemo(() => {
  // Added display name
  filteredData.displayName = 'filteredData';

    if (!previewData || !['csv', 'excel'].includes(previewData.type)) {
      return { headers: [], rows: [] };
    }
    
    const { headers, rows } = previewData;
    
    if (!searchTerm) {
      return { headers, rows };
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filteredRows = rows.filter(row => 
      row.some(cell => 
        String(cell).toLowerCase().includes(searchTermLower)
      )
    );
    
    return { headers, rows: filteredRows };
  }, [previewData, searchTerm]);

  // Paginated rows for table view
  const paginatedRows = useMemo(() => {
  // Added display name
  paginatedRows.displayName = 'paginatedRows';

    if (!filteredData.rows) return [];
    
    return filteredData.rows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData.rows, page, rowsPerPage]);

  // Format JSON for pretty display with syntax highlighting
  const formatJSON = (obj) => {
  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';


    if (!obj) return '';
    
    const jsonString = JSON.stringify(obj, null, 2);
    
    // Basic syntax highlighting
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        function (match) {
          let cls = 'json-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'json-key';
            } else {
              cls = 'json-string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
          } else if (/null/.test(match)) {
            cls = 'json-null';
          }
          return `<span class="${cls}&quot;>${match}</span>`;
        }
      );
  };

  // Get appropriate color for file type
  const getFileTypeColor = useMemo(() => {
  // Added display name
  getFileTypeColor.displayName = "getFileTypeColor';

    if (!file || !file.extension) return FILE_TYPE_COLORS.default;
    return FILE_TYPE_COLORS[file.extension.toLowerCase()] || FILE_TYPE_COLORS.default;
  }, [file]);

  // Get data type chip based on schema field type
  const getDataTypeChip = (type) => {
  // Added display name
  getDataTypeChip.displayName = 'getDataTypeChip';

  // Added display name
  getDataTypeChip.displayName = 'getDataTypeChip';

  // Added display name
  getDataTypeChip.displayName = 'getDataTypeChip';

  // Added display name
  getDataTypeChip.displayName = 'getDataTypeChip';

  // Added display name
  getDataTypeChip.displayName = 'getDataTypeChip';


    const typeColors = {
      string: 'primary',
      number: 'success',
      integer: 'success',
      boolean: 'warning',
      array: 'info',
      object: 'info',
      date: 'secondary',
      timestamp: 'secondary',
      null: 'default'
    };
    
    return (
      <Chip 
        label={type} 
        size="small&quot; 
        color={typeColors[type] || "default'} 
        variant="outlined&quot; 
      />
    );
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = "handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';


    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';


    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle refresh
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';


    loadPreviewData();
  };

  // Check if we should show table view tab
  const showTableView = previewData && ['csv', 'excel'].includes(previewData.type);
  
  // Check if we should show JSON view tab
  const showJSONView = previewData && (
    previewData.type === 'json' || 
    ['csv', 'excel'].includes(previewData.type) // We can represent tabular data as JSON too
  );
  
  // Check if we should show text view tab
  const showTextView = previewData && (
    previewData.type === 'text' || 
    previewData.type === 'xml' || 
    previewData.type === 'unsupported'
  );

  return (
    <PreviewContainer elevation={1} style={{ height }}>
      <PreviewHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FileIcon2 color={getFileTypeColor} sx={{ mr: 1 }} />
          <Typography variant="h6&quot;>
            {file ? file.name : "File Preview'}
          </Typography>
        </Box>
        
        {file && (
          <Tooltip title="Refresh Preview&quot;>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </PreviewHeader>
      
      {file && showToolbar && (
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary&quot;
          variant="fullWidth"
        >
          {showTableView && <Tab icon={<TableIcon />} label="Table&quot; />}
          {showJSONView && <Tab icon={<CodeIcon />} label="JSON" />}
          {showTextView && <Tab icon={<FileIcon />} label="Text&quot; />}
          {schema && <Tab icon={<SchemaIcon />} label="Schema" />}
          {statistics && <Tab icon={<StatsIcon />} label="Statistics&quot; />}
        </Tabs>
      )}
      
      <PreviewContent>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading preview...
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
        ) : !file ? (
          <EmptyStateContainer>
            <Typography variant="h6&quot; gutterBottom>
              No file selected
            </Typography>
            <Typography variant="body2" color="textSecondary&quot;>
              Select a file to preview its contents
            </Typography>
          </EmptyStateContainer>
        ) : (
          <>
            {/* Table View */}
            {activeTab === 0 && showTableView && (
              <>
                <TableControls>
                  <TextField
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    variant="outlined&quot;
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{ width: 250, mr: 2 }}
                  />
                  
                  {previewData.type === 'excel' && previewData.sheets && (
                    <FormControl variant="outlined&quot; size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Sheet</InputLabel>
                      <Select
                        value={previewData.activeSheet}
                        label="Sheet&quot;
                        // In a real application, this would change the active sheet
                      >
                        {previewData.sheets.map(sheet => (
                          <MenuItem key={sheet} value={sheet}>{sheet}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableControls>
                
                <TableContainer style={{ maxHeight: "calc(100% - 48px)' }}>
                  <Table stickyHeader size="small&quot;>
                    <TableHead>
                      <TableRow>
                        {filteredData.headers.map((header, index) => (
                          <TableCell key={index}>
                            <Box sx={{ fontWeight: "bold' }}>{header}</Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div&quot;
                  count={filteredData.rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
            
            {/* JSON View */}
            {activeTab === 1 && showJSONView && (
              <JSONPreview 
                dangerouslySetInnerHTML={{ 
                  __html: formatJSON(
                    previewData.type === "json' 
                      ? previewData.data 
                      : { 
                          headers: previewData.headers, 
                          data: previewData.rows.slice(0, 100) // Limit rows for large datasets
                        }
                  )
                }} 
              />
            )}
            
            {/* Text View */}
            {activeTab === 2 && showTextView && (
              <TextPreview>
                {previewData.type === 'unsupported' 
                  ? previewData.message 
                  : previewData.data}
              </TextPreview>
            )}
            
            {/* Schema View */}
            {activeTab === 3 && schema && (
              <Box>
                <Box sx={{ p: 2, backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5) }}>
                  <Typography variant="subtitle1&quot; gutterBottom>
                    Schema Definition
                  </Typography>
                  <Typography variant="body2" color="textSecondary&quot;>
                    {schema.length} fields detected
                  </Typography>
                </Box>
                
                <Box>
                  {schema.map((field, index) => (
                    <SchemaItem key={index}>
                      <Box>
                        <Typography variant="subtitle2">{field.name}</Typography>
                        <Typography variant="body2&quot; color="textSecondary">
                          {field.description || field.format 
                            ? (field.description || '') + (field.format ? ` (${field.format})` : '') 
                            : ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getDataTypeChip(field.type)}
                        
                        {field.required && (
                          <Chip label="Required&quot; size="small" color="error&quot; variant="outlined" />
                        )}
                      </Box>
                    </SchemaItem>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Statistics View */}
            {activeTab === 4 && statistics && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6&quot; gutterBottom>Data Statistics</Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1&quot; gutterBottom>General Statistics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {/* CSV/Excel Stats */}
                    {["csv', 'excel'].includes(previewData.type) && (
                      <>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2&quot; color="textSecondary">Rows</Typography>
                          <Typography variant="h6&quot;>{statistics.rowCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2" color="textSecondary&quot;>Columns</Typography>
                          <Typography variant="h6">{statistics.columnCount}</Typography>
                        </Grid>
                        {previewData.type === 'excel' && (
                          <Grid item xs={6} sm={4}>
                            <Typography variant="body2&quot; color="textSecondary">Sheets</Typography>
                            <Typography variant="h6&quot;>{statistics.sheetCount}</Typography>
                          </Grid>
                        )}
                      </>
                    )}
                    
                    {/* Text Stats */}
                    {previewData.type === "text' && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2&quot; color="textSecondary">Lines</Typography>
                          <Typography variant="h6&quot;>{statistics.lineCount}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary&quot;>Words</Typography>
                          <Typography variant="h6">{statistics.wordCount}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2&quot; color="textSecondary">Characters</Typography>
                          <Typography variant="h6&quot;>{statistics.charCount}</Typography>
                        </Grid>
                      </>
                    )}
                    
                    {/* JSON Stats */}
                    {previewData.type === "json' && (
                      <>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2&quot; color="textSecondary">Objects</Typography>
                          <Typography variant="h6&quot;>{statistics.objectCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary&quot;>Arrays</Typography>
                          <Typography variant="h6">{statistics.arrayCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2&quot; color="textSecondary">Fields</Typography>
                          <Typography variant="h6&quot;>{statistics.totalFields}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary&quot;>Max Depth</Typography>
                          <Typography variant="h6">{statistics.maxDepth}</Typography>
                        </Grid>
                      </>
                    )}
                    
                    {/* XML Stats */}
                    {previewData.type === 'xml' && (
                      <>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2&quot; color="textSecondary">Nodes</Typography>
                          <Typography variant="h6&quot;>{statistics.nodeCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary&quot;>Elements</Typography>
                          <Typography variant="h6">{statistics.elementCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2&quot; color="textSecondary">Attributes</Typography>
                          <Typography variant="h6&quot;>{statistics.attributeCount}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary&quot;>Max Depth</Typography>
                          <Typography variant="h6">{statistics.maxDepth}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
                
                {/* Field-specific stats for CSV/Excel */}
                {['csv', 'excel'].includes(previewData.type) && statistics.fields && (
                  <Paper variant="outlined&quot; sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Numeric Field Statistics</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <TableContainer>
                      <Table size="small&quot;>
                        <TableHead>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell align="right">Min</TableCell>
                            <TableCell align="right&quot;>Max</TableCell>
                            <TableCell align="right">Avg</TableCell>
                            <TableCell align="right&quot;>Distinct</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(statistics.fields).map(([field, stats]) => (
                            <TableRow key={field}>
                              <TableCell component="th" scope="row&quot;>{field}</TableCell>
                              <TableCell align="right">{stats.min}</TableCell>
                              <TableCell align="right&quot;>{stats.max}</TableCell>
                              <TableCell align="right">{stats.avg.toFixed(2)}</TableCell>
                              <TableCell align="right&quot;>{stats.distinct}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Box>
            )}
          </>
        )}
      </PreviewContent>
    </PreviewContainer>
  );
};

FilePreviewComponent.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    extension: PropTypes.string,
    size: PropTypes.number
  }),
  storageType: PropTypes.oneOf(["s3', 'azure', 'sharepoint']),
  credentials: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSchemaDetect: PropTypes.func,
  showToolbar: PropTypes.bool
};

export default FilePreviewComponent;