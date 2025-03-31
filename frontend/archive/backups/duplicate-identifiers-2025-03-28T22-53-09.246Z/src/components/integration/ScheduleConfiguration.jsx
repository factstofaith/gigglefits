// ScheduleConfiguration.jsx
// -----------------------------------------------------------------------------
// Component for configuring integration execution schedules

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Select
} from '../../design-system/adapter';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import cronstrue from '@utils/cronstrue';
import { format, parse } from 'date-fns';
import Box from '@mui/material/Box';
const ScheduleConfiguration = ({ schedule, onChange, errors = {}, readOnly = false }) => {
  // Added display name
  ScheduleConfiguration.displayName = 'ScheduleConfiguration';

  // Added display name
  ScheduleConfiguration.displayName = 'ScheduleConfiguration';

  // Added display name
  ScheduleConfiguration.displayName = 'ScheduleConfiguration';


  // Default configuration structure
  const defaultSchedule = {
    type: 'onDemand',
    cronExpression: '',
    timezone: 'UTC',
    effectiveDate: '',
    description: '',
  };

  // Predefined schedule options
  const scheduleOptions = [
    { value: 'onDemand', label: 'Run manually (on demand)', cron: '' },
    { value: 'daily', label: 'Daily', cron: '', isPreset: true },
    { value: 'weekly', label: 'Weekly', cron: '', isPreset: true },
    { value: 'monthly', label: 'Monthly', cron: '', isPreset: true },
    { value: 'custom', label: 'Custom schedule', cron: '' },
  ];

  // Merge provided schedule with defaults
  const currentSchedule = { ...defaultSchedule, ...schedule };

  // Add additional schedule settings
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1);
  const [scheduleTimeObj, setScheduleTimeObj] = useState(() => {
    // Initialize with 8:00 AM or parse from existing time in HH:MM format
    if (currentSchedule.cronExpression) {
      const timeParts = currentSchedule.cronExpression.split(' ');
      if (timeParts.length >= 3) {
        const hours = parseInt(timeParts[2]);
        const minutes = parseInt(timeParts[1]);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          return parse(timeStr, 'HH:mm', new Date());
        }
      }
    }
    return parse('08:00', 'HH:mm', new Date());
  });

  // State for custom cron expression editing
  const [isEditingCron, setIsEditingCron] = useState(false);
  const [cronValid, setCronValid] = useState(true);
  const [cronHumanReadable, setCronHumanReadable] = useState('');

  // Generate days of the week for selection
  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
  ];

  // Generate days of the month for selection
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}${getDaySuffix(i + 1)}`,
  }));

  // Helper function to get day suffix (1st, 2nd, 3rd, etc.)
  function getDaySuffix(day) {
  // Added display name
  getDaySuffix.displayName = 'getDaySuffix';

    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

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

  // Generate cron expression from user-friendly options
  const generateCronExpression = (scheduleType, timeObj, dayOfWeek, dayOfMonth) => {
  // Added display name
  generateCronExpression.displayName = 'generateCronExpression';

  // Added display name
  generateCronExpression.displayName = 'generateCronExpression';

  // Added display name
  generateCronExpression.displayName = 'generateCronExpression';


    // Extract hours and minutes from time object
    const hours = timeObj.getHours();
    const minutes = timeObj.getMinutes();

    switch (scheduleType) {
      case 'daily':
        return `0 ${minutes} ${hours} * * *`;
      case 'weekly':
        // In cron, 0 = Sunday, 1 = Monday, etc.
        return `0 ${minutes} ${hours} * * ${dayOfWeek}`;
      case 'monthly':
        return `0 ${minutes} ${hours} ${dayOfMonth} * *`;
      default:
        return '';
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'type') {
      const selectedOption = scheduleOptions.find(option => option.value === value);
      let newCronExpression = selectedOption?.cron || '';

      // Generate cron expression for preset schedule types
      if (value === 'daily' || value === 'weekly' || value === 'monthly') {
        newCronExpression = generateCronExpression(
          value,
          scheduleTimeObj,
          scheduleDayOfWeek,
          scheduleDayOfMonth
        );
      }

      onChange({
        ...currentSchedule,
        type: value,
        cronExpression: value === 'custom' ? currentSchedule.cronExpression : newCronExpression,
      });

      // Start editing cron immediately if custom is selected
      if (value === 'custom') {
        setIsEditingCron(true);
      } else {
        setIsEditingCron(false);
      }
    } else if (name === 'scheduleDayOfWeek') {
      // Update day of week and regenerate cron if using weekly schedule
      setScheduleDayOfWeek(value);

      if (currentSchedule.type === 'weekly') {
        const newCronExpression = generateCronExpression(
          'weekly',
          scheduleTimeObj,
          value,
          scheduleDayOfMonth
        );

        onChange({
          ...currentSchedule,
          cronExpression: newCronExpression,
        });
      }
    } else if (name === 'scheduleDayOfMonth') {
      // Update day of month and regenerate cron if using monthly schedule
      setScheduleDayOfMonth(value);

      if (currentSchedule.type === 'monthly') {
        const newCronExpression = generateCronExpression(
          'monthly',
          scheduleTimeObj,
          scheduleDayOfWeek,
          value
        );

        onChange({
          ...currentSchedule,
          cronExpression: newCronExpression,
        });
      }
    } else {
      onChange({
        ...currentSchedule,
        [name]: value,
      });
    }
  };

  // Handle time picker change
  const handleTimeChange = newTime => {
    if (!newTime) return;

    setScheduleTimeObj(newTime);

    if (['daily', 'weekly', 'monthly'].includes(currentSchedule.type)) {
      const newCronExpression = generateCronExpression(
        currentSchedule.type,
        newTime,
        scheduleDayOfWeek,
        scheduleDayOfMonth
      );

      onChange({
        ...currentSchedule,
        cronExpression: newCronExpression,
      });
    }
  };

  const handleCronBlur = () => {
  // Added display name
  handleCronBlur.displayName = 'handleCronBlur';

  // Added display name
  handleCronBlur.displayName = 'handleCronBlur';

  // Added display name
  handleCronBlur.displayName = 'handleCronBlur';


    setIsEditingCron(false);
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  // Check if schedule is custom or a predefined option
  const isCustom = currentSchedule.type === 'custom';
  const isOnDemand = currentSchedule.type === 'onDemand';
  const isDaily = currentSchedule.type === 'daily';
  const isWeekly = currentSchedule.type === 'weekly';
  const isMonthly = currentSchedule.type === 'monthly';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box style={{ marginTop: '16px' }}>
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Schedule Configuration
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box style={{ marginBottom: '16px' }}>
              <Typography 
                variant="body2" 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: 'medium',
                  color: errors.type ? '#d32f2f' : '#666666'
                }}
              >
                Schedule Type
              </Typography>
              <Select
                name="type"
                value={currentSchedule.type}
                onChange={handleChange}
                disabled={readOnly}
                options={scheduleOptions.map(option => ({ value: option.value, label: option.label }))}
                fullWidth
                error={!!errors.type}
              />
              {errors.type && (
                <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                  {errors.type}
                </Typography>
              )}
            </Box>
          </Grid>

          {!isOnDemand && (
            <Grid item xs={12} md={6}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ 
                    marginBottom: '4px', 
                    fontWeight: 'medium',
                    color: errors.timezone ? '#d32f2f' : '#666666'
                  }}
                >
                  Timezone
                </Typography>
                <Select
                  name="timezone"
                  value={currentSchedule.timezone}
                  onChange={handleChange}
                  disabled={readOnly}
                  options={timezones.map(tz => ({ value: tz, label: tz }))}
                  fullWidth
                  error={!!errors.timezone}
                />
                {errors.timezone && (
                  <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '4px' }}>
                    {errors.timezone}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Schedule Configuration Options */}
          {!isOnDemand && !isCustom && (
            <Grid item xs={12}>
              <Box
                style={{
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  marginBottom: '16px'
                }}
              >
                <Typography variant="subtitle2" style={{ marginBottom: '16px' }}>
                  Schedule Settings
                </Typography>

                <Grid container spacing={2} style={{ alignItems: 'center' }}>
                  {/* Time Picker */}
                  <Grid item xs={12} sm={isDaily ? 12 : 6} md={isDaily ? 6 : 4}>
                    <Box style={{ marginBottom: '16px' }}>
                      <TimePicker
                        label="Time"
                        value={scheduleTimeObj}
                        onChange={handleTimeChange}
                        disabled={readOnly}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                          },
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        style={{ 
                          color: '#666666', 
                          display: 'block', 
                          marginTop: '4px' 
                        }}
                      >
                        Set the time ({currentSchedule.timezone})
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Day of Week Selector (for weekly schedules) */}
                  {isWeekly && (
                    <Grid item xs={12} sm={6} md={8}>
                      <Box style={{ marginBottom: '16px' }}>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            marginBottom: '4px', 
                            fontWeight: 'medium',
                            color: '#666666'
                          }}
                        >
                          Day of Week
                        </Typography>
                        <Select
                          name="scheduleDayOfWeek"
                          value={scheduleDayOfWeek}
                          onChange={handleChange}
                          disabled={readOnly}
                          options={daysOfWeek.map(day => ({ value: day.value, label: day.label }))}
                          fullWidth
                        />
                        <Typography 
                          variant="caption" 
                          style={{ 
                            color: '#666666', 
                            display: 'block', 
                            marginTop: '4px' 
                          }}
                        >
                          Select which day of the week the job should run
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Day of Month Selector (for monthly schedules) */}
                  {isMonthly && (
                    <Grid item xs={12} sm={6} md={8}>
                      <Box style={{ marginBottom: '16px' }}>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            marginBottom: '4px', 
                            fontWeight: 'medium',
                            color: '#666666'
                          }}
                        >
                          Day of Month
                        </Typography>
                        <Select
                          name="scheduleDayOfMonth"
                          value={scheduleDayOfMonth}
                          onChange={handleChange}
                          disabled={readOnly}
                          options={daysOfMonth.map(day => ({ value: day.value, label: day.label }))}
                          fullWidth
                        />
                        <Typography 
                          variant="caption" 
                          style={{ 
                            color: '#666666', 
                            display: 'block', 
                            marginTop: '4px' 
                          }}
                        >
                          Select which day of the month the job should run
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Custom Cron Expression */}
          {(isCustom || currentSchedule.cronExpression) && !isOnDemand && (
            <Grid item xs={12}>
              <Box 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  marginBottom: '16px' 
                }}
              >
                {isEditingCron ? (
                  <TextField
                    fullWidth
                    name="cronExpression"
                    label="Cron Expression"
                    value={currentSchedule.cronExpression}
                    onChange={handleChange}
                    onBlur={handleCronBlur}
                    error={!cronValid || !!errors.cronExpression}
                    helperText={
                      errors.cronExpression ||
                      "Format: sec min hour day month weekday (e.g., '0 0 2 * * *' for daily at 2am)"
                    }
                    disabled={readOnly}
                    autoFocus
                  />
                ) : (
                  <>
                    <Box style={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
                        Cron Expression:
                      </Typography>
                      <Box 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}
                      >
                        <Chip
                          label={currentSchedule.cronExpression || 'None'}
                          variant="outlined"
                          color={cronValid ? 'primary' : 'error'}
                        />
                        {!readOnly && (
                          <Box
                            as="button"
                            onClick={() => setIsEditingCron(true)}
                            title="Edit cron expression"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              border: 'none',
                              borderRadius: '50%',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <EditIcon style={{ fontSize: '18px' }} />
                          </Box>
                        )}
                        <Box
                          as="button"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            border: 'none',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Cron expressions define the schedule pattern using 6 fields: second minute hour day month weekday"
                        >
                          <InfoIcon style={{ fontSize: '18px' }} />
                        </Box>
                      </Box>
                      {cronHumanReadable && (
                        <Typography 
                          variant="body2" 
                          style={{ 
                            color: '#666666', 
                            marginTop: '4px' 
                          }}
                        >
                          {cronHumanReadable}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          )}

          {/* Effective Date - when the schedule should start */}
          {!isOnDemand && (
            <Grid item xs={12} md={6}>
              <Box style={{ marginBottom: '16px' }}>
                <Typography 
                  variant="body2" 
                  style={{ 
                    marginBottom: '4px', 
                    fontWeight: 'medium',
                    color: errors.effectiveDate ? '#d32f2f' : '#666666'
                  }}
                >
                  Effective From (Optional)
                </Typography>
                <TextField
                  name="effectiveDate"
                  type="datetime-local"
                  value={currentSchedule.effectiveDate}
                  onChange={handleChange}
                  disabled={readOnly}
                  error={!!errors.effectiveDate}
                  fullWidth
                  style={{ marginBottom: '4px' }}
                />
                <Typography 
                  variant="caption" 
                  style={{ 
                    color: errors.effectiveDate ? '#d32f2f' : '#666666',
                    display: 'block'
                  }}
                >
                  {errors.effectiveDate || 'Leave blank to start immediately'}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Schedule Description */}
          <Grid item xs={12}>
            <Box style={{ marginBottom: '16px' }}>
              <Typography 
                variant="body2" 
                style={{ 
                  marginBottom: '4px', 
                  fontWeight: 'medium',
                  color: '#666666'
                }}
              >
                Schedule Description (Optional)
              </Typography>
              <TextField
                name="description"
                value={currentSchedule.description}
                onChange={handleChange}
                multiline
                rows={2}
                disabled={readOnly}
                fullWidth
                style={{ marginBottom: '4px' }}
              />
              <Typography 
                variant="caption" 
                style={{ 
                  color: '#666666',
                  display: 'block'
                }}
              >
                Add notes about this schedule for other team members
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleConfiguration;
