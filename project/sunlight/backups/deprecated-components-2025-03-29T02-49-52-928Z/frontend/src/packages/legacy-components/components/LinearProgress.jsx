import React from 'react';

/**
 * Legacy wrapper for LinearProgress component
 * This provides backward compatibility with Material UI's LinearProgress component
 */
const LinearProgress = ({
  variant = 'indeterminate',
  value = 0,
  color = 'primary',
  ...props
}) => {
  // Added display name
  LinearProgress.displayName = 'LinearProgress';

  // Added display name
  LinearProgress.displayName = 'LinearProgress';

  // Added display name
  LinearProgress.displayName = 'LinearProgress';

  // Added display name
  LinearProgress.displayName = 'LinearProgress';

  // Added display name
  LinearProgress.displayName = 'LinearProgress';


  // Get color based on theme
  const getColor = () => {
  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';


    const colors = {
      primary: '#1976d2',
      secondary: '#9c27b0',
      success: '#2e7d32',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1',
    };

    return colors[color] || colors.primary;
  };

  // Base styles
  const containerStyle = {
    position: 'relative',
    height: '4px',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    ...props.style,
  };

  // Progress bar styles
  const barStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: getColor(),
    transition: 'transform 0.2s linear',
    width: variant === 'indeterminate' ? '100%' : undefined,
    transform: variant === 'determinate' ? `translateX(${value - 100}%)` : undefined,
    animation:
      variant === 'indeterminate'
        ? 'linearProgressIndeterminate 1.5s infinite ease-in-out'
        : undefined,
  };

  return (
    <div style={containerStyle} {...props}>
      <div style={barStyle} />
      <style jsx>{`
        @keyframes linearProgressIndeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }
      `}</style>
    </div>
  );
};

export default LinearProgress;
