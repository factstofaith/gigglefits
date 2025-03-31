/**
 * Accessibility-Enhanced Schedule Configuration
 *
 * A component for configuring integration execution schedules with enhanced accessibility.
 * Part of the zero technical debt accessibility implementation.
 *
 * @component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import cronstrue from 'cronstrue';
import { 
  useA11yAnnouncement, 
  useA11yKeyboard 
} from '../../hooks/a11y';
import A11yButton from '../common/A11yButton';
import { getFormFieldAttributes } from '../../utils/a11y/ariaAttributeHelper';

/**
 * Enhanced Schedule Configuration component with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {Object} props.schedule - Current schedule configuration
 * @param {Function} props.onChange - Function to call when schedule changes
 * @param {Object} props.errors - Validation errors object
 * @param {boolean} props.readOnly - Whether the component is in read-only mode
 * @returns {JSX.Element} The enhanced schedule configuration component
 */
const A11yScheduleConfiguration = ({ 
  schedule, 
  onChange, 
  errors = {}, 
  readOnly = false 
}) => {
  // Default configuration structure
  const defaultSchedule = {
    type: 'onDemand',
    cronExpression: '',
    timezone: 'UTC',
    effectiveDate: '',
    description: ''
  };
  
  // Predefined schedule options
  const scheduleOptions = [
    { value: 'onDemand', label: 'On demand', cron: '' },
    { value: 'daily2am', label: 'Daily @ 2am', cron: '0 0 2 * * *' },
    { value: 'daily6am', label: 'Daily @ 6am', cron: '0 0 6 * * *' },
    { value: 'hourly', label: 'Hourly', cron: '0 0 * * * *' },
    { value: 'weeklyFriday', label: 'Weekly on Fridays', cron: '0 0 2 * * 5' },
    { value: 'monthly1st', label: 'Monthly (1st day)', cron: '0 0 2 1 * *' },
    { value: 'custom', label: 'Custom', cron: '' }
  ];
  
  // Merge provided schedule with defaults
  const currentSchedule = { ...defaultSchedule, ...schedule };
  
  // State for custom cron expression editing
  const [isEditingCron, setIsEditingCron] = useState(false);
  const [cronValid, setCronValid] = useState(true);
  const [cronHumanReadable, setCronHumanReadable] = useState('');
  
  // Refs for interactive elements
  const cronInputRef = useRef(null);
  
  // A11y hooks
  const { announcePolite } = useA11yAnnouncement();
  const { registerKeyHandler } = useA11yKeyboard();
  
  // Update human-readable description when cron expression changes
  useEffect(() => {
    if (currentSchedule.cronExpression) {
      try {
        const readable = cronstrue.toString(currentSchedule.cronExpression);
        setCronHumanReadable(readable);
        setCronValid(true);
        
        // Announce the human-readable format to screen readers
        if (isEditingCron) {
          announcePolite(`Schedule will run ${readable.toLowerCase()}`);
        }
      } catch (error) {
        setCronHumanReadable('Invalid cron expression');
        setCronValid(false);
        
        if (isEditingCron) {
          announcePolite('Invalid cron expression format');
        }
      }
    } else {
      setCronHumanReadable('');
    }
  }, [currentSchedule.cronExpression, isEditingCron]);
  
  // Register keyboard handlers
  useEffect(() => {
    if (!isEditingCron) return;
    
    const handleEscapeKey = (e) => {
      setIsEditingCron(false);
      announcePolite('Cancelled editing cron expression');
    };
    
    return registerKeyHandler({
      'Escape': handleEscapeKey
    });
  }, [isEditingCron, registerKeyHandler]);
  
  // Memoize handleChange to prevent unnecessary recreations
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // If schedule type changes, update cron expression
    if (name === 'type') {
      const selectedOption = scheduleOptions.find(option => option.value === value);
      const newCronExpression = selectedOption?.cron || '';
      
      onChange({
        ...currentSchedule,
        type: value,
        cronExpression: value === 'custom' ? currentSchedule.cronExpression : newCronExpression
      });
      
      // Start editing cron immediately if custom is selected
      if (value === 'custom') {
        setIsEditingCron(true);
        announcePolite('Custom schedule selected. Please enter a cron expression.');
      } else {
        setIsEditingCron(false);
        
        // Announce the selected schedule type
        if (value === 'onDemand') {
          announcePolite('On demand schedule selected. The integration will run only when manually triggered.');
        } else if (selectedOption) {
          try {
            const readable = newCronExpression ? cronstrue.toString(newCronExpression) : '';
            announcePolite(`${selectedOption.label} selected. ${readable}`);
          } catch (error) {
            announcePolite(`${selectedOption.label} selected.`);
          }
        }
      }
    } else if (name === 'timezone') {
      onChange({
        ...currentSchedule,
        timezone: value
      });
      announcePolite(`Timezone changed to ${value}`);
    } else {
      onChange({
        ...currentSchedule,
        [name]: value
      });
      
      // Announce changes for specific fields
      if (name === 'effectiveDate' && value) {
        const date = new Date(value);
        announcePolite(`Effective date set to ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
      }
    }
  }, [currentSchedule, onChange, scheduleOptions, announcePolite]);
  
  // Memoize handleCronBlur to prevent unnecessary recreations
  const handleCronBlur = useCallback(() => {
    setIsEditingCron(false);
  }, []);
  
  // Start editing the cron expression
  const handleEditCron = useCallback(() => {
    setIsEditingCron(true);
    announcePolite('Editing cron expression. Press Escape to cancel.');
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (cronInputRef.current) {
        cronInputRef.current.focus();
      }
    }, 50);
  }, [announcePolite]);
  
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
  
  // Check if schedule is custom or a predefined option
  const isCustom = currentSchedule.type === 'custom';
  const isOnDemand = currentSchedule.type === 'onDemand';
  
  // Get form field attributes for ARIA
  const getFieldA11yAttributes = (fieldName, label, required = false) => {
    return getFormFieldAttributes({
      label,
      required,
      invalid: !!errors[fieldName],
      errorId: errors[fieldName] ? `${fieldName}-error` : undefined
    });
  };
  
  return (
    <Box 
      sx={{ mt: 2 }}
      role="region"
      aria-labelledby="schedule-configuration-heading"
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom
        id="schedule-configuration-heading"
        tabIndex={-1}
      >
        Schedule Configuration
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
            <Select
              labelId="schedule-type-label"
              id="schedule-type"
              name="type"
              value={currentSchedule.type}
              onChange={handleChange}
              label="Schedule Type"
              disabled={readOnly}
              {...getFieldA11yAttributes('type', 'Schedule Type', true)}
            >
              {scheduleOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.type && (
              <FormHelperText id="type-error" role="alert">
                {errors.type}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {!isOnDemand && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.timezone}>
              <InputLabel id="timezone-label">Timezone</InputLabel>
              <Select
                labelId="timezone-label"
                id="timezone"
                name="timezone"
                value={currentSchedule.timezone}
                onChange={handleChange}
                label="Timezone"
                disabled={readOnly}
                {...getFieldA11yAttributes('timezone', 'Timezone', true)}
              >
                {timezones.map(tz => (
                  <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                ))}
              </Select>
              {errors.timezone && (
                <FormHelperText id="timezone-error" role="alert">
                  {errors.timezone}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        )}
        
        {/* Custom Cron Expression */}
        {(isCustom || currentSchedule.cronExpression) && !isOnDemand && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              {isEditingCron ? (
                <TextField
                  fullWidth
                  inputRef={cronInputRef}
                  name="cronExpression"
                  id="cronExpression"
                  label="Cron Expression"
                  value={currentSchedule.cronExpression}
                  onChange={handleChange}
                  onBlur={handleCronBlur}
                  error={!cronValid || !!errors.cronExpression}
                  helperText={errors.cronExpression || "Format: sec min hour day month weekday (e.g., '0 0 2 * * *' for daily at 2am)"}
                  disabled={readOnly}
                  autoFocus
                  aria-describedby="cron-format-help"
                  {...getFieldA11yAttributes('cronExpression', 'Cron Expression', isCustom)}
                />
              ) : (
                <>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" id="cron-label">
                      Cron Expression:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={currentSchedule.cronExpression || "None"} 
                        variant="outlined" 
                        color={cronValid ? "primary" : "error"}
                        aria-labelledby="cron-label"
                      />
                      {!readOnly && (
                        <A11yButton 
                          size="small" 
                          onClick={handleEditCron}
                          a11yLabel="Edit cron expression"
                          a11yAnnouncement="Editing cron expression"
                          variant="outlined"
                          startIcon={<EditIcon fontSize="small" />}
                        >
                          Edit
                        </A11yButton>
                      )}
                      <Tooltip title="Cron expressions define the schedule pattern using 6 fields: second minute hour day month weekday">
                        <IconButton 
                          size="small"
                          aria-label="Cron expression format information"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {cronHumanReadable && (
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ mt: 0.5 }}
                        aria-live="polite"
                        id="cron-human-readable"
                      >
                        {cronHumanReadable}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
            <div id="cron-format-help" className="sr-only" aria-hidden="true">
              Format: seconds minutes hours day-of-month month day-of-week.
              For example, 0 0 2 * * * means daily at 2am.
              Use asterisks as wildcards for any value.
            </div>
          </Grid>
        )}
        
        {/* Effective Date - when the schedule should start */}
        {!isOnDemand && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.effectiveDate}>
              <TextField
                name="effectiveDate"
                id="effectiveDate"
                label="Effective From (Optional)"
                type="datetime-local"
                value={currentSchedule.effectiveDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                disabled={readOnly}
                error={!!errors.effectiveDate}
                helperText={errors.effectiveDate || "Leave blank to start immediately"}
                {...getFieldA11yAttributes('effectiveDate', 'Effective From')}
                aria-describedby="effective-date-help"
              />
              <span id="effective-date-help" className="sr-only">
                The date and time when this schedule should become active. If left blank, the schedule will become active immediately after saving.
              </span>
            </FormControl>
          </Grid>
        )}
        
        {/* Schedule Description */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              name="description"
              id="scheduleDescription"
              label="Schedule Description (Optional)"
              value={currentSchedule.description}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={readOnly}
              helperText="Add notes about this schedule for other team members"
              {...getFieldA11yAttributes('description', 'Schedule Description')}
            />
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Hidden style for screen reader only content */}
      <style jsx="true">{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </Box>
  );
};

A11yScheduleConfiguration.propTypes = {
  schedule: PropTypes.shape({
    type: PropTypes.string,
    cronExpression: PropTypes.string,
    timezone: PropTypes.string,
    effectiveDate: PropTypes.string,
    description: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
};

export default A11yScheduleConfiguration;