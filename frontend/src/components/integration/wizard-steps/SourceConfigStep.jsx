/**
 * Fixed for Docker compatibility:
 * - Removed duplicate imports
 * - Standardized error-handling import path
 */
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Source Configuration Step
                                                                                      *
                                                                                      * Third step of the dataset creation wizard that dynamically renders
                                                                                      * configuration options based on the selected source type.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Alert } from '@mui/material';
import { DATASET_SOURCE_TYPES, getSourceConfigComponent } from '../dataset_wizard_utils';

// Source configuration components
import S3ConfigurationForm from '../source-config/S3ConfigurationForm';
import AzureBlobConfigurationForm from '../source-config/AzureBlobConfigurationForm';
import SharePointConfigurationForm from '../source-config/SharePointConfigurationForm';
import LocalFileConfigurationForm from '../source-config/LocalFileConfigurationForm';
import ApiConfigurationForm from '../source-config/ApiConfigurationForm';
import DatabaseConfigurationForm from '../source-config/DatabaseConfigurationForm';
import WebhookConfigurationForm from '../source-config/WebhookConfigurationForm';
import GenericConfigurationForm from '../source-config/GenericConfigurationForm';

/**
 * Source Configuration Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The SourceConfigStep component
 */
const SourceConfigStep = ({
  formik
}) => {
  const sourceType = formik.values.sourceType;

  // Get the appropriate configuration component based on the source type
  const ConfigComponent = useMemo(() => {
    switch (sourceType) {
      case DATASET_SOURCE_TYPES.S3:
        return S3ConfigurationForm;
      case DATASET_SOURCE_TYPES.AZURE_BLOB:
        return AzureBlobConfigurationForm;
      case DATASET_SOURCE_TYPES.SHAREPOINT:
        return SharePointConfigurationForm;
      case DATASET_SOURCE_TYPES.LOCAL_FILE:
        return LocalFileConfigurationForm;
      case DATASET_SOURCE_TYPES.API:
        return ApiConfigurationForm;
      case DATASET_SOURCE_TYPES.DATABASE:
        return DatabaseConfigurationForm;
      case DATASET_SOURCE_TYPES.WEBHOOK:
        return WebhookConfigurationForm;
      default:
        return GenericConfigurationForm;
    }
  }, [sourceType]);

  // If no source type is selected, show an alert
  if (!sourceType) {
    return <Alert severity="warning">
        Please select a source type in the previous step.
      </Alert>;
  }
  return <Box>
      <ConfigComponent formik={formik} />
    </Box>;
};
SourceConfigStep.propTypes = {
  formik: PropTypes.object.isRequired
};
export default withErrorBoundary(SourceConfigStep, {
  boundary: 'SourceConfigStep'
});