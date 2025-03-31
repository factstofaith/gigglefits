import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationDatasetWorkflowTester from './ApplicationDatasetWorkflowTester';
import { ThemeProvider } from '@design-system/foundations/theme';

// Mock MaterialUI icons used in the component
jest.mock('@mui/icons-material/PlayArrow', () => {
  return function MockPlayArrowIcon() {
  // Added display name
  MockPlayArrowIcon.displayName = 'MockPlayArrowIcon';

    return <span data-testid="play-icon">Play</span>;
  };
});

jest.mock('@mui/icons-material/CheckCircleOutline', () => {
  return function MockCheckCircleOutlineIcon(props) {
  // Added display name
  MockCheckCircleOutlineIcon.displayName = 'MockCheckCircleOutlineIcon';

    return <span data-testid="success-icon" style={props.style}>Success</span>;
  };
});

jest.mock('@mui/icons-material/ErrorOutline', () => {
  return function MockErrorOutlineIcon(props) {
  // Added display name
  MockErrorOutlineIcon.displayName = 'MockErrorOutlineIcon';

    return <span data-testid="error-icon" style={props.style}>Error</span>;
  };
});

jest.mock('@mui/icons-material/InfoOutlined', () => {
  return function MockInfoOutlinedIcon(props) {
  // Added display name
  MockInfoOutlinedIcon.displayName = 'MockInfoOutlinedIcon';

    return <span data-testid="info-icon" style={props.style}>Info</span>;
  };
});

jest.mock('@mui/icons-material/SaveAlt', () => {
  return function MockSaveAltIcon() {
  // Added display name
  MockSaveAltIcon.displayName = 'MockSaveAltIcon';

    return <span data-testid="save-icon">Save</span>;
  };
});

jest.mock('@mui/icons-material/Visibility', () => {
  return function MockVisibilityIcon() {
  // Added display name
  MockVisibilityIcon.displayName = 'MockVisibilityIcon';

    return <span data-testid="view-icon">View</span>;
  };
});

jest.mock('@mui/icons-material/Code', () => {
  return function MockCodeIcon() {
  // Added display name
  MockCodeIcon.displayName = 'MockCodeIcon';

    return <span data-testid="code-icon">Code</span>;
  };
});

jest.mock('@mui/icons-material/Schema', () => {
  return function MockSchemaIcon() {
  // Added display name
  MockSchemaIcon.displayName = 'MockSchemaIcon';

    return <span data-testid="schema-icon">Schema</span>;
  };
});

// Setup wrapper for rendering components with theme
const renderWithTheme = (ui, options) => {
  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';


  return render(
    <ThemeProvider>{ui}</ThemeProvider>,
    options
  );
};

describe('ApplicationDatasetWorkflowTester Component', () => {
  beforeEach(() => {
    // Mock createObjectURL and revokeObjectURL to avoid errors
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement for the download functionality
    const mockAnchor = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    };
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement.originalImpl(tag);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with correct initial state', () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Check header is present
    expect(screen.getByText('Application-Dataset Workflow Tester')).toBeInTheDocument();
    
    // Check summary chips are present
    expect(screen.getByText('8 Test Scenarios')).toBeInTheDocument();
    expect(screen.getByText('4 Applications')).toBeInTheDocument();
    expect(screen.getByText('4 Datasets')).toBeInTheDocument();
    
    // Check tabs are present
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByText('Test Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Results Summary')).toBeInTheDocument();
  });

  test('navigates between tabs correctly', () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Applications tab should be active by default and show applications
    expect(screen.getByText('CRM System')).toBeInTheDocument();
    
    // Click on Datasets tab
    fireEvent.click(screen.getByText('Datasets'));
    expect(screen.getByText('Employee Records')).toBeInTheDocument();
    
    // Click on Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    expect(screen.getByText('Run All Tests')).toBeInTheDocument();
    
    // Click on Results Summary tab
    fireEvent.click(screen.getByText('Results Summary'));
    expect(screen.getByText('No test results available. Run tests to see results.')).toBeInTheDocument();
  });

  test('runs a single test correctly', async () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Navigate to Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    
    // Find the first test's run button
    const runButtons = screen.getAllByTestId('play-icon');
    fireEvent.click(runButtons[1]); // Click the first individual test run button
    
    // Wait for test to complete (mock async behavior)
    await waitFor(() => {
      // Should now see either SUCCESS, WARNING, or ERROR chip
      const hasResult = screen.queryByText('SUCCESS') || 
                        screen.queryByText('WARNING') || 
                        screen.queryByText('ERROR');
      expect(hasResult).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('test results can be viewed in detail', async () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Navigate to Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    
    // Run a test
    const runButtons = screen.getAllByTestId('play-icon');
    fireEvent.click(runButtons[1]);
    
    // Wait for test to complete
    await waitFor(() => {
      const hasResult = screen.queryByText('SUCCESS') || 
                        screen.queryByText('WARNING') || 
                        screen.queryByText('ERROR');
      expect(hasResult).toBeTruthy();
    }, { timeout: 3000 });
    
    // View result details
    const viewButtons = screen.getAllByTestId('view-icon');
    fireEvent.click(viewButtons[0]);
    
    // Check details are shown
    expect(screen.getByText('Test Result Details')).toBeInTheDocument();
    expect(screen.getByText(/Message:/)).toBeInTheDocument();
    expect(screen.getByText(/Timestamp:/)).toBeInTheDocument();
    expect(screen.getByText(/Details:/)).toBeInTheDocument();
  });

  test('exports test results when requested', async () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Navigate to Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    
    // Run a test
    const runButtons = screen.getAllByTestId('play-icon');
    fireEvent.click(runButtons[1]);
    
    // Wait for test to complete
    await waitFor(() => {
      const hasResult = screen.queryByText('SUCCESS') || 
                        screen.queryByText('WARNING') || 
                        screen.queryByText('ERROR');
      expect(hasResult).toBeTruthy();
    }, { timeout: 3000 });
    
    // Export results
    const exportButton = screen.getByText('Export Results');
    fireEvent.click(exportButton);
    
    // Verify download was triggered
    expect(document.createElement).toHaveBeenCalledWith('a');
    const mockAnchor = document.createElement('a');
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', 'application-dataset-test-results.json');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.remove).toHaveBeenCalled();
  });

  test('run all tests button works correctly', async () => {
    renderWithTheme(<ApplicationDatasetWorkflowTester />);
    
    // Navigate to Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    
    // Get initial number of NOT RUN chips
    const initialNotRunCount = screen.getAllByText('NOT RUN').length;
    expect(initialNotRunCount).toBeGreaterThan(0);
    
    // Click Run All Tests
    fireEvent.click(screen.getByText('Run All Tests'));
    
    // Wait for tests to complete
    await waitFor(() => {
      const notRunCount = screen.queryAllByText('NOT RUN').length;
      expect(notRunCount).toBe(0);
    }, { timeout: 3000 });
    
    // Check results summary tab for updated counts
    fireEvent.click(screen.getByText('Results Summary'));
    
    // Should show total tests count matching the scenario count
    expect(screen.getByText('8')).toBeInTheDocument(); // Total Tests
  });
});