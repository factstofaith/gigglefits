# Integration Flow Canvas

The Integration Flow Canvas is a visual interface for building and configuring data integration flows with role-based access control.

## Components

### Primary Components

#### IntegrationFlowCanvas
The main canvas component for building integration flows. It integrates ReactFlow with our custom node types and enhanced functionality.

**Key Features:**
- Visual flow design with drag-and-drop
- Role-based access control (admin vs. user roles)
- Auto-layout functionality
- Performance optimization for large flows
- Support for various node types and edge configurations
- Integrated validation
- Undo/redo functionality

```jsx
<IntegrationFlowCanvas 
  initialNodes={[...]} 
  initialEdges={[...]} 
  onSave={handleSave}
  onRun={handleRun}
  readOnly={false}
  isAdmin={user.isAdmin}
  availableComponents={{
    sources: [...],
    transforms: [...],
    destinations: [...]
  }}
/>
```

#### EnhancedNodePalette
Component for browsing and selecting available node types, with role-based access control.

**Key Features:**
- Categorized node types
- Drag-and-drop node creation
- Role-based filtering (admin vs. user)
- Visual search and filtering
- Responsive design

```jsx
<EnhancedNodePalette 
  components={availableComponents}
  onDragStart={handleDragStart}
  onNodeSelect={handleNodeSelect}
  isAdmin={user.isAdmin}
/>
```

#### ContextualPropertiesPanel
Dynamic panel for editing node or edge properties with role-based permissions.

**Key Features:**
- Context-aware property editing
- Role-based field visibility
- Validation and error reporting
- Dynamic form generation based on element type
- Admin-only advanced configuration options

```jsx
<ContextualPropertiesPanel 
  element={selectedElement}
  onNodeUpdate={handleNodeUpdate}
  onEdgeUpdate={handleEdgeUpdate}
  onDeleteNode={handleDeleteNode}
  readOnly={false}
  isAdmin={user.isAdmin}
/>
```

### Supporting Components

- **OptimizedEdge**: Enhanced edge component with better performance
- **ValidationPanel**: Displays flow validation results
- **DataPreviewPanel**: Shows data previews for nodes
- **TemplateBrowser**: Browse and apply flow templates (admin feature)
- **FlowErrorPanel**: Shows execution errors
- **FlowPerformanceMonitor**: Monitors flow performance metrics

## Role-Based Access Control

These components implement role-based access control based on the `isAdmin` prop:

### Admin Users (isAdmin=true)

Admins can:
- Create and manage applications and datasets
- Access all node types
- Configure advanced settings
- Create and manage templates
- Access system-level configuration
- View detailed performance metrics
- Access technical IDs and debugging tools

### Regular Users (isAdmin=false)

Regular users can:
- Use applications and datasets created by admins
- Create and configure flows with available components
- Apply templates created by admins
- Access basic settings only
- View limited performance metrics
- Cannot access system-level configuration

## Usage Examples

### Basic Implementation
```jsx
import IntegrationFlowCanvas from './components/integration/IntegrationFlowCanvas';
import { useUser } from './contexts/UserContext';

const IntegrationDetailPage = () => {
  const { user } = useUser();
  
  return (
    <IntegrationFlowCanvas
      initialNodes={[]}
      initialEdges={[]}
      onSave={handleSaveFlow}
      onRun={handleRunFlow}
      isAdmin={user.isAdmin}
      availableComponents={availableComponents}
    />
  );
};
```

### With Custom Configuration
```jsx
<IntegrationFlowCanvas
  initialNodes={existingNodes}
  initialEdges={existingEdges}
  onSave={handleSaveFlow}
  onRun={handleRunFlow}
  isAdmin={user.isAdmin}
  availableComponents={availableComponents}
  enableDebugMode={true}
  enableTemplates={true}
  enableAutoLayout={true}
  onNodeSelect={handleNodeSelect}
  onEdgeSelect={handleEdgeSelect}
  validationMode="live"
/>
```

## Performance Considerations

For optimal performance with large flows:
- Enable node virtualization for flows with >100 nodes
- Use simplified node rendering for distant nodes
- Consider using pagination or lazy loading for large node palettes
- Implement debounced validation for large flows

## Further Documentation

See related documentation:
- [Flow Canvas API Reference](/docs/api/FlowCanvasAPI.md)
- [Node Type Reference](/docs/api/NodeTypes.md)
- [Admin Guide](/docs/admin/FlowCanvasAdmin.md)
- [User Guide](/docs/user/FlowCanvasUser.md)