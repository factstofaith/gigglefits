import React from 'react';
import MuiTypography, { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/**
 * Typography variant options
 */
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'button' 
  | 'overline';

/**
 * Typography component props interface
 */
export interface TypographyProps extends Omit<MuiTypographyProps, 'color'> {
  /**
   * The content of the typography component
   */
  children: React.ReactNode;
  
  /**
   * The typography variant to use
   * @default 'body1'
   */
  variant?: TypographyVariant;
  
  /**
   * The color of the text
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'textPrimary' | 'textSecondary';
  
  /**
   * If true, the text will have a bottom margin
   * @default false
   */
  gutterBottom?: boolean;
  
  /**
   * If true, the text will use the theme's secondary color
   * @default false
   */
  secondary?: boolean;
  
  /**
   * If true, the text will be truncated with an ellipsis if it's too long
   * @default false
   */
  noWrap?: boolean;
  
  /**
   * CSS class to apply to the root element
   */
  className?: string;
  
  /**
   * If true, the text will be rendered with a light font weight
   * @default false
   */
  light?: boolean;
  
  /**
   * If true, the text will be rendered with a bold font weight
   * @default false
   */
  bold?: boolean;
}

const StyledTypography = styled(MuiTypography, {
  shouldForwardProp: (prop) => prop !== 'light' && prop !== 'bold' && prop !== 'secondary',
})<{ light?: boolean; bold?: boolean; secondary?: boolean }>(
  ({ theme, light, bold, secondary }) => ({
    ...(light && {
      fontWeight: 300,
    }),
    ...(bold && {
      fontWeight: 700,
    }),
    ...(secondary && {
      color: theme.palette.text.secondary,
    }),
  }),
);

/**
 * Typography component for displaying text with consistent styling
 * 
 * @example
 * // Basic usage
 * <Typography>This is a text</Typography>
 * 
 * @example
 * // As a heading
 * <Typography variant="h1">Main Heading</Typography>
 * 
 * @example
 * // With custom styling
 * <Typography variant="body2" bold color="primary">Important notice</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color,
  gutterBottom = false,
  secondary = false,
  noWrap = false,
  className,
  light = false,
  bold = false,
  ...rest
}) => {
  // Convert our color prop to Material UI's color prop format
  let muiColor: any = color;
  if (color === 'textPrimary') muiColor = 'text.primary';
  if (color === 'textSecondary') muiColor = 'text.secondary';

  return (
    <StyledTypography
      variant={variant}
      color={muiColor}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      light={light}
      bold={bold}
      secondary={secondary}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography;