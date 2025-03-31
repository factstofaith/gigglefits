import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@design-system/foundations/theme';
import DataPreviewTransformationValidator from './DataPreviewTransformationValidator';

/**
 * This is a standalone runner for the DataPreviewTransformationValidator component.
 * It can be used to run and test the component in isolation without the need for
 * the full application. This allows for faster development and testing of the
 * data preview and transformation validation functionality.
 * 
 * Usage:
 * 1. npm run start-test-runner
 * 2. Navigate to http://localhost:3000/test/data-preview-transformation
 */

const DataPreviewTransformationValidatorRunner = () => {
  // Added display name
  DataPreviewTransformationValidatorRunner.displayName = 'DataPreviewTransformationValidatorRunner';

  // Added display name
  DataPreviewTransformationValidatorRunner.displayName = 'DataPreviewTransformationValidatorRunner';

  // Added display name
  DataPreviewTransformationValidatorRunner.displayName = 'DataPreviewTransformationValidatorRunner';

  // Added display name
  DataPreviewTransformationValidatorRunner.displayName = 'DataPreviewTransformationValidatorRunner';

  // Added display name
  DataPreviewTransformationValidatorRunner.displayName = 'DataPreviewTransformationValidatorRunner';


  return (
    <ThemeProvider>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <DataPreviewTransformationValidator />
      </div>
    </ThemeProvider>
  );
};

// For standalone usage
if (document.getElementById('data-preview-transformation-test-root')) {
  const root = createRoot(document.getElementById('data-preview-transformation-test-root'));
  root.render(<DataPreviewTransformationValidatorRunner />);
}

export default DataPreviewTransformationValidatorRunner;