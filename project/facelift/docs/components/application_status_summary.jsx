import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  useTheme,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Styled components
const StatusCard = styled(Card)(({ theme, statusColor }) => ({
  borderTop: `4px solid ${statusColor}`,
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const ColorIndicator = styled(Box)(({ theme, color }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: theme.spacing(1),
}));

/**
 * ApplicationStatusSummary component
 * 
 * Displays a summary of application statuses in both card and chart formats,
 * providing quick insights into the distribution of applications by status.
 */
const ApplicationStatusSummary = ({
  applications = [],
  isLoading = false,
  error = null,
  onStatusClick = () => {},
}) => {
  const theme = useTheme();

  // Status configuration with color and icon
  const statusConfig = {
    active: {
      color: theme.palette.success.main,
      icon: <CheckCircleIcon color="success" />,
      label: 'Active',
      description: 'Applications that are live and available to users',
    },
    draft: {
      color: theme.palette.info.main,
      icon: <EditIcon color="info" />,
      label: 'Draft',
      description: 'Applications in development or editing phase',
    },
    inactive: {
      color: theme.palette.error.main,
      icon: <BlockIcon color="error" />,
      label: 'Inactive',
      description: 'Applications that are temporarily disabled',
    },
    deprecated: {
      color: theme.palette.warning.main,
      icon: <WarningIcon color="warning" />,
      label: 'Deprecated',
      description: 'Applications marked for removal',
    },
    pending_review: {
      color: theme.palette.info.dark,
      icon: <HourglassEmptyIcon color="info" />,
      label: 'Pending Review',
      description: 'Applications awaiting approval',
    },
    error: {
      color: theme.palette.error.dark,
      icon: <ErrorIcon color="error" />,
      label: 'Error',
      description: 'Applications with critical issues',
    },
  };

  // Calculate status counts and percentages
  const statusStats = useMemo(() => {
    if (!applications.length) {
      return [];
    }

    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([status, count]) => {
      const percentage = Math.round((count / applications.length) * 100);
      return {
        status,
        count,
        percentage,
        ...statusConfig[status] || {
          color: theme.palette.grey[500],
          label: status,
          description: 'Unknown status',
        },
      };
    }).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [applications, theme.palette.grey]);

  // Calculate total and chart data
  const totalApplications = applications.length;
  
  const chartData = useMemo(() => {
    return statusStats.map((stat) => ({
      id: stat.status,
      label: stat.label,
      value: stat.count,
      color: stat.color,
    }));
  }, [statusStats]);

  // Simple Donut Chart component
  const DonutChart = ({ data, size = 200 }) => {
    const radius = size / 2;
    const innerRadius = radius * 0.6;
    const centerX = radius;
    const centerY = radius;
    
    // Calculate angles for pie slices
    let startAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, i) => {
            const percentage = item.value / total;
            const endAngle = startAngle + percentage * Math.PI * 2;
            
            // Calculate path for pie slice
            const x1 = centerX + innerRadius * Math.cos(startAngle);
            const y1 = centerY + innerRadius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(startAngle);
            const y2 = centerY + radius * Math.sin(startAngle);
            const x3 = centerX + radius * Math.cos(endAngle);
            const y3 = centerY + radius * Math.sin(endAngle);
            const x4 = centerX + innerRadius * Math.cos(endAngle);
            const y4 = centerY + innerRadius * Math.sin(endAngle);
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            const pathData = [
              `M ${x1} ${y1}`,
              `L ${x2} ${y2}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
              `L ${x4} ${y4}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
              'Z'
            ].join(' ');
            
            const slice = (
              <path
                key={i}
                d={pathData}
                fill={item.color}
                stroke={theme.palette.background.paper}
                strokeWidth={1}
                cursor="pointer"
                onClick={() => onStatusClick(item.id)}
              />
            );
            
            startAngle = endAngle;
            return slice;
          })}
        </svg>
        
        {/* Center text showing total */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
        </Box>
      </Box>
    );
  };

  // Display loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error.message || 'An error occurred'}</Typography>
      </Box>
    );
  }

  // Display empty state
  if (totalApplications === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center">No applications available</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Create your first application to see statistics
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Status cards */}
        {statusStats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.status}>
            <StatusCard 
              statusColor={stat.color}
              onClick={() => onStatusClick(stat.status)}
              sx={{ cursor: 'pointer' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {stat.label}
                  </Typography>
                </Box>
                
                <StatNumber>{stat.count}</StatNumber>
                
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`${stat.percentage}%`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    of total
                  </Typography>
                </Box>
              </CardContent>
            </StatusCard>
          </Grid>
        ))}

        {/* Chart summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Distribution
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DonutChart data={chartData} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Legend
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {statusStats.map((stat) => (
                        <LegendItem key={stat.status}>
                          <ColorIndicator color={stat.color} />
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {stat.label}:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {stat.count} ({stat.percentage}%)
                          </Typography>
                        </LegendItem>
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Applications:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {totalApplications}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

ApplicationStatusSummary.propTypes = {
  /**
   * Array of application objects
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
  
  /**
   * Whether the data is loading
   */
  isLoading: PropTypes.bool,
  
  /**
   * Error object if an error occurred
   */
  error: PropTypes.object,
  
  /**
   * Callback function when a status card is clicked
   */
  onStatusClick: PropTypes.func,
};

export default ApplicationStatusSummary;