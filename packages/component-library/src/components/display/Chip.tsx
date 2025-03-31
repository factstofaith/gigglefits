import React from 'react';
import MuiChip, { ChipProps as MuiChipProps } from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

/**
 * Chip size options
 */
export type ChipSize = 'small' | 'medium';

/**
 * Chip variant options
 */
export type ChipVariant = 'filled' | 'outlined';

/**
 * Chip color options
 */
export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/**
 * Chip component props interface
 */
export interface ChipProps extends Omit<MuiChipProps, 'color' | 'variant' | 'size'> {
  /**
   * The label to be displayed in the chip
   */
  label: React.ReactNode;
  
  /**
   * The color of the chip
   * @default 'default'
   */
  color?: ChipColor;
  
  /**
   * The variant of the chip
   * @default 'filled'
   */
  variant?: ChipVariant;
  
  /**
   * The size of the chip
   * @default 'medium'
   */
  size?: ChipSize;
  
  /**
   * If true, the chip will appear clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * If true, the chip will show a delete icon
   * @default false
   */
  deletable?: boolean;
  
  /**
   * Custom icon element to display on the left side
   */
  icon?: React.ReactNode;
  
  /**
   * If true, the chip will have a more rounded appearance
   * @default false
   */
  rounded?: boolean;
  
  /**
   * If true, the chip will have a border with the theme primary color
   * @default false
   */
  bordered?: boolean;
  
  /**
   * Click handler for the chip
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Delete icon click handler
   */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop) => !['rounded', 'bordered'].includes(prop as string),
})<{ rounded?: boolean; bordered?: boolean }>(({ theme, rounded, bordered }) => ({
  ...(rounded && {
    borderRadius: '16px',
  }),
  ...(bordered && {
    border: `1px solid ${theme.palette.primary.main}`,
  }),
}));

/**
 * Chip component for displaying compact elements such as filters, tags, or categories
 * 
 * @example
 * // Basic usage
 * <Chip label="Technology" />
 * 
 * @example
 * // With icon and clickable
 * <Chip 
 *   icon={<TagIcon />} 
 *   label="Technology" 
 *   clickable 
 *   onClick={() => console.log('Clicked')} 
 * />
 * 
 * @example
 * // With delete action
 * <Chip 
 *   label="Delete me" 
 *   deletable 
 *   onDelete={() => console.log('Deleted')} 
 * />
 * 
 * @example
 * // Different variant and color
 * <Chip 
 *   label="Warning" 
 *   variant="outlined" 
 *   color="warning" 
 * />
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  color = 'default',
  variant = 'filled',
  size = 'medium',
  clickable = false,
  deletable = false,
  icon,
  rounded = false,
  bordered = false,
  onClick,
  onDelete,
  ...rest
}) => {
  return (
    <StyledChip
      label={label}
      color={color}
      variant={variant}
      size={size}
      icon={icon}
      onClick={clickable ? onClick : undefined}
      onDelete={deletable ? onDelete : undefined}
      clickable={clickable}
      rounded={rounded}
      bordered={bordered}
      {...rest}
    />
  );
};

export default Chip;