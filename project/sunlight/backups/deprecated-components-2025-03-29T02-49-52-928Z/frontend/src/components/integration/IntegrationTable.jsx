// IntegrationTable.jsx
// -----------------------------------------------------------------------------
// Enhanced integration table that uses VirtualizedDataTable for better performance
// with large datasets

import React, { useState, useMemo, useCallback, memo } from 'react';
import {MuiBox as MuiBox, TextField, Chip, Button, Menu, Typography} from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VirtualizedDataTable from '../common/VirtualizedDataTable';
// Removed duplicate import

// Memoized action button to prevent re-renders
const IntegrationActionButton = memo(
  ({ integration, onFieldMapping, onModify, onViewRunLog, onRun, onDelete }) => {
    const { theme } = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = event => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';


      setAnchorEl(null);
    };

    const handleAction = actionFn => {
      handleMenuClose();
      actionFn(integration);
    };

    return (
      <>
        <MuiBox
          as="button&quot;
          onClick={handleMenuOpen}
          aria-label="Integration actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <MoreVertIcon style={{ fontSize: '20px' }} />
        </MuiBox>

        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
        >
          <Menu.Item onClick={() => handleAction(onModify)}>
            <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon style={{ fontSize: '20px', marginRight: '8px' }} />
              <Typography>Edit</Typography>
            </MuiBox>
          </Menu.Item>

          <Menu.Item onClick={() => handleAction(onFieldMapping)}>
            <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon style={{ fontSize: '20px', marginRight: '8px' }} />
              <Typography>Field Mapping</Typography>
            </MuiBox>
          </Menu.Item>

          <Menu.Item onClick={() => handleAction(onRun)}>
            <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
              <PlayArrowIcon style={{ fontSize: '20px', marginRight: '8px' }} />
              <Typography>Run Now</Typography>
            </MuiBox>
          </Menu.Item>

          <Menu.Item onClick={() => handleAction(onViewRunLog)}>
            <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon style={{ fontSize: '20px', marginRight: '8px' }} />
              <Typography>View Logs</Typography>
            </MuiBox>
          </Menu.Item>

          <Menu.Item onClick={() => handleAction(onDelete)}>
            <MuiBox style={{ display: 'flex', alignItems: 'center' }}>
              <DeleteIcon style={{ fontSize: '20px', marginRight: '8px', color: theme.palette.error.main }} />
              <Typography style={{ color: theme.palette.error.main }}>Delete</Typography>
            </MuiBox>
          </Menu.Item>
        </Menu>
      </>
    );
  }
);

