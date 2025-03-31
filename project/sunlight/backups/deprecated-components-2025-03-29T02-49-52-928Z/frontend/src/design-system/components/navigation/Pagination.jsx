import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * Pagination component for navigating between multiple pages
 */
const Pagination = forwardRef(
  (
    {
      count = 1,
      page = 1,
      onChange,
      disabled = false,
      showFirstButton = false,
      showLastButton = false,
      hideNextButton = false,
      hidePrevButton = false,
      siblingCount = 1,
      boundaryCount = 1,
      color = 'primary',
      size = 'medium',
      shape = 'rounded',
      variant = 'outlined',
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Ensure page is within valid bounds
    const normalizedPage = Math.max(1, Math.min(page, count));

    // Helper to create range array: [start, start+1, ..., end]
    const range = (start, end) => {
  // Added display name
  range.displayName = 'range';

  // Added display name
  range.displayName = 'range';

  // Added display name
  range.displayName = 'range';

  // Added display name
  range.displayName = 'range';

  // Added display name
  range.displayName = 'range';


      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    // Generate the pagination items
    const paginationItems = useMemo(() => {
  // Added display name
  paginationItems.displayName = 'paginationItems';

      // Show all pages if there are few
      if (count <= boundaryCount * 2 + siblingCount * 2 + 3) {
        return range(1, count);
      }

      // Calculate range of visible pagination items
      const startPages = range(1, boundaryCount);
      const endPages = range(count - boundaryCount + 1, count);

      const siblingsStart = Math.max(normalizedPage - siblingCount, boundaryCount + 1);

      const siblingsEnd = Math.min(normalizedPage + siblingCount, count - boundaryCount);

      const itemList = [];

      // Add start pages
      itemList.push(...startPages);

      // Add ellipsis or single page between startPages and siblingPages
      if (siblingsStart > boundaryCount + 1) {
        if (siblingsStart - boundaryCount === 2) {
          itemList.push(boundaryCount + 1);
        } else {
          itemList.push('ellipsis-start');
        }
      }

      // Add sibling pages
      itemList.push(...range(siblingsStart, siblingsEnd));

      // Add ellipsis or single page between siblingPages and endPages
      if (siblingsEnd < count - boundaryCount) {
        if (count - boundaryCount - siblingsEnd === 1) {
          itemList.push(count - boundaryCount);
        } else {
          itemList.push('ellipsis-end');
        }
      }

      // Add end pages
      itemList.push(...endPages);

      return itemList;
    }, [count, normalizedPage, boundaryCount, siblingCount]);

    // Handle page change
    const handlePageChange = newPage => {
      if (onChange && !disabled && newPage !== normalizedPage && newPage >= 1 && newPage <= count) {
        onChange(newPage);
      }
    };

    // Size styles
    const sizeStyles = {
      small: {
        height: '30px',
        minWidth: '30px',
        fontSize: theme.typography.caption.fontSize,
      },
      medium: {
        height: '36px',
        minWidth: '36px',
        fontSize: theme.typography.body2.fontSize,
      },
      large: {
        height: '42px',
        minWidth: '42px',
        fontSize: theme.typography.body1.fontSize,
      },
    };

    // Shape styles
    const getShapeStyles = itemType => {
      if (shape === 'rounded') {
        return {
          borderRadius: theme.shape.borderRadius,
        };
      } else if (shape === 'circular') {
        return {
          borderRadius: '50%',
        };
      }
      return {};
    };

    // Base item styles
    const getItemBaseStyles = itemType => {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        margin: `0 ${theme.spacing.xs}`,
        padding: '0',
        fontFamily: theme.typography.fontFamily,
        outline: 'none',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
        ...sizeStyles[size],
        ...getShapeStyles(itemType),
      };
    };

    // Item variant styles
    const getItemVariantStyles = isSelected => {
      const colorValue = theme.palette[color] || theme.palette.primary;

      if (variant === 'outlined') {
        return {
          border: `1px solid ${isSelected ? colorValue.main : theme.palette.divider}`,
          backgroundColor: isSelected ? colorValue.light : 'transparent',
          color: isSelected ? colorValue.main : theme.palette.text.primary,
          ':hover':
            !disabled && !isSelected
              ? {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.text.primary,
                }
              : {},
        };
      } else if (variant === 'text') {
        return {
          backgroundColor: isSelected ? colorValue.light : 'transparent',
          color: isSelected ? colorValue.main : theme.palette.text.primary,
          ':hover':
            !disabled && !isSelected
              ? {
                  backgroundColor: theme.palette.action.hover,
                }
              : {},
        };
      } else if (variant === 'contained') {
        return {
          backgroundColor: isSelected ? colorValue.main : theme.palette.action.disabledBackground,
          color: isSelected ? colorValue.contrastText : theme.palette.text.secondary,
          ':hover':
            !disabled && !isSelected
              ? {
                  backgroundColor: theme.palette.action.hover,
                }
              : {},
        };
      }

      return {};
    };

    // Render navigation buttons
    const renderNavButton = type => {
      // Skip rendering if hidden
      if (
        (type === 'first' && !showFirstButton) ||
        (type === 'last' && !showLastButton) ||
        (type === 'previous' && hidePrevButton) ||
        (type === 'next' && hideNextButton)
      ) {
        return null;
      }

      // Determine if button is disabled
      let buttonDisabled = disabled;
      let ariaLabel = '';
      let content = '';
      let clickHandler = () => {};

      switch (type) {
        case 'first':
          buttonDisabled = disabled || normalizedPage === 1;
          ariaLabel = 'Go to first page';
          content = '«';
          clickHandler = () => handlePageChange(1);
          break;
        case 'previous':
          buttonDisabled = disabled || normalizedPage === 1;
          ariaLabel = 'Go to previous page';
          content = '‹';
          clickHandler = () => handlePageChange(normalizedPage - 1);
          break;
        case 'next':
          buttonDisabled = disabled || normalizedPage === count;
          ariaLabel = 'Go to next page';
          content = '›';
          clickHandler = () => handlePageChange(normalizedPage + 1);
          break;
        case 'last':
          buttonDisabled = disabled || normalizedPage === count;
          ariaLabel = 'Go to last page';
          content = '»';
          clickHandler = () => handlePageChange(count);
          break;
        default:
          break;
      }

      return (
        <button
          type="button&quot;
          aria-label={ariaLabel}
          disabled={buttonDisabled}
          onClick={clickHandler}
          style={{
            ...getItemBaseStyles("nav'),
            opacity: buttonDisabled ? 0.38 : 1,
            ...getItemVariantStyles(false),
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {content}
        </button>
      );
    };

    // Render ellipsis
    const renderEllipsis = key => (
      <div
        key={key}
        aria-hidden="true"
        style={{
          ...getItemBaseStyles('ellipsis'),
          cursor: 'default',
          color: theme.palette.text.secondary,
        }}
      >
        …
      </div>
    );

    // Render page number
    const renderPageNumber = pageNumber => {
      const isSelected = pageNumber === normalizedPage;

      return (
        <button
          key={pageNumber}
          type="button&quot;
          aria-label={`Go to page ${pageNumber}`}
          aria-current={isSelected ? "page' : undefined}
          disabled={disabled}
          onClick={() => handlePageChange(pageNumber)}
          style={{
            ...getItemBaseStyles('page'),
            fontWeight: isSelected
              ? theme.typography.fontWeightMedium
              : theme.typography.fontWeightRegular,
            ...getItemVariantStyles(isSelected),
          }}
        >
          {pageNumber}
        </button>
      );
    };

    // Render items based on the item list
    const renderItems = () => {
  // Added display name
  renderItems.displayName = 'renderItems';

  // Added display name
  renderItems.displayName = 'renderItems';

  // Added display name
  renderItems.displayName = 'renderItems';

  // Added display name
  renderItems.displayName = 'renderItems';

  // Added display name
  renderItems.displayName = 'renderItems';


      return paginationItems.map(item => {
        if (typeof item === 'number') {
          return renderPageNumber(item);
        } else if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          return renderEllipsis(item);
        }
        return null;
      });
    };

    return (
      <nav
        ref={ref}
        aria-label="pagination navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...props.style,
        }}
        {...props}
      >
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: 0,
            margin: 0,
            listStyle: 'none',
          }}
        >
          {/* First page button */}
          {showFirstButton && <li>{renderNavButton('first')}</li>}

          {/* Previous page button */}
          {!hidePrevButton && <li>{renderNavButton('previous')}</li>}

          {/* Page numbers and ellipses */}
          {renderItems().map((item, index) => (
            <li key={index}>{item}</li>
          ))}

          {/* Next page button */}
          {!hideNextButton && <li>{renderNavButton('next')}</li>}

          {/* Last page button */}
          {showLastButton && <li>{renderNavButton('last')}</li>}
        </ul>
      </nav>
    );
  }
);

Pagination.propTypes = {
  /**
   * Total number of pages
   */
  count: PropTypes.number,

  /**
   * Current page number
   */
  page: PropTypes.number,

  /**
   * Callback fired when page is changed
   */
  onChange: PropTypes.func,

  /**
   * If true, the pagination is disabled
   */
  disabled: PropTypes.bool,

  /**
   * If true, show the first-page button
   */
  showFirstButton: PropTypes.bool,

  /**
   * If true, show the last-page button
   */
  showLastButton: PropTypes.bool,

  /**
   * If true, hide the next-page button
   */
  hideNextButton: PropTypes.bool,

  /**
   * If true, hide the previous-page button
   */
  hidePrevButton: PropTypes.bool,

  /**
   * Number of sibling pages on each side of the current page
   */
  siblingCount: PropTypes.number,

  /**
   * Number of pages at the beginning and end of the pagination
   */
  boundaryCount: PropTypes.number,

  /**
   * Color of the active page button
   */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),

  /**
   * Size of pagination items
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),

  /**
   * Shape of pagination items
   */
  shape: PropTypes.oneOf(['rounded', 'circular']),

  /**
   * Appearance variant of pagination items
   */
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
};

Pagination.displayName = 'Pagination';

export default Pagination;
