import { 
  Box, 
  MenuItem, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  Card, 
  CardContent, 
  Chip 
} from '@design-system/adapter';
import React, { useState, useEffect, useMemo } from 'react';
import { CardActions } from '@design-system/adapter';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookIcon from '@mui/icons-material/Book';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
/**
 * Component for browsing and searching through the documentation library
 */
const DocumentationLibrary = ({ onDocumentSelect }) => {
  // Added display name
  DocumentationLibrary.displayName = 'DocumentationLibrary';

  // Added display name
  DocumentationLibrary.displayName = 'DocumentationLibrary';

  // Added display name
  DocumentationLibrary.displayName = 'DocumentationLibrary';

  // Added display name
  DocumentationLibrary.displayName = 'DocumentationLibrary';

  // Added display name
  DocumentationLibrary.displayName = 'DocumentationLibrary';


  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call
        const response = await fetch('/documentation-index.json');
        if (!response.ok) {
          throw new Error('Failed to fetch documentation index');
        }
        const data = await response.json();
        setDocuments(Object.values(data));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documentation:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Get unique categories and audiences for filters
  const categories = useMemo(() => {
  // Added display name
  categories.displayName = 'categories';

    const uniqueCategories = new Set(documents.map(doc => doc.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [documents]);

  const audiences = useMemo(() => {
  // Added display name
  audiences.displayName = 'audiences';

    const uniqueAudiences = new Set(documents.map(doc => doc.audience));
    return ['all', ...Array.from(uniqueAudiences)];
  }, [documents]);

  // Filter documents based on search query and filters
  const filteredDocuments = useMemo(() => {
  // Added display name
  filteredDocuments.displayName = 'filteredDocuments';

    return documents.filter(doc => {
      // Check if document matches search query
      const matchesSearch = 
        searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Check if document matches category filter
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      
      // Check if document matches audience filter
      const matchesAudience = audienceFilter === 'all' || doc.audience === audienceFilter;
      
      return matchesSearch && matchesCategory && matchesAudience;
    });
  }, [documents, searchQuery, categoryFilter, audienceFilter]);

  // Get icon for a document based on its category
  const getDocumentIcon = (category) => {
  // Added display name
  getDocumentIcon.displayName = 'getDocumentIcon';

  // Added display name
  getDocumentIcon.displayName = 'getDocumentIcon';

  // Added display name
  getDocumentIcon.displayName = 'getDocumentIcon';

  // Added display name
  getDocumentIcon.displayName = 'getDocumentIcon';

  // Added display name
  getDocumentIcon.displayName = 'getDocumentIcon';


    switch (category) {
      case 'architecture':
      case 'code':
      case 'development':
        return <CodeIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'integration':
        return <IntegrationInstructionsIcon />;
      case 'administration':
        return <SettingsIcon />;
      case 'user-guide':
      case 'tutorial':
        return <SchoolIcon />;
      default:
        return <BookIcon />;
    }
  };

  // Format category for display
  const formatCategory = (category) => {
  // Added display name
  formatCategory.displayName = 'formatCategory';

  // Added display name
  formatCategory.displayName = 'formatCategory';

  // Added display name
  formatCategory.displayName = 'formatCategory';

  // Added display name
  formatCategory.displayName = 'formatCategory';

  // Added display name
  formatCategory.displayName = 'formatCategory';


    if (!category) return 'Unknown';
    
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading documentation...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error&quot;>Error: {error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5&quot; gutterBottom>
          Documentation Library
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined&quot;
              placeholder="Search documentation by title, tag, or content"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start&quot;>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label&quot;>Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category&quot;
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : formatCategory(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined&quot;>
              <InputLabel id="audience-filter-label">Audience</InputLabel>
              <Select
                labelId="audience-filter-label&quot;
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                label="Audience"
              >
                {audiences.map(audience => (
                  <MenuItem key={audience} value={audience}>
                    {audience === 'all' 
                      ? 'All Audiences' 
                      : audience.charAt(0).toUpperCase() + audience.slice(1)
                    }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="subtitle1&quot; gutterBottom>
        {filteredDocuments.length} {filteredDocuments.length === 1 ? "document' : 'documents'} found
      </Typography>
      
      <Grid container spacing={2}>
        {filteredDocuments.map(doc => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex&quot; alignItems="center" mb={1}>
                  {getDocumentIcon(doc.category)}
                  <Typography variant="subtitle1&quot; ml={1}>
                    {formatCategory(doc.category)}
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {doc.title}
                </Typography>
                
                <Box mt={1}>
                  <Chip 
                    size="small&quot; 
                    label={doc.audience} 
                    color={doc.audience === "internal' ? 'primary' : 'success'} 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                  
                  {doc.tags && doc.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      size="small&quot; 
                      label={tag} 
                      variant="outlined" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                </Box>
                
                <Typography variant="caption&quot; color="textSecondary" display="block&quot; mt={1}>
                  Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => onDocumentSelect(doc)}
                  startIcon={<BookIcon />}
                >
                  Read
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filteredDocuments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>No documentation found matching your search criteria.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentationLibrary;