import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * SpecializedFileViewer Component
                                                                                      * 
                                                                                      * A component for displaying specialized viewers for various file types, including
                                                                                      * data files (CSV, JSON, XML), documents (PDF, Markdown), images, and more.
                                                                                      * Provides optimized viewing experiences based on file type.
                                                                                      */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import MUI components
import { Box, Paper, Typography, Card, CardContent, Grid, Tabs, Tab, Divider, CircularProgress, Alert, IconButton, Button, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Chip } from '@mui/material';

// Import icons
import { Download as DownloadIcon, FullscreenExit as FullscreenExitIcon, Fullscreen as FullscreenIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon, Code as CodeIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Info as InfoIcon, Search as SearchIcon, Print as PrintIcon, Share as ShareIcon, Refresh as RefreshIcon, Delete as DeleteIcon, Edit as EditIcon, TableChart as TableIcon, DataObject as DataObjectIcon, TextSnippet as TextIcon, Description as DocumentIcon } from '@mui/icons-material';

// Import file detector utilities
import { FILE_TYPES } from "@/utils/fileTypeDetector";

// Import FileTypeDetector for initial detection
import FileTypeDetector from './FileTypeDetector';

/**
 * CSV Viewer Component
 * Displays CSV data in a paginated table with filtering and sorting
 */
const CsvViewer = ({
  content,
  fileName
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [delimiter, setDelimiter] = useState(',');

  // Parse CSV content with Web Worker for larger files
  useEffect(() => {
    if (!content) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);

    // Create a Web Worker for parsing large CSV files without blocking the main thread
    // In a production app, you'd use an actual Web Worker file
    // For this demonstration, use setTimeout to simulate moving work off the main thread
    const parseCSVTask = setTimeout(() => {
      try {
        // Parse CSV with the current delimiter
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) {
          if (isMounted) {
            setData([]);
            setHeaders([]);
            setLoading(false);
          }
          return;
        }

        // Get headers from first line
        const headerRow = lines[0].split(delimiter);
        const processedHeaders = headerRow.map(h => h.trim().replace(/^"|"$/g, ''));

        // Parse data rows
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(delimiter);

          // Create object with header keys
          return headerRow.reduce((obj, header, index) => {
            const headerKey = header.trim().replace(/^"|"$/g, '');
            let value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            obj[headerKey] = value;
            return obj;
          }, {});
        });
        if (isMounted) {
          setHeaders(processedHeaders);
          setData(parsedData);
          setFilteredData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 0);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(parseCSVTask);
    };
  }, [content, delimiter]);

  // Filter data when filter text changes with optimized performance
  useEffect(() => {
    // For empty filter text, just use the original data
    if (!filterText.trim()) {
      setFilteredData(data);
      return;
    }

    // Use requestAnimationFrame to avoid blocking the UI during filtering
    let animationFrameId;
    let isMounted = true;

    // Apply debounce pattern for filtering to improve performance
    const filterTimeout = setTimeout(() => {
      // Use animation frame for visual operations to prevent jank
      animationFrameId = requestAnimationFrame(() => {
        const lowerFilter = filterText.toLowerCase();

        // Filter in chunks for large datasets to avoid UI freezing
        const chunkSize = 1000;
        const totalChunks = Math.ceil(data.length / chunkSize);
        let processedChunks = 0;
        const filtered = [];

        // Process data in chunks
        const processChunk = () => {
          if (!isMounted) return;
          const startIndex = processedChunks * chunkSize;
          const endIndex = Math.min(startIndex + chunkSize, data.length);

          // Filter the current chunk
          for (let i = startIndex; i < endIndex; i++) {
            const row = data[i];
            if (Object.values(row).some(value => String(value).toLowerCase().includes(lowerFilter))) {
              filtered.push(row);
            }
          }
          processedChunks++;

          // If all chunks are processed, update state
          if (processedChunks >= totalChunks) {
            if (isMounted) {
              setFilteredData(filtered);
              setPage(0);
            }
          } else {
            // Process next chunk in the next animation frame
            animationFrameId = requestAnimationFrame(processChunk);
          }
        };

        // Start processing chunks
        processChunk();
      });
    }, 150); // Debounce to avoid processing on every keystroke

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(filterTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [data, filterText]);

  // Handle page change - memoized to prevent recreation on each render
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  // Handle rows per page change - memoized to prevent recreation on each render
  const handleChangeRowsPerPage = useCallback(event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Handle delimiter change - memoized to prevent recreation on each render
  const handleDelimiterChange = useCallback(event => {
    setDelimiter(event.target.value);
  }, []);

  // Loading state
  if (loading) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      p: 3
    }}>
        <CircularProgress />
      </Box>;
  }

  // Empty state
  if (!content || data.length === 0) {
    return <Alert severity="info">No CSV data to display</Alert>;
  }
  return <Box>
      <Box sx={{
      mb: 2,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'center'
    }}>
        <TextField label="Filter" size="small" value={filterText} onChange={e => setFilterText(e.target.value)} InputProps={{
        startAdornment: <SearchIcon fontSize="small" sx={{
          mr: 1,
          color: 'text.secondary'
        }} />
      }} />

        
        <FormControl size="small" sx={{
        minWidth: 120
      }}>
          <InputLabel>Delimiter</InputLabel>
          <Select value={delimiter} label="Delimiter" onChange={handleDelimiterChange}>

            <MenuItem value=",">Comma (,)</MenuItem>
            <MenuItem value="\t">Tab</MenuItem>
            <MenuItem value=";">Semicolon (;)</MenuItem>
            <MenuItem value="|">Pipe (|)</MenuItem>
          </Select>
        </FormControl>
        
        <Chip label={`${filteredData.length} rows`} variant="outlined" size="small" icon={<TableIcon fontSize="small" />} />

        
        <Box sx={{
        flexGrow: 1
      }} />
        
        <Tooltip title="Download CSV">
          <IconButton size="small">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => <TableCell key={index}>
                  <Typography variant="subtitle2">{header}</Typography>
                </TableCell>)}

            </TableRow>
          </TableHead>
          
          <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => <TableRow key={rowIndex} hover>
                  {headers.map((header, colIndex) => <TableCell key={`${rowIndex}-${colIndex}`}>
                      {row[header]}
                    </TableCell>)}

                </TableRow>)}

          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination rowsPerPageOptions={[10, 25, 50, 100]} component="div" count={filteredData.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />

    </Box>;
};

