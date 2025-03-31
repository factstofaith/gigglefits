// IntegrationStatsBar.jsx
// -----------------------------------------------------------------------------
// A modern stats bar showing integration counts (total, healthy, warnings, errors).

import React from 'react';
import { Box, Grid, Card } from '../../design-system'
import { Typography } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import IntegrationsIcon from '@mui/icons-material/SettingsSystemDaydream';
// Design system import already exists;
// Removed duplicate import
function IntegrationStatsBar({ total = 0, healthy = 0, warnings = 0, errors = 0 }) {
  // Added display name
  IntegrationStatsBar.displayName = 'IntegrationStatsBar';

  const { theme } = useTheme();
  
  // Calculate percentages for the progress bar
  const healthyPercent = total > 0 ? (healthy / total) * 100 : 0;
  const warningPercent = total > 0 ? (warnings / total) * 100 : 0;
  const errorPercent = total > 0 ? (errors / total) * 100 : 0;

  // Statistics cards
  const stats = [
    {
      label: 'Total Integrations',
      value: total,
      icon: <IntegrationsIcon style={{ color: '#2E7EED' }} />,
      color: '#2E7EED',
      description: 'All active integration connections',
    },
    {
      label: 'Healthy',
      value: healthy,
      icon: <CheckCircleIcon style={{ color: '#27AE60' }} />,
      color: '#27AE60',
      description: 'Running properly with no issues',
    },
    {
      label: 'Warnings',
      value: warnings,
      icon: <WarningAmberIcon style={{ color: '#F2994A' }} />,
      color: '#F2994A',
      description: 'Running with minor issues',
    },
    {
      label: 'Errors',
      value: errors,
      icon: <ErrorIcon style={{ color: '#EB5757' }} />,
      color: '#EB5757',
      description: 'Critical issues requiring attention',
    },
  ];

  return (
    <Card 
      style={{ 
        padding: '24px', 
        borderRadius: '8px', 
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: 'none'
      }}
    >
      <Grid.Container spacing={3}>
        {stats.map((stat, index) => (
          <Grid.Item xs={12} sm={6} md={3} key={index}>
            <Box
              title={stat.description}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: index > 0 ? 
                  '@media (min-width: 900px) { border-left: 1px solid rgba(0,0,0,0.08) }' : 
                  'none',
                paddingLeft: index > 0 ? 
                  '@media (min-width: 900px) { padding-left: 16px }' : 
                  '0',
                paddingRight: index > 0 ? 
                  '@media (min-width: 900px) { padding-right: 16px }' : 
                  '0',
              }}
            >
              <Box 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px'
                }}
              >
                {React.cloneElement(stat.icon, { style: { color: stat.color } })}
                <Typography 
                  variant="body2&quot; 
                  style={{ color: theme?.colors?.text?.secondary || "#757575' }}
                >
                  {stat.label}
                </Typography>
              </Box>

              <Typography
                variant="h3&quot;
                style={{
                  color: stat.color,
                  fontSize: "2.5rem',
                  lineHeight: 1,
                  fontWeight: 'bold',
                }}
              >
                {stat.value}
              </Typography>

              {index === 0 && (
                <Box 
                  style={{ 
                    marginTop: '16px', 
                    width: '100%', 
                    '@media (max-width: 900px)': {
                      display: 'none'
                    }
                  }}
                >
                  <Box
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Health status bar */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${healthyPercent}%`,
                        background: '#27AE60',
                        borderRadius: '4px 0 0 4px',
                      }}
                    />

                    {/* Warning status bar */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: `${healthyPercent}%`,
                        top: 0,
                        height: '100%',
                        width: `${warningPercent}%`,
                        background: '#F2994A',
                      }}
                    />

                    {/* Error status bar */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: `${healthyPercent + warningPercent}%`,
                        top: 0,
                        height: '100%',
                        width: `${errorPercent}%`,
                        background: '#EB5757',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="caption&quot; 
                    style={{ color: theme?.colors?.text?.secondary || "#757575' }}
                  >
                    {Math.round(healthyPercent)}% healthy
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid.Item>
        ))}
      </Grid.Container>
    </Card>
  );
}

export default IntegrationStatsBar;
