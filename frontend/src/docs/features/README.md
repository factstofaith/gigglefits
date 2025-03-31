# TAP Integration Platform Features

This directory contains documentation for the key features of the TAP Integration Platform frontend:

## Feature Documentation

### Flow Canvas
[FlowCanvas.md](./FlowCanvas.md)

The Flow Canvas is a visual interface for building and configuring data integration flows with role-based access control. It provides a drag-and-drop interface for connecting various node types and configuring their properties.

Key components:
- IntegrationFlowCanvas - Main canvas component
- EnhancedNodePalette - Component selection panel
- ContextualPropertiesPanel - Dynamic property editing panel
- Role-based access control for admin vs regular users

### Notification System
[NotificationSystem.md](./NotificationSystem.md)

The notification system provides a comprehensive solution for displaying both temporary toast notifications and persistent notifications that users can access through a notification center.

Key components:
- NotificationContext - Central state management
- Toast - Individual notification component
- ToastContainer - Container for temporary notifications
- NotificationCenter - UI for accessing persistent notifications
- notificationHelper - Utility for non-component contexts

## Related Documentation

- [Design System Documentation](../../design-system/README.md)
- [Frontend Testing Documentation](../testing/README.md)