// Memoized filter chips to prevent unnecessary re-renders
const FilterChips = memo(({ integrations, statusFilter, onFilterChange }) => {
  const { theme } = useTheme();
  
  const healthyCounts = useMemo(() => {
  // Added display name
  healthyCounts.displayName = 'healthyCounts';

    const counts = {
      all: integrations.length,
      healthy: 0,
      warning: 0,
      error: 0,
    };

    integrations.forEach(intg => {
      if (counts[intg.health] !== undefined) {
        counts[intg.health]++;
      }
    });

    return counts;
  }, [integrations]);

  return (
    <MuiBox style={{ display: 'flex', gap: '4px' }}>
      <MuiBox title="All integrations&quot;>
        <Chip
          label={`All (${healthyCounts.all})`}
          onClick={() => onFilterChange("all')}
          color={statusFilter === 'all' ? 'primary' : 'default'}
          variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          size="small&quot;
        />
      </MuiBox>
      <MuiBox title="Healthy integrations">
        <Chip
          label={`Healthy (${healthyCounts.healthy})`}
          onClick={() => onFilterChange('healthy')}
          color={statusFilter === 'healthy' ? 'success' : 'default'}
          variant={statusFilter === 'healthy' ? 'filled' : 'outlined'}
          size="small&quot;
        />
      </MuiBox>
      <MuiBox title="Integrations with warnings">
        <Chip
          label={`Warnings (${healthyCounts.warning})`}
          onClick={() => onFilterChange('warning')}
          color={statusFilter === 'warning' ? 'warning' : 'default'}
          variant={statusFilter === 'warning' ? 'filled' : 'outlined'}
          size="small&quot;
        />
      </MuiBox>
      <MuiBox title="Integrations with errors">
        <Chip
          label={`Errors (${healthyCounts.error})`}
          onClick={() => onFilterChange('error')}
          color={statusFilter === 'error' ? 'error' : 'default'}
          variant={statusFilter === 'error' ? 'filled' : 'outlined'}
          size="small&quot;
        />
      </MuiBox>
    </MuiBox>
  );
});

// Main component
function IntegrationTable({
  integrations = [],
  onFieldMapping,
  onModify,
  onViewRunLog,
  onRun,
  onDelete,
  onRefresh,
}) {
  // Added display name
  IntegrationTable.displayName = "IntegrationTable';

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Handler functions
  const handleSearch = useCallback(event => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

    setSearchTerm(event.target.value);
  }, []);

  const handleFilterStatus = useCallback(status => {
  // Added display name
  handleFilterStatus.displayName = 'handleFilterStatus';

    setStatusFilter(status);
  }, []);

  // Filter integrations based on search term and status filter
  const filteredIntegrations = useMemo(() => {
  // Added display name
  filteredIntegrations.displayName = 'filteredIntegrations';

    return integrations.filter(intg => {
      // Apply search filter
      const searchFields = [intg.name, intg.type, intg.source, intg.destination]
        .join(' ')
        .toLowerCase();

      const searchMatch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());

      // Apply status filter
      const statusMatch = statusFilter === 'all' || intg.health === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [integrations, searchTerm, statusFilter]);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        width: '20%',
        bold: true,
      },
      {
        id: 'type',
        label: 'Type',
        width: '10%',
      },
      {
        id: 'source',
        label: 'Source',
        width: '15%',
      },
      {
        id: 'destination',
        label: 'Destination',
        width: '15%',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        width: '15%',
        sortable: false,
        render: (value, row) => (
          <MuiBox style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ScheduleIcon style={{ fontSize: '18px', color: '#757575' }} />
            <span>{value || 'Manual Run Only'}</span>
          </MuiBox>
        ),
      },
      {
        id: 'health',
        label: 'Status',
        width: '15%',
        type: 'chip',
        getChipColor: value => {
          switch (value) {
            case 'healthy':
              return 'success';
            case 'warning':
              return 'warning';
            case 'error':
              return 'error';
            default:
              return 'default';
          }
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        width: '10%',
        sortable: false,
        render: (value, row) => (
          <IntegrationActionButton
            integration={row}
            onFieldMapping={onFieldMapping}
            onModify={onModify}
            onViewRunLog={onViewRunLog}
            onRun={onRun}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onFieldMapping, onModify, onViewRunLog, onRun, onDelete]
  );

  // Create filter components
  const filterComponents = useMemo(
    () => (
      <MuiBox style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FilterChips
          integrations={integrations}
          statusFilter={statusFilter}
          onFilterChange={handleFilterStatus}
        />

        <MuiBox 
          as="button&quot;
          title="More filters"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <FilterListIcon style={{ fontSize: '20px' }} />
        </MuiBox>

        <MuiBox 
          as="button&quot;
          title="Refresh"
          onClick={onRefresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <RefreshIcon style={{ fontSize: '20px' }} />
        </MuiBox>
      </MuiBox>
    ),
    [integrations, statusFilter, handleFilterStatus, onRefresh]
  );

  // Search component
  const searchComponent = (
    <TextField
      placeholder="Search integrations...&quot;
      variant="outlined"
      size="small&quot;
      value={searchTerm}
      onChange={handleSearch}
      style={{ width: "300px' }}
      startAdornment={<SearchIcon />}
    />
  );

  const { theme } = useTheme();
  
  return (
    <MuiBox
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <MuiBox
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          marginBottom: '8px',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {searchComponent}
        {filterComponents}
      </MuiBox>

      <MuiBox style={{ flexGrow: 1, width: '100%' }}>
        <VirtualizedDataTable
          data={filteredIntegrations}
          columns={columns}
          initialOrderBy="name&quot;
          initialOrder="asc"
          rowsPerPageOptions={[10, 25, 50, 100]}
          defaultRowsPerPage={25}
          emptyMessage={
            searchTerm
              ? 'No matching integrations found. Try adjusting your search or filters.'
              : 'No integrations found.'
          }
          // Disable virtualization for small datasets for better UX
          virtualizationDisabled={filteredIntegrations.length < 50}
          maxHeight={600}
          rowHeight={60}
        />
      </MuiBox>
    </MuiBox>
  );
}

export default memo(IntegrationTable);
