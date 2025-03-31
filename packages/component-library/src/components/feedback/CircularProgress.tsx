import React from 'react';
import MuiCircularProgress, { CircularProgressProps as MuiCircularProgressProps } from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/**
 * CircularProgress size options
 */
export type CircularProgressSize = 'small' | 'medium' | 'large' | number;

/**
 * CircularProgress color options
 */
export type CircularProgressColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/**
 * CircularProgress component props interface
 */
export interface CircularProgressProps extends Omit<MuiCircularProgressProps, 'color' | 'size'> {
  /**
   * The color of the progress indicator
   * @default 'primary'
   */
  color?: CircularProgressColor;
  
  /**
   * The size of the progress indicator
   * @default 'medium'
   */
  size?: CircularProgressSize;
  
  /**
   * The thickness of the progress indicator
   * @default 3.6
   */
  thickness?: number;
  
  /**
   * If true, the progress will be displayed with a label
   * @default false
   */
  withLabel?: boolean;
  
  /**
   * If true, the progress will be displayed in the center of a contrasting background
   * @default false
   */
  withBackground?: boolean;
  
  /**
   * Custom label to display
   */
  label?: React.ReactNode;
}

const ProgressBackground = styled(Box)<{ withBackground?: boolean }>(({ theme, withBackground }) => ({
  display: 'inline-flex',
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center',
  ...(withBackground && {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    boxShadow: theme.shadows[1],
  }),
}));

/**
 * CircularProgress component for showing loading states and progress
 * 
 * @example
 * // Basic usage
 * <CircularProgress />
 * 
 * @example
 * // With percentage and custom size
 * <CircularProgress value={75} size="large" withLabel />
 * 
 * @example
 * // With custom color and thickness
 * <CircularProgress color="secondary" thickness={4.5} />
 * 
 * @example
 * // With background and label
 * <CircularProgress value={60} withBackground withLabel />
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  color = 'primary',
  size = 'medium',
  thickness = 3.6,
  withLabel = false,
  withBackground = false,
  label,
  ...rest
}) => {
  // Convert named sizes to numbers
  let sizeValue = size;
  if (size === 'small') sizeValue = 24;
  else if (size === 'medium') sizeValue = 40;
  else if (size === 'large') sizeValue = 56;

  return (
    <ProgressBackground withBackground={withBackground}>
      <MuiCircularProgress
        color={color}
        size={sizeValue as number}
        thickness={thickness}
        {...rest}
      />
      {withLabel && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >
            {label !== undefined ? label : `${Math.round(rest.value || 0)}%`}
          </Typography>
        </Box>
      )}
    </ProgressBackground>
  );
};

export default CircularProgress;