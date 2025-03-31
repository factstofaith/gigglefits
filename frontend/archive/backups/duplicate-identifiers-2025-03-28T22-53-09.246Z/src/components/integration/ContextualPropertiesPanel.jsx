/**
 * @component ContextualPropertiesPanel
 * @description Advanced property panel for node/edge configuration in the integration flow builder.
 * Provides contextual configuration options based on the selected element type with both
 * basic and advanced settings, field mapping, validation feedback, and admin-only options.
 *
 * Key features:
 * - Dynamic property fields based on node/edge type
 * - Visual field mapping interface
 * - Real-time validation feedback
 * - Role-based access control
 * - Advanced configuration options
 * - Quick access to related functionality
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
// Import design system components through the adapter layer
import { 
  Box, Typography, TextField, Button, Alert, Chip, Badge, 
  CircularProgress, Tabs, Radio, RadioGroup, Select, Switch,
  useTheme // Import useTheme from our compatibility layer
} from '../../design-system/adapter';

// Still using Material UI components until fully migrated
import { useMediaQuery } from '@mui/material';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tab from '@mui/material/Tab';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';
import  from '@mui/material/';;

// Icons
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import SchemaIcon from '@mui/icons-material/Schema';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import Box from '@mui/material/Box';
// Form components with memoization for better performance
const MemoTextField = memo(({ label, value, onChange, helperText, error, ...props }) => {
  const theme = useTheme();
  
  return (
    <Box style={{ marginBottom: '16px' }}>
      <Typography 
        variant="body2" 
        style={{ 
          marginBottom: '4px', 
          fontWeight: 'medium',
          color: error 
            ? theme.colors?.error?.main || theme.palette.error.main
            : theme.colors?.text?.primary || theme.palette.text.primary
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        size="small"
        error={error}
        helperText={helperText}
        {...props}
      />
    </Box>
  );
});

const MemoSelect = memo(({ label, value, onChange, children, helperText, error, ...props }) => {
  const theme = useTheme();
   
  
  // Transform MUI MenuItem children to options format for design system Select
  const options = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === MenuItem) {
      return {
        value: child.props.value,
        label: child.props.children
      };
    }
    return null;
  }).filter(Boolean);
  
  return (
    <Box style={{ marginBottom: '16px' }}>
      <Typography 
        variant="body2" 
        style={{ 
          marginBottom: '4px', 
          fontWeight: 'medium',
          color: error 
            ? theme.colors?.error?.main || theme.palette.error.main
            : theme.colors?.text?.primary || theme.palette.text.primary
        }}
      >
        {label}
      </Typography>
      <Select
        fullWidth
        value={value || ''}
        options={options}
        onChange={e => onChange(e.target.value)}
        error={error}
        size="small"
        {...props}
      />
      {helperText && (
        <Typography
          variant="caption"
          style={{ 
            marginTop: '4px', 
            marginLeft: '4px',
            color: error 
              ? theme.colors?.error?.main || theme.palette.error.main
              : theme.colors?.text?.secondary || theme.palette.text.secondary
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
});

const MemoSwitch = memo(({ label, checked, onChange, helperText, ...props }) => {
  const theme = useTheme();
   
  
  return (
    <Box style={{ marginTop: '8px', marginBottom: '8px' }}>
      <Switch
        label={label}
        checked={!!checked}
        onChange={e => onChange(e)}
        size="small"
        helperText={helperText}
        {...props}
      />
    </Box>
  );
});

// Helper components for enhanced functionality
const ValidationMessage = memo(({ message, severity = 'error' }) => {
  const theme = useTheme();
   
  
  const icon = {
    error: <ErrorIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
    info: <InfoIcon fontSize="small" />,
    success: <CheckCircleIcon fontSize="small" />,
  }[severity];

  return (
    <Alert
      severity={severity}
      icon={icon}
      style={{
        marginTop: '8px',
        padding: '4px 8px',
        fontSize: '0.8rem',
      }}
    >
      {message}
    </Alert>
  );
});

const FieldRow = memo(({ label, value, type, required, isValid }) => {
  const theme = useTheme();
   
  
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '6px',
        paddingBottom: '6px',
        borderBottom: `1px solid ${theme.colors?.divider || theme.palette.divider}`,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" style={{ marginRight: '8px' }}>
          {label}
        </Typography>
        {required && (
          <Chip
            size="small"
            label="Required"
            color="primary"
            variant="outlined"
            style={{ height: '20px', fontSize: '0.7rem' }}
          />
        )}
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          size="small"
          label={type}
          style={{ 
            height: '20px', 
            fontSize: '0.7rem', 
            marginRight: '8px', 
            backgroundColor: theme.colors?.background?.light || theme.palette.grey[100]
          }}
        />
        {isValid !== undefined &&
          (isValid ? (
            <CheckCircleIcon style={{ 
              color: theme.colors?.status?.success?.main || theme.palette.success.main,
              fontSize: '16px'
            }} />
          ) : (
            <ErrorIcon style={{ 
              color: theme.colors?.status?.error?.main || theme.palette.error.main,
              fontSize: '16px'
            }} />
          ))}
      </Box>
    </Box>
  );
});

const SchemaViewer = memo(({ fields, title }) => {
  const theme = useTheme();
   
  
  return (
    <Box 
      style={{ 
        padding: '8px', 
        marginTop: '8px', 
        maxHeight: '200px', 
        overflow: 'auto',
        border: `1px solid ${theme.colors?.divider || theme.palette.divider}`,
        borderRadius: '4px',
        backgroundColor: theme.colors?.background?.paper || theme.palette.background.paper,
      }}
    >
      <Typography 
        variant="subtitle2" 
        style={{ 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 'medium'
        }}
      >
        <SchemaIcon 
          fontSize="small" 
          style={{ 
            marginRight: '4px',
            color: theme.colors?.text?.secondary || theme.palette.text.secondary 
          }} 
        />
        {title}
      </Typography>
      <Box>
        {fields.map((field, index) => (
          <FieldRow
            key={index}
            label={field.name}
            value={field.value}
            type={field.type}
            required={field.required}
            isValid={field.isValid}
          />
        ))}
      </Box>
    </Box>
  );
});

const SectionTitle = memo(({ icon, title, color }) => {
  const theme = useTheme();
   
  const Icon = icon;
  
  return (
    <Box style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
      <Icon 
        fontSize="small" 
        style={{ 
          marginRight: '8px', 
          color: color || theme.colors?.primary?.main || theme.palette.primary.main 
        }} 
      />
      <Typography 
        variant="subtitle2" 
        style={{ 
          color: color || theme.colors?.primary?.main || theme.palette.primary.main, 
          fontWeight: 'medium' 
        }}
      >
        {title}
      </Typography>
    </Box>
  );
});

// Node type-specific forms
const CommonNodeProperties = memo(({ formData, handleChange, validation, isAdmin }) => {
  const theme = useTheme();
   
  
  return (
    <Box>
      <MemoTextField
        label="Label"
        value={formData.label}
        onChange={value => handleChange('label', value)}
        error={validation?.fields?.label?.hasError}
        helperText={validation?.fields?.label?.message}
      />

      <MemoTextField
        label="Description"
        value={formData.description}
        onChange={value => handleChange('description', value)}
        multiline
        rows={2}
        error={validation?.fields?.description?.hasError}
        helperText={
          validation?.fields?.description?.message || 'Brief explanation of what this node does'
        }
      />

      {isAdmin && (
        <MemoTextField
          label="Technical ID"
          value={formData.id}
          readOnly={true}
          variant="filled"
          helperText="System identifier (read-only)"
          style={{ marginTop: '16px' }}
        />
      )}
    </Box>
  );
});

const SourceNodeProperties = memo(
  ({
    formData,
    handleChange,
    handleNestedChange,
    validation,
    isAdmin,
    onOpenVisualMapper,
    readOnly,
  }) => {
    const theme = useTheme();
    const hasConnectionError = validation?.connection?.hasError;
    const connectionStatus = formData.status || 'Not Connected';
    const isConnected = connectionStatus === 'Connected';

    // Mock schema fields - in a real implementation, these would come from API discovery
    const schemaFields = [
      { name: 'id', type: 'string', required: true, isValid: true },
      { name: 'name', type: 'string', required: true, isValid: true },
      { name: 'email', type: 'string', required: true, isValid: true },
      { name: 'age', type: 'number', required: false, isValid: true },
      { name: 'isActive', type: 'boolean', required: false, isValid: true },
      { name: 'createdAt', type: 'datetime', required: false, isValid: true },
      { name: 'address', type: 'object', required: false, isValid: true },
      { name: 'tags', type: 'array', required: false, isValid: true },
    ];

    return (
      <Box>
        <SectionTitle icon={SettingsIcon} title="Source Configuration" color="primary.main" />

        <MemoSelect
          label="System Type"
          value={formData.system}
          onChange={value => handleChange('system', value)}
          error={validation?.fields?.system?.hasError}
          helperText={validation?.fields?.system?.message}
        >
          <MenuItem value="rest">REST API</MenuItem>
          <MenuItem value="soap">SOAP</MenuItem>
          <MenuItem value="graphql">GraphQL</MenuItem>
          <MenuItem value="database">Database</MenuItem>
          <MenuItem value="file">File System</MenuItem>
          <MenuItem value="s3">AWS S3</MenuItem>
          <MenuItem value="azure">Azure Blob</MenuItem>
          <MenuItem value="salesforce">Salesforce</MenuItem>
          <MenuItem value="sap">SAP</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </MemoSelect>

        <MemoSelect
          label="Authentication Method"
          value={formData.authMethod || 'none'}
          onChange={value => handleChange('authMethod', value)}
          error={validation?.fields?.authMethod?.hasError}
          helperText={validation?.fields?.authMethod?.message}
        >
          <MenuItem value="none">No Authentication</MenuItem>
          <MenuItem value="basic">Basic Auth</MenuItem>
          <MenuItem value="oauth2">OAuth 2.0</MenuItem>
          <MenuItem value="api_key">API Key</MenuItem>
          <MenuItem value="jwt">JWT</MenuItem>
          <MenuItem value="aws_sig">AWS Signature</MenuItem>
        </MemoSelect>

        <MemoTextField
          label="Connection URL"
          value={formData.connectionUrl}
          onChange={value => handleChange('connectionUrl', value)}
          placeholder="https://api.example.com/v1"
          error={validation?.fields?.connectionUrl?.hasError}
          helperText={validation?.fields?.connectionUrl?.message}
        />

        {/* Connection section with visual indicator */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '16px',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: isConnected 
              ? (theme.colors?.status?.success?.lightest || 'rgba(46, 204, 113, 0.1)') 
              : (theme.colors?.background?.light || theme.palette.grey[100]),
          }}
        >
          <Box style={{ marginRight: '16px' }}>
            {isConnected ? (
              <CheckCircleIcon style={{ color: theme.colors?.status?.success?.main || theme.palette.success.main }} />
            ) : (
              <LinkOffIcon style={{ color: theme.colors?.action?.active || theme.palette.action.active }} />
            )}
          </Box>
          <Box style={{ flex: 1 }}>
            <Typography variant="body2" style={{ fontWeight: 'medium' }}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </Typography>
            <Typography 
              variant="caption" 
              style={{ 
                color: theme.colors?.text?.secondary || theme.palette.text.secondary 
              }}
            >
              {isConnected
                ? 'Successfully connected to the source'
                : 'Configure and test the connection'}
            </Typography>
          </Box>

          {!readOnly && (
            <Button
              size="small"
              variant={isConnected ? "outlined" : "contained"}
              startIcon={isConnected ? <LinkOffIcon /> : <PlayArrowIcon />}
              onClick={() => handleChange('status', isConnected ? 'Not Connected' : 'Connected')}
              color={isConnected ? 'primary' : 'secondary'}
            >
              {isConnected ? 'Disconnect' : 'Test Connection'}
            </Button>
          )}
        </Box>

        {hasConnectionError && (
          <ValidationMessage message={validation.connection.message} severity="error" />
        )}

        {/* Schema Discovery section */}
        {isConnected && (
          <>
            <SectionTitle icon={SchemaIcon} title="Available Fields" color="primary.main" />

            <SchemaViewer fields={schemaFields} title="Source Schema" />

            {!readOnly && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={onOpenVisualMapper}
                sx={{ mt: 2 }}
              >
                Configure Field Mapping
              </Button>
            )}
          </>
        )}
      </Box>
    );
  }
);

