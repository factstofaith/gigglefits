import React, { forwardRef, Children, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * Breadcrumbs component provides a navigation trail for showing page hierarchy
 */
const Breadcrumbs = forwardRef(
  (
    {
      children,
      separator = '/',
      maxItems = 8,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      'aria-label': ariaLabel = 'breadcrumbs',
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Count valid children
    const allItems = Children.toArray(children).filter(child => isValidElement(child));
    const totalItems = allItems.length;

    // Determine if we need to collapse items
    const shouldCollapse = maxItems > 0 && totalItems > maxItems;

    // Create the items array, potentially with collapsed items
    let items;

    if (shouldCollapse) {
      const startItems = allItems.slice(0, itemsBeforeCollapse);
      const endItems = allItems.slice(totalItems - itemsAfterCollapse);

      items = [
        ...startItems,
        // Add the ellipsis item in the middle
        <li
          key="ellipsis&quot;
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
          }}
        >
          …
        </li>,
        ...endItems,
      ];
    } else {
      items = allItems;
    }

    // Add separators between items
    const itemsWithSeparators = items.map((item, index) => {
      const isLast = index === items.length - 1;

      // Clone each item to add specific props
      const clonedItem = cloneElement(item, {
        'aria-current': isLast ? 'page' : undefined,
        style: {
          ...item.props.style,
          color: isLast ? theme.palette.text.primary : theme.palette.text.secondary,
          fontWeight: isLast
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
          cursor: isLast ? 'default' : 'pointer',
          textDecoration: 'none',
          ':hover': !isLast ? { textDecoration: 'underline' } : undefined,
        },
      });

      // Return the item with a separator if not the last item
      return (
        <React.Fragment key={index}>
          {clonedItem}
          {isLast ? null : (
            <li
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                margin: `0 ${theme.spacing.xs}`,
                color: theme.palette.text.secondary,
                userSelect: 'none',
              }}
            >
              {separator}
            </li>
          )}
        </React.Fragment>
      );
    });

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        style={{
          fontSize: theme.typography.body2.fontSize,
          lineHeight: theme.typography.body2.lineHeight,
          ...props.style,
        }}
        {...props}
      >
        <ol
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {itemsWithSeparators}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.propTypes = {
  /**
   * The content of the breadcrumbs, normally link elements
   */
  children: PropTypes.node,

  /**
   * Custom separator between breadcrumbs
   */
  separator: PropTypes.node,

  /**
   * Maximum number of items to display before collapsing
   */
  maxItems: PropTypes.number,

  /**
   * Number of items to show before the collapse indicator
   */
  itemsBeforeCollapse: PropTypes.number,

  /**
   * Number of items to show after the collapse indicator
   */
  itemsAfterCollapse: PropTypes.number,

  /**
   * Accessible label for the breadcrumbs navigation
   */
  'aria-label': PropTypes.string,
};

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
