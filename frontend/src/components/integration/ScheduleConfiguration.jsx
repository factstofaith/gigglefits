// ScheduleConfiguration.jsx
// -----------------------------------------------------------------------------
// Component for configuring integration execution schedules

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Chip, FormControl, FormHelperText, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import cronstrue from 'cronstrue';
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const ScheduleConfiguration = ({
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
  const scheduleOptions = [{
    value: 'onDemand',
    label: 'On demand',
    cron: ''
  }, {
    value: 'daily2am',
    label: 'Daily @ 2am',
    cron: '0 0 2 * * *'
  }, {
    value: 'daily6am',
    label: 'Daily @ 6am',
    cron: '0 0 6 * * *'
  }, {
    value: 'hourly',
    label: 'Hourly',
    cron: '0 0 * * * *'
  }, {
    value: 'weeklyFriday',
    label: 'Weekly on Fridays',
    cron: '0 0 2 * * 5'
  }, {
    value: 'monthly1st',
    label: 'Monthly (1st day)',
    cron: '0 0 2 1 * *'
  }, {
    value: 'custom',
    label: 'Custom',
    cron: ''
  }];

  // Merge provided schedule with defaults
  const currentSchedule = {
    ...defaultSchedule,
    ...schedule
  };

  // State for custom cron expression editing
  const [isEditingCron, setIsEditingCron] = useState(false);
  const [cronValid, setCronValid] = useState(true);
  const [cronHumanReadable, setCronHumanReadable] = useState('');

  // Update human-readable description when cron expression changes
  useEffect(() => {
    if (currentSchedule.cronExpression) {
      try {
        const readable = cronstrue.toString(currentSchedule.cronExpression);
        setCronHumanReadable(readable);
        setCronValid(true);
      } catch (error) {
        setCronHumanReadable('Invalid cron expression');
        setCronValid(false);
      }
    } else {
      setCronHumanReadable('');
    }
  }, [currentSchedule.cronExpression]);

  // Memoize handleChange to prevent unnecessary recreations
  const handleChange = useCallback(e => {
    const {
      name,
      value
    } = e.target;

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
      } else {
        setIsEditingCron(false);
      }
    } else {
      onChange({
        ...currentSchedule,
        [name]: value
      });
    }
  }, [currentSchedule, onChange, scheduleOptions]);

  // Memoize handleCronBlur to prevent unnecessary recreations
  const handleCronBlur = useCallback(() => {
    setIsEditingCron(false);
  }, []);
  const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];

  // Check if schedule is custom or a predefined option
  const isCustom = currentSchedule.type === 'custom';
  const isOnDemand = currentSchedule.type === 'onDemand';
  return <Box sx={{
    mt: 2
  }}>
      <Typography variant="subtitle1" gutterBottom>
        Schedule Configuration
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Schedule Type</InputLabel>
            <Select name="type" value={currentSchedule.type} onChange={handleChange} label="Schedule Type" disabled={readOnly}>

              {scheduleOptions.map(option => <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>)}

            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
        </Grid>
        
        {!isOnDemand && <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.timezone}>
              <InputLabel>Timezone</InputLabel>
              <Select name="timezone" value={currentSchedule.timezone} onChange={handleChange} label="Timezone" disabled={readOnly}>

                {timezones.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}

              </Select>
              {errors.timezone && <FormHelperText>{errors.timezone}</FormHelperText>}
            </FormControl>
          </Grid>}

        
        {/* Custom Cron Expression */}
        {(isCustom || currentSchedule.cronExpression) && !isOnDemand && <Grid item xs={12}>
            <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1
        }}>
              {isEditingCron ? <TextField fullWidth name="cronExpression" label="Cron Expression" value={currentSchedule.cronExpression} onChange={handleChange} onBlur={handleCronBlur} error={!cronValid || !!errors.cronExpression} helperText={errors.cronExpression || "Format: sec min hour day month weekday (e.g., '0 0 2 * * *' for daily at 2am)"} disabled={readOnly} autoFocus /> : <>
                  <Box sx={{
              flexGrow: 1
            }}>
                    <Typography variant="subtitle2">Cron Expression:</Typography>
                    <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                      <Chip label={currentSchedule.cronExpression || "None"} variant="outlined" color={cronValid ? "primary" : "error"} />

                      {!readOnly && <IconButton size="small" onClick={() => setIsEditingCron(true)} title="Edit cron expression">

                          <EditIcon fontSize="small" />
                        </IconButton>}

                      <Tooltip title="Cron expressions define the schedule pattern using 6 fields: second minute hour day month weekday">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {cronHumanReadable && <Typography variant="body2" color="textSecondary" sx={{
                mt: 0.5
              }}>
                        {cronHumanReadable}
                      </Typography>}

                  </Box>
                </>}

            </Box>
          </Grid>}

        
        {/* Effective Date - when the schedule should start */}
        {!isOnDemand && <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.effectiveDate}>
              <TextField name="effectiveDate" label="Effective From (Optional)" type="datetime-local" value={currentSchedule.effectiveDate} onChange={handleChange} InputLabelProps={{
            shrink: true
          }} disabled={readOnly} error={!!errors.effectiveDate} helperText={errors.effectiveDate || "Leave blank to start immediately"} />

            </FormControl>
          </Grid>}

        
        {/* Schedule Description */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField name="description" label="Schedule Description (Optional)" value={currentSchedule.description} onChange={handleChange} multiline rows={2} disabled={readOnly} helperText="Add notes about this schedule for other team members" />

          </FormControl>
        </Grid>
      </Grid>
    </Box>;
};
export default ScheduleConfiguration;