import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  TextField,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 320,
    padding: theme.spacing(2),
    boxSizing: 'border-box',
  },
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

/**
 * ApplicationFilterPanel component
 * 
 * A sliding panel that provides advanced filtering capabilities for applications
 * with multiple filter criteria including status, date ranges, type, and more.
 */
const ApplicationFilterPanel = ({ open, onClose, onApplyFilters }) => {
  // Filter state
  const [filters, setFilters] = useState({
    status: [],
    createdDateRange: [null, null],
    updatedDateRange: [null, null],
    type: '',
    tags: [],
    hasDatasources: false,
    sortBy: 'updated_at',
    sortDirection: 'desc',
  });

  // Application types available in the system
  const applicationTypes = [
    'API Integration',
    'Data Transformation',
    'ETL Process',
    'Reporting',
    'Analytics',
    'Custom',
  ];

  // Handle checkbox group changes
  const handleStatusChange = (event) => {
    const { value, checked } = event.target;
    setFilters(prev => ({
      ...prev,
      status: checked
        ? [...prev.status, value]
        : prev.status.filter(status => status !== value)
    }));
  };

  // Handle radio group changes
  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date range changes
  const handleDateChange = (name, index, value) => {
    setFilters(prev => {
      const newRange = [...prev[name]];
      newRange[index] = value;
      return {
        ...prev,
        [name]: newRange
      };
    });
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Reset all filters to default values
  const handleResetFilters = () => {
    setFilters({
      status: [],
      createdDateRange: [null, null],
      updatedDateRange: [null, null],
      type: '',
      tags: [],
      hasDatasources: false,
      sortBy: 'updated_at',
      sortDirection: 'desc',
    });
  };

  // Apply filters and close panel
  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <FilterDrawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <FilterHeader>
        <Typography variant="h6" display="flex" alignItems="center">
          <FilterListIcon sx={{ mr: 1 }} />
          Filter Applications
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </FilterHeader>

      <Divider sx={{ mb: 3 }} />

      {/* Status Filter */}
      <FilterSection>
        <Typography variant="subtitle2" gutterBottom>
          Status
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes('draft')}
                onChange={handleStatusChange}
                value="draft"
              />
            }
            label="Draft"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes('active')}
                onChange={handleStatusChange}
                value="active"
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes('inactive')}
                onChange={handleStatusChange}
                value="inactive"
              />
            }
            label="Inactive"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes('deprecated')}
                onChange={handleStatusChange}
                value="deprecated"
              />
            }
            label="Deprecated"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes('pending_review')}
                onChange={handleStatusChange}
                value="pending_review"
              />
            }
            label="Pending Review"
          />
        </FormGroup>
      </FilterSection>

      {/* Date Range Filters */}
      <FilterSection>
        <Typography variant="subtitle2" gutterBottom>
          Created Date Range
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.createdDateRange[0] || ''}
            onChange={(e) => handleDateChange('createdDateRange', 0, e.target.value)}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.createdDateRange[1] || ''}
            onChange={(e) => handleDateChange('createdDateRange', 1, e.target.value)}
          />
        </Stack>

        <Typography variant="subtitle2" gutterBottom>
          Last Updated Date Range
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label="From"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.updatedDateRange[0] || ''}
            onChange={(e) => handleDateChange('updatedDateRange', 0, e.target.value)}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.updatedDateRange[1] || ''}
            onChange={(e) => handleDateChange('updatedDateRange', 1, e.target.value)}
          />
        </Stack>
      </FilterSection>

      {/* Application Type Filter */}
      <FilterSection>
        <FormControl fullWidth size="small">
          <InputLabel>Application Type</InputLabel>
          <Select
            value={filters.type}
            label="Application Type"
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {applicationTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterSection>

      {/* Additional Filters */}
      <FilterSection>
        <Typography variant="subtitle2" gutterBottom>
          Additional Filters
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.hasDatasources}
              onChange={handleCheckboxChange}
              name="hasDatasources"
            />
          }
          label="Has Datasources"
        />
      </FilterSection>

      {/* Sort Options */}
      <FilterSection>
        <Typography variant="subtitle2" gutterBottom>
          Sort By
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            name="sortBy"
            value={filters.sortBy}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="name" control={<Radio />} label="Name" />
            <FormControlLabel value="created_at" control={<Radio />} label="Creation Date" />
            <FormControlLabel value="updated_at" control={<Radio />} label="Last Updated" />
          </RadioGroup>
        </FormControl>
      </FilterSection>

      <FilterSection>
        <Typography variant="subtitle2" gutterBottom>
          Sort Direction
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            name="sortDirection"
            value={filters.sortDirection}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="asc" control={<Radio />} label="Ascending" />
            <FormControlLabel value="desc" control={<Radio />} label="Descending" />
          </RadioGroup>
        </FormControl>
      </FilterSection>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<RestartAltIcon />}
          onClick={handleResetFilters}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </Box>
    </FilterDrawer>
  );
};

ApplicationFilterPanel.propTypes = {
  /**
   * Whether the filter panel is open
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback function called when the panel is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * Callback function called when filters are applied
   * @param {Object} filters - The selected filter criteria
   */
  onApplyFilters: PropTypes.func.isRequired,
};

export default ApplicationFilterPanel;