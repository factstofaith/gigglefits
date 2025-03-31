/**
 * DataQualityIndicator Component
 * 
 * A visualization component that displays data quality metrics in various formats,
 * including score cards, gauges, and detailed breakdowns by quality dimension.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Import MUI components
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  Button,
  CircularProgress
} from '@mui/material';

// Import icons
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

// Import data quality utilities
import { 
  QUALITY_DIMENSIONS, 
  ISSUE_TYPES,
  SEVERITY,
  getQualityGrade 
} from '../../utils/dataQualityAnalyzer';

/**
 * Quality Score Card
 * Displays an overall quality score with visual indicators
 */
const QualityScoreCard = ({ score, title }) => {
  // Get quality grade (A-F)
  const grade = getQualityGrade(score);
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'info';
    if (score >= 0.5) return 'warning';
    return 'error';
  };
  
  const color = getColor(score);
  const percentage = Math.round(score * 100);
  
  return (
    <Card variant="outlined" sx={{ textAlign: 'center' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {title || 'Data Quality Score'}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          mt: 1 
        }}>
          <Box 
            sx={{ 
              width: 70, 
              height: 70, 
              borderRadius: '50%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
              border: 3,
              borderColor: `${color}.main`,
              position: 'relative',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}
          >
            {grade}
          </Box>
          
          <Box sx={{ ml: 2, textAlign: 'left' }}>
            <Typography variant="h4">
              {percentage}%
            </Typography>
            <Chip 
              size="small"
              label={color === 'success' ? 'Excellent' : 
                color === 'info' ? 'Good' : 
                color === 'warning' ? 'Fair' : 'Poor'}
              color={color}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Quality Dimension Card
 * Displays score for a specific quality dimension
 */
const QualityDimensionCard = ({ dimension, score }) => {
  // Get formatted dimension name
  const formatDimensionName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  // Get dimension description
  const getDimensionDescription = (dimension) => {
    switch (dimension) {
      case QUALITY_DIMENSIONS.COMPLETENESS:
        return 'Measures whether all required data is present';
      case QUALITY_DIMENSIONS.ACCURACY:
        return 'Measures correctness of data values';
      case QUALITY_DIMENSIONS.CONSISTENCY:
        return 'Measures data consistency across records';
      case QUALITY_DIMENSIONS.VALIDITY:
        return 'Measures conformance to data rules/types';
      case QUALITY_DIMENSIONS.UNIQUENESS:
        return 'Measures uniqueness of values where expected';
      case QUALITY_DIMENSIONS.INTEGRITY:
        return 'Measures referential integrity between data';
      case QUALITY_DIMENSIONS.CONFORMITY:
        return 'Measures adherence to data standards/formats';
      case QUALITY_DIMENSIONS.RELIABILITY:
        return 'Overall reliability score for the dataset';
      default:
        return 'Quality dimension score';
    }
  };
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'info';
    if (score >= 0.5) return 'warning';
    return 'error';
  };
  
  const color = getColor(score);
  const percentage = Math.round(score * 100);
  
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={7}>
            <Tooltip title={getDimensionDescription(dimension)}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {formatDimensionName(dimension)}
              </Typography>
            </Tooltip>
          </Grid>
          
          <Grid item xs={5} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {percentage}%
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * Field Quality Table
 * Displays quality metrics for individual fields
 */
const FieldQualityTable = ({ fieldMetrics }) => {
  // No field metrics available
  if (!fieldMetrics || Object.keys(fieldMetrics).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No field quality metrics available
        </Typography>
      </Box>
    );
  }
  
  // Format a score as a percentage
  const formatScore = (score) => `${Math.round(score * 100)}%`;
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 0.9) return 'success.main';
    if (score >= 0.7) return 'info.main';
    if (score >= 0.5) return 'warning.main';
    return 'error.main';
  };
  
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell align="center">Quality</TableCell>
            <TableCell align="center">Completeness</TableCell>
            <TableCell align="center">Validity</TableCell>
            <TableCell align="right">Issues</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(fieldMetrics).map(([fieldName, metrics]) => {
            const issueCount = Object.values(metrics.issueTypes || {}).reduce((sum, count) => sum + count, 0);
            
            return (
              <TableRow key={fieldName} hover>
                <TableCell component="th" scope="row">
                  {fieldName}
                </TableCell>
                <TableCell align="center">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getColor(metrics.qualityScore)
                    }}
                  >
                    {formatScore(metrics.qualityScore)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {formatScore(metrics.completeness)}
                </TableCell>
                <TableCell align="center">
                  {formatScore(metrics.validity || 1)}
                </TableCell>
                <TableCell align="right">
                  {issueCount > 0 ? (
                    <Chip 
                      size="small" 
                      label={issueCount} 
                      color={issueCount > 10 ? "error" : issueCount > 5 ? "warning" : "info"}
                    />
                  ) : (
                    <CheckCircleIcon color="success" fontSize="small" />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Issue Summary Card
 * Displays a summary of data quality issues
 */
const IssueSummaryCard = ({ issues, isExpanded, toggleExpanded }) => {
  // Handle case where issues is an array
  let issueCount = 0;
  let issuesByType = {};
  let issuesBySeverity = {};
  
  if (Array.isArray(issues)) {
    issueCount = issues.length;
    
    // Count issues by type and severity
    issues.forEach(issue => {
      // Count by type
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = 0;
      }
      issuesByType[issue.type]++;
      
      // Count by severity
      if (!issuesBySeverity[issue.severity]) {
        issuesBySeverity[issue.severity] = 0;
      }
      issuesBySeverity[issue.severity]++;
    });
  } else if (issues && typeof issues === 'object') {
    // Use the summarized issues
    issueCount = issues.totalCount || 0;
    issuesByType = issues.byType || {};
    issuesBySeverity = issues.bySeverity || {};
  }
  
  // Get issue type display name
  const getIssueTypeName = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Determine severity icon and color
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY.CRITICAL:
        return <ErrorIcon color="error" fontSize="small" />;
      case SEVERITY.HIGH:
        return <ErrorIcon color="error" fontSize="small" />;
      case SEVERITY.MEDIUM:
        return <WarningIcon color="warning" fontSize="small" />;
      case SEVERITY.LOW:
        return <InfoIcon color="info" fontSize="small" />;
      case SEVERITY.INFO:
        return <InfoIcon color="info" fontSize="small" />;
      default:
        return <InfoIcon color="info" fontSize="small" />;
    }
  };
  
  // Count by severity for chip display
  const criticalCount = issuesBySeverity[SEVERITY.CRITICAL] || 0;
  const highCount = issuesBySeverity[SEVERITY.HIGH] || 0;
  const mediumCount = issuesBySeverity[SEVERITY.MEDIUM] || 0;
  const lowCount = issuesBySeverity[SEVERITY.LOW] || 0;
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BugReportIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Quality Issues
            </Typography>
          </Box>
          
          <Box>
            <IconButton size="small" onClick={toggleExpanded}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item>
              <Chip 
                icon={<ErrorIcon />} 
                label={`Critical: ${criticalCount}`} 
                size="small"
                color="error"
                variant={criticalCount > 0 ? "filled" : "outlined"}
              />
            </Grid>
            
            <Grid item>
              <Chip 
                icon={<ErrorIcon />} 
                label={`High: ${highCount}`} 
                size="small"
                color="error"
                variant={highCount > 0 ? "filled" : "outlined"}
              />
            </Grid>
            
            <Grid item>
              <Chip 
                icon={<WarningIcon />} 
                label={`Medium: ${mediumCount}`} 
                size="small"
                color="warning"
                variant={mediumCount > 0 ? "filled" : "outlined"}
              />
            </Grid>
            
            <Grid item>
              <Chip 
                icon={<InfoIcon />} 
                label={`Low: ${lowCount}`} 
                size="small"
                color="info"
                variant={lowCount > 0 ? "filled" : "outlined"}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Collapse in={isExpanded}>
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Issues by Type
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableBody>
                {Object.entries(issuesByType).map(([type, count]) => (
                  <TableRow key={type}>
                    <TableCell>{getIssueTypeName(type)}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                  </TableRow>
                ))}
                
                {Object.keys(issuesByType).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No issues found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {Array.isArray(issues) && issues.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Top Issues (First 5)
              </Typography>
              
              {issues.slice(0, 5).map((issue, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'start', 
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  {getSeverityIcon(issue.severity)}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" component="div">
                      {issue.message}
                    </Typography>
                    {issue.field && (
                      <Typography variant="caption" color="text.secondary">
                        Field: {issue.field}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              
              {issues.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  ...and {issues.length - 5} more issues
                </Typography>
              )}
            </>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

/**
 * DataQualityIndicator Component
 * Main component for displaying data quality metrics
 */
const DataQualityIndicator = ({
  qualityResults,
  isLoading = false,
  onRefresh = () => {},
  showFieldMetrics = true,
  showDimensionScores = true,
  showIssues = true,
  compact = false,
  maxHeight = 500
}) => {
  const [expandedSections, setExpandedSections] = useState({
    fields: !compact,
    issues: !compact
  });
  
  // Toggle a section's expanded state
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // If no data or still loading
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          width: '100%'
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Analyzing data quality...
        </Typography>
      </Box>
    );
  }
  
  // If no quality results
  if (!qualityResults || !qualityResults.overallQuality) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          width: '100%',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No data quality information available
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{ mt: 1 }}
        >
          Analyze Data Quality
        </Button>
      </Box>
    );
  }
  
  const { 
    overallQuality, 
    dimensions, 
    fieldMetrics, 
    issues,
    recordCount,
    sampledRecordCount,
    analyzedAt
  } = qualityResults;
  
  return (
    <Box 
      sx={{ 
        maxHeight: maxHeight,
        overflow: 'auto',
        p: 1
      }}
    >
      {/* Header with refresh button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}
      >
        <Box>
          <Typography variant="h6">
            Data Quality Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyzed {sampledRecordCount} of {recordCount} records • {new Date(analyzedAt).toLocaleString()}
          </Typography>
        </Box>
        
        <IconButton onClick={onRefresh} size="small" title="Refresh Analysis">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {/* Score cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QualityScoreCard score={overallQuality} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={8}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quality Dimensions
              </Typography>
              
              <Grid container spacing={1}>
                {Object.entries(dimensions).slice(0, 6).map(([dimension, score]) => (
                  <Grid item xs={6} sm={6} md={4} key={dimension}>
                    <QualityDimensionCard dimension={dimension} score={score} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Issues summary */}
      {showIssues && issues && (
        <Box sx={{ mb: 2 }}>
          <IssueSummaryCard 
            issues={issues} 
            isExpanded={expandedSections.issues}
            toggleExpanded={() => toggleSection('issues')}
          />
        </Box>
      )}
      
      {/* Field metrics */}
      {showFieldMetrics && fieldMetrics && Object.keys(fieldMetrics).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Field Quality Metrics
                </Typography>
                
                <IconButton size="small" onClick={() => toggleSection('fields')}>
                  {expandedSections.fields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.fields}>
                <Box sx={{ mt: 1 }}>
                  <FieldQualityTable fieldMetrics={fieldMetrics} />
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Recommendations */}
      <Box>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Recommendations
              </Typography>
            </Box>
            
            {overallQuality < 0.9 ? (
              <Box>
                {/* Completeness recommendations */}
                {dimensions[QUALITY_DIMENSIONS.COMPLETENESS] < 0.95 && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Improve Data Completeness
                    </Typography>
                    <Typography variant="body2">
                      Ensure all required fields are populated and consider adding validation to prevent missing values.
                    </Typography>
                  </Box>
                )}
                
                {/* Validity recommendations */}
                {dimensions[QUALITY_DIMENSIONS.VALIDITY] < 0.95 && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Improve Data Validity
                    </Typography>
                    <Typography variant="body2">
                      Ensure values match their expected types and implement validation for specialized formats.
                    </Typography>
                  </Box>
                )}
                
                {/* Consistency recommendations */}
                {dimensions[QUALITY_DIMENSIONS.CONSISTENCY] < 0.9 && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Improve Data Consistency
                    </Typography>
                    <Typography variant="body2">
                      Standardize data formats and enforce consistent data entry practices across systems.
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} fontSize="small" />
                  Data quality is excellent! Continue monitoring to maintain high standards.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// PropTypes
DataQualityIndicator.propTypes = {
  qualityResults: PropTypes.object,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func,
  showFieldMetrics: PropTypes.bool,
  showDimensionScores: PropTypes.bool,
  showIssues: PropTypes.bool,
  compact: PropTypes.bool,
  maxHeight: PropTypes.number
};

QualityScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
  title: PropTypes.string
};

QualityDimensionCard.propTypes = {
  dimension: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired
};

FieldQualityTable.propTypes = {
  fieldMetrics: PropTypes.object
};

IssueSummaryCard.propTypes = {
  issues: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  isExpanded: PropTypes.bool,
  toggleExpanded: PropTypes.func
};

export default DataQualityIndicator;