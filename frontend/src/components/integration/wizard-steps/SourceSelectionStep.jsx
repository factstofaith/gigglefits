import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Source Selection Step
                                                                                      *
                                                                                      * Second step of the dataset creation wizard that allows selecting
                                                                                      * the data source type for the dataset.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, CardActionArea, CardContent, Typography, Box, FormHelperText, Radio, RadioGroup, FormControlLabel, Divider } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ApiIcon from '@mui/icons-material/Api';
import WebhookIcon from '@mui/icons-material/Webhook';
import ShareIcon from '@mui/icons-material/Share';
// Using StorageIcon as DatabaseIcon

import { getDataSourceOptions, DATASET_SOURCE_TYPES } from '../dataset_wizard_utils';

/**
 * Get icon component for a source type
 * @param {string} sourceType - The source type
 * @returns {JSX.Element} Icon component
 */
const getSourceTypeIcon = sourceType => {
  switch (sourceType) {
    case DATASET_SOURCE_TYPES.S3:
      return <CloudIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.AZURE_BLOB:
      return <CloudIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.SHAREPOINT:
      return <ShareIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.LOCAL_FILE:
      return <InsertDriveFileIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.API:
      return <ApiIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.DATABASE:
      return <StorageIcon fontSize="large" />;
    case DATASET_SOURCE_TYPES.WEBHOOK:
      return <WebhookIcon fontSize="large" />;
    default:
      return <StorageIcon fontSize="large" />;
  }
};

/**
 * Source Selection Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The SourceSelectionStep component
 */
const SourceSelectionStep = ({
  formik
}) => {
  const sourceOptions = getDataSourceOptions();

  // Group sources by category
  const sourcesByCategory = sourceOptions.reduce((acc, source) => {
    const category = source.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(source);
    return acc;
  }, {});

  // Sort categories
  const sortedCategories = Object.keys(sourcesByCategory).sort();

  /**
   * Handle source type selection
   * @param {string} sourceType - The selected source type
   */
  const handleSourceTypeSelect = sourceType => {
    formik.setFieldValue('sourceType', sourceType);
  };
  return <Box>
      <RadioGroup name="sourceType" value={formik.values.sourceType} onChange={e => handleSourceTypeSelect(e.target.value)}>

        {sortedCategories.map(category => <Box key={category} sx={{
        mb: 4
      }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {category}
            </Typography>
            <Divider sx={{
          mb: 2
        }} />
            
            <Grid container spacing={3}>
              {sourcesByCategory[category].map(source => <Grid item xs={12} sm={6} md={4} key={source.id}>
                  <Card elevation={formik.values.sourceType === source.id ? 3 : 1} sx={{
              height: '100%',
              border: formik.values.sourceType === source.id ? 2 : 0,
              borderColor: 'primary.main'
            }}>

                    <CardActionArea sx={{
                height: '100%'
              }} onClick={() => handleSourceTypeSelect(source.id)}>

                      <CardContent>
                        <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1
                  }}>
                          <FormControlLabel control={<Radio checked={formik.values.sourceType === source.id} value={source.id} name="sourceType" />} label="" sx={{
                      m: 0,
                      mr: 1
                    }} />

                          <Typography variant="h6" component="h3">
                            {source.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    mb: 2
                  }}>
                          <Box sx={{
                      mr: 2,
                      color: 'primary.main'
                    }}>
                            {getSourceTypeIcon(source.id)}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {source.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>)}

            </Grid>
          </Box>)}

      </RadioGroup>

      {formik.touched.sourceType && formik.errors.sourceType && <FormHelperText error>{formik.errors.sourceType}</FormHelperText>}

    </Box>;
};
SourceSelectionStep.propTypes = {
  formik: PropTypes.object.isRequired
};
export default withErrorBoundary(SourceSelectionStep, {
  boundary: 'SourceSelectionStep'
});