const TransformNodeProperties = memo(
  ({ formData, handleChange, validation, isAdmin, onOpenVisualMapper, readOnly }) => {
    const theme = useTheme();
    return (
    <Box>
      <SectionTitle icon={SwapVertIcon} title="Transform Configuration" color="#F2994A" />

      <MemoSelect
        label="Transform Type"
        value={formData.transformType || 'transform'}
        onChange={value => handleChange('transformType', value)}
        error={validation?.fields?.transformType?.hasError}
        helperText={validation?.fields?.transformType?.message}
      >
        <MenuItem value="filter">Filter</MenuItem>
        <MenuItem value="map">Map Fields</MenuItem>
        <MenuItem value="join">Join Data</MenuItem>
        <MenuItem value="aggregate">Aggregate</MenuItem>
        <MenuItem value="sort">Sort</MenuItem>
        <MenuItem value="transform">Custom Transform</MenuItem>
      </MemoSelect>

      {formData.transformType === 'filter' && (
        <>
          <MemoTextField
            label="Filter Condition"
            value={formData.condition}
            onChange={value => handleChange('condition', value)}
            multiline
            rows={3}
            placeholder="status === 'active' && amount > 100"
            error={validation?.fields?.condition?.hasError}
            helperText={
              validation?.fields?.condition?.message ||
              'JavaScript expression that evaluates to true/false'
            }
          />

          {!readOnly && (
            <Button fullWidth variant="outlined" startIcon={<CodeIcon />} sx={{ mt: 2 }}>
              Open Expression Editor
            </Button>
          )}
        </>
      )}

      {formData.transformType === 'map' && (
        <>
          <SectionTitle icon={MapIcon} title="Field Mapping" color="#F2994A" />

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Configure how source fields map to destination fields
            </Typography>

            {!readOnly && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={onOpenVisualMapper}
              >
                Open Visual Mapper
              </Button>
            )}
          </Paper>
        </>
      )}

      {formData.transformType === 'join' && (
        <>
          <MemoSelect
            label="Join Type"
            value={formData.joinType || 'inner'}
            onChange={value => handleChange('joinType', value)}
          >
            <MenuItem value="inner">Inner Join</MenuItem>
            <MenuItem value="left">Left Join</MenuItem>
            <MenuItem value="right">Right Join</MenuItem>
            <MenuItem value="full">Full Join</MenuItem>
          </MemoSelect>

          <MemoTextField
            label="Join Condition"
            value={formData.joinCondition}
            onChange={value => handleChange('joinCondition', value)}
            placeholder="left.id === right.userId"
            helperText="Condition to match records between datasets"
          />
        </>
      )}

      {formData.transformType === 'aggregate' && (
        <>
          <MemoTextField
            label="Group By Fields"
            value={formData.groupBy}
            onChange={value => handleChange('groupBy', value)}
            placeholder="category, region"
            helperText="Comma-separated list of fields to group by"
          />

          <MemoTextField
            label="Aggregate Functions"
            value={formData.aggregateFunctions}
            onChange={value => handleChange('aggregateFunctions', value)}
            multiline
            rows={3}
            placeholder="sum(amount) as totalAmount, avg(quantity) as avgQuantity"
            helperText="Aggregation functions to apply to each group"
          />
        </>
      )}

      {formData.transformType === 'sort' && (
        <>
          <MemoTextField
            label="Sort Fields"
            value={formData.sortFields}
            onChange={value => handleChange('sortFields', value)}
            multiline
            rows={2}
            placeholder="lastName asc, age desc"
            helperText="Fields to sort by with direction (asc/desc)"
          />
        </>
      )}

      {formData.transformType === 'transform' && (
        <>
          <MemoTextField
            label="Custom Code"
            value={formData.customCode}
            onChange={value => handleChange('customCode', value)}
            multiline
            rows={5}
            placeholder="function transform(input) {
  // Added display name
  transform.displayName = 'transform';
\n  // Your transformation logic here\n  return output;\n}"
            error={validation?.fields?.customCode?.hasError}
            helperText={
              validation?.fields?.customCode?.message || 'JavaScript code to transform the data'
            }
          />

          {!readOnly && (
            <Button fullWidth variant="outlined" startIcon={<CodeIcon />} sx={{ mt: 2 }}>
              Open Code Editor
            </Button>
          )}
        </>
      )}

      {/* Data Preview */}
      {isAdmin && !readOnly && (
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<PlayArrowIcon />}
          sx={{ mt: 2 }}
        >
          Preview Transformation
        </Button>
      )}
    </Box>
  )}
);

