/**
 * cronstrue.js
 * -----------------------------------------------------------------------------
 * Enhanced stub implementation for the cronstrue library
 * for converting cron expressions to human-readable text.
 */

/**
 * Converts a cron expression into a human-readable string
 * 
 * @param {string} cronExpression - The cron expression to parse
 * @param {Object} [options] - Options for the parsed output
 * @returns {string} Human-readable description of the cron schedule
 */
function toString(cronExpression, options = {}) {
  // Added display name
  toString.displayName = 'toString';

  if (!cronExpression) {
    return 'Invalid cron expression';
  }
  
  // Normalize the cron expression
  let normalizedCron = cronExpression.trim();
  
  // Handle 6-part expressions (with seconds)
  let parts = normalizedCron.split(' ');
  let includesSeconds = parts.length === 6;
  
  if (includesSeconds) {
    // Remove seconds for standardizing our checks
    parts = parts.slice(1);
    normalizedCron = parts.join(' ');
  }
  
  // Check for standard 5-part expression
  if (parts.length !== 5 && !includesSeconds) {
    throw new Error('Invalid cron expression format. Expected 5 or 6 parts.');
  }
  
  // Simple implementation for common cron expressions
  const expressions = {
    '0 0 * * *': 'At midnight every day',
    '0 0 * * 0': 'At midnight on Sunday',
    '0 0 * * 1': 'At midnight on Monday',
    '0 0 * * 2': 'At midnight on Tuesday',
    '0 0 * * 3': 'At midnight on Wednesday',
    '0 0 * * 4': 'At midnight on Thursday',
    '0 0 * * 5': 'At midnight on Friday',
    '0 0 * * 6': 'At midnight on Saturday',
    '0 * * * *': 'Every hour',
    '*/5 * * * *': 'Every 5 minutes',
    '*/10 * * * *': 'Every 10 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 0 1 * *': 'At midnight on the 1st day of the month',
    '0 0 15 * *': 'At midnight on the 15th day of the month',
    '* * * * *': 'Every minute',
    '0 8 * * *': 'At 8:00 AM every day',
    '0 9 * * *': 'At 9:00 AM every day',
    '0 10 * * *': 'At 10:00 AM every day',
    '0 12 * * *': 'At 12:00 PM (noon) every day',
    '0 14 * * *': 'At 2:00 PM every day',
    '0 16 * * *': 'At 4:00 PM every day',
    '0 18 * * *': 'At 6:00 PM every day',
    '0 20 * * *': 'At 8:00 PM every day',
    '0 8 * * 1-5': 'At 8:00 AM Monday through Friday',
    '0 18 * * 1-5': 'At 6:00 PM Monday through Friday',
  };
  
  // Check our known expressions dictionary
  if (expressions[normalizedCron]) {
    return expressions[normalizedCron];
  }
  
  // Parse the cron expression
  try {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Handle specific times
    if (minute.match(/^\d+$/) && hour.match(/^\d+$/)) {
      let timeStr = '';
      const hourNum = parseInt(hour, 10);
      const minuteNum = parseInt(minute, 10);
      
      // Format the time
      if (hourNum === 0 && minuteNum === 0) {
        timeStr = 'midnight';
      } else if (hourNum === 12 && minuteNum === 0) {
        timeStr = 'noon';
      } else {
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        timeStr = `${hour12}:${minuteNum.toString().padStart(2, '0')} ${ampm}`;
      }
      
      // Format the time expression based on day/month constraints
      if (dayOfMonth !== '*' && dayOfWeek !== '*') {
        return `At ${timeStr} on the ${getDayWithSuffix(dayOfMonth)} day of the month and on ${getDayOfWeekName(dayOfWeek)}`;
      } else if (dayOfMonth !== '*') {
        return `At ${timeStr} on the ${getDayWithSuffix(dayOfMonth)} day of the month`;
      } else if (dayOfWeek !== '*') {
        return `At ${timeStr} on ${getDayOfWeekName(dayOfWeek)}`;
      } else if (month !== '*') {
        return `At ${timeStr} in ${getMonthName(month)}`;
      } else {
        return `At ${timeStr} every day`;
      }
    }
    
    // Handle intervals
    const minuteInterval = minute.match(/^\*\/(\d+)$/);
    if (minuteInterval) {
      const interval = minuteInterval[1];
      return `Every ${interval} minute${interval !== '1' ? 's' : ''}`;
    }
    
    const hourInterval = hour.match(/^\*\/(\d+)$/);
    if (hourInterval) {
      const interval = hourInterval[1];
      return `Every ${interval} hour${interval !== '1' ? 's' : ''}`;
    }
    
    // Default to a generic description
    return 'At the specified time according to the cron schedule';
  } catch (e) {
    return 'Invalid cron expression';
  }
}

/**
 * Helper function to get day of month with suffix
 */
function getDayWithSuffix(day) {
  // Added display name
  getDayWithSuffix.displayName = 'getDayWithSuffix';

  if (day === '*') return 'every';
  
  const num = parseInt(day, 10);
  if (isNaN(num)) return day;
  
  const suffixes = {
    1: 'st', 2: 'nd', 3: 'rd',
    21: 'st', 22: 'nd', 23: 'rd',
    31: 'st'
  };
  
  const suffix = suffixes[num] || 'th';
  return `${num}${suffix}`;
}

/**
 * Helper function to get day of week name
 */
function getDayOfWeekName(dayOfWeek) {
  // Added display name
  getDayOfWeekName.displayName = 'getDayOfWeekName';

  if (dayOfWeek === '*') return 'every day';
  
  const daysMap = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday',
    'SUN': 'Sunday', 'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday',
    'THU': 'Thursday', 'FRI': 'Friday', 'SAT': 'Saturday'
  };
  
  if (dayOfWeek.includes('-')) {
    const [start, end] = dayOfWeek.split('-');
    return `${daysMap[start] || start} through ${daysMap[end] || end}`;
  }
  
  if (dayOfWeek.includes(',')) {
    const days = dayOfWeek.split(',');
    return days.map(d => daysMap[d] || d).join(', ');
  }
  
  return daysMap[dayOfWeek] || dayOfWeek;
}

/**
 * Helper function to get month name
 */
function getMonthName(month) {
  // Added display name
  getMonthName.displayName = 'getMonthName';

  if (month === '*') return 'every month';
  
  const monthsMap = {
    '1': 'January', '2': 'February', '3': 'March', '4': 'April',
    '5': 'May', '6': 'June', '7': 'July', '8': 'August',
    '9': 'September', '10': 'October', '11': 'November', '12': 'December',
    'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
    'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
    'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
  };
  
  if (month.includes('-')) {
    const [start, end] = month.split('-');
    return `${monthsMap[start] || start} through ${monthsMap[end] || end}`;
  }
  
  if (month.includes(',')) {
    const months = month.split(',');
    return months.map(m => monthsMap[m] || m).join(', ');
  }
  
  return monthsMap[month] || month;
}

const cronstrue = { toString };

export default cronstrue;