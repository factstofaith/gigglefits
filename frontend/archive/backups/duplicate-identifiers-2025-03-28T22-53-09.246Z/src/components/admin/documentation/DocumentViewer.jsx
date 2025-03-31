import { Box, IconButton, Typography, Button, CircularProgress, Paper, Chip, Divider, Link } from '@design-system/adapter';
import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@design-system/adapter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';

/**
 * Component for viewing documentation content
 */
const DocumentViewer = ({ document, onBack }) => {
  // Added display name
  DocumentViewer.displayName = 'DocumentViewer';

  // Added display name
  DocumentViewer.displayName = 'DocumentViewer';

  // Added display name
  DocumentViewer.displayName = 'DocumentViewer';


  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch document content
  useEffect(() => {
    const fetchContent = async () => {
      if (!document) return;
      
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch from an API
        // Here we're simulating with a delay and checking for local files
        const response = await fetch(document.path);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        
        // Check file type and process accordingly
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          // HTML content
          const html = await response.text();
          setContent(html);
        } else {
          // Markdown content - convert to HTML
          const markdown = await response.text();
          
          // Simple markdown to HTML conversion
          // In a real implementation, use a proper markdown parser
          const html = convertMarkdownToHtml(markdown);
          setContent(html);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document content:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContent();
  }, [document]);

  // Check if document is bookmarked
  useEffect(() => {
    if (!document) return;
    
    // In a real implementation, this would check a user's bookmarks
    const bookmarks = JSON.parse(localStorage.getItem('documentBookmarks') || '[]');
    setBookmarked(bookmarks.includes(document.id));
  }, [document]);

  // Toggle bookmark state
  const handleToggleBookmark = () => {
  // Added display name
  handleToggleBookmark.displayName = 'handleToggleBookmark';

  // Added display name
  handleToggleBookmark.displayName = 'handleToggleBookmark';

  // Added display name
  handleToggleBookmark.displayName = 'handleToggleBookmark';


    if (!document) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('documentBookmarks') || '[]');
    
    if (bookmarked) {
      // Remove from bookmarks
      const newBookmarks = bookmarks.filter(id => id !== document.id);
      localStorage.setItem('documentBookmarks', JSON.stringify(newBookmarks));
    } else {
      // Add to bookmarks
      bookmarks.push(document.id);
      localStorage.setItem('documentBookmarks', JSON.stringify(bookmarks));
    }
    
    setBookmarked(!bookmarked);
  };

  // Print document
  const handlePrint = () => {
  // Added display name
  handlePrint.displayName = 'handlePrint';

  // Added display name
  handlePrint.displayName = 'handlePrint';

  // Added display name
  handlePrint.displayName = 'handlePrint';


    window.print();
  };

  // Format document path for breadcrumbs
  const formatPathForBreadcrumbs = () => {
  // Added display name
  formatPathForBreadcrumbs.displayName = 'formatPathForBreadcrumbs';

  // Added display name
  formatPathForBreadcrumbs.displayName = 'formatPathForBreadcrumbs';

  // Added display name
  formatPathForBreadcrumbs.displayName = 'formatPathForBreadcrumbs';


    if (!document || !document.path) return [];
    
    const parts = document.path.split('/');
    return parts.map((part, index) => {
      // Skip file extension if last part
      const label = index === parts.length - 1 
        ? part.split('.')[0] 
        : part;
      
      return {
        label: label.replace(/[-_]/g, ' '),
        path: parts.slice(0, index + 1).join('/')
      };
    });
  };

  // Simple markdown to HTML converter
  // In a real implementation, use a proper markdown parser like marked
  const convertMarkdownToHtml = (markdown) => {
  // Added display name
  convertMarkdownToHtml.displayName = 'convertMarkdownToHtml';

  // Added display name
  convertMarkdownToHtml.displayName = 'convertMarkdownToHtml';

  // Added display name
  convertMarkdownToHtml.displayName = 'convertMarkdownToHtml';


    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
      // Bold
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      // Link
      .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
      // Unordered list
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

  if (!document) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Select a document to view</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading document...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
        <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
          Back to Library
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            
            <Breadcrumbs aria-label="document path" sx={{ flexGrow: 1 }}>
              {formatPathForBreadcrumbs().map((part, index, array) => (
                <Link 
                  key={part.path} 
                  color={index === array.length - 1 ? 'text.primary' : 'inherit'}
                  underline={index === array.length - 1 ? 'none' : 'hover'}
                  sx={{ cursor: index === array.length - 1 ? 'default' : 'pointer' }}
                >
                  {part.label}
                </Link>
              ))}
            </Breadcrumbs>
            
            <Box>
              <IconButton onClick={handleToggleBookmark} title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
              
              <IconButton onClick={handlePrint} title="Print">
                <PrintIcon />
              </IconButton>
              
              <IconButton title="Share">
                <ShareIcon />
              </IconButton>
              
              <IconButton title="Download">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Typography variant="h4" gutterBottom>
            {document.title}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={document.audience} 
              color={document.audience === 'internal' ? 'primary' : 'success'} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            
            <Chip 
              label={document.category.replace(/-/g, ' ')} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }} 
            />
            
            {document.tags && document.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                variant="outlined" 
                size="small" 
                sx={{ mr: 1 }} 
              />
            ))}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(document.lastUpdated).toLocaleString()}
            {document.version && ` | Version: ${document.version}`}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Document content */}
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
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </Paper>
    </Box>
  );
};

export default DocumentViewer;