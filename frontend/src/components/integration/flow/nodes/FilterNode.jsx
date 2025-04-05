import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Filter Node
                                                                                      *
                                                                                      * A custom node for data filtering in the integration flow canvas.
                                                                                      * This node represents a data filtering operation.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { Box, Typography, Paper, IconButton, Tooltip, Badge, Chip } from '@mui/material';
import { FilterAlt as FilterIcon, Rule as RuleIcon, Error as ErrorIcon, Check as CheckIcon, Settings as SettingsIcon, FindReplace as FindReplaceIcon, FilterList as FilterListIcon } from '@mui/icons-material';
const FILTER_TYPES = {
  CONDITION: {
    icon: RuleIcon,
    color: '#9c27b0',
    // Purple
    label: 'Condition'
  },
  VALIDATION: {
    icon: CheckIcon,
    color: '#9c27b0',
    // Purple
    label: 'Validation'
  },
  SEARCH_REPLACE: {
    icon: FindReplaceIcon,
    color: '#9c27b0',
    // Purple
    label: 'Search & Replace'
  },
  LIST_FILTER: {
    icon: FilterListIcon,
    color: '#9c27b0',
    // Purple
    label: 'List Filter'
  },
  default: {
    icon: FilterIcon,
    color: '#9c27b0',
    // Purple
    label: 'Filter'
  }
};

/**
 * Filter Node component
 */
const FilterNode = memo(({
  id,
  data,
  isConnectable,
  selected
}) => {
  const filterType = data.filterType || 'default';
  const filterConfig = FILTER_TYPES[filterType] || FILTER_TYPES.default;
  const FilterIconComponent = filterConfig.icon;
  const hasError = data.error !== undefined;
  const isConfigured = data.isConfigured || false;
  const conditionCount = data.conditions?.length || 0;
  return <Paper elevation={selected ? 3 : 1} sx={{
    minHeight: 80,
    width: 200,
    padding: 1,
    borderRadius: 1,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: selected ? 'primary.main' : filterConfig.color,
    backgroundColor: 'background.paper',
    position: 'relative'
  }}>

      {/* Input handle on the left */}
      <Handle type="target" position="left" id="input" style={{
      left: -8,
      top: '50%',
      width: 12,
      height: 12,
      background: filterConfig.color,
      border: '2px solid #fff'
    }} isConnectable={isConnectable} />

      
      {/* Output handle on the right */}
      <Handle type="source" position="right" id="output" style={{
      right: -8,
      top: '50%',
      width: 12,
      height: 12,
      background: filterConfig.color,
      border: '2px solid #fff'
    }} isConnectable={isConnectable} />

      
      {/* Node header */}
      <Box sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 1,
      backgroundColor: filterConfig.color,
      color: '#fff',
      marginLeft: -1,
      marginRight: -1,
      marginTop: -1,
      padding: 0.5,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4
    }}>
        <FilterIconComponent fontSize="small" sx={{
        mr: 1
      }} />
        <Typography variant="subtitle2" sx={{
        flexGrow: 1
      }}>
          {filterConfig.label}
        </Typography>
        <Badge color={hasError ? "error" : "success"} variant="dot" invisible={!isConfigured}>

          <Tooltip title="Configure Filter">
            <IconButton size="small" sx={{
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}>

              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Badge>
      </Box>
      
      {/* Node content */}
      <Box sx={{
      p: 1
    }}>
        <Typography variant="body2" sx={{
        mb: 0.5
      }}>
          {data.label || 'Data Filter'}
        </Typography>
        
        {/* Display filter conditions */}
        {conditionCount > 0 && <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        my: 0.5
      }}>
            <Chip label={`${conditionCount} condition${conditionCount > 1 ? 's' : ''}`} size="small" variant="outlined" color="secondary" />

          </Box>}

        
        {/* Status indicator */}
        {hasError ? <Box sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'error.main'
      }}>
            <ErrorIcon fontSize="small" sx={{
          mr: 0.5
        }} />
            <Typography variant="caption" color="error">
              {data.error}
            </Typography>
          </Box> : isConfigured ? <Box sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'success.main'
      }}>
            <Check fontSize="small" sx={{
          mr: 0.5
        }} />
            <Typography variant="caption" color="success.main">
              Configured
            </Typography>
          </Box> : <Typography variant="caption" color="text.secondary">
            Click to configure
          </Typography>}

      </Box>
    </Paper>;
});
export default withErrorBoundary(FilterNode, {
  boundary: 'FilterNode'
});