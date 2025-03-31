/**
 * @component Pagination
 * @description An adapter wrapper for the Material UI Pagination component. This component
 * maps the Material UI Pagination API to the design system Pagination component, providing
 * consistent interface and accessibility features.
 * 
 * @typedef {import('../../types/navigation').PaginationProps} PaginationProps
 * @type {React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLDivElement>>}
 * 
 * @example
 * // Basic usage
 * <PaginationAdapted 
 *   count={10} 
 *   page={currentPage} 
 *   onChange={(_, page) => setCurrentPage(page)} 
 * />
 * 
 * // With first/last buttons and custom styling
 * <PaginationAdapted
 *   count={totalPages}
 *   page={currentPage}
 *   onChange={handlePageChange}
 *   color="secondary&quot;
 *   size="large"
 *   showFirstButton
 *   showLastButton
 * />
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@design-system/components/navigation';
import { getAriaAttributes } from '@utils/accessibilityUtils';

/**
 * PaginationAdapted - Adapter wrapper for Material UI Pagination component
 * 
 * Provides a consistent pagination component with enhanced accessibility features
 * and compatibility with Material UI's Pagination API.
 */
const Pagination = React.memo(React.forwardRef(({
  count = 1,
  page = 1,
  defaultPage = 1,
  onChange,
  disabled = false,
  showFirstButton = false,
  showLastButton = false,
  hideNextButton = false,
  hidePrevButton = false,
  siblingCount = 1,
  boundaryCount = 1,
  variant = 'outlined',
  shape = 'rounded',
  color = 'primary',
  size = 'medium',
  className,
  // Accessibility props
  ariaLabel,
  getItemAriaLabel,
  // Additional props
  ...rest
}, ref) => {
  // Handle change from MUI format to design system format
  const handleChange = (page) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    if (onChange) {
      // MUI's Pagination sends (event, page) but our design system expects just page
      // This adapter converts between the two patterns
      onChange({}, page);
    }
  };

  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'pagination navigation',
  });

  return (
    <Pagination
      ref={ref}
      count={count}
      page={page || defaultPage}
      onChange={handleChange}
      disabled={disabled}
      showFirstButton={showFirstButton}
      showLastButton={showLastButton}
      hideNextButton={hideNextButton}
      hidePrevButton={hidePrevButton}
      siblingCount={siblingCount}
      boundaryCount={boundaryCount}
      variant={variant}
      shape={shape}
      color={color}
      size={size}
      className={`ds-pagination ds-pagination-adapted ${className || ''}`}
      {...ariaAttributes}
      {...rest}
    />
  );
}));

PaginationAdapted.propTypes = {
  // Standard props
  count: PropTypes.number,
  page: PropTypes.number, 
  defaultPage: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  showFirstButton: PropTypes.bool,
  showLastButton: PropTypes.bool,
  hideNextButton: PropTypes.bool,
  hidePrevButton: PropTypes.bool,
  siblingCount: PropTypes.number,
  boundaryCount: PropTypes.number,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  shape: PropTypes.oneOf(['rounded', 'circular']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  
  // Accessibility props
  ariaLabel: PropTypes.string,
  getItemAriaLabel: PropTypes.func,
};

Pagination.displayName = 'Pagination';

export default Pagination;