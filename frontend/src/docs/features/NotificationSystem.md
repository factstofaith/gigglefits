# TAP Integration Platform Notification System

## Overview

The notification system provides a comprehensive solution for displaying both temporary toast notifications and persistent notifications that users can access through a notification center. The system is designed to be used throughout the application and supports different notification types (info, success, warning, error).

## Components

1. **NotificationContext**: The central state management for all notifications
2. **Toast**: Individual toast notification component
3. **ToastContainer**: Container for displaying toast notifications
4. **NotificationCenter**: UI for accessing persistent notifications with badge counter
5. **notificationHelper**: Utility for using notifications in non-component contexts

## Features

- **Toast Notifications**: Temporary messages that appear and automatically disappear
- **Persistent Notifications**: History of important notifications accessible through the notification center
- **Notification Types**: Support for info, success, warning, and error notifications
- **Service Integration**: Allows services to trigger notifications without direct hook access
- **Action Buttons**: Notifications can include action buttons for direct user interaction
- **Customization**: Support for different durations, titles, and content

## Usage

### Component Usage

```jsx
import useNotification from '../hooks/useNotification';

function MyComponent() {
  const { showToast, addNotification } = useNotification();

  const handleSuccess = () => {
    showToast('Operation completed successfully', 'success', {
      title: 'Success'
    });
  };

  const handleImportantAlert = () => {
    addNotification({
      title: 'System Update',
      message: 'The system will undergo maintenance tonight at 2:00 AM EST',
      type: 'warning'
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Complete Operation</button>
      <button onClick={handleImportantAlert}>Show Important Alert</button>
    </div>
  );
}
```

### Service Usage

```js
import { createNotificationManager } from '../utils/notificationHelper';

async function myServiceFunction() {
  const notifications = createNotificationManager();
  
  try {
    // Some async operation
    const result = await apiCall();
    
    notifications.showToast('Operation successful', 'success');
    return result;
  } catch (error) {
    notifications.showToast('Operation failed', 'error', {
      title: 'Error',
      duration: 8000
    });
    throw error;
  }
}
```

## Implementation Details

1. The system uses React's Context API for state management
2. Notification persistence is managed through the NotificationProvider
3. Toast notifications automatically disappear after a configurable duration
4. The notification center shows a badge with the number of unread notifications
5. Services can trigger notifications through the notificationHelper utility

## Best Practices

1. Use toast notifications for immediate feedback on user actions
2. Use persistent notifications for important events that users might want to reference later
3. Choose the appropriate notification type based on the message importance
4. Keep notification messages concise and clear
5. Include action buttons when users might want to take action based on the notification
6. Use consistent notification patterns throughout the application

## Future Enhancements

1. Email/SMS notifications for critical alerts
2. User notification preferences
3. Notification categories and filtering
4. Desktop notifications for background events
5. Sound alerts for critical notifications

## Example Files

- `/src/contexts/NotificationContext.jsx`
- `/src/components/common/Toast.jsx`
- `/src/components/common/ToastContainer.jsx`
- `/src/components/common/NotificationCenter.jsx`
- `/src/utils/notificationHelper.js`
- `/src/hooks/useNotification.js`
- `/src/docs/NotificationSystemUsage.md`