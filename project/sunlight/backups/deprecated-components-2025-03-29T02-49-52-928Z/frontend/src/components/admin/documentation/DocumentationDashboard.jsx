import { Box, Button, Typography, Tabs, Tab, Paper } from '@design-system/adapter';
import React, { useState } from 'react';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import UpdateIcon from '@mui/icons-material/Update';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';

import DocumentationLibrary from '@components/admin/documentation/DocumentationLibrary';
import DocumentViewer from '@components/admin/documentation/DocumentViewer';

/**
 * Main Documentation Dashboard Component for the Admin Panel
 * Serves as the entry point for documentation management
 */
const DocumentationDashboard = () => {
  // Added display name
  DocumentationDashboard.displayName = 'DocumentationDashboard';

  // Added display name
  DocumentationDashboard.displayName = 'DocumentationDashboard';

  // Added display name
  DocumentationDashboard.displayName = 'DocumentationDashboard';

  // Added display name
  DocumentationDashboard.displayName = 'DocumentationDashboard';

  // Added display name
  DocumentationDashboard.displayName = 'DocumentationDashboard';


  const [activeTab, setActiveTab] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);

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
    setSelectedDocument(null); // Reset selected document when changing tabs
  };

  const handleDocumentSelect = (document) => {
  // Added display name
  handleDocumentSelect.displayName = 'handleDocumentSelect';

  // Added display name
  handleDocumentSelect.displayName = 'handleDocumentSelect';

  // Added display name
  handleDocumentSelect.displayName = 'handleDocumentSelect';

  // Added display name
  handleDocumentSelect.displayName = 'handleDocumentSelect';

  // Added display name
  handleDocumentSelect.displayName = 'handleDocumentSelect';


    setSelectedDocument(document);
  };

  const handleBackToLibrary = () => {
  // Added display name
  handleBackToLibrary.displayName = 'handleBackToLibrary';

  // Added display name
  handleBackToLibrary.displayName = 'handleBackToLibrary';

  // Added display name
  handleBackToLibrary.displayName = 'handleBackToLibrary';

  // Added display name
  handleBackToLibrary.displayName = 'handleBackToLibrary';

  // Added display name
  handleBackToLibrary.displayName = 'handleBackToLibrary';


    setSelectedDocument(null);
  };

  // If a document is selected, show the document viewer
  if (selectedDocument) {
    return (
      <DocumentViewer 
        document={selectedDocument} 
        onBack={handleBackToLibrary} 
      />
    );
  }

  // Render dashboard with tabs
  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable&quot;
            scrollButtons="auto"
            aria-label="documentation dashboard tabs"
          >
            <Tab 
              icon={<LibraryBooksIcon />} 
              label="All Documentation&quot; 
              id="tab-0" 
              aria-controls="tabpanel-0" 
            />
            <Tab 
              icon={<BookmarksIcon />} 
              label="Bookmarks&quot; 
              id="tab-1" 
              aria-controls="tabpanel-1" 
            />
            <Tab 
              icon={<UpdateIcon />} 
              label="Recently Updated&quot; 
              id="tab-2" 
              aria-controls="tabpanel-2" 
            />
            <Tab 
              icon={<CategoryIcon />} 
              label="Categories&quot; 
              id="tab-3" 
              aria-controls="tabpanel-3" 
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Audience Management&quot; 
              id="tab-4" 
              aria-controls="tabpanel-4" 
            />
          </Tabs>
        </Box>
      </Paper>

      {/* All Documentation Tab */}
      {activeTab === 0 && (
        <Box role="tabpanel&quot; id="tabpanel-0" aria-labelledby="tab-0">
          <DocumentationLibrary onDocumentSelect={handleDocumentSelect} />
        </Box>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 1 && (
        <Box role="tabpanel&quot; id="tabpanel-1" aria-labelledby="tab-1">
          <BookmarkedDocuments onDocumentSelect={handleDocumentSelect} />
        </Box>
      )}

      {/* Recently Updated Tab */}
      {activeTab === 2 && (
        <Box role="tabpanel&quot; id="tabpanel-2" aria-labelledby="tab-2">
          <RecentlyUpdatedDocuments onDocumentSelect={handleDocumentSelect} />
        </Box>
      )}

      {/* Categories Tab */}
      {activeTab === 3 && (
        <Box role="tabpanel&quot; id="tabpanel-3" aria-labelledby="tab-3">
          <CategoriesView onDocumentSelect={handleDocumentSelect} />
        </Box>
      )}

      {/* Audience Management Tab */}
      {activeTab === 4 && (
        <Box role="tabpanel&quot; id="tabpanel-4" aria-labelledby="tab-4">
          <AudienceManagement />
        </Box>
      )}
    </Box>
  );
};

