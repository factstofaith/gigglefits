import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Button variants supported by the component
 */
export type ButtonVariant = 'contained' | 'outlined' | 'text';

/**
 * Button sizes supported by the component
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button component props interface
 */
export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  /**
   * Button variant
   * @default 'contained'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Button color
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  
  /**
   * If true, the button will be disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * The content of the button
   */
  children: React.ReactNode;
  
  /**
   * If true, the button will show a loading spinner and be disabled
   * @default false
   */
  loading?: boolean;
  
  /**
   * If true, the button will take the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * If true, the button will have a less pronounced appearance
   * @default false
   */
  subtle?: boolean;
  
  /**
   * If provided, the button will be rendered as an anchor element with this href
   */
  href?: string;
  
  /**
   * Click handler for the button
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'subtle',
})<{ subtle?: boolean }>(({ theme, subtle }) => ({
  ...(subtle && {
    boxShadow: 'none',
    backgroundColor: theme.palette.mode === 'light' 
      ? theme.palette.grey[100] 
      : theme.palette.grey[800],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? theme.palette.grey[200] 
        : theme.palette.grey[700],
      boxShadow: 'none',
    },
  }),
}));

/**
 * Button component for user interactions
 * 
 * @example
 * // Basic usage
 * <Button onClick={() => console.log('Clicked')}>Click Me</Button>
 * 
 * @example
 * // With loading state
 * <Button loading variant="contained" color="primary">Loading</Button>
 * 
 * @example
 * // As a link
 * <Button href="https://example.com" variant="outlined">Visit Site</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  disabled = false,
  children,
  loading = false,
  fullWidth = false,
  subtle = false,
  href,
  onClick,
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      color={color}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      href={href}
      onClick={onClick}
      subtle={subtle}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : rest.startIcon}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;