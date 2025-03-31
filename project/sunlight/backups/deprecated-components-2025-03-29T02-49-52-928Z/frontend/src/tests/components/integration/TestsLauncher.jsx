import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@design-system/foundations/theme';
import {Typography, Card, MuiBox as MuiBox, List, ListItem, ListItemText, ListItemIcon, Divider, Button, AppBar, Toolbar, Container} from '@design-system/legacy';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import SourceIcon from '@mui/icons-material/Source';
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HomeIcon from '@mui/icons-material/Home';
import SpeedIcon from '@mui/icons-material/Speed';

import StorageConnectorTester from './StorageConnectorTester';
import DynamicDataSourceTester from './DynamicDataSourceTester';
import ApplicationDatasetWorkflowTester from './ApplicationDatasetWorkflowTester';
import DataPreviewTransformationValidator from './DataPreviewTransformationValidator';
import NodeTypesTester from './NodeTypesTester';
import ComplexFlowValidator from './ComplexFlowValidator';
import PerformanceTestHarness from './PerformanceTestHarness';
import FlowCanvasTestSuite from './FlowCanvasTestSuite';
import { MuiBox } from '../../design-system';
;

// If these components don't exist yet in your code base, either create minimal placeholders
// or comment out the imports and related code

/**
 * This is a standalone launcher for all test components.
 * It provides a centralized interface to launch and run various testers
 * and validators for the integration flow platform.
 */

const TestsLauncher = () => {
  // Added display name
  TestsLauncher.displayName = 'TestsLauncher';

  // Added display name
  TestsLauncher.displayName = 'TestsLauncher';

  // Added display name
  TestsLauncher.displayName = 'TestsLauncher';

  // Added display name
  TestsLauncher.displayName = 'TestsLauncher';

  // Added display name
  TestsLauncher.displayName = 'TestsLauncher';


  const [activeComponent, setActiveComponent] = useState(null);
  
  const testComponents = [
    {
      id: 'flow-canvas-suite',
      name: 'Flow Canvas Test Suite',
      description: 'Comprehensive test suite for the Flow Canvas implementation',
      icon: <SpeedIcon />,
      component: FlowCanvasTestSuite
    },
    {
      id: 'node-types',
      name: 'Node Types Tester',
      description: 'Test all node types with various configurations',
      icon: <MemoryIcon />,
      component: NodeTypesTester
    },
    {
      id: 'complex-flow',
      name: 'Complex Flow Validator',
      description: 'Validate complex flows with multiple branches',
      icon: <AssessmentIcon />,
      component: ComplexFlowValidator
    },
    {
      id: 'storage-connector',
      name: 'Storage Connector Tester',
      description: 'Test storage connectors with different file types',
      icon: <StorageIcon />,
      component: StorageConnectorTester
    },
    {
      id: 'dynamic-data-source',
      name: 'Dynamic Data Source Tester',
      description: 'Verify dynamic data sources with sample APIs',
      icon: <ApiIcon />,
      component: DynamicDataSourceTester
    },
    {
      id: 'application-dataset',
      name: 'Application-Dataset Workflow Tester',
      description: 'Test application-dataset workflows end-to-end',
      icon: <DynamicFeedIcon />,
      component: ApplicationDatasetWorkflowTester
    },
    {
      id: 'data-preview-transformation',
      name: 'Data Preview & Transformation Validator',
      description: 'Validate data preview and transformation components',
      icon: <SourceIcon />,
      component: DataPreviewTransformationValidator
    },
    {
      id: 'performance-test',
      name: 'Performance Test Harness',
      description: 'Performance test with large and complex flows',
      icon: <SpeedIcon />,
      component: PerformanceTestHarness
    }
  ];
  
  const handleLaunch = (componentId) => {
  // Added display name
  handleLaunch.displayName = 'handleLaunch';

  // Added display name
  handleLaunch.displayName = 'handleLaunch';

  // Added display name
  handleLaunch.displayName = 'handleLaunch';

  // Added display name
  handleLaunch.displayName = 'handleLaunch';

  // Added display name
  handleLaunch.displayName = 'handleLaunch';


    const component = testComponents.find(c => c.id === componentId);
    setActiveComponent(component);
  };
  
  const handleBack = () => {
  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


    setActiveComponent(null);
  };
  
  const renderActiveComponent = () => {
  // Added display name
  renderActiveComponent.displayName = 'renderActiveComponent';

  // Added display name
  renderActiveComponent.displayName = 'renderActiveComponent';

  // Added display name
  renderActiveComponent.displayName = 'renderActiveComponent';

  // Added display name
  renderActiveComponent.displayName = 'renderActiveComponent';

  // Added display name
  renderActiveComponent.displayName = 'renderActiveComponent';


    if (!activeComponent) return null;
    
    const Component = activeComponent.component;
    return <Component />;
  };
  
  const renderComponentList = () => (
    <Container maxWidth="md&quot; sx={{ py: 4 }}>
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Integration Flow Testing Suite
        </Typography>
        <Typography variant="body1&quot; paragraph>
          This testing suite provides comprehensive validation tools for the TAP Integration Platform"s
          Flow Canvas implementation. Each component focuses on testing specific aspects of the system
          to ensure robust functionality.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6&quot; gutterBottom>
          Available Test Components:
        </Typography>
        
        <List>
          {testComponents.map((component) => (
            <React.Fragment key={component.id}>
              <ListItem 
                button 
                onClick={() => handleLaunch(component.id)}
                sx={{ 
                  py: 2,
                  "&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemIcon>
                  {component.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={component.name} 
                  secondary={component.description} 
                />
                <Button 
                  variant="contained&quot; 
                  color="primary" 
                  startIcon={<PlayArrowIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch(component.id);
                  }}
                >
                  Launch
                </Button>
              </ListItem>
              <Divider component="li&quot; />
            </React.Fragment>
          ))}
        </List>
      </Card>
      
      <Typography variant="body2" color="text.secondary&quot; align="center">
        TAP Integration Platform Testing Suite &copy; 2025
      </Typography>
    </Container>
  );
  
  return (
    <div>
      <AppBar position="static&quot; color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6&quot; component="div" sx={{ flexGrow: 1 }}>
            Integration Flow Testing Suite
          </Typography>
          {activeComponent && (
            <Button color="inherit&quot; startIcon={<HomeIcon />} onClick={handleBack}>
              Back to Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <MuiBox sx={{ p: 0 }}>
        {activeComponent ? renderActiveComponent() : renderComponentList()}
      </MuiBox>
    </div>
  );
};

// For standalone usage
if (document.getElementById("tests-launcher-root')) {
  const root = createRoot(document.getElementById('tests-launcher-root'));
  root.render(
    <ThemeProvider>
      <TestsLauncher />
    </ThemeProvider>
  );
}

export default TestsLauncher;