const DestinationNodeProperties = memo(
  ({ formData, handleChange, validation, isAdmin, onOpenVisualMapper, readOnly }) => {
    const theme = useTheme();
    return (
    <Box>
      <SectionTitle icon={SettingsIcon} title="Destination Configuration" color="#27AE60" />

      <MemoSelect
        label="System Type"
        value={formData.system}
        onChange={value => handleChange('system', value)}
        error={validation?.fields?.system?.hasError}
        helperText={validation?.fields?.system?.message}
      >
        <MenuItem value="rest">REST API</MenuItem>
        <MenuItem value="database">Database</MenuItem>
        <MenuItem value="file">File System</MenuItem>
        <MenuItem value="s3">AWS S3</MenuItem>
        <MenuItem value="azure">Azure Blob</MenuItem>
        <MenuItem value="salesforce">Salesforce</MenuItem>
        <MenuItem value="sap">SAP</MenuItem>
        <MenuItem value="custom">Custom</MenuItem>
      </MemoSelect>

      <MemoSelect
        label="Write Mode"
        value={formData.writeMode || 'append'}
        onChange={value => handleChange('writeMode', value)}
        error={validation?.fields?.writeMode?.hasError}
        helperText={validation?.fields?.writeMode?.message}
      >
        <MenuItem value="append">Append</MenuItem>
        <MenuItem value="overwrite">Overwrite</MenuItem>
        <MenuItem value="upsert">Upsert</MenuItem>
        <MenuItem value="merge">Merge</MenuItem>
      </MemoSelect>

      {/* Connection Configuration - Similar to Source */}
      <MemoTextField
        label="Connection URL"
        value={formData.connectionUrl}
        onChange={value => handleChange('connectionUrl', value)}
        placeholder="https://api.example.com/v1/data"
        error={validation?.fields?.connectionUrl?.hasError}
        helperText={validation?.fields?.connectionUrl?.message}
      />

      {formData.system === 'database' && (
        <MemoTextField
          label="Table Name"
          value={formData.tableName}
          onChange={value => handleChange('tableName', value)}
          placeholder="customers"
          helperText="Target table name in the database"
        />
      )}

      {formData.system === 'file' && (
        <MemoTextField
          label="File Path"
          value={formData.filePath}
          onChange={value => handleChange('filePath', value)}
          placeholder="/path/to/output.csv"
          helperText="Target file path"
        />
      )}

      {/* Connection Status */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 2,
          p: 1.5,
          borderRadius: 1,
          bgcolor: formData.status === 'Connected' ? 'success.lightest' : 'grey.100',
        }}
      >
        <Box sx={{ mr: 2 }}>
          {formData.status === 'Connected' ? (
            <CheckCircleIcon color="success" />
          ) : (
            <LinkOffIcon color="action" />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {formData.status === 'Connected' ? 'Connected' : 'Not Connected'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formData.status === 'Connected'
              ? 'Successfully connected to the destination'
              : 'Configure and test the connection'}
          </Typography>
        </Box>

        {!readOnly && (
          <Button
            size="small"
            variant="outlined"
            startIcon={formData.status === 'Connected' ? <LinkOffIcon /> : <PlayArrowIcon />}
            onClick={() =>
              handleChange(
                'status',
                formData.status === 'Connected' ? 'Not Connected' : 'Connected'
              )
            }
            color={formData.status === 'Connected' ? 'primary' : 'secondary'}
          >
            {formData.status === 'Connected' ? 'Disconnect' : 'Test Connection'}
          </Button>
        )}
      </Box>

      {formData.status === 'Connected' && !readOnly && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={onOpenVisualMapper}
          sx={{ mt: 2 }}
        >
          Configure Field Mapping
        </Button>
      )}

      {/* Error handling */}
      <SectionTitle icon={WarningIcon} title="Error Handling" color="#F2994A" />

      <MemoSelect
        label="On Error"
        value={formData.onError || 'abort'}
        onChange={value => handleChange('onError', value)}
      >
        <MenuItem value="abort">Abort Integration</MenuItem>
        <MenuItem value="continue">Continue (Skip Failed Records)</MenuItem>
        <MenuItem value="retry">Retry (3 Attempts)</MenuItem>
        <MenuItem value="custom">Custom Error Handler</MenuItem>
      </MemoSelect>

      {formData.onError === 'custom' && (
        <MemoTextField
          label="Custom Error Handler"
          value={formData.errorHandler}
          onChange={value => handleChange('errorHandler', value)}
          multiline
          rows={3}
          placeholder="function handleError(error, record) {
  // Added display name
  handleError.displayName = 'handleError';
\n  // Custom error handling logic\n}"
        />
      )}
    </Box>
  )}
);

