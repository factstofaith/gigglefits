import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// Design system components
import { Box } from '../../design-system'
import { Typography } from '../../design-system'
import { Button } from '../../design-system'

// Material UI components
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip, FormControl, InputLabel, Select, MenuItem, FormHelperText, Alert } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
/**
 * TemplateForm Component
 * 
 * A component for creating or editing flow templates.
 * Provides a form for entering template details like name, description, category, and tags.
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onSave - Callback when template is saved
 * @param {Object} [props.initialValues={}] - Initial values for the form
 * @param {Array} [props.categories=[]] - List of available categories
 * @param {boolean} [props.editMode=false] - Whether we're editing an existing template
 */
const TemplateForm = ({ 
  open, 
  onClose, 
  onSave, 
  initialValues = {}, 
  categories = [], 
  editMode = false 
}) => {
  // Added display name
  TemplateForm.displayName = 'TemplateForm';

  // Added display name
  TemplateForm.displayName = 'TemplateForm';

  // Added display name
  TemplateForm.displayName = 'TemplateForm';

  // Added display name
  TemplateForm.displayName = 'TemplateForm';

  // Added display name
  TemplateForm.displayName = 'TemplateForm';


  // Form state
  const [formValues, setFormValues] = useState({
    name: initialValues.name || '',
    description: initialValues.description || '',
    category: initialValues.category || 'Custom',
    tags: initialValues.tags || [],
    currentTag: ''
  });
  
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = useCallback((e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  // Handle tag input
  const handleTagChange = useCallback((e) => {
  // Added display name
  handleTagChange.displayName = 'handleTagChange';

    setFormValues(prev => ({
      ...prev,
      currentTag: e.target.value
    }));
  }, []);

  // Add a tag when Enter is pressed
  const handleAddTag = useCallback((e) => {
  // Added display name
  handleAddTag.displayName = 'handleAddTag';

    if (e.key === 'Enter' && formValues.currentTag.trim()) {
      const newTag = formValues.currentTag.trim();
      if (!formValues.tags.includes(newTag)) {
        setFormValues(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
          currentTag: ''
        }));
      }
      e.preventDefault();
    }
  }, [formValues.currentTag, formValues.tags]);

  // Remove a tag
  const handleRemoveTag = useCallback((tagToRemove) => {
  // Added display name
  handleRemoveTag.displayName = 'handleRemoveTag';

    setFormValues(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
  // Added display name
  validateForm.displayName = 'validateForm';

    const newErrors = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formValues.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formValues]);

  // Handle form submit
  const handleSubmit = useCallback(() => {
  // Added display name
  handleSubmit.displayName = 'handleSubmit';

    if (validateForm()) {
      // Prepare data to save
      const templateData = {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        category: formValues.category.trim(),
        tags: formValues.tags
      };
      
      onSave(templateData);
    }
  }, [formValues, onSave, validateForm]);

  // Combined categories with custom option
  const allCategories = [...new Set(['Custom', ...categories])];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm&quot; fullWidth>
      <DialogTitle>
        {editMode ? "Edit Template' : 'Save Flow as Template'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            name="name&quot;
            label="Template Name"
            value={formValues.name}
            onChange={handleChange}
            fullWidth
            margin="normal&quot;
            required
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          
          <TextField
            name="description"
            label="Description&quot;
            value={formValues.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Describe what this template does and when to use it&quot;
          />
          
          <FormControl fullWidth margin="normal" error={Boolean(errors.category)}>
            <InputLabel id="category-label&quot;>Category</InputLabel>
            <Select
              labelId="category-label"
              id="category&quot;
              name="category"
              value={formValues.category}
              onChange={handleChange}
            >
              {allCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2&quot; gutterBottom>
              Tags
            </Typography>
            
            <TextField
              name="currentTag"
              placeholder="Add tag and press Enter&quot;
              value={formValues.currentTag}
              onChange={handleTagChange}
              onKeyDown={handleAddTag}
              fullWidth
              size="small"
              helperText="Tags help with searching and categorizing templates&quot;
            />
            
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {formValues.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small&quot;
                />
              ))}
              {formValues.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary&quot;>
                  No tags added
                </Typography>
              )}
            </Stack>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            {editMode 
              ? 'Editing this template will not affect any flows already created from it.' 
              : 'This will save the current flow state as a reusable template.'}
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained&quot; color="primary" onClick={handleSubmit}>
          {editMode ? 'Update Template' : 'Save as Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TemplateForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  categories: PropTypes.array,
  editMode: PropTypes.bool
};

export default TemplateForm;