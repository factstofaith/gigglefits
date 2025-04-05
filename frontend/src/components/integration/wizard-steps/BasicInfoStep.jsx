/**
 * Fixed for Docker compatibility:
 * - Removed duplicate imports
 * - Standardized error-handling import path
 * - Fixed syntax errors
 */
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip, Autocomplete } from '@mui/material';
import { DATASET_TYPES, getDatasetTypeOptions } from '../dataset_wizard_utils';

/**
 * Basic Information Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The BasicInfoStep component
 */
const BasicInfoStep = ({
  formik
}) => {
  const [formError, setFormError] = useState(null);
  const datasetTypeOptions = getDatasetTypeOptions();

  /**
   * Handle tag input change
   * @param {Event} event - Change event
   * @param {Array} newValue - New array of tags
   */
  const handleTagsChange = (event, newValue) => {
    formik.setFieldValue('tags', newValue);
  };
  return <Grid container spacing={3}>
      {/* Dataset Name */}
      <Grid item xs={12}>
        <TextField fullWidth id="name" name="name" label="Dataset Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} placeholder="Enter a descriptive name for your dataset" required />

      </Grid>

      {/* Dataset Description */}
      <Grid item xs={12}>
        <TextField fullWidth id="description" name="description" label="Description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} placeholder="Describe the purpose and contents of this dataset" multiline rows={4} required />

      </Grid>

      {/* Dataset Type */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>

          <InputLabel id="type-label">Dataset Type</InputLabel>
          <Select labelId="type-label" id="type" name="type" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} label="Dataset Type" required>

            {datasetTypeOptions.map(option => <MenuItem key={option.id} value={option.id}>
                {option.name} - {option.description}
              </MenuItem>)}

          </Select>
          {formik.touched.type && formik.errors.type && <FormHelperText>{formik.errors.type}</FormHelperText>}

        </FormControl>
      </Grid>

      {/* Tags */}
      <Grid item xs={12} md={6}>
        <Autocomplete multiple id="tags" options={[]} freeSolo value={formik.values.tags} onChange={handleTagsChange} renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option} {...getTagProps({
        index
      })} key={index} variant="outlined" />)} renderInput={params => <TextField {...params} label="Tags" placeholder="Add tags" error={formik.touched.tags && Boolean(formik.errors.tags)} helperText={formik.touched.tags && formik.errors.tags} onBlur={formik.handleBlur} />} />



        <FormHelperText>
          Press Enter to add a tag. Tags help with searching and organizing datasets.
        </FormHelperText>
      </Grid>
    </Grid>;
};
BasicInfoStep.propTypes = {
  formik: PropTypes.object.isRequired
};

// Export with error boundary wrapper for Docker compatibility
export default withErrorBoundary(BasicInfoStep, {
  fallback: <div>Error loading BasicInfoStep component</div>,
  onError: (error, info) => {
    console.error('Error in BasicInfoStep component:', error, info);
  }
});