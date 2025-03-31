import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';;
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import ApiIcon from '@mui/icons-material/Api';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
/**
 * Public-facing documentation portal for end users
 * Only shows documentation with 'public' or 'both' audience
 */
const PublicDocumentationPortal = () => {
  // Added display name
  PublicDocumentationPortal.displayName = 'PublicDocumentationPortal';

  // Added display name
  PublicDocumentationPortal.displayName = 'PublicDocumentationPortal';

  // Added display name
  PublicDocumentationPortal.displayName = 'PublicDocumentationPortal';

  // Added display name
  PublicDocumentationPortal.displayName = 'PublicDocumentationPortal';

  // Added display name
  PublicDocumentationPortal.displayName = 'PublicDocumentationPortal';


  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');

  // Define documentation categories for the main page
  const categories = [
    {
      id: 'user-guide',
      title: 'User Guides',
      description: 'Learn how to use the TAP Integration Platform',
      icon: <SchoolIcon fontSize="large&quot; />,
      color: "#4caf50'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Detailed API documentation for developers',
      icon: <ApiIcon fontSize="large&quot; />,
      color: "#2196f3'
    },
    {
      id: 'integration',
      title: 'Integration Guides',
      description: 'Connect with other systems and services',
      icon: <IntegrationInstructionsIcon fontSize="large&quot; />,
      color: "#ff9800'
    },
    {
      id: 'administration',
      title: 'Administrator Guides',
      description: 'Manage and configure the platform',
      icon: <SettingsIcon fontSize="large&quot; />,
      color: "#9c27b0'
    }
  ];

  // Fetch all public documentation
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call
        const response = await fetch('/documentation-index.json');
        if (!response.ok) {
          throw new Error('Failed to fetch documentation');
        }
        
        const data = await response.json();
        
        // Filter to only include public documentation
        const publicDocs = Object.values(data).filter(doc => 
          doc.audience === 'public' || doc.audience === 'both'
        );
        
        setDocuments(publicDocs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching public documentation:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Fetch document content when a document is selected
  useEffect(() => {
    const fetchDocumentContent = async () => {
      if (!selectedDocument) return;
      
      try {
        setLoading(true);
        // In a real implementation, this would fetch from an API
        const response = await fetch(selectedDocument.path);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        
        // Get the document content
        const content = await response.text();
        setDocumentContent(content);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document content:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocumentContent();
  }, [selectedDocument]);

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
  // Added display name
  filteredDocuments.displayName = 'filteredDocuments';

    if (!selectedCategory && !searchQuery) {
      return [];
    }
    
    return documents.filter(doc => {
      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  // Convert simple markdown to HTML
  const markdownToHtml = (markdown) => {
  // Added display name
  markdownToHtml.displayName = 'markdownToHtml';

  // Added display name
  markdownToHtml.displayName = 'markdownToHtml';

  // Added display name
  markdownToHtml.displayName = 'markdownToHtml';

  // Added display name
  markdownToHtml.displayName = 'markdownToHtml';

  // Added display name
  markdownToHtml.displayName = 'markdownToHtml';


    if (!markdown) return '';
    
    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      // Bold
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2&quot;>$1</a>")
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/<\/li>\n/g, '</li>')
      .replace(/\n<li>/g, '<ul><li>')
      .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
  // Added display name
  handleCategoryClick.displayName = 'handleCategoryClick';

  // Added display name
  handleCategoryClick.displayName = 'handleCategoryClick';

  // Added display name
  handleCategoryClick.displayName = 'handleCategoryClick';

  // Added display name
  handleCategoryClick.displayName = 'handleCategoryClick';

  // Added display name
  handleCategoryClick.displayName = 'handleCategoryClick';


    setSelectedCategory(categoryId);
    setSelectedDocument(null);
  };

  // Handle document selection
  const handleDocumentClick = (document) => {
  // Added display name
  handleDocumentClick.displayName = 'handleDocumentClick';

  // Added display name
  handleDocumentClick.displayName = 'handleDocumentClick';

  // Added display name
  handleDocumentClick.displayName = 'handleDocumentClick';

  // Added display name
  handleDocumentClick.displayName = 'handleDocumentClick';

  // Added display name
  handleDocumentClick.displayName = 'handleDocumentClick';


    setSelectedDocument(document);
  };

  // Handle back button click
  const handleBackClick = () => {
  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';

  // Added display name
  handleBackClick.displayName = 'handleBackClick';


    if (selectedDocument) {
      setSelectedDocument(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
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


    setSearchQuery(event.target.value);
  };

  // If loading, show loading indicator
  if (loading && !selectedCategory && !selectedDocument) {
    return (
      <Container maxWidth="lg&quot; sx={{ py: 4, textAlign: "center' }}>
        <Typography variant="h5&quot;>Loading documentation...</Typography>
      </Container>
    );
  }

  // If error, show error message
  if (error && !selectedCategory && !selectedDocument) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error&quot;>
          Error loading documentation: {error}
          <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // Show document content if a document is selected
  if (selectedDocument) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            component="button&quot; 
            variant="body2" 
            onClick={() => setSelectedCategory(null)}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit&quot; />
            Documentation Home
          </Link>
          
          {selectedCategory && (
            <Link 
              component="button" 
              variant="body2&quot; 
              onClick={() => setSelectedDocument(null)}
            >
              {categories.find(c => c.id === selectedCategory)?.title || selectedCategory}
            </Link>
          )}
          
          <Typography color="text.primary">{selectedDocument.title}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4&quot; gutterBottom>
            {selectedDocument.title}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {loading ? (
            <Typography>Loading content...</Typography>
          ) : error ? (
            <Alert severity="error">
              Error loading document content: {error}
              <Button onClick={handleBackClick} sx={{ ml: 2 }}>
                Back
              </Button>
            </Alert>
          ) : (
            <Box 
              sx={{ 
                '& h1': { mt: 3, mb: 2 },
                '& h2': { mt: 2, mb: 1.5 },
                '& h3': { mt: 1.5, mb: 1 },
                '& p': { mb: 1.5 },
                '& code': { 
                  backgroundColor: 'grey.100', 
                  p: 0.5, 
                  borderRadius: 1,
                  fontFamily: 'monospace' 
                },
                '& pre': { 
                  backgroundColor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  overflowX: 'auto' 
                }
              }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(documentContent) }} 
            />
          )}
        </Box>
        
        <Button 
          variant="outlined&quot; 
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to {selectedCategory ? categories.find(c => c.id === selectedCategory)?.title : "Documentation Home'}
        </Button>
      </Container>
    );
  }

  // Show category documents if a category is selected
  if (selectedCategory) {
    return (
      <Container maxWidth="lg&quot; sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            component="button" 
            variant="body2&quot; 
            onClick={() => setSelectedCategory(null)}
            sx={{ display: "flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit&quot; />
            Documentation Home
          </Link>
          <Typography color="text.primary">
            {categories.find(c => c.id === selectedCategory)?.title || selectedCategory}
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4&quot; gutterBottom>
            {categories.find(c => c.id === selectedCategory)?.title || selectedCategory}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary&quot; gutterBottom>
            {categories.find(c => c.id === selectedCategory)?.description}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search documentation..."
            variant="outlined&quot;
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 4 }}>
            Loading documents...
          </Typography>
        ) : filteredDocuments.length > 0 ? (
          <Grid container spacing={3}>
            {filteredDocuments.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea 
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6&quot; component="h2" gutterBottom>
                        {doc.title}
                      </Typography>
                      
                      <Box sx={{ mt: 1, mb: 2 }}>
                        {doc.tags && doc.tags.map(tag => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small&quot; 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary&quot;>
                        Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center', py: 4 }}>
            <Typography gutterBottom>
              No documentation found in this category.
            </Typography>
            {searchQuery && (
              <Button 
                variant="outlined&quot; 
                onClick={() => setSearchQuery("')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            )}
          </Box>
        )}
        
        <Button 
          variant="outlined&quot; 
          onClick={handleBackClick}
          sx={{ mt: 3 }}
        >
          Back to Documentation Home
        </Button>
      </Container>
    );
  }

  // Show main documentation home
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3&quot; component="h1" gutterBottom>
          TAP Integration Platform Documentation
        </Typography>
        <Typography variant="h6&quot; color="text.secondary" sx={{ mb: 3 }}>
          Find guides, tutorials, and reference documentation to help you succeed with the platform
        </Typography>
        
        <TextField
          placeholder="Search all documentation...&quot;
          variant="outlined"
          sx={{ width: { xs: '100%', sm: '70%', md: '50%' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start&quot;>
                <SearchIcon />
              </InputAdornment>
            )
          }}
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>
      
      {searchQuery ? (
        // Show search results
        <Box>
          <Typography variant="h5" gutterBottom>
            Search Results for "{searchQuery}"
          </Typography>
          
          {filteredDocuments.length > 0 ? (
            <Grid container spacing={3}>
              {filteredDocuments.map(doc => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea 
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6&quot; component="h2" gutterBottom>
                          {doc.title}
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={doc.category.replace(/-/g, ' ')} 
                            size="small&quot; 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                          
                          {doc.tags && doc.tags.map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              variant="outlined&quot;
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center', py: 4 }}>
              <Typography gutterBottom>
                No documentation found matching your search.
              </Typography>
              <Button 
                variant="outlined&quot; 
                onClick={() => setSearchQuery("')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        // Show categories
        <Grid container spacing={4}>
          {categories.map(category => (
            <Grid item xs={12} sm={6} key={category.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardActionArea 
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardMedia
                    sx={{ 
                      height: 120, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: category.color + '20' // Add transparency
                    }}
                  >
                    <Box sx={{ color: category.color }}>
                      {category.icon}
                    </Box>
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h5&quot; component="h2" gutterBottom>
                      {category.title}
                    </Typography>
                    <Typography variant="body2&quot; color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="subtitle1&quot; gutterBottom>
          Can"t find what you're looking for?
        </Typography>
        <Button variant="contained&quot; color="primary">
          Contact Support
        </Button>
      </Box>
    </Container>
  );
};

export default PublicDocumentationPortal;