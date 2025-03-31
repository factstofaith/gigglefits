/**
 * @component List
 * @description An enhanced list component with virtualization for large datasets.
 * @typedef {import('../../types/complex-components').ListAdaptedProps} ListAdaptedProps
 * @type {React.ForwardRefExoticComponent<ListAdaptedProps & React.RefAttributes<HTMLUListElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;;
import { VariableSizeList } from 'react-window';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary/ErrorBoundary';
import { List as MuiList, ListItem, ListItemIcon, ListItemText, ListSubheader, Typography } from '../../design-system';

const List = React.memo(React.forwardRef((props, ref) => {
  // Destructure and process props
  const {
    // Required props
    id,
    items = [],
    
    // Optional props with defaults
    header = '',
    dense = false,
    disablePadding = false,
    maxHeight = 400,
    itemSize = 56,
    enableVirtualization = true,
    renderItem = null,
    emptyMessage = 'No items to display',
    
    // ARIA props
    ariaLabel,
    ariaLabelledBy,
    
    // Rest of props
    ...otherProps
  } = props;
  
  // If no items, show empty state
  if (items.length === 0) {
    return (
      <ErrorBoundary fallback={<div>Error rendering list component</div>}>
        <MuiList
          ref={ref}
          id={id}
          dense={dense}
          disablePadding={disablePadding}
          subheader={header ? <ListSubheader>{header}</ListSubheader> : null}
          className="ds-list ds-list-adapted ds-list-empty&quot;
          {...otherProps}
        >
          <ListItem>
            <ListItemText primary={emptyMessage} />
          </ListItem>
        </MuiList>
      </ErrorBoundary>
    );
  }
  
  // Compute ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy
  });
  
  // Default item renderer if not provided
  const defaultRenderItem = ({ item, style, index }) => (
    <ListItem 
      key={item.id || index} 
      style={style} 
      dense={dense}
      disablePadding={disablePadding}
      className="ds-list-item"
      {...(item.onClick ? { onClick: () => item.onClick(item) } : {})}
      {...(item.selected ? { selected: true } : {})}
      {...(item.disabled ? { disabled: true } : {})}
    >
      {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
      <ListItemText 
        primary={item.primary} 
        secondary={item.secondary}
      />
    </ListItem>
  );
  
  // Use provided renderItem or default
  const itemRenderer = renderItem || defaultRenderItem;
  
  // Don't use virtualization for small lists
  const shouldVirtualize = enableVirtualization && items.length > 20;
  
  // Virtualized list implementation
  if (shouldVirtualize) {
    return (
      <ErrorBoundary fallback={<div>Error rendering virtualized list</div>}>
        <div
          ref={ref}
          id={id}
          style={{ height: maxHeight, width: '100%' }}
          className="ds-list ds-list-adapted ds-list-virtualized&quot;
          {...ariaAttributes}
        >
          {header && (
            <Typography variant="subtitle1" component="div&quot; className="ds-list-header">
              {header}
            </Typography>
          )}
          <VariableSizeList
            height={maxHeight - (header ? 48 : 0)}
            width="100%&quot;
            itemCount={items.length}
            itemSize={() => itemSize}
            overscanCount={5}
          >
            {({ index, style }) => itemRenderer({
              item: items[index],
              index,
              style
            })}
          </VariableSizeList>
        </div>
      </ErrorBoundary>
    );
  }
  
  // Standard list implementation for smaller datasets
  return (
    <ErrorBoundary fallback={<div>Error rendering list component</div>}>
      <MuiList
        ref={ref}
        id={id}
        dense={dense}
        disablePadding={disablePadding}
        subheader={header ? <ListSubheader>{header}</ListSubheader> : null}
        className="ds-list ds-list-adapted"
        style={{ maxHeight, overflow: 'auto' }}
        {...ariaAttributes}
        {...otherProps}
      >
        {items.map((item, index) => itemRenderer({
          item,
          index,
          style: {}
        }))}
      </MuiList>
    </ErrorBoundary>
  );
}));

ListAdapted.propTypes = {
  // Required props
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    primary: PropTypes.node.isRequired,
    secondary: PropTypes.node,
    icon: PropTypes.node,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
    disabled: PropTypes.bool
  })),
  
  // Optional props
  header: PropTypes.node,
  dense: PropTypes.bool,
  disablePadding: PropTypes.bool,
  maxHeight: PropTypes.number,
  itemSize: PropTypes.number,
  enableVirtualization: PropTypes.bool,
  renderItem: PropTypes.func,
  emptyMessage: PropTypes.node,
  
  // ARIA props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string
};

List.displayName = 'List';

export default List;