/**
 * Generic Configuration Form
 *
 * A fallback configuration form for source types that don't have a specific form.
 * This is a placeholder component that can be used when a source type's
 * configuration component is not yet implemented.
 *
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Alert, Typography, TextField, Paper } from '@mui/material';

/**
 * Generic Configuration Form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The GenericConfigurationForm component
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const GenericConfigurationForm = ({
  formik
}) => {
  const sourceType = formik.values.sourceType;
  return <Box>
      <Alert severity="info" sx={{
      mb: 3
    }}>
        Please provide configuration details for the selected source type. The specific
        configuration form for this source type is not yet implemented.
      </Alert>

      <Paper variant="outlined" sx={{
      p: 3
    }}>
        <Typography variant="subtitle1" gutterBottom>
          Generic Configuration
        </Typography>

        <TextField fullWidth multiline rows={10} label="Configuration JSON" name="config.raw" value={JSON.stringify(formik.values.config || {}, null, 2)} onChange={e => {
        try {
          const config = JSON.parse(e.target.value);
          formik.setFieldValue('config', config);
        } catch (error) {
          // Allow invalid JSON during editing, but don't update the value
          console.error('Invalid JSON configuration', error);
        }
      }} placeholder={`{\n  "key": "value"\n}`} sx={{
        fontFamily: 'monospace'
      }} />

      </Paper>
    </Box>;
};
GenericConfigurationForm.propTypes = {
  formik: PropTypes.object.isRequired
};
export default GenericConfigurationForm;