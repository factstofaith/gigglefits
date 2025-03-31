import React from 'react';
import DocumentationDashboard from '@components/admin/documentation/DocumentationDashboard';
import PageLayout from '@components/common/PageLayout';
import { Box } from '../../design-system';
// Design system import already exists;
;

/**
 * Admin page for documentation management
 */
const DocumentationManagementPage = () => {
  // Added display name
  DocumentationManagementPage.displayName = 'DocumentationManagementPage';

  // Added display name
  DocumentationManagementPage.displayName = 'DocumentationManagementPage';

  // Added display name
  DocumentationManagementPage.displayName = 'DocumentationManagementPage';

  // Added display name
  DocumentationManagementPage.displayName = 'DocumentationManagementPage';

  // Added display name
  DocumentationManagementPage.displayName = 'DocumentationManagementPage';


  return (
    <PageLayout title="Documentation Management" isAdminPage>
      <Box sx={{ flex: 1 }}>
        <DocumentationDashboard />
      </Box>
    </PageLayout>
  );
};

export default DocumentationManagementPage;