/**
 * JSON Viewer Component
 * Displays JSON data in a formatted, collapsible tree structure
 */
const JsonViewer = ({
  content
}) => {
  const [loading, setLoading] = useState(true);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState({});

  // Parse JSON content with performance optimizations
  useEffect(() => {
    if (!content) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);

    // Use a separate thread via setTimeout to prevent blocking UI
    const parseTask = setTimeout(() => {
      try {
        // For extremely large JSON, we could use a streaming parser
        // but for this example we'll use JSON.parse with error handling
        const parsed = JSON.parse(content);
        if (!isMounted) return;
        setParsedData(parsed);
        setError(null);

        // Auto-expand first level
        if (parsed && typeof parsed === 'object') {
          // Calculate expansion state in a separate thread to avoid UI blocking
          requestAnimationFrame(() => {
            if (!isMounted) return;
            const initialExpanded = {};
            if (Array.isArray(parsed)) {
              // For arrays, expand first few items (limit for performance)
              for (let i = 0; i < Math.min(parsed.length, 5); i++) {
                initialExpanded[i] = true;
              }
            } else {
              // For objects, expand all first level keys
              // Limit expansion for very large objects
              const keys = Object.keys(parsed);
              const keysToExpand = keys.slice(0, Math.min(keys.length, 20));
              keysToExpand.forEach(key => {
                initialExpanded[key] = true;
              });
            }
            setExpandedPaths(initialExpanded);
          });
        }
      } catch (e) {
        if (isMounted) {
          console.error('Error parsing JSON:', e);
          setError('Invalid JSON format');
          setParsedData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 0);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(parseTask);
    };
  }, [content]);

  // Toggle expand/collapse - memoized to prevent recreation on each render
  const toggleExpand = useCallback(path => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  }, []);

  // Format value based on type - memoized to prevent recreation
  const formatValue = useCallback(value => {
    if (value === null) return <span style={{
      color: '#999'
    }}>null</span>;
    if (value === undefined) return <span style={{
      color: '#999'
    }}>undefined</span>;
    switch (typeof value) {
      case 'boolean':
        return <span style={{
          color: '#0d6efd'
        }}>{value.toString()}</span>;
      case 'number':
        return <span style={{
          color: '#198754'
        }}>{value}</span>;
      case 'string':
        // Truncate very long strings for performance
        const displayValue = value.length > 10000 ? `${value.substring(0, 10000)}... (truncated)` : value;
        return <span style={{
          color: '#dc3545'
        }}>{`"${displayValue}"`}</span>;
      default:
        return String(value);
    }
  }, []);

  // Render JSON node recursively - defined within component but not memoized due to recursive nature
  const renderNode = useCallback((data, path = '') => {
    if (data === null || data === undefined) {
      return formatValue(data);
    }

    // For arrays and objects
    if (typeof data === 'object') {
      const isArray = Array.isArray(data);
      const isEmpty = Object.keys(data).length === 0;

      // Handle empty objects/arrays
      if (isEmpty) {
        return <span>{isArray ? '[]' : '{}'}</span>;
      }

      // Determine if expanded
      const isExpanded = expandedPaths[path];
      return <Box sx={{
        ml: path ? 3 : 0
      }}>
          <Box sx={{
          display: 'flex',
          alignItems: 'center'
        }}>
            <IconButton size="small" onClick={() => toggleExpand(path)}>
              {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
            <Typography variant="body2">
              {isArray ? '[' : '{'}
              {!isExpanded && '...'}
              {!isExpanded && (isArray ? ']' : '}')}
              {!isExpanded && <Typography component="span" variant="caption" color="text.secondary"> {Object.keys(data).length} items</Typography>}
            </Typography>
          </Box>
          
          {isExpanded && <Box sx={{
          ml: 2
        }}>
              {Object.entries(data).map(([key, value], index) => {
            const childPath = path ? `${path}.${key}` : key;
            const displayKey = isArray ? index : key;
            return <Box key={childPath} sx={{
              display: 'flex',
              flexDirection: 'column',
              mt: 0.5
            }}>
                    <Box sx={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                  mr: 1
                }}>
                        {isArray ? `[${displayKey}]` : `"${displayKey}":`}
                      </Typography>
                      
                      {typeof value === 'object' && value !== null ? renderNode(value, childPath) : formatValue(value)}

                    </Box>
                  </Box>;
          })}
            </Box>}

          
          {isExpanded && <Typography variant="body2" sx={{
          ml: 1
        }}>
              {isArray ? ']' : '}'}
            </Typography>}

        </Box>;
    }

    // For primitive values
    return formatValue(data);
  }, [expandedPaths, toggleExpand, formatValue]);

  // Loading state
  if (loading) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      p: 3
    }}>
        <CircularProgress />
      </Box>;
  }

  // Error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Empty state
  if (!content) {
    return <Alert severity="info">No JSON content to display</Alert>;
  }
  return <Box sx={{
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    p: 2,
    bgcolor: 'background.paper'
  }}>
      <Box sx={{
      mb: 2,
      display: 'flex',
      gap: 1
    }}>
        <Button size="small" startIcon={<ExpandMoreIcon />} onClick={() => setExpandedPaths({})}>

          Collapse All
        </Button>
        
        <Button size="small" startIcon={<ExpandMoreIcon />} onClick={() => {
        // Expand all first level keys
        const allExpanded = {};
        if (Array.isArray(parsedData)) {
          parsedData.forEach((_, index) => {
            allExpanded[index] = true;
          });
        } else if (parsedData && typeof parsedData === 'object') {
          Object.keys(parsedData).forEach(key => {
            allExpanded[key] = true;
          });
        }
        setExpandedPaths(allExpanded);
      }}>

          Expand Level 1
        </Button>
        
        <Box sx={{
        flexGrow: 1
      }} />
        
        <Tooltip title="Download JSON">
          <IconButton size="small">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {renderNode(parsedData)}
    </Box>;
};

