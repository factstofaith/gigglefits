/**
 * Schema Configuration Step
 *
 * Fourth step of the dataset creation wizard that allows configuring
 * the schema for the dataset, either by manual definition, auto-discovery,
 * or uploading a schema file.
 *
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { FIELD_TYPES, getFieldTypeOptions } from '../dataset_wizard_utils';

/**
 * Schema Configuration Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The SchemaConfigStep component
 */
const SchemaConfigStep = ({ formik }) => {
  const [schemaDefinitionMethod, setSchemaDefinitionMethod] = useState(
    formik.values.schemaDefinitionMethod || 'auto'
  );
  const [expandedField, setExpandedField] = useState(null);
  const fieldTypeOptions = getFieldTypeOptions();

  /**
   * Handle schema definition method change
   * @param {Event} event - Change event
   */
  const handleMethodChange = (event) => {
    const method = event.target.value;
    setSchemaDefinitionMethod(method);
    formik.setFieldValue('schemaDefinitionMethod', method);
  };

  /**
   * Add a new field to the schema
   */
  const handleAddField = () => {
    const newField = {
      name: '',
      type: FIELD_TYPES.STRING,
      description: '',
      required: false,
      defaultValue: '',
      constraints: {},
    };

    formik.setFieldValue('schema', [...formik.values.schema, newField]);
  };

  /**
   * Update a field in the schema
   * @param {number} index - Field index
   * @param {string} fieldName - Field property name
   * @param {any} value - New value
   */
  const handleFieldChange = (index, fieldName, value) => {
    const updatedSchema = [...formik.values.schema];
    updatedSchema[index] = {
      ...updatedSchema[index],
      [fieldName]: value,
    };
    formik.setFieldValue('schema', updatedSchema);
  };

  /**
   * Remove a field from the schema
   * @param {number} index - Field index
   */
  const handleRemoveField = (index) => {
    const updatedSchema = formik.values.schema.filter((_, i) => i !== index);
    formik.setFieldValue('schema', updatedSchema);
  };

  /**
   * Toggle field expansion
   * @param {number} index - Field index
   */
  const toggleFieldExpansion = (index) => {
    setExpandedField(expandedField === index ? null : index);
  };

  /**
   * Handle schema file upload
   * @param {Event} event - Change event
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('schemaFile', file);
    }
  };

  /**
   * Render the appropriate form based on the schema definition method
   */
  const renderSchemaForm = () => {
    switch (schemaDefinitionMethod) {
      case 'manual':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Define Schema Fields</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddField}
              >
                Add Field
              </Button>
            </Box>

            {formik.values.schema.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No fields defined yet. Click "Add Field" to start defining your schema.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.schema.map((field, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={field.name}
                              onChange={(e) =>
                                handleFieldChange(index, 'name', e.target.value)
                              }
                              placeholder="Field name"
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={field.type}
                                onChange={(e) =>
                                  handleFieldChange(index, 'type', e.target.value)
                                }
                              >
                                {fieldTypeOptions.map((option) => (
                                  <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={field.required ? 'yes' : 'no'}
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  'required',
                                  e.target.value === 'yes'
                                )
                              }
                              size="small"
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Expand">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleFieldExpansion(index)}
                                >
                                  {expandedField === index ? (
                                    <ExpandLessIcon />
                                  ) : (
                                    <ExpandMoreIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveField(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0 }}>
                            <Collapse
                              in={expandedField === index}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Description"
                                      value={field.description}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          index,
                                          'description',
                                          e.target.value
                                        )
                                      }
                                      multiline
                                      rows={2}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Default Value"
                                      value={field.defaultValue || ''}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          index,
                                          'defaultValue',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      case 'auto':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Paste a sample of your data below. The system will automatically
              detect the schema based on this sample.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Sample Data"
              name="sampleData"
              value={formik.values.sampleData}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.sampleData && Boolean(formik.errors.sampleData)
              }
              helperText={
                formik.touched.sampleData && formik.errors.sampleData
              }
              placeholder="Paste JSON, CSV, or other structured data here"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AutoFixHighIcon />}
              sx={{ mt: 2 }}
              // In a real implementation, this would trigger schema discovery
              // For now it's just a placeholder
              onClick={() => console.log('Discover schema from sample data')}
            >
              Discover Schema
            </Button>
          </Box>
        );

      case 'upload':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload a schema file (JSON Schema, XSD, etc.) to define your dataset structure.
            </Alert>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 2,
              }}
            >
              <input
                accept=".json,.xsd,.xml,.avsc"
                id="schema-file-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="schema-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Schema File
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Supported formats: JSON Schema, XSD, Avro Schema
              </Typography>
            </Box>
            {formik.values.schemaFile && (
              <Alert severity="success">
                File uploaded: {formik.values.schemaFile.name}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="schema-definition-method-label">
          Schema Definition Method
        </InputLabel>
        <Select
          labelId="schema-definition-method-label"
          id="schemaDefinitionMethod"
          value={schemaDefinitionMethod}
          onChange={handleMethodChange}
          label="Schema Definition Method"
        >
          <MenuItem value="auto">Automatic Schema Discovery</MenuItem>
          <MenuItem value="manual">Manual Schema Definition</MenuItem>
          <MenuItem value="upload">Upload Schema File</MenuItem>
        </Select>
        <FormHelperText>
          Choose how you want to define the schema for your dataset
        </FormHelperText>
      </FormControl>

      <Divider sx={{ mb: 3 }} />

      {renderSchemaForm()}
    </Box>
  );
};

SchemaConfigStep.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default SchemaConfigStep;