import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataPreviewTransformationValidator from './DataPreviewTransformationValidator';
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

jest.mock('@mui/icons-material/ShowChart', () => {
  return function MockShowChartIcon() {
  // Added display name
  MockShowChartIcon.displayName = 'MockShowChartIcon';

    return <span data-testid="chart-icon">Chart</span>;
  };
});

jest.mock('@mui/icons-material/TableChart', () => {
  return function MockTableChartIcon() {
  // Added display name
  MockTableChartIcon.displayName = 'MockTableChartIcon';

    return <span data-testid="table-icon">Table</span>;
  };
});

jest.mock('@mui/icons-material/Code', () => {
  return function MockCodeIcon() {
  // Added display name
  MockCodeIcon.displayName = 'MockCodeIcon';

    return <span data-testid="code-icon">Code</span>;
  };
});

jest.mock('@mui/icons-material/Refresh', () => {
  return function MockRefreshIcon() {
  // Added display name
  MockRefreshIcon.displayName = 'MockRefreshIcon';

    return <span data-testid="refresh-icon">Refresh</span>;
  };
});

jest.mock('@mui/icons-material/Settings', () => {
  return function MockSettingsIcon() {
  // Added display name
  MockSettingsIcon.displayName = 'MockSettingsIcon';

    return <span data-testid="settings-icon">Settings</span>;
  };
});

jest.mock('@mui/icons-material/FilterList', () => {
  return function MockFilterListIcon() {
  // Added display name
  MockFilterListIcon.displayName = 'MockFilterListIcon';

    return <span data-testid="filter-icon">Filter</span>;
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

describe('DataPreviewTransformationValidator Component', () => {
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
    renderWithTheme(<DataPreviewTransformationValidator />);
    
    // Check header is present
    expect(screen.getByText('Data Preview & Transformation Validator')).toBeInTheDocument();
    
    // Check summary chips are present
    expect(screen.getByText('5 Data Sources')).toBeInTheDocument();
    expect(screen.getByText('5 Transformations')).toBeInTheDocument();
    expect(screen.getByText('8 Validation Scenarios')).toBeInTheDocument();
    
    // Check tabs are present
    expect(screen.getByText('Data Preview')).toBeInTheDocument();
    expect(screen.getByText('Transformations')).toBeInTheDocument();
    expect(screen.getByText('Test Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Results Summary')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  test('navigates between tabs correctly', () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
    // Data Preview tab should be active by default
    expect(screen.getByText('Data Preview')).toBeInTheDocument();
    expect(screen.getByText('Preview Controls Demo')).toBeInTheDocument();
    
    // Click on Transformations tab
    fireEvent.click(screen.getByText('Transformations'));
    expect(screen.getByText('Source Data')).toBeInTheDocument();
    expect(screen.getByText('Transformation Result')).toBeInTheDocument();
    expect(screen.getByText('Transformation Configuration')).toBeInTheDocument();
    
    // Click on Test Scenarios tab
    fireEvent.click(screen.getByText('Test Scenarios'));
    expect(screen.getByText('Run All Tests')).toBeInTheDocument();
    
    // Click on Results Summary tab
    fireEvent.click(screen.getByText('Results Summary'));
    expect(screen.getByText('No test results available. Run tests to see results.')).toBeInTheDocument();
    
    // Click on Performance tab
    fireEvent.click(screen.getByText('Performance'));
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Data Preview Performance')).toBeInTheDocument();
    expect(screen.getByText('Transformation Performance')).toBeInTheDocument();
  });

  test('displays data preview and can toggle between table and JSON views', () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
    // Check data preview is displayed
    expect(screen.getByText('id')).toBeInTheDocument(); // Column header
    expect(screen.getByText('first_name')).toBeInTheDocument(); // Column header
    expect(screen.getByText('John')).toBeInTheDocument(); // Data value
    
    // Find and click the JSON view button (in the first tab)
    const jsonViewButtons = screen.getAllByTestId('code-icon');
    fireEvent.click(jsonViewButtons[0]);
    
    // Should now show JSON data
    expect(screen.getByText(/{"id":1,"first_name":"John"/)).toBeInTheDocument();
    
    // Switch back to table view
    const tableViewButtons = screen.getAllByTestId('table-icon');
    fireEvent.click(tableViewButtons[0]);
    
    // Should show table again
    expect(screen.getByText('id')).toBeInTheDocument();
  });

  test('can change data source in the preview tab', () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
    // Initially shows Employee Dataset
    expect(screen.getByText('John')).toBeInTheDocument();
    
    // Find and click the data source dropdown
    fireEvent.mouseDown(screen.getByLabelText('Data Source'));
    
    // Click the "Customer Records" option when it appears in the dropdown
    const customerRecordsOption = screen.getByText('Customer Records (JSON)');
    fireEvent.click(customerRecordsOption);
    
    // Should now show customer data
    expect(screen.getByText('company')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  test('can change transformation in the transformations tab', () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
    // Navigate to Transformations tab
    fireEvent.click(screen.getByText('Transformations'));
    
    // Initially shows "Employee Salary Calculation"
    expect(screen.getByText('Employee Salary Calculation')).toBeInTheDocument();
    
    // Find and click the transformation dropdown
    fireEvent.mouseDown(screen.getByLabelText('Transformation'));
    
    // Click the "High-Value Customer Filter" option
    const filterOption = screen.getByText('High-Value Customer Filter (FILTER)');
    fireEvent.click(filterOption);
    
    // Should now show the filter transformation
    expect(screen.getByText('High-Value Customer Filter')).toBeInTheDocument();
    expect(screen.getByText('Filters customers based on their tier to identify high-value clients')).toBeInTheDocument();
  });

  test('runs a single test correctly', async () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
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
    renderWithTheme(<DataPreviewTransformationValidator />);
    
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
    const viewButtons = screen.getAllByTestId('info-icon');
    fireEvent.click(viewButtons[0]);
    
    // Check details are shown
    expect(screen.getByText('Test Result Details')).toBeInTheDocument();
    expect(screen.getByText(/Message:/)).toBeInTheDocument();
    expect(screen.getByText(/Timestamp:/)).toBeInTheDocument();
    expect(screen.getByText(/Details:/)).toBeInTheDocument();
  });

  test('exports test results when requested', async () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
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
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', 'data-preview-transformation-test-results.json');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.remove).toHaveBeenCalled();
  });

  test('run all tests button works correctly', async () => {
    renderWithTheme(<DataPreviewTransformationValidator />);
    
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