// Placeholder components for other tabs
// In a real implementation, these would be separate component files

const BookmarkedDocuments = ({ onDocumentSelect }) => {
  // Added display name
  BookmarkedDocuments.displayName = 'BookmarkedDocuments';

  // Added display name
  BookmarkedDocuments.displayName = 'BookmarkedDocuments';

  // Added display name
  BookmarkedDocuments.displayName = 'BookmarkedDocuments';

  // Added display name
  BookmarkedDocuments.displayName = 'BookmarkedDocuments';

  // Added display name
  BookmarkedDocuments.displayName = 'BookmarkedDocuments';


  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6&quot; gutterBottom>
        Bookmarked Documentation
      </Typography>
      <Typography color="textSecondary">
        Your bookmarked documents will appear here.
      </Typography>
    </Box>
  );
};

const RecentlyUpdatedDocuments = ({ onDocumentSelect }) => {
  // Added display name
  RecentlyUpdatedDocuments.displayName = 'RecentlyUpdatedDocuments';

  // Added display name
  RecentlyUpdatedDocuments.displayName = 'RecentlyUpdatedDocuments';

  // Added display name
  RecentlyUpdatedDocuments.displayName = 'RecentlyUpdatedDocuments';

  // Added display name
  RecentlyUpdatedDocuments.displayName = 'RecentlyUpdatedDocuments';

  // Added display name
  RecentlyUpdatedDocuments.displayName = 'RecentlyUpdatedDocuments';


  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6&quot; gutterBottom>
        Recently Updated Documentation
      </Typography>
      <Typography color="textSecondary">
        Recently updated documents will appear here.
      </Typography>
    </Box>
  );
};

const CategoriesView = ({ onDocumentSelect }) => {
  // Added display name
  CategoriesView.displayName = 'CategoriesView';

  // Added display name
  CategoriesView.displayName = 'CategoriesView';

  // Added display name
  CategoriesView.displayName = 'CategoriesView';

  // Added display name
  CategoriesView.displayName = 'CategoriesView';

  // Added display name
  CategoriesView.displayName = 'CategoriesView';


  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6&quot; gutterBottom>
        Documentation Categories
      </Typography>
      <Typography color="textSecondary">
        Browse documentation by category.
      </Typography>
    </Box>
  );
};

const AudienceManagement = () => {
  // Added display name
  AudienceManagement.displayName = 'AudienceManagement';

  // Added display name
  AudienceManagement.displayName = 'AudienceManagement';

  // Added display name
  AudienceManagement.displayName = 'AudienceManagement';

  // Added display name
  AudienceManagement.displayName = 'AudienceManagement';

  // Added display name
  AudienceManagement.displayName = 'AudienceManagement';


  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6&quot; gutterBottom>
        Documentation Audience Management
      </Typography>
      <Typography color="textSecondary" paragraph>
        Manage what documentation is visible to different user roles and audiences.
      </Typography>
      <Button variant="contained" disabled>
        This feature is coming soon
      </Button>
    </Box>
  );
};

export default DocumentationDashboard;