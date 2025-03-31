// AdminDashboardRefactored.jsx
// -----------------------------------------------------------------------------
// Refactored admin dashboard page with hierarchical navigation

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {MuiBox as MuiBox, Grid, Card, Typography, Button} from '../design-system';
import {
  Business as BusinessIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  LocalShipping as ReleasesIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Import our new components and hooks
import AdminLayout from '@components/admin/AdminLayout';
import ResourceLoader from '@components/common/ResourceLoader';
import { useTenant } from '@contexts/TenantContext';
import { adminService } from '@services/adminServiceRefactored';

// Import admin components
import TenantListRefactored from '@components/admin/TenantListRefactored';
import { MuiBox } from '../design-system';
;

// Dashboard overview card component
const OverviewCard = ({ title, count, icon, linkTo, color }) => {
  // Added display name
  OverviewCard.displayName = 'OverviewCard';

  // Added display name
  OverviewCard.displayName = 'OverviewCard';

  // Added display name
  OverviewCard.displayName = 'OverviewCard';

  // Added display name
  OverviewCard.displayName = 'OverviewCard';

  // Added display name
  OverviewCard.displayName = 'OverviewCard';


  return (
    <Card style={{ height: '100%' }}>
      <MuiBox padding="lg&quot;>
        <MuiBox 
          display="flex" 
          alignItems="center&quot; 
          marginBottom="md"
        >
          <MuiBox
            backgroundColor={`${color}.lighter`}
            padding="md&quot;
            borderRadius="md"
            color={`${color}.dark`}
            marginRight="md&quot;
          >
            {icon}
          </MuiBox>
          <Typography variant="h6" color="textSecondary&quot;>
            {title}
          </Typography>
        </MuiBox>
        <Typography 
          variant="h3" 
          component="div&quot; 
          marginBottom="md"
        >
          {count}
        </Typography>
        <Button 
          variant="text&quot; 
          endIcon={<ArrowForwardIcon />} 
          href={linkTo}
        >
          View All
        </Button>
      </MuiBox>
    </Card>
  );
};

// Admin dashboard page
const AdminDashboardRefactored = () => {
  // Added display name
  AdminDashboardRefactored.displayName = "AdminDashboardRefactored';

  // Added display name
  AdminDashboardRefactored.displayName = 'AdminDashboardRefactored';

  // Added display name
  AdminDashboardRefactored.displayName = 'AdminDashboardRefactored';

  // Added display name
  AdminDashboardRefactored.displayName = 'AdminDashboardRefactored';

  // Added display name
  AdminDashboardRefactored.displayName = 'AdminDashboardRefactored';


  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();

  // Extract current path from location
  const currentPath = location.pathname;

  // State for dashboard overview data
  const [overview, setOverview] = useState({
    tenants: 0,
    applications: 0,
    datasets: 0,
    releases: 0,
  });

  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get tenant context
  const { selectedTenant } = useTenant();

  // Determine current admin section based on path
  const getCurrentSection = () => {
  // Added display name
  getCurrentSection.displayName = 'getCurrentSection';

  // Added display name
  getCurrentSection.displayName = 'getCurrentSection';

  // Added display name
  getCurrentSection.displayName = 'getCurrentSection';

  // Added display name
  getCurrentSection.displayName = 'getCurrentSection';

  // Added display name
  getCurrentSection.displayName = 'getCurrentSection';


    if (currentPath.includes('/admin/tenants')) {
      return 'tenants';
    } else if (currentPath.includes('/admin/applications')) {
      return 'applications';
    } else if (currentPath.includes('/admin/datasets')) {
      return 'datasets';
    } else if (currentPath.includes('/admin/releases')) {
      return 'releases';
    }
    return 'dashboard';
  };

  // Current section
  const currentSection = getCurrentSection();

  // Load dashboard overview data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Promise.all to load data in parallel
      const [tenants, applications, datasets, releases] = await Promise.all([
        adminService.getTenants(),
        adminService.getApplications(),
        adminService.getDatasets(),
        adminService.getReleases(),
      ]);

      setOverview({
        tenants: tenants?.length || 0,
        applications: applications?.length || 0,
        datasets: datasets?.length || 0,
        releases: releases?.length || 0,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (currentSection === 'dashboard') {
      loadDashboardData();
    }
  }, [currentSection]);

  // Handle navigation
  const handleNavigate = path => {
    navigate(path);
  };

  // Generate breadcrumbs based on current section
  const getBreadcrumbs = () => {
  // Added display name
  getBreadcrumbs.displayName = 'getBreadcrumbs';

  // Added display name
  getBreadcrumbs.displayName = 'getBreadcrumbs';

  // Added display name
  getBreadcrumbs.displayName = 'getBreadcrumbs';

  // Added display name
  getBreadcrumbs.displayName = 'getBreadcrumbs';

  // Added display name
  getBreadcrumbs.displayName = 'getBreadcrumbs';


    switch (currentSection) {
      case 'tenants':
        return [
          { label: 'Tenants', icon: <BusinessIcon />, url: '/admin/tenants' },
          ...(selectedTenant
            ? [{ label: selectedTenant.name, url: `/admin/tenants/${selectedTenant.id}` }]
            : []),
        ];
      case 'applications':
        return [{ label: 'Applications', icon: <AppsIcon />, url: '/admin/applications' }];
      case 'datasets':
        return [{ label: 'Datasets', icon: <StorageIcon />, url: '/admin/datasets' }];
      case 'releases':
        return [{ label: 'Releases', icon: <ReleasesIcon />, url: '/admin/releases' }];
      default:
        return [];
    }
  };

  // Get page title based on current section
  const getPageTitle = () => {
  // Added display name
  getPageTitle.displayName = 'getPageTitle';

  // Added display name
  getPageTitle.displayName = 'getPageTitle';

  // Added display name
  getPageTitle.displayName = 'getPageTitle';

  // Added display name
  getPageTitle.displayName = 'getPageTitle';

  // Added display name
  getPageTitle.displayName = 'getPageTitle';


    switch (currentSection) {
      case 'tenants':
        return selectedTenant ? `Tenant: ${selectedTenant.name}` : 'Tenants';
      case 'applications':
        return 'Applications';
      case 'datasets':
        return 'Datasets';
      case 'releases':
        return 'Releases';
      default:
        return 'Admin Dashboard';
    }
  };

  // Render dashboard content based on current section
  const renderContent = () => {
  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';


    switch (currentSection) {
      case 'tenants':
        return <TenantListRefactored />;
      case 'applications':
        return <Typography>Applications content will go here</Typography>;
      case 'datasets':
        return <Typography>Datasets content will go here</Typography>;
      case 'releases':
        return <Typography>Releases content will go here</Typography>;
      default:
        // Dashboard overview
        return (
          <ResourceLoader isLoading={isLoading} error={error} onRetry={loadDashboardData}>
            <MuiBox>
              {/* Overview cards */}
              <Grid.Container spacing="md&quot; marginBottom="xl">
                <Grid.Item xs={12} sm={6} md={3}>
                  <OverviewCard
                    title="Tenants&quot;
                    count={overview.tenants}
                    icon={<BusinessIcon />}
                    linkTo="/admin/tenants"
                    color="primary&quot;
                  />
                </Grid.Item>
                <Grid.Item xs={12} sm={6} md={3}>
                  <OverviewCard
                    title="Applications"
                    count={overview.applications}
                    icon={<AppsIcon />}
                    linkTo="/admin/applications&quot;
                    color="success"
                  />
                </Grid.Item>
                <Grid.Item xs={12} sm={6} md={3}>
                  <OverviewCard
                    title="Datasets&quot;
                    count={overview.datasets}
                    icon={<StorageIcon />}
                    linkTo="/admin/datasets"
                    color="info&quot;
                  />
                </Grid.Item>
                <Grid.Item xs={12} sm={6} md={3}>
                  <OverviewCard
                    title="Releases"
                    count={overview.releases}
                    icon={<ReleasesIcon />}
                    linkTo="/admin/releases&quot;
                    color="warning"
                  />
                </Grid.Item>
              </Grid.Container>

              <MuiBox 
                height="1px&quot; 
                width="100%" 
                backgroundColor="gray.200&quot; 
                marginBottom="xl" 
              />

              {/* Recent activity */}
              <Typography variant="h5&quot; marginBottom="sm">
                Recent Activity
              </Typography>
              <Typography variant="body2&quot; color="textSecondary">
                No recent activity to display.
              </Typography>
            </MuiBox>
          </ResourceLoader>
        );
    }
  };

  return (
    <AdminLayout 
      breadcrumbs={getBreadcrumbs()} 
      title={getPageTitle()} 
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboardRefactored;