/**
 * XML Viewer Component
 * Displays XML data in a formatted, collapsible tree structure
 */
const XmlViewer = ({
  content
}) => {
  const [loading, setLoading] = useState(true);
  const [parsedContent, setParsedContent] = useState('');
  const [error, setError] = useState(null);
  const [expandedElements, setExpandedElements] = useState({});

  // Parse and format XML content with performance optimizations
  useEffect(() => {
    if (!content) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);

    // Process XML in a separate thread via setTimeout to avoid blocking UI
    const parseTask = setTimeout(() => {
      try {
        // Simple XML formatting - could be replaced with a proper XML parser library
        // but we're using a simple approach here for demonstration

        // Format XML in chunks for very large documents
        const processXml = () => {
          const formattedXml = formatXml(content);
          if (!isMounted) return;
          setParsedContent(formattedXml);
          setError(null);

          // Process tag extraction in a separate animation frame
          requestAnimationFrame(() => {
            if (!isMounted) return;
            try {
              // Initialize expanded state
              const initialExpanded = {};
              // Extract first level tags to expand them (limit number for performance)
              const regex = /<(\w+)[^>]*>/g;
              let match;
              const uniqueTags = new Set();
              let matchCount = 0;
              const maxMatches = 1000; // Limit for very large XML

              while ((match = regex.exec(content)) !== null && matchCount < maxMatches) {
                uniqueTags.add(match[1]);
                matchCount++;
              }

              // Limit number of expanded tags for performance
              const tagsToExpand = Array.from(uniqueTags).slice(0, 20);
              tagsToExpand.forEach(tag => {
                initialExpanded[tag] = true;
              });
              setExpandedElements(initialExpanded);
            } catch (innerError) {
              console.error('Error processing XML tags:', innerError);
            }
          });
        };

        // Use requestAnimationFrame to schedule the XML processing
        requestAnimationFrame(processXml);
      } catch (e) {
        if (isMounted) {
          console.error('Error formatting XML:', e);
          setError('Invalid XML format');
          setParsedContent(content);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 0);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(parseTask);
    };
  }, [content]);

  // Format XML with indentation
  const formatXml = xml => {
    if (!xml) return '';
    let formatted = '';
    let indent = '';
    const indentString = '  ';
    xml.split(/>\s*</).forEach(node => {
      if (node.match(/^\/\w/)) {
        // Closing tag
        indent = indent.substring(indentString.length);
      }
      formatted += indent + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith("?")) {
        // Opening tag
        indent += indentString;
      }
    });
    return formatted.substring(1, formatted.length - 2);
  };

  // Toggle element expansion - memoized to prevent recreation on each render
  const toggleElement = useCallback(tag => {
    setExpandedElements(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
  }, []);

  // Simplified XML rendering - memoized to prevent recreation on each render
  const renderXml = useCallback(() => {
    const lines = parsedContent.split('\n');
    return <Box sx={{
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap'
    }}>
        {lines.map((line, index) => {
        // Extract tag from line
        const tagMatch = line.match(/<(\/?[a-zA-Z0-9]+)/);
        const tag = tagMatch ? tagMatch[1].replace('/', '') : null;
        const isClosing = tagMatch && tagMatch[1].startsWith('/');
        const indentLevel = line.search(/\S|$/) / 2;
        return <Box key={index} sx={{
          ml: Math.max(0, indentLevel) * 2,
          display: 'flex',
          alignItems: 'center'
        }}>

              {tag && !isClosing && !line.includes('/>') && !line.startsWith('<?') && <IconButton size="small" onClick={() => toggleElement(tag)}>
                  {expandedElements[tag] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>}

              
              <Typography variant="body2" sx={{
            color: line.includes('=') ? 'secondary.main' : 'text.primary',
            fontWeight: line.match(/<[a-zA-Z]/) && !isClosing ? 'bold' : 'normal'
          }}>

                {line}
              </Typography>
            </Box>;
      })}
      </Box>;
  }, [parsedContent, expandedElements, toggleElement]);

  // Loading state
  if (loading) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      p: 3
    }}>
        <CircularProgress />
      </Box>;
  }

  // Error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Empty state
  if (!content) {
    return <Alert severity="info">No XML content to display</Alert>;
  }
  return <Box sx={{
    p: 2,
    bgcolor: 'background.paper'
  }}>
      <Box sx={{
      mb: 2,
      display: 'flex',
      gap: 1
    }}>
        <Button size="small" startIcon={<ExpandMoreIcon />} onClick={() => setExpandedElements({})}>

          Collapse All
        </Button>
        
        <Button size="small" startIcon={<ExpandMoreIcon />} onClick={() => {
        // Create expanded state with all tags expanded
        const allExpanded = {};
        const allTagsRegex = /<(\w+)[^>]*>/g;
        let match;
        while ((match = allTagsRegex.exec(content)) !== null) {
          allExpanded[match[1]] = true;
        }
        setExpandedElements(allExpanded);
      }}>

          Expand All
        </Button>
        
        <Box sx={{
        flexGrow: 1
      }} />
        
        <Tooltip title="Download XML">
          <IconButton size="small">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {renderXml()}
    </Box>;
};

