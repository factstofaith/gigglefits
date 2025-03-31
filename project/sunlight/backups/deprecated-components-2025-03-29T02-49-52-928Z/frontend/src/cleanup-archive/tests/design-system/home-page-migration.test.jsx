import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { BreadcrumbContext } from '../../contexts/BreadcrumbContext';
import { KeyboardShortcutsContext } from '../../contexts/KeyboardShortcutsContext';
import authService from '../../services/authService';
import * as integrationService from '../../services/integrationService';

// Mock the PageLayout component
jest.mock('../../components/common/PageLayout', () => {
  return ({ children, title, subtitle, actions, icon }) => (
    <div data-testid="page-layout">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <div data-testid="page-actions">
        {actions.map((action, index) => (
          <button key={index} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
});

// Mock the KeyboardShortcutsHelp component
jest.mock('../../components/common/KeyboardShortcutsHelp', () => {
  return () => <div data-testid="keyboard-shortcuts-help">Keyboard Shortcuts Help</div>;
});

// Mock icons
jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon" />,
  ArrowForward: () => <span data-testid="arrow-forward-icon" />,
  Star: () => <span data-testid="star-icon" />,
  Refresh: () => <span data-testid="refresh-icon" />,
  Dashboard: () => <span data-testid="dashboard-icon" />,
}));

// Mock services
jest.mock('../../services/authService', () => ({
  isAuthenticated: jest.fn(),
}));

jest.mock('../../services/integrationService', () => ({
  getTemplates: jest.fn(),
  createIntegrationFromTemplate: jest.fn(),
}));

// Mock data
const mockFeaturedTemplates = [
  {
    id: 1,
    name: 'Test Template 1',
    description: 'This is a test template',
    type: 'API-based',
    featured: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Test Template 2',
    description: 'Another test template',
    type: 'File-based',
    featured: true,
    createdAt: '2023-01-02T00:00:00Z',
  },
];

// Mock contexts
const mockBreadcrumbContext = {
  setBreadcrumbs: jest.fn(),
};

const mockKeyboardShortcutsContext = {
  registerShortcut: jest.fn().mockReturnValue('shortcut-id'),
  unregisterShortcut: jest.fn(),
};

// Custom render function
const renderHomePage = () => {
  // Added display name
  renderHomePage.displayName = 'renderHomePage';

  // Added display name
  renderHomePage.displayName = 'renderHomePage';

  // Added display name
  renderHomePage.displayName = 'renderHomePage';

  // Added display name
  renderHomePage.displayName = 'renderHomePage';

  // Added display name
  renderHomePage.displayName = 'renderHomePage';


  return render(
    <BrowserRouter>
      <BreadcrumbContext.Provider value={mockBreadcrumbContext}>
        <KeyboardShortcutsContext.Provider value={mockKeyboardShortcutsContext}>
          <HomePage />
        </KeyboardShortcutsContext.Provider>
      </BreadcrumbContext.Provider>
    </BrowserRouter>
  );
};

describe('HomePage Component Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth to be successful by default
    authService.isAuthenticated.mockResolvedValue(true);
    // Mock integration service to return templates
    integrationService.getTemplates.mockResolvedValue(mockFeaturedTemplates);
  });

  it('sets breadcrumbs correctly', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(mockBreadcrumbContext.setBreadcrumbs).toHaveBeenCalledWith([{ label: 'Home' }]);
    });
  });

  it('registers keyboard shortcuts', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(mockKeyboardShortcutsContext.registerShortcut).toHaveBeenCalledTimes(4);
    });
  });

  it('fetches templates on load', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(integrationService.getTemplates).toHaveBeenCalled();
    });
  });

  it('redirects to login if not authenticated', async () => {
    const navigateMock = jest.fn();
    // Mock useNavigate to return our mock function
    require('react-router-dom').useNavigate = () => navigateMock;

    // Set auth to be unsuccessful
    authService.isAuthenticated.mockResolvedValue(false);

    renderHomePage();
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('renders page layout with correct props', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByTestId('page-layout')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText('Build, manage, and monitor your integrations from one place')
      ).toBeInTheDocument();
    });
  });

  it('renders quick stats cards', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Active Integrations')).toBeInTheDocument();
      expect(screen.getByText('Monthly Runs')).toBeInTheDocument();
      expect(screen.getByText('Data Processed')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  it('renders featured templates when available', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Featured Templates')).toBeInTheDocument();
      expect(screen.getByText('Test Template 1')).toBeInTheDocument();
      expect(screen.getByText('Test Template 2')).toBeInTheDocument();
    });
  });

  it('renders empty state when no templates are available', async () => {
    // Mock integration service to return empty array
    integrationService.getTemplates.mockResolvedValue([]);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('No featured templates available at this time.')).toBeInTheDocument();
    });
  });

  it('renders quick links section', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Manage Integrations')).toBeInTheDocument();
      expect(screen.getByText('Run History')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });
  });

  it('renders keyboard shortcuts helper', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('keyboard-shortcuts-help')).toBeInTheDocument();
    });
  });

  it('refreshes templates when refresh button is clicked', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(integrationService.getTemplates).toHaveBeenCalledTimes(1);
    });

    // Clear the mock to check if it's called again
    integrationService.getTemplates.mockClear();

    // Click the refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(integrationService.getTemplates).toHaveBeenCalledTimes(1);
    });
  });
});
