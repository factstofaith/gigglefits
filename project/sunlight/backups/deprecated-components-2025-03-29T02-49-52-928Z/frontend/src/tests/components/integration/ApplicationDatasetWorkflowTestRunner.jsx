import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@design-system/foundations/theme';
import ApplicationDatasetWorkflowTester from './ApplicationDatasetWorkflowTester';

/**
 * This is a standalone runner for the ApplicationDatasetWorkflowTester component.
 * It can be used to run and test the component in isolation without the need for
 * the full application. This allows for faster development and testing of the
 * application-dataset workflow testing functionality.
 * 
 * Usage:
 * 1. npm run start-test-runner
 * 2. Navigate to http://localhost:3000/test/application-dataset
 */

const ApplicationDatasetWorkflowTestRunner = () => {
  // Added display name
  ApplicationDatasetWorkflowTestRunner.displayName = 'ApplicationDatasetWorkflowTestRunner';

  // Added display name
  ApplicationDatasetWorkflowTestRunner.displayName = 'ApplicationDatasetWorkflowTestRunner';

  // Added display name
  ApplicationDatasetWorkflowTestRunner.displayName = 'ApplicationDatasetWorkflowTestRunner';

  // Added display name
  ApplicationDatasetWorkflowTestRunner.displayName = 'ApplicationDatasetWorkflowTestRunner';

  // Added display name
  ApplicationDatasetWorkflowTestRunner.displayName = 'ApplicationDatasetWorkflowTestRunner';


  return (
    <ThemeProvider>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <ApplicationDatasetWorkflowTester />
      </div>
    </ThemeProvider>
  );
};

// For standalone usage
if (document.getElementById('application-dataset-test-root')) {
  const root = createRoot(document.getElementById('application-dataset-test-root'));
  root.render(<ApplicationDatasetWorkflowTestRunner />);
}

export default ApplicationDatasetWorkflowTestRunner;