/**
 * Image Viewer Component
 * Displays images with zoom, rotate, and download capabilities
 */
const ImageViewer = ({
  file,
  url
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Handle zoom in - memoized to prevent recreation on each render
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(5, prevZoom + 0.2));
  }, []);

  // Handle zoom out - memoized to prevent recreation on each render
  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(0.2, prevZoom - 0.2));
  }, []);

  // Handle rotation - memoized to prevent recreation on each render
  const handleRotateRight = useCallback(() => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  }, []);
  const handleRotateLeft = useCallback(() => {
    setRotation(prevRotation => (prevRotation - 90 + 360) % 360);
  }, []);

  // Handle fullscreen toggle - memoized to prevent recreation on each render
  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
  }, []);

  // Calculate image source
  const src = url || (file ? URL.createObjectURL(file) : null);

  // Empty state
  if (!src) {
    return <Alert severity="info">No image to display</Alert>;
  }
  return <Box sx={{
    position: 'relative'
  }}>
      <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: fullscreen ? '100vh' : 'auto',
      position: fullscreen ? 'fixed' : 'relative',
      top: fullscreen ? 0 : 'auto',
      left: fullscreen ? 0 : 'auto',
      zIndex: fullscreen ? 1300 : 'auto',
      bgcolor: fullscreen ? 'background.paper' : 'transparent',
      p: 2
    }}>

        <img src={src} alt="Image preview" style={{
        maxWidth: '100%',
        maxHeight: fullscreen ? '90vh' : '500px',
        transform: `scale(${zoom}) rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
        objectFit: 'contain'
      }} />

      </Box>
      
      <Paper sx={{
      position: fullscreen ? 'fixed' : 'relative',
      bottom: fullscreen ? 20 : 'auto',
      left: fullscreen ? '50%' : 'auto',
      transform: fullscreen ? 'translateX(-50%)' : 'none',
      zIndex: fullscreen ? 1301 : 'auto',
      mt: fullscreen ? 0 : 2,
      p: 1,
      display: 'flex',
      justifyContent: 'center',
      gap: 1
    }}>

        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Typography variant="body2" sx={{
        mx: 1,
        alignSelf: 'center'
      }}>
          {Math.round(zoom * 100)}%
        </Typography>
        
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem />
        
        <Tooltip title="Rotate left">
          <IconButton size="small" onClick={handleRotateLeft}>
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Rotate right">
          <IconButton size="small" onClick={handleRotateRight}>
            <RotateRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem />
        
        <Tooltip title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
          <IconButton size="small" onClick={toggleFullscreen}>
            {fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Download">
          <IconButton size="small" component="a" href={src} download>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>;
};

/**
 * PDF Viewer Component
 * Displays PDF documents with page navigation and download
 */
const PdfViewer = ({
  file,
  url
}) => {
  // In a production app, you would use a proper PDF viewer library
  // such as react-pdf or pdf.js

  // Calculate PDF source
  const src = url || (file ? URL.createObjectURL(file) : null);

  // Empty state
  if (!src) {
    return <Alert severity="info">No PDF document to display</Alert>;
  }
  return <Box sx={{
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
      <Box sx={{
      mb: 2,
      display: 'flex',
      gap: 1
    }}>
        <Tooltip title="Download PDF">
          <Button size="small" startIcon={<DownloadIcon />} component="a" href={src} download variant="outlined">

            Download PDF
          </Button>
        </Tooltip>
        
        <Box sx={{
        flexGrow: 1
      }} />
        
        <Typography variant="body2" color="text.secondary">
          For optimal PDF viewing, please download the file
        </Typography>
      </Box>
      
      <Box sx={{
      width: '100%',
      height: 500,
      border: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>

        <iframe src={`${src}#toolbar=0&navpanes=0`} width="100%" height="100%" style={{
        border: 'none'
      }} title="PDF Preview" />

      </Box>
    </Box>;
};

