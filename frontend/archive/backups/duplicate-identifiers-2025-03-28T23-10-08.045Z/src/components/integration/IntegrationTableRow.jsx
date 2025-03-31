import {   TableRow, Stack , TableRow, Stack , TableRow, Stack } from '../../design-system';
// IntegrationTableRow.jsx
// -----------------------------------------------------------------------------
// A single row in the table of integrations

import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ButtonLegacy as Button,
  ChipLegacy as Chip,
  IconButtonLegacy as IconButton,
} from '../../design-system/legacy';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IntegrationHealthBar from '../common/IntegrationHealthBar';
import Box from '@mui/material/Box';

function IntegrationTableRow({ integration, onFieldMapping, onModify, onViewRunLog }) {
  // Added display name
  IntegrationTableRow.displayName = 'IntegrationTableRow';

  const navigate = useNavigate();

  const { id, name, type, source, destination, schedule, health, status, lastRun } = integration;

  // When a row is clicked, we want to go directly to the canvas view
  const handleRowClick = () => {
  // Added display name
  handleRowClick.displayName = 'handleRowClick';

  // Added display name
  handleRowClick.displayName = 'handleRowClick';

  // Added display name
  handleRowClick.displayName = 'handleRowClick';


    // Use the onModify handler which calls the handleEditCanvas function
    onModify(id);
  };

  const handleFieldMapping = e => {
    e.stopPropagation();
    onFieldMapping(id);
  };

  const handleModify = e => {
    e.stopPropagation();
    onModify(id);
  };

  const handleViewRunLog = e => {
    e.stopPropagation();
    onViewRunLog(id);
  };

  // Get schedule display text
  const getScheduleDisplay = () => {
  // Added display name
  getScheduleDisplay.displayName = 'getScheduleDisplay';

  // Added display name
  getScheduleDisplay.displayName = 'getScheduleDisplay';

  // Added display name
  getScheduleDisplay.displayName = 'getScheduleDisplay';


    if (schedule && typeof schedule === 'object') {
      if (schedule.type === 'onDemand') return 'On demand';
      if (schedule.type === 'daily') return 'Daily';
      if (schedule.type === 'weekly') return 'Weekly';
      if (schedule.type === 'monthly') return 'Monthly';
      return schedule.cronExpression || 'Custom schedule';
    }
    return schedule || 'On demand';
  };

  // Get chip color based on integration type
  const getTypeColor = () => {
  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';


    switch (type) {
      case 'API-based':
        return 'primary';
      case 'File-based':
        return 'success';
      case 'Data Warehouse':
        return 'info';
      case 'Database':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      sx={{
        cursor: 'pointer',
        '&:last-child td, &:last-child th': { border: 0 },
        '&:hover': {
          backgroundColor: 'rgba(46, 126, 237, 0.05)',
          transition: 'background-color 0.2s ease',
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" fontWeight="medium">
            {name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            ID: {id}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Chip label={type} size="small" color={getTypeColor()} variant="outlined" />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{source}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{destination}</Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={getScheduleDisplay()}
          size="small"
          color="default"
          variant="outlined"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            '& .MuiChip-label': {
              fontSize: '0.75rem',
            },
          }}
        />
      </TableCell>

      <TableCell>
        <IntegrationHealthBar health={health} />
      </TableCell>

      <TableCell sx={{ paddingRight: 2 }} onClick={e => e.stopPropagation()}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Field mapping">
            <IconButton size="small" color="info" onClick={handleFieldMapping}>
              <CompareArrowsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit integration">
            <IconButton size="small" color="warning" onClick={handleModify}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View run logs">
            <IconButton size="small" onClick={handleViewRunLog}>
              <AssessmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default IntegrationTableRow;
