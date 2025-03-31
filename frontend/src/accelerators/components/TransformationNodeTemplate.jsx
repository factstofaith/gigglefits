// TransformationNodeTemplate.jsx
// A production-ready template for creating transformation nodes with built-in validation,
// error handling, performance optimization, and accessibility best practices.

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Typography, IconButton, Collapse, Divider, Badge } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * TransformationNodeTemplate - Production-ready template for transformation nodes
 * 
 * Features:
 * - Comprehensive validation with error display
 * - Performance optimized with proper hooks usage
 * - Accessibility compliant with ARIA attributes
 * - Consistent error handling and recovery
 * - Resource cleanup with proper useEffect patterns
 * - Standardized layout for consistent UX
 */
const TransformationNodeTemplate = ({
  title,
  icon: Icon,
  description,
  configPanel: ConfigPanel,
  validationSchema,
  initialConfig = {},
  onConfigChange,
  onValidate,
  disabled = false,
  readOnly = false,
  id,
  testId,
}) => {
  // State for managing configuration and validation
  const [config, setConfig] = useState(initialConfig);
  const [expanded, setExpanded] = useState(false);
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: {},
    warnings: {},
  });
  const [isDirty, setIsDirty] = useState(false);
  
  // Refs for tracking mounted state and previous props
  const isMounted = useRef(true);
  const prevConfig = useRef(config);
  
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Validate configuration when it changes
  useEffect(() => {
    if (validationSchema && isDirty) {
      validateConfiguration(config);
    }
    
    // Only trigger onConfigChange if the config actually changed and component is mounted
    if (prevConfig.current !== config && isMounted.current) {
      prevConfig.current = config;
      if (onConfigChange) {
        onConfigChange(config);
      }
    }
  }, [config, validationSchema, onConfigChange, isDirty]);
  
  // Handle configuration changes with memoized callback to prevent rerenders
  const handleConfigChange = useCallback((newConfig) => {
    setConfig((prevConfig) => {
      const updatedConfig = typeof newConfig === 'function' 
        ? newConfig(prevConfig) 
        : { ...prevConfig, ...newConfig };
      
      setIsDirty(true);
      return updatedConfig;
    });
  }, []);
  
  // Toggle expanded state optimized with useCallback
  const handleExpandClick = useCallback(() => {
    setExpanded((prevExpanded) => !prevExpanded);
  }, []);
  
  // Validate configuration with validation schema
  const validateConfiguration = useCallback((configToValidate) => {
    if (!validationSchema) return { isValid: true, errors: {}, warnings: {} };
    
    try {
      // Run validation
      const validationResult = typeof onValidate === 'function'
        ? onValidate(configToValidate)
        : validationSchema.validate(configToValidate, { abortEarly: false });
      
      // Handle successful validation
      if (isMounted.current) {
        setValidationState({
          isValid: true,
          errors: {},
          warnings: {},
        });
      }
      
      return { isValid: true, errors: {}, warnings: {} };
    } catch (error) {
      // Process and categorize validation errors
      const errors = {};
      const warnings = {};
      
      if (error.inner && Array.isArray(error.inner)) {
        error.inner.forEach(err => {
          if (err.type === 'warning') {
            warnings[err.path] = err.message;
          } else {
            errors[err.path] = err.message;
          }
        });
      } else if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(errorMsg => {
          errors['general'] = errorMsg;
        });
      }
      
      // Update validation state if component is still mounted
      if (isMounted.current) {
        setValidationState({
          isValid: Object.keys(errors).length === 0,
          errors,
          warnings,
        });
      }
      
      return { isValid: false, errors, warnings };
    }
  }, [validationSchema, onValidate]);
  
  // Calculate error and warning counts for badge display
  const errorCount = useMemo(() => Object.keys(validationState.errors).length, [validationState.errors]);
  const warningCount = useMemo(() => Object.keys(validationState.warnings).length, [validationState.warnings]);
  
  // Generate status icon based on validation state
  const StatusIcon = useMemo(() => {
    if (errorCount > 0) {
      return <ErrorOutlineIcon color="error" aria-label="Configuration has errors" />;
    } else if (warningCount > 0) {
      return <ErrorOutlineIcon color="warning" aria-label="Configuration has warnings" />;
    } else if (isDirty) {
      return <CheckCircleOutlineIcon color="success" aria-label="Configuration is valid" />;
    }
    return null;
  }, [errorCount, warningCount, isDirty]);
  
  return (
    <Card
      elevation={2}
      id={id}
      data-testid={testId || `transformation-node-${title}`}
      aria-disabled={disabled}
      sx={{
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'all 0.2s ease',
        position: 'relative',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: readOnly ? 'default' : 'pointer',
        }}
        onClick={readOnly ? undefined : handleExpandClick}
        role="button"
        aria-expanded={expanded}
        aria-label={`${title} transformation node, ${expanded ? 'click to collapse' : 'click to expand'}`}
        tabIndex={readOnly ? -1 : 0}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {Icon && <Icon sx={{ mr: 1.5 }} />}
          <Typography variant="subtitle1" component="h3">
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {StatusIcon && (
            <Badge
              badgeContent={errorCount + warningCount}
              color={errorCount > 0 ? "error" : "warning"}
              sx={{ mr: 1 }}
              invisible={errorCount + warningCount === 0}
            >
              {StatusIcon}
            </Badge>
          )}
          
          {!readOnly && (
            <IconButton
              aria-label={expanded ? "Collapse" : "Expand"}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleExpandClick();
              }}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      {description && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <Divider />
        </Collapse>
      )}
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          {ConfigPanel && (
            <ConfigPanel
              config={config}
              onChange={handleConfigChange}
              validationState={validationState}
              disabled={disabled || readOnly}
              readOnly={readOnly}
            />
          )}
          
          {/* Validation Error Display */}
          {errorCount > 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: 'error.light', 
                borderRadius: 1,
                color: 'error.contrastText'
              }}
              role="alert"
              aria-live="polite"
            >
              <Typography variant="subtitle2">Configuration Errors:</Typography>
              <ul>
                {Object.entries(validationState.errors).map(([field, message]) => (
                  <li key={field}>
                    <Typography variant="body2">
                      {field !== 'general' ? `${field}: ` : ''}{message}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
          
          {/* Warning Display */}
          {warningCount > 0 && errorCount === 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: 'warning.light', 
                borderRadius: 1,
                color: 'warning.contrastText'
              }}
              role="alert"
              aria-live="polite"
            >
              <Typography variant="subtitle2">Warnings:</Typography>
              <ul>
                {Object.entries(validationState.warnings).map(([field, message]) => (
                  <li key={field}>
                    <Typography variant="body2">
                      {field !== 'general' ? `${field}: ` : ''}{message}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

TransformationNodeTemplate.propTypes = {
  /** Title of the transformation node */
  title: PropTypes.string.isRequired,
  /** Icon component to display */
  icon: PropTypes.elementType,
  /** Description of what the transformation node does */
  description: PropTypes.string,
  /** Component for configuration panel */
  configPanel: PropTypes.elementType.isRequired, 
  /** Validation schema (e.g., Yup schema) */
  validationSchema: PropTypes.object,
  /** Initial configuration */
  initialConfig: PropTypes.object,
  /** Callback when configuration changes */
  onConfigChange: PropTypes.func,
  /** Custom validation function */
  onValidate: PropTypes.func,
  /** Whether the node is disabled */
  disabled: PropTypes.bool,
  /** Whether the node is in read-only mode */
  readOnly: PropTypes.bool,
  /** HTML ID attribute */
  id: PropTypes.string,
  /** Test ID for testing */
  testId: PropTypes.string,
};

export default React.memo(TransformationNodeTemplate);