/**
 * Text Viewer Component
 * Displays plain text with syntax highlighting for various formats
 */
const TextViewer = ({
  content
}) => {
  // In a production app, you would use a proper syntax highlighter
  // such as react-syntax-highlighter or prismjs

  // Empty state
  if (!content) {
    return <Alert severity="info">No text content to display</Alert>;
  }
  return <Box sx={{
    width: '100%',
    height: '100%'
  }}>
      <Paper variant="outlined" sx={{
      p: 2,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowX: 'auto',
      maxHeight: 500
    }}>

        {content}
      </Paper>
    </Box>;
};

/**
 * Main SpecializedFileViewer Component
 */
const SpecializedFileViewer = ({
  file = null,
  url = null,
  content = null,
  fileType = null,
  showDetector = true,
  detailLevel = 'full'
}) => {
  const [detectedType, setDetectedType] = useState(null);
  const [fileContent, setFileContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('preview');

  // Load content from file if needed
  useEffect(() => {
    if (!file || fileContent) return;
    let isMounted = true;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = event => {
      if (isMounted) {
        setFileContent(event.target.result);
        setLoading(false);
      }
    };
    reader.onerror = () => {
      if (isMounted) {
        setError('Error reading file');
        setLoading(false);
      }
    };
    reader.readAsText(file);

    // Cleanup function to handle component unmounting during file read
    return () => {
      isMounted = false;
      // In modern browsers, we can abort the read operation
      if (reader.readyState === 1 /* LOADING */) {
        reader.abort();
      }
    };
  }, [file, fileContent]);

  // Handle detection complete - memoized to prevent recreation on each render
  const handleDetectionComplete = useCallback(result => {
    if (result && result.detectedType) {
      setDetectedType(result.detectedType);
    }
  }, []);

  // Determine which viewer to show based on file type - memoized to prevent recreation on each render
  const renderViewer = useCallback(() => {
    const type = fileType || (detectedType ? detectedType.name : null);
    if (!type) {
      return <Alert severity="info">Unable to determine file type</Alert>;
    }

    // Set appropriate viewer based on file type
    switch (type) {
      case FILE_TYPES.CSV.name:
      case FILE_TYPES.TSV.name:
        return <CsvViewer content={fileContent} fileName={file?.name} />;
      case FILE_TYPES.JSON.name:
        return <JsonViewer content={fileContent} />;
      case FILE_TYPES.XML.name:
        return <XmlViewer content={fileContent} />;
      case FILE_TYPES.JPEG.name:
      case FILE_TYPES.PNG.name:
      case FILE_TYPES.GIF.name:
      case FILE_TYPES.SVG.name:
        return <ImageViewer file={file} url={url} />;
      case FILE_TYPES.PDF.name:
        return <PdfViewer file={file} url={url} />;
      case FILE_TYPES.TEXT.name:
      case FILE_TYPES.MARKDOWN.name:
      default:
        return <TextViewer content={fileContent} />;
    }
  }, [fileType, detectedType, fileContent, file, url]);

  // Handle view mode change - memoized to prevent recreation on each render
  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Loading state
  if (loading) {
    return <Paper sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
        <CircularProgress sx={{
        mb: 2
      }} />
        <Typography variant="body2" color="text.secondary">
          Loading file content...
        </Typography>
      </Paper>;
  }

  // Error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return <Box sx={{
    width: '100%'
  }}>
      {showDetector && !detectedType && <Box sx={{
      mb: 3
    }}>
          <FileTypeDetector file={file} content={fileContent} onDetectionComplete={handleDetectionComplete} allowFileDrop={false} performDeepInspection={true} />

        </Box>}

      
      {(detectedType || fileType) && <Box sx={{
      mb: 2
    }}>
          <Tabs value={viewMode} onChange={handleViewModeChange} variant="scrollable" scrollButtons="auto">

            <Tab label="Preview" value="preview" icon={detectedType?.category === 'data' ? <TableIcon fontSize="small" /> : <DocumentIcon fontSize="small" />} iconPosition="start" />

            <Tab label="Raw" value="raw" icon={<CodeIcon fontSize="small" />} iconPosition="start" />

            <Tab label="Info" value="info" icon={<InfoIcon fontSize="small" />} iconPosition="start" />

          </Tabs>
        </Box>}

      
      <Box sx={{
      mt: 2
    }}>
        {viewMode === 'preview' && renderViewer()}
        
        {viewMode === 'raw' && <TextViewer content={fileContent} />}

        
        {viewMode === 'info' && <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                File Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Basic Information
                  </Typography>
                  
                  <Box sx={{
                ml: 1
              }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Name:</strong> {file?.name || 'N/A'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Size:</strong> {file?.size ? formatFileSize(file.size) : 'N/A'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Type:</strong> {detectedType?.fullName || fileType || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>MIME Type:</strong> {detectedType?.mimeType || file?.type || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Content Information
                  </Typography>
                  
                  <Box sx={{
                ml: 1
              }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Category:</strong> {detectedType?.category || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Text-based:</strong> {detectedType?.isTextBased ? 'Yes' : 'No'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Content Size:</strong> {fileContent ? `${fileContent.length} characters` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>}

      </Box>
    </Box>;
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// PropTypes
SpecializedFileViewer.propTypes = {
  file: PropTypes.object,
  url: PropTypes.string,
  content: PropTypes.string,
  fileType: PropTypes.string,
  showDetector: PropTypes.bool,
  detailLevel: PropTypes.oneOf(['minimal', 'standard', 'full'])
};
CsvViewer.propTypes = {
  content: PropTypes.string.isRequired,
  fileName: PropTypes.string
};
JsonViewer.propTypes = {
  content: PropTypes.string.isRequired
};
XmlViewer.propTypes = {
  content: PropTypes.string.isRequired
};
ImageViewer.propTypes = {
  file: PropTypes.object,
  url: PropTypes.string
};
PdfViewer.propTypes = {
  file: PropTypes.object,
  url: PropTypes.string
};
TextViewer.propTypes = {
  content: PropTypes.string.isRequired
};
SpecializedFileViewer;
const SpecializedFileViewerWithErrorBoundary = props => <ErrorBoundary boundary="SpecializedFileViewer" fallback={({
  error,
  resetError
}) => <div className="error-container">
            <h3>Error in SpecializedFileViewer</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <SpecializedFileViewer {...props} />
      </ErrorBoundary>;
export default SpecializedFileViewerWithErrorBoundary;