const TriggerNodeProperties = memo(
  ({ formData, handleChange, handleNestedChange, validation, isAdmin, readOnly }) => {
    const theme = useTheme();
    return (
    <Box>
      <SectionTitle icon={PlayArrowIcon} title="Trigger Configuration" color="#7950F2" />

      <MemoSelect
        label="Trigger Type"
        value={formData.triggerType || 'schedule'}
        onChange={value => handleChange('triggerType', value)}
        error={validation?.fields?.triggerType?.hasError}
        helperText={validation?.fields?.triggerType?.message}
      >
        <MenuItem value="schedule">Schedule</MenuItem>
        <MenuItem value="webhook">Webhook</MenuItem>
        <MenuItem value="event">Event</MenuItem>
        <MenuItem value="manual">Manual</MenuItem>
      </MemoSelect>

      {formData.triggerType === 'schedule' && (
        <>
          <MemoSelect
            label="Schedule Type"
            value={formData.schedule?.type || 'interval'}
            onChange={value => handleNestedChange('schedule', 'type', value)}
          >
            <MenuItem value="interval">Interval</MenuItem>
            <MenuItem value="cron">Cron Expression</MenuItem>
            <MenuItem value="fixed">Fixed Time</MenuItem>
          </MemoSelect>

          {formData.schedule?.type === 'interval' && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                label="Interval"
                type="number"
                value={formData.schedule?.interval || 5}
                onChange={e => handleNestedChange('schedule', 'interval', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />

              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.schedule?.unit || 'minutes'}
                  label="Unit"
                  onChange={e => handleNestedChange('schedule', 'unit', e.target.value)}
                >
                  <MenuItem value="minutes">Minutes</MenuItem>
                  <MenuItem value="hours">Hours</MenuItem>
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {formData.schedule?.type === 'cron' && (
            <>
              <MemoTextField
                label="Cron Expression"
                value={formData.schedule?.cronExpression}
                onChange={value => handleNestedChange('schedule', 'cronExpression', value)}
                placeholder="0 0 * * * *"
                error={validation?.fields?.['schedule.cronExpression']?.hasError}
                helperText={
                  validation?.fields?.['schedule.cronExpression']?.message ||
                  'Standard cron expression format (sec min hour day month weekday)'
                }
              />

              {!readOnly && isAdmin && (
                <Button fullWidth variant="outlined" startIcon={<HelpOutlineIcon />} sx={{ mt: 1 }}>
                  Cron Expression Help
                </Button>
              )}
            </>
          )}

          {formData.schedule?.type === 'fixed' && (
            <>
              <MemoTextField
                label="Time"
                type="time"
                value={formData.schedule?.time || '08:00'}
                onChange={value => handleNestedChange('schedule', 'time', value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />

              <MemoSelect
                label="Repeat"
                value={formData.schedule?.repeat || 'daily'}
                onChange={value => handleNestedChange('schedule', 'repeat', value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekdays">Weekdays</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </MemoSelect>

              {formData.schedule?.repeat === 'weekly' && (
                <MemoSelect
                  label="Day of Week"
                  value={formData.schedule?.dayOfWeek || 1}
                  onChange={value => handleNestedChange('schedule', 'dayOfWeek', value)}
                >
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                  <MenuItem value={0}>Sunday</MenuItem>
                </MemoSelect>
              )}

              {formData.schedule?.repeat === 'monthly' && (
                <MemoTextField
                  label="Day of Month"
                  type="number"
                  value={formData.schedule?.dayOfMonth || 1}
                  onChange={value => handleNestedChange('schedule', 'dayOfMonth', value)}
                  inputProps={{ min: 1, max: 31 }}
                  helperText="Day of the month (1-31)"
                />
              )}
            </>
          )}

          {/* Timezone selection (for all schedule types) */}
          <MemoSelect
            label="Timezone"
            value={formData.schedule?.timezone || 'UTC'}
            onChange={value => handleNestedChange('schedule', 'timezone', value)}
          >
            <MenuItem value="UTC">UTC</MenuItem>
            <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
            <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
            <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
            <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
            <MenuItem value="Europe/London">London (GMT)</MenuItem>
            <MenuItem value="Europe/Paris">Central European (CET)</MenuItem>
            <MenuItem value="Asia/Tokyo">Japan (JST)</MenuItem>
          </MemoSelect>
        </>
      )}

      {formData.triggerType === 'webhook' && (
        <>
          <MemoTextField
            label="Path"
            value={formData.webhook?.path}
            onChange={value => handleNestedChange('webhook', 'path', value)}
            placeholder="/webhooks/my-integration"
            error={validation?.fields?.['webhook.path']?.hasError}
            helperText={
              validation?.fields?.['webhook.path']?.message ||
              'URL path where webhook should receive events'
            }
          />

          <MemoSelect
            label="Method"
            value={formData.webhook?.method || 'POST'}
            onChange={value => handleNestedChange('webhook', 'method', value)}
          >
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
          </MemoSelect>

          <MemoTextField
            label="Secret Key"
            value={formData.webhook?.secret}
            onChange={value => handleNestedChange('webhook', 'secret', value)}
            placeholder="Optional webhook secret for validation"
            type="password"
            helperText="Used to validate webhook authenticity"
          />

          {/* Display webhook URL */}
          {isAdmin && formData.webhook?.path && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Webhook URL:</Typography>
              <Box
                sx={{
                  p: 1,
                  mt: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                }}
              >
                https://api.example.com{formData.webhook?.path}
              </Box>

              <Button size="small" variant="text" startIcon={<ContentCopyIcon />} sx={{ mt: 1 }}>
                Copy URL
              </Button>
            </Box>
          )}
        </>
      )}

      {formData.triggerType === 'event' && (
        <>
          <MemoTextField
            label="Event Source"
            value={formData.event?.source}
            onChange={value => handleNestedChange('event', 'source', value)}
            placeholder="System"
            error={validation?.fields?.['event.source']?.hasError}
            helperText={
              validation?.fields?.['event.source']?.message || 'System that will generate the event'
            }
          />

          <MemoTextField
            label="Event Name"
            value={formData.event?.name}
            onChange={value => handleNestedChange('event', 'name', value)}
            placeholder="record.created"
            error={validation?.fields?.['event.name']?.hasError}
            helperText={
              validation?.fields?.['event.name']?.message || 'Name of the event to trigger the flow'
            }
          />

          <MemoTextField
            label="Event Filter"
            value={formData.event?.filter}
            onChange={value => handleNestedChange('event', 'filter', value)}
            placeholder="data.type === 'customer'"
            multiline
            rows={2}
            helperText="Optional filter condition for event data"
          />
        </>
      )}

      {/* Trigger status toggle */}
      <Box
        sx={{
          mt: 3,
          p: 1.5,
          borderRadius: 1,
          bgcolor: formData.status === 'Active' ? 'success.lightest' : 'grey.100',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={formData.status === 'Active'}
              onChange={e => handleChange('status', e.target.checked ? 'Active' : 'Inactive')}
              disabled={readOnly}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {formData.status === 'Active' ? 'Active' : 'Inactive'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.status === 'Active'
                  ? 'Trigger is enabled and will start the flow'
                  : 'Trigger is disabled and will not start the flow'}
              </Typography>
            </Box>
          }
        />
      </Box>

      {isAdmin && formData.status === 'Active' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Next scheduled run: {formData.nextRun || 'Calculating...'}
          </Typography>
        </Alert>
      )}
    </Box>
  )}
);

const RouterNodeProperties = memo(({ formData, handleChange, validation, isAdmin, readOnly }) => {
  const theme = useTheme();
  return (
  <Box>
    <SectionTitle icon={CallSplitIcon} title="Router Configuration" color="#BB6BD9" />

    <MemoSelect
      label="Router Type"
      value={formData.routerType || 'condition'}
      onChange={value => handleChange('routerType', value)}
      error={validation?.fields?.routerType?.hasError}
      helperText={validation?.fields?.routerType?.message}
    >
      <MenuItem value="fork">Fork (All Paths)</MenuItem>
      <MenuItem value="condition">Condition (If/Else)</MenuItem>
      <MenuItem value="switch">Switch (Multiple Cases)</MenuItem>
      <MenuItem value="merge">Merge</MenuItem>
    </MemoSelect>

    {formData.routerType === 'condition' && (
      <MemoTextField
        label="Condition"
        value={formData.condition}
        onChange={value => handleChange('condition', value)}
        multiline
        rows={2}
        placeholder="amount > 100"
        error={validation?.fields?.condition?.hasError}
        helperText={
          validation?.fields?.condition?.message ||
          'JavaScript expression that evaluates to true/false'
        }
      />
    )}

    {formData.routerType === 'switch' && (
      <>
        <MemoTextField
          label="Switch Field"
          value={formData.switchField}
          onChange={value => handleChange('switchField', value)}
          placeholder="status"
          error={validation?.fields?.switchField?.hasError}
          helperText={
            validation?.fields?.switchField?.message || 'Field name to evaluate for different cases'
          }
        />

        <SectionTitle icon={FormatListBulletedIcon} title="Cases" color="#BB6BD9" />

        {(formData.cases || []).map((caseItem, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
            <Typography variant="subtitle2">
              Case {index + 1}: {caseItem.label || caseItem.value}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                label="Value"
                value={caseItem.value}
                onChange={e => {
                  const newCases = [...(formData.cases || [])];
                  newCases[index] = { ...newCases[index], value: e.target.value };
                  handleChange('cases', newCases);
                }}
                size="small"
                sx={{ flex: 2 }}
              />

              <TextField
                label="Label"
                value={caseItem.label}
                onChange={e => {
                  const newCases = [...(formData.cases || [])];
                  newCases[index] = { ...newCases[index], label: e.target.value };
                  handleChange('cases', newCases);
                }}
                size="small"
                sx={{ flex: 3 }}
              />
            </Box>

            {!readOnly && (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  const newCases = [...(formData.cases || [])];
                  newCases.splice(index, 1);
                  handleChange('cases', newCases);
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ))}

        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              const newCases = [...(formData.cases || []), { value: '', label: '' }];
              handleChange('cases', newCases);
            }}
            sx={{ mt: 1 }}
            fullWidth
          >
            Add Case
          </Button>
        )}

        <MemoSwitch
          label="Include Default Case"
          checked={formData.includeDefault}
          onChange={checked => handleChange('includeDefault', checked)}
          helperText="Route to default path if no cases match"
          sx={{ mt: 2 }}
        />
      </>
    )}

    {formData.routerType === 'merge' && (
      <MemoSelect
        label="Merge Strategy"
        value={formData.mergeStrategy || 'all'}
        onChange={value => handleChange('mergeStrategy', value)}
      >
        <MenuItem value="all">Wait for All</MenuItem>
        <MenuItem value="any">First Response</MenuItem>
        <MenuItem value="sequence">Process in Sequence</MenuItem>
      </MemoSelect>
    )}

    {/* Visual representation of routes */}
    {(formData.routerType === 'condition' || formData.routerType === 'switch') && (
      <Box sx={{ mt: 3, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimelineIcon fontSize="small" sx={{ mr: 1 }} />
          Route Visualization
        </Typography>

        <Paper variant="outlined" sx={{ p: 1.5 }}>
          {formData.routerType === 'condition' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="If" size="small" color="primary" />
                <Typography variant="body2">{formData.condition || '[Condition]'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  → Route to True path
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Else" size="small" color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  → Route to False path
                </Typography>
              </Box>
            </Box>
          )}

          {formData.routerType === 'switch' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                Switch on: <b>{formData.switchField || '[Field]'}</b>
              </Typography>

              {(formData.cases || []).map((caseItem, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                  <Chip
                    label={`Case ${index + 1}`}
                    size="small"
                    sx={{ bgcolor: `rgba(187, 107, 217, ${0.2 + index * 0.1})` }}
                  />
                  <Typography variant="body2">
                    {caseItem.value || '[Value]'}: → {caseItem.label || 'Path ' + (index + 1)}
                  </Typography>
                </Box>
              ))}

              {formData.includeDefault && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                  <Chip label="Default" size="small" color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    → Default path
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    )}
  </Box>
)});

// Edge properties component
const EdgeProperties = memo(
  ({ formData, handleChange, handleStyleChange, validation, isAdmin }) => {
    const theme = useTheme();
    return (
    <Box>
      <SectionTitle icon={LinkIcon} title="Connection Configuration" color="#555" />

      <MemoTextField
        label="Label"
        value={formData.label}
        onChange={value => handleChange('label', value)}
        placeholder="Data flow"
      />

      <MemoSelect
        label="Connection Type"
        value={formData.type || 'smoothstep'}
        onChange={value => handleChange('type', value)}
      >
        <MenuItem value="default">Default</MenuItem>
        <MenuItem value="straight">Straight</MenuItem>
        <MenuItem value="step">Step</MenuItem>
        <MenuItem value="smoothstep">Smooth Step</MenuItem>
        <MenuItem value="bezier">Bezier</MenuItem>
      </MemoSelect>

      <MemoSwitch
        label="Animated Flow"
        checked={formData.animated}
        onChange={checked => handleChange('animated', checked)}
        helperText="Show animated flow along the connection"
      />

      <SectionTitle icon={PaletteIcon} title="Visual Styling" color="#555" />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="Stroke Width"
          type="number"
          value={formData.style?.strokeWidth || 2}
          onChange={e => handleStyleChange('strokeWidth', Number(e.target.value))}
          size="small"
          inputProps={{ min: 1, max: 10 }}
          sx={{ flex: 1 }}
        />

        <TextField
          label="Stroke Color"
          value={formData.style?.stroke || '#555'}
          onChange={e => handleStyleChange('stroke', e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
      </Box>

      <MemoSwitch
        label="Dashed Line"
        checked={!!formData.style?.strokeDasharray}
        onChange={checked => handleStyleChange('strokeDasharray', checked ? '5, 5' : null)}
        sx={{ mt: 1 }}
      />

      {/* Advanced edge settings for admins */}
      {isAdmin && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Advanced Connection Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MemoSelect
              label="Connection Validation"
              value={formData.validation || 'types'}
              onChange={value => handleChange('validation', value)}
            >
              <MenuItem value="none">No Validation</MenuItem>
              <MenuItem value="types">Validate Data Types</MenuItem>
              <MenuItem value="schema">Full Schema Validation</MenuItem>
              <MenuItem value="custom">Custom Validation</MenuItem>
            </MemoSelect>

            <MemoSwitch
              label="Enable Transformation"
              checked={formData.enableTransform}
              onChange={checked => handleChange('enableTransform', checked)}
              helperText="Apply transformation while data flows through connection"
            />

            {formData.enableTransform && (
              <MemoTextField
                label="Transformation"
                value={formData.transform}
                onChange={value => handleChange('transform', value)}
                multiline
                rows={3}
                placeholder="data => ({ ...data, processed: true })"
                helperText="JavaScript transformation to apply to flowing data"
              />
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )}
);

// Advanced tab content
const AdvancedProperties = memo(({ formData, handleChange, isAdmin, readOnly }) => {
  const theme = useTheme();
  return (
  <Box>
    <SectionTitle icon={SettingsIcon} title="Advanced Settings" color="text.primary" />

    <MemoSwitch
      label="Enable Logging"
      checked={formData.enableLogging}
      onChange={checked => handleChange('enableLogging', checked)}
      helperText="Record detailed execution logs for this node"
    />

    <MemoSwitch
      label="Pass-through on Failure"
      checked={formData.passThroughOnFailure}
      onChange={checked => handleChange('passThroughOnFailure', checked)}
      helperText="Continue flow execution even if this node fails"
    />

    <MemoTextField
      label="Custom ID"
      value={formData.customId}
      onChange={value => handleChange('customId', value)}
      placeholder="Optional custom identifier"
      helperText="Unique identifier for external references"
    />

    <MemoSelect
      label="Execution Priority"
      value={formData.priority || 'normal'}
      onChange={value => handleChange('priority', value)}
    >
      <MenuItem value="high">High</MenuItem>
      <MenuItem value="normal">Normal</MenuItem>
      <MenuItem value="low">Low</MenuItem>
    </MemoSelect>

    <MemoTextField
      label="Timeout (seconds)"
      type="number"
      value={formData.timeout || 30}
      onChange={value => handleChange('timeout', value)}
      inputProps={{ min: 0, max: 3600 }}
      helperText="Maximum execution time (0 = no timeout)"
    />

    {isAdmin && (
      <>
        <SectionTitle icon={CodeIcon} title="Custom Logic" color="text.primary" />

        <MemoTextField
          label="Before Execution"
          value={formData.beforeExecution}
          onChange={value => handleChange('beforeExecution', value)}
          multiline
          rows={3}
          placeholder="function(context) { /* Pre-execution logic */ }"
          helperText="Custom code to run before node execution"
          disabled={readOnly}
        />

        <MemoTextField
          label="After Execution"
          value={formData.afterExecution}
          onChange={value => handleChange('afterExecution', value)}
          multiline
          rows={3}
          placeholder="function(result, context) { /* Post-execution logic */ }"
          helperText="Custom code to run after node execution"
          disabled={readOnly}
        />

        <MemoTextField
          label="Error Handler"
          value={formData.errorHandler}
          onChange={value => handleChange('errorHandler', value)}
          multiline
          rows={3}
          placeholder="function(error, context) { /* Error handling logic */ }"
          helperText="Custom error handling logic"
          disabled={readOnly}
        />
      </>
    )}
  </Box>
)});

// Permissions tab (admin only)
const PermissionsProperties = memo(({ formData, handleChange, isAdmin }) => {
  const theme = useTheme();
  if (!isAdmin) return null;

  return (
    <Box>
      <SectionTitle icon={LockIcon} title="Permissions" color="text.primary" />

      <MemoSelect
        label="Visibility"
        value={formData.visibility || 'all'}
        onChange={value => handleChange('visibility', value)}
      >
        <MenuItem value="all">All Users</MenuItem>
        <MenuItem value="admin">Admins Only</MenuItem>
        <MenuItem value="owner">Owner Only</MenuItem>
        <MenuItem value="custom">Custom</MenuItem>
      </MemoSelect>

      {formData.visibility === 'custom' && (
        <MemoTextField
          label="Allowed Roles/Users"
          value={formData.allowedUsers}
          onChange={value => handleChange('allowedUsers', value)}
          helperText="Comma-separated list of roles or usernames"
        />
      )}

      <MemoSelect
        label="Edit Permission"
        value={formData.editPermission || 'admin'}
        onChange={value => handleChange('editPermission', value)}
      >
        <MenuItem value="all">All Users</MenuItem>
        <MenuItem value="admin">Admins Only</MenuItem>
        <MenuItem value="owner">Owner Only</MenuItem>
      </MemoSelect>

      <MemoSwitch
        label="Lock Configuration"
        checked={formData.locked}
        onChange={checked => handleChange('locked', checked)}
        helperText="Prevent modifications to this node"
      />
    </Box>
  );
});

// History tab
const HistoryProperties = memo(({ nodeHistory, isAdmin }) => {
  const theme = useTheme();
  return (
  <Box>
    <SectionTitle icon={HistoryIcon} title="Execution History" color="text.primary" />

    {nodeHistory && nodeHistory.length > 0 ? (
      <List sx={{ p: 0 }}>
        {nodeHistory.map((entry, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1,
              borderLeft: '4px solid',
              borderColor:
                entry.status === 'success'
                  ? 'success.main'
                  : entry.status === 'error'
                    ? 'error.main'
                    : entry.status === 'warning'
                      ? 'warning.main'
                      : 'grey.400',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">
                {new Date(entry.timestamp).toLocaleString()}
              </Typography>
              <Chip
                size="small"
                label={entry.status}
                color={
                  entry.status === 'success'
                    ? 'success'
                    : entry.status === 'error'
                      ? 'error'
                      : entry.status === 'warning'
                        ? 'warning'
                        : 'default'
                }
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {entry.message}
            </Typography>
            {isAdmin && entry.details && (
              <Accordion sx={{ mt: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0 }}>
                  <Typography variant="caption">Technical Details</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                    }}
                  >
                    {entry.details}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        ))}
      </List>
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
        No execution history available
      </Typography>
    )}

    {isAdmin && (
      <Button fullWidth variant="outlined" startIcon={<HistoryIcon />} sx={{ mt: 1 }}>
        View Full History
      </Button>
    )}
  </Box>
)});

// Main component
const ContextualPropertiesPanel = ({
  element,
  onNodeUpdate,
  onEdgeUpdate,
  onDeleteNode,
  onDeleteEdge,
  onAddNextNode,
  onOpenVisualMapper,
  readOnly = false,
  isAdmin = false,
  validation,
}) => {
  // Added display name
  ContextualPropertiesPanel.displayName = 'ContextualPropertiesPanel';

  // Added display name
  ContextualPropertiesPanel.displayName = 'ContextualPropertiesPanel';

  // Added display name
  ContextualPropertiesPanel.displayName = 'ContextualPropertiesPanel';


  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Get node history (mock data for demonstration)
  const nodeHistory = useMemo(
    () => [
      {
        timestamp: Date.now() - 3600000,
        status: 'success',
        message: 'Node executed successfully',
        details: 'Processed 145 records in 2.3 seconds',
      },
      {
        timestamp: Date.now() - 7200000,
        status: 'error',
        message: 'Execution failed: Connection timeout',
        details: 'Error: ETIMEDOUT at SourceConnector.connect (line 42)',
      },
      {
        timestamp: Date.now() - 86400000,
        status: 'success',
        message: 'Node executed successfully',
        details: 'Processed 130 records in 2.1 seconds',
      },
    ],
    []
  );

  // Initialize form data when element changes
  useEffect(() => {
    if (element?.type === 'node') {
      setFormData({
        label: element.data.label || '',
        id: element.id,
        ...element.data,
      });
    } else if (element?.type === 'edge') {
      setFormData({
        label: element.data.label || '',
        animated: element.data.animated || false,
        style: element.data.style || { stroke: '#555', strokeWidth: 2 },
        ...element.data,
      });
    }
  }, [element]);

  // Memoized handlers for better performance
  const handleChange = useCallback((field, value) => {
  // Added display name
  handleChange.displayName = 'handleChange';

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNestedChange = useCallback((parent, field, value) => {
  // Added display name
  handleNestedChange.displayName = 'handleNestedChange';

    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  }, []);

  const handleStyleChange = useCallback((field, value) => {
  // Added display name
  handleStyleChange.displayName = 'handleStyleChange';

    setFormData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value,
      },
    }));
  }, []);

  // Handle save with memoization
  const handleSave = useCallback(() => {
  // Added display name
  handleSave.displayName = 'handleSave';

    if (element?.type === 'node') {
      onNodeUpdate(element.id, formData);
    } else if (element?.type === 'edge') {
      onEdgeUpdate(element.id, formData);
    }
  }, [element, formData, onNodeUpdate, onEdgeUpdate]);

  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
  // Added display name
  handleDelete.displayName = 'handleDelete';

    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
  // Added display name
  confirmDelete.displayName = 'confirmDelete';

    if (element?.type === 'node') {
      onDeleteNode(element.id);
    } else if (element?.type === 'edge') {
      onDeleteEdge(element.id);
    }
    setDeleteConfirmOpen(false);
  }, [element, onDeleteNode, onDeleteEdge]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

    setActiveTab(newValue);
  }, []);

  // Determine node type for styling
  const getNodeTypeInfo = useCallback(() => {
  // Added display name
  getNodeTypeInfo.displayName = 'getNodeTypeInfo';

    if (!element || element.type !== 'node') {
      return { color: '#555', name: 'Element' };
    }

    const nodeType = element.data.type?.replace('Node', '') || '';

    if (
      nodeType.includes('source') ||
      nodeType.includes('api') ||
      nodeType.includes('file') ||
      nodeType.includes('database')
    ) {
      return { color: '#2E7EED', name: 'Source' };
    } else if (nodeType.includes('destination')) {
      return { color: '#27AE60', name: 'Destination' };
    } else if (
      nodeType.includes('transform') ||
      nodeType.includes('filter') ||
      nodeType.includes('map') ||
      nodeType.includes('join') ||
      nodeType.includes('aggregate')
    ) {
      return { color: '#F2994A', name: 'Transform' };
    } else if (nodeType.includes('dataset')) {
      return { color: '#9B51E0', name: 'Dataset' };
    } else if (
      nodeType.includes('trigger') ||
      nodeType.includes('schedule') ||
      nodeType.includes('webhook') ||
      nodeType.includes('event')
    ) {
      return { color: '#7950F2', name: 'Trigger' };
    } else if (
      nodeType.includes('router') ||
      nodeType.includes('fork') ||
      nodeType.includes('condition') ||
      nodeType.includes('switch') ||
      nodeType.includes('merge')
    ) {
      return { color: '#BB6BD9', name: 'Router' };
    } else if (
      nodeType.includes('action') ||
      nodeType.includes('notification') ||
      nodeType.includes('function') ||
      nodeType.includes('delay') ||
      nodeType.includes('error')
    ) {
      return { color: '#1E88E5', name: 'Action' };
    }

    return { color: '#888888', name: capitalize(nodeType) || 'Node' };
  }, [element]);

  // Helper function to capitalize
  const capitalize = str => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const nodeTypeInfo = getNodeTypeInfo();

  // Determine element type for UI
  const elementTypeName = useMemo(() => {
  // Added display name
  elementTypeName.displayName = 'elementTypeName';

    if (!element) return 'Properties';

    if (element.type === 'edge') {
      return 'Connection';
    } else if (element.type === 'node') {
      return nodeTypeInfo.name;
    }

    return 'Element';
  }, [element, nodeTypeInfo.name]);

  // Determine which component to render based on node type
  const renderNodeSpecificProperties = useCallback(() => {
  // Added display name
  renderNodeSpecificProperties.displayName = 'renderNodeSpecificProperties';

    if (!element || element.type !== 'node') return null;

    const nodeType = element.data.type?.replace('Node', '') || '';

    // Source node properties
    if (
      nodeType.includes('source') ||
      nodeType.includes('api') ||
      nodeType.includes('file') ||
      nodeType.includes('database')
    ) {
      return (
        <SourceNodeProperties
          formData={formData}
          handleChange={handleChange}
          handleNestedChange={handleNestedChange}
          validation={validation}
          isAdmin={isAdmin}
          onOpenVisualMapper={onOpenVisualMapper}
          readOnly={readOnly}
        />
      );
    }

    // Destination node properties
    if (nodeType.includes('destination')) {
      return (
        <DestinationNodeProperties
          formData={formData}
          handleChange={handleChange}
          validation={validation}
          isAdmin={isAdmin}
          onOpenVisualMapper={onOpenVisualMapper}
          readOnly={readOnly}
        />
      );
    }

    // Transform node properties
    if (
      nodeType.includes('transform') ||
      nodeType.includes('filter') ||
      nodeType.includes('map') ||
      nodeType.includes('join') ||
      nodeType.includes('aggregate')
    ) {
      return (
        <TransformNodeProperties
          formData={formData}
          handleChange={handleChange}
          validation={validation}
          isAdmin={isAdmin}
          onOpenVisualMapper={onOpenVisualMapper}
          readOnly={readOnly}
        />
      );
    }

    // Trigger node properties
    if (
      nodeType.includes('trigger') ||
      nodeType.includes('schedule') ||
      nodeType.includes('webhook') ||
      nodeType.includes('event')
    ) {
      return (
        <TriggerNodeProperties
          formData={formData}
          handleChange={handleChange}
          handleNestedChange={handleNestedChange}
          validation={validation}
          isAdmin={isAdmin}
          readOnly={readOnly}
        />
      );
    }

    // Router node properties
    if (
      nodeType.includes('router') ||
      nodeType.includes('fork') ||
      nodeType.includes('condition') ||
      nodeType.includes('switch') ||
      nodeType.includes('merge')
    ) {
      return (
        <RouterNodeProperties
          formData={formData}
          handleChange={handleChange}
          validation={validation}
          isAdmin={isAdmin}
          readOnly={readOnly}
        />
      );
    }

    // Other node types would be implemented similarly...

    // Default properties for unhandled node types
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No specific properties available for this node type.
      </Typography>
    );
  }, [
    element,
    formData,
    handleChange,
    handleNestedChange,
    validation,
    isAdmin,
    onOpenVisualMapper,
    readOnly,
  ]);

  // Early return if no element
  if (!element) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Select a node or edge to edit its properties.
        </Typography>
      </Box>
    );
  }

  // Import missing icons for the render
  const LockIcon = SettingsIcon;
  const ContentCopyIcon = EditIcon;
  const CallSplitIcon = FormatListNumberedIcon;
  const PaletteIcon = FormatListNumberedIcon;
  const HistoryIcon = TimelineIcon;
  const FormatPaintIcon = FormatListNumberedIcon;

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Panel header */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: `1px solid ${theme.colors?.divider || theme.palette.divider}`,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            overlap="circular" 
            badgeContent={validation?.hasErrors ? '!' : null} 
            color="error"
          >
            <Typography 
              variant="subtitle1" 
              style={{ 
                fontWeight: 'bold', 
                color: nodeTypeInfo.color 
              }}
            >
              {elementTypeName} Properties
            </Typography>
          </Badge>
        </Box>

        <Box
          as="button"
          onClick={() => window.close()}
          aria-label="close"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseIcon fontSize="small" />
        </Box>
      </Box>

      {/* Tabs */}
      <Box style={{ 
        borderBottom: `1px solid ${theme.colors?.divider || theme.palette.divider}` 
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isXsScreen ? 'scrollable' : 'fullWidth'}
        >
          <Tab label="Properties" />
          <Tab label="Advanced" />
          {isAdmin && <Tab label="Permissions" />}
          <Tab label="History" />
        </Tabs>
      </Box>

      {/* Content area (scrollable) */}
      <Box
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {/* Tab content */}
        {activeTab === 0 && (
          <>
            {element.type === 'node' ? (
              <>
                {/* Common node properties */}
                <CommonNodeProperties
                  formData={formData}
                  handleChange={handleChange}
                  validation={validation}
                  isAdmin={isAdmin}
                />

                <Divider sx={{ my: 2 }} />

                {/* Node-specific properties */}
                {renderNodeSpecificProperties()}
              </>
            ) : (
              /* Edge properties */
              <EdgeProperties
                formData={formData}
                handleChange={handleChange}
                handleStyleChange={handleStyleChange}
                validation={validation}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}

        {activeTab === 1 && (
          <AdvancedProperties
            formData={formData}
            handleChange={handleChange}
            isAdmin={isAdmin}
            readOnly={readOnly}
          />
        )}

        {activeTab === 2 && isAdmin && (
          <PermissionsProperties
            formData={formData}
            handleChange={handleChange}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === (isAdmin ? 3 : 2) && (
          <HistoryProperties nodeHistory={nodeHistory} isAdmin={isAdmin} />
        )}
      </Box>

      {/* Actions */}
      {!readOnly && (
        <Box
          style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${theme.colors?.divider || theme.palette.divider}`,
          }}
        >
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
              style={{ marginRight: '8px' }}
            >
              Delete
            </Button>

            {element.type === 'node' && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onAddNextNode(element.id, 'transform')}
                size="small"
              >
                Add Next
              </Button>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={validation?.hasErrors}
          >
            Apply
          </Button>
        </Box>
      )}

      {/* Delete confirmation dialog - keeping Dialog from MUI for now */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this{' '}
            {element?.type === 'node' ? elementTypeName : 'connection'}?
          </Typography>
          {element?.type === 'node' && (
            <Alert 
              severity="warning" 
              style={{ marginTop: '16px' }}
            >
              Deleting this node will also remove all of its connections.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Set display names for debugging
ContextualPropertiesPanel.displayName = 'ContextualPropertiesPanel';
MemoTextField.displayName = 'MemoTextField';
MemoSelect.displayName = 'MemoSelect';
MemoSwitch.displayName = 'MemoSwitch';
CommonNodeProperties.displayName = 'CommonNodeProperties';
SourceNodeProperties.displayName = 'SourceNodeProperties';
DestinationNodeProperties.displayName = 'DestinationNodeProperties';
TransformNodeProperties.displayName = 'TransformNodeProperties';
RouterNodeProperties.displayName = 'RouterNodeProperties';
EdgeProperties.displayName = 'EdgeProperties';
AdvancedProperties.displayName = 'AdvancedProperties';
PermissionsProperties.displayName = 'PermissionsProperties';
HistoryProperties.displayName = 'HistoryProperties';
ValidationMessage.displayName = 'ValidationMessage';
SchemaViewer.displayName = 'SchemaViewer';
FieldRow.displayName = 'FieldRow';
SectionTitle.displayName = 'SectionTitle';

export default ContextualPropertiesPanel;