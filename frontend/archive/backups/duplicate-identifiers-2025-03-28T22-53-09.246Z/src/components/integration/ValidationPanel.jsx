/**
 * @component ValidationPanel
 * @description Component that displays validation errors and warnings for the integration flow,
 * providing details about issues and quick access to fix them.
 *
 * Key features:
 * - Categorized display of validation issues (errors, warnings, info)
 * - Quick navigation to problematic nodes
 * - Detailed information about each validation issue
 * - Filtering and sorting capabilities
 * - Recommendations for fixing issues
 */

import React, { useState, useMemo, useCallback } from 'react';
// Import all components through the adapter layer
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  Tab,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Link,
  useTheme,
} from '../../design-system/adapter';

// Icons
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
/**
 * ValidationPanel Component
 *
 * @param {Object} props - Component props
 * @param {Array} props.validationErrors - Array of validation errors/warnings
 * @param {Function} props.onSelectNode - Callback when node is selected
 * @param {Function} props.onRunValidation - Callback to re-run validation
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.autoFix - Whether to show auto-fix options
 */
const ValidationPanel = ({
  validationErrors = [],
  onSelectNode,
  onRunValidation,
  loading = false,
  autoFix = false,
}) => {
  // Added display name
  ValidationPanel.displayName = 'ValidationPanel';

  // Added display name
  ValidationPanel.displayName = 'ValidationPanel';

  // Added display name
  ValidationPanel.displayName = 'ValidationPanel';


  // Use theme from the adapter layer
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  // Categorize validation issues
  const categorizedIssues = useMemo(() => {
  // Added display name
  categorizedIssues.displayName = 'categorizedIssues';

    const errors = validationErrors.filter(error => error.severity === 'error');
    const warnings = validationErrors.filter(error => error.severity === 'warning');
    const info = validationErrors.filter(error => error.severity === 'info');

    return { errors, warnings, info };
  }, [validationErrors]);

  // Get counts
  const counts = useMemo(
    () => ({
      errors: categorizedIssues.errors.length,
      warnings: categorizedIssues.warnings.length,
      info: categorizedIssues.info.length,
      total: validationErrors.length,
    }),
    [categorizedIssues, validationErrors]
  );

  // Filter and sort validation issues
  const filteredIssues = useMemo(() => {
  // Added display name
  filteredIssues.displayName = 'filteredIssues';

    let filtered = [...validationErrors];

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        issue =>
          issue.message.toLowerCase().includes(term) ||
          issue.nodeId?.toLowerCase().includes(term) ||
          issue.nodeType?.toLowerCase().includes(term) ||
          issue.details?.toLowerCase().includes(term)
      );
    }

    // Sort by severity (errors first)
    filtered.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return filtered;
  }, [validationErrors, severityFilter, searchTerm]);

  // Toggle expanded state for an issue
  const toggleExpanded = useCallback(id => {
  // Added display name
  toggleExpanded.displayName = 'toggleExpanded';

    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

    setActiveTab(newValue);

    // Set appropriate filter based on tab
    switch (newValue) {
      case 0: // All
        setSeverityFilter('all');
        break;
      case 1: // Errors
        setSeverityFilter('error');
        break;
      case 2: // Warnings
        setSeverityFilter('warning');
        break;
      case 3: // Info
        setSeverityFilter('info');
        break;
    }
  }, []);

  // Handle refresh validation
  const handleRefreshValidation = useCallback(() => {
  // Added display name
  handleRefreshValidation.displayName = 'handleRefreshValidation';

    if (onRunValidation) {
      onRunValidation();
    }
  }, [onRunValidation]);

  // Get icon for severity
  const getSeverityIcon = useCallback(severity => {
  // Added display name
  getSeverityIcon.displayName = 'getSeverityIcon';

    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  }, []);

  // Get color for severity
  const getSeverityColor = useCallback(severity => {
  // Added display name
  getSeverityColor.displayName = 'getSeverityColor';

    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  }, []);

  // Summary section content
  const renderSummary = useCallback(() => {
  // Added display name
  renderSummary.displayName = 'renderSummary';

    if (loading) {
      return (
        <Box style={{ padding: '16px', textAlign: 'center' }}>
          <CircularProgress size="small" />
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            Running validation...
          </Typography>
        </Box>
      );
    }

    if (counts.total === 0) {
      return (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          style={{ marginTop: '16px' }}
        >
          No validation issues found. Your flow is valid.
        </Alert>
      );
    }

    return (
      <Box style={{ marginTop: '16px' }}>
        <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
          Validation Summary
        </Typography>

        <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Chip
            icon={<ErrorIcon />}
            label={`${counts.errors} Errors`}
            color={counts.errors > 0 ? 'error' : 'default'}
            variant={counts.errors > 0 ? 'filled' : 'outlined'}
          />

          <Chip
            icon={<WarningIcon />}
            label={`${counts.warnings} Warnings`}
            color={counts.warnings > 0 ? 'warning' : 'default'}
            variant={counts.warnings > 0 ? 'filled' : 'outlined'}
          />

          <Chip
            icon={<InfoIcon />}
            label={`${counts.info} Info`}
            color={counts.info > 0 ? 'info' : 'default'}
            variant={counts.info > 0 ? 'filled' : 'outlined'}
          />
        </Box>

        {counts.errors > 0 && (
          <Alert severity="error" style={{ marginTop: '16px' }}>
            Your flow has critical errors that must be fixed before saving or running.
          </Alert>
        )}

        {counts.errors === 0 && counts.warnings > 0 && (
          <Alert severity="warning" style={{ marginTop: '16px' }}>
            Your flow has warnings that should be addressed but won't prevent saving or running.
          </Alert>
        )}

        {counts.errors === 0 && counts.warnings === 0 && counts.info > 0 && (
          <Alert severity="info" style={{ marginTop: '16px' }}>
            Your flow has some recommendations for improvement.
          </Alert>
        )}
      </Box>
    );
  }, [counts, loading]);

  // Render for empty state
  const renderEmptyState = useCallback(() => {
  // Added display name
  renderEmptyState.displayName = 'renderEmptyState';

    if (searchTerm || severityFilter !== 'all') {
      return (
        <Box style={{ padding: '24px', textAlign: 'center' }}>
          <Typography color="textSecondary">
            No issues found matching your filters.
          </Typography>
          <Button
            variant="text"
            onClick={() => {
              setSearchTerm('');
              setSeverityFilter('all');
              setActiveTab(0);
            }}
            style={{ marginTop: '8px' }}
          >
            Clear Filters
          </Button>
        </Box>
      );
    }

    if (loading) {
      return null;
    }

    return (
      <Box style={{ padding: '24px', textAlign: 'center' }}>
        <CheckCircleIcon 
          style={{ 
            color: theme.palette.success.main,
            fontSize: '48px', 
            marginBottom: '16px' 
          }} 
        />
        <Typography variant="h6" style={{ marginBottom: '8px' }}>
          All Clear!
        </Typography>
        <Typography color="textSecondary">
          No validation issues found in your integration flow.
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary"
          style={{ marginTop: '8px' }}
        >
          Your flow is valid and ready to be saved or run.
        </Typography>
      </Box>
    );
  }, [searchTerm, severityFilter, activeTab, loading, theme]);

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with tabs */}
      <Box style={{ 
        borderBottom: '1px solid', 
        borderColor: theme.palette.divider 
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={true}
        >
          <Tab
            label="All"
            icon={
              <Badge
                badgeContent={counts.total}
                color={counts.errors > 0 ? 'error' : counts.warnings > 0 ? 'warning' : 'default'}
                showZero
              />
            }
            iconPosition="end"
          />
          <Tab
            label="Errors"
            icon={<Badge badgeContent={counts.errors} color="error" showZero />}
            iconPosition="end"
          />
          <Tab
            label="Warnings"
            icon={<Badge badgeContent={counts.warnings} color="warning" showZero />}
            iconPosition="end"
          />
          <Tab
            label="Info"
            icon={<Badge badgeContent={counts.info} color="info" showZero />}
            iconPosition="end"
          />
        </Tabs>
      </Box>

      {/* Toolbar */}
      <Box style={{ 
        padding: '16px', 
        borderBottom: '1px solid', 
        borderColor: theme.palette.divider 
      }}>
        <TextField
          placeholder="Search issues..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          startAdornment={<SearchIcon />}
          endAdornment={searchTerm && (
            <Box 
              as="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DeleteIcon fontSize="small" />
            </Box>
          )}
          style={{ marginBottom: '8px' }}
        />

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshValidation}
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Validate Flow'}
            </Button>
          </Box>

          {autoFix && counts.total > 0 && (
            <Button
              size="small"
              startIcon={<AutoFixHighIcon />}
              color="primary"
              variant="outlined"
            >
              Auto-Fix Issues
            </Button>
          )}
        </Box>
      </Box>

      {/* Summary section */}
      <Box style={{ 
        padding: '16px', 
        borderBottom: '1px solid',
        borderColor: theme.palette.divider
      }}>
        {renderSummary()}
      </Box>

      {/* Issues list */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        {filteredIssues.length > 0 ? (
          <List disablePadding>
            {filteredIssues.map((issue, index) => (
              <React.Fragment key={issue.id || index}>
                <ListItem
                  button
                  onClick={() => toggleExpanded(issue.id || index)}
                  style={{
                    borderLeft: '4px solid',
                    borderColor: theme.palette[getSeverityColor(issue.severity)].main,
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  <ListItemIcon>{getSeverityIcon(issue.severity)}</ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        style={{ fontWeight: 500 }}
                      >
                        {issue.message}
                      </Typography>
                    }
                    secondary={
                      issue.nodeId ? (
                        <Box style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                          <Chip
                            label={issue.nodeType || 'Node'}
                            size="small"
                            style={{ 
                              marginRight: '8px', 
                              height: '20px', 
                              fontSize: '0.7rem' 
                            }}
                          />
                          <Typography variant="caption">{issue.nodeId}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption">Flow-level issue</Typography>
                      )
                    }
                  />

                  <ListItemSecondaryAction>
                    {expandedItems[issue.id || index] ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                  </ListItemSecondaryAction>
                </ListItem>

                <Collapse in={expandedItems[issue.id || index]} timeout="auto" unmountOnExit>
                  <Box style={{ 
                    paddingLeft: '72px', 
                    paddingRight: '16px', 
                    paddingBottom: '16px', 
                    paddingTop: '4px' 
                  }}>
                    {issue.details && (
                      <Typography 
                        variant="body2" 
                        style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}
                      >
                        {issue.details}
                      </Typography>
                    )}

                    {issue.recommendation && (
                      <Alert 
                        severity="info" 
                        icon={<HelpOutlineIcon />} 
                        style={{ marginBottom: '8px' }}
                      >
                        <Typography variant="body2">{issue.recommendation}</Typography>
                      </Alert>
                    )}

                    <Box style={{ marginTop: '8px', display: 'flex' }}>
                      {issue.nodeId && (
                        <Button
                          size="small"
                          startIcon={<NavigateNextIcon />}
                          onClick={() => onSelectNode(issue.nodeId)}
                          style={{ marginRight: '8px' }}
                        >
                          Go to Node
                        </Button>
                      )}

                      {issue.canAutoFix && autoFix && (
                        <Button
                          size="small"
                          startIcon={<AutoFixHighIcon />}
                          color="primary"
                          variant="outlined"
                        >
                          Auto-Fix Issue
                        </Button>
                      )}

                      {issue.helpLink && (
                        <Button
                          size="small"
                          as={Link}
                          href={issue.helpLink}
                          target="_blank"
                          rel="noopener"
                          endIcon={<LinkIcon />}
                        >
                          Learn More
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Collapse>

                {index < filteredIssues.length - 1 && (
                  <Box 
                    as="li" 
                    style={{ 
                      listStyle: 'none',
                      marginLeft: '72px',
                      borderBottom: '1px solid',
                      borderColor: theme.palette.divider,
                      opacity: 0.7
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          renderEmptyState()
        )}
      </Box>
    </Box>
  );
};

export default ValidationPanel;
