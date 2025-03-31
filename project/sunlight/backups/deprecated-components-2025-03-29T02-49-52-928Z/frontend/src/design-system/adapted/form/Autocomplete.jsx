/**
 * @component Autocomplete
 * @description Enhanced autocomplete component with accessibility, virtualization for large datasets, and standardized API.
 * @typedef {import('../../types/form').AutocompleteProps} AutocompleteProps
 * @template T
 * @type {React.ForwardRefExoticComponent<AutocompleteProps<T> & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;;
import { VariableSizeList } from 'react-window';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary/ErrorBoundary';
import { Autocomplete, ListSubheader, Popper, TextField, useMediaQuery } from '../../design-system';

// Custom virtualized list component for large datasets
const VirtualizedList = React.forwardRef(function VirtualizedList(props, ref) {
  const { children, groupBy, itemCount, itemData, itemSize, renderRow, maxHeight = 300, ...other } = props;

  // Calculate item heights based on whether they're a group header
  const itemSizeMap = React.useRef({});
  const getItemSize = React.useCallback((index) => {
  // Added display name
  getItemSize.displayName = 'getItemSize';

    return itemSizeMap.current[index] || itemSize;
  }, [itemSize]);

  // Set size mapping if using groups
  React.useEffect(() => {
    if (groupBy) {
      const groupIndexes = {};
      let index = 0;
      
      // Find all group headers
      for (let i = 0; i < itemData.length; i++) {
        const item = itemData[i];
        const group = groupBy(item);
        
        if (group && !groupIndexes[group]) {
          groupIndexes[group] = index;
          itemSizeMap.current[index] = 48; // Group header height
          index++;
        }
        index++;
      }
    }
  }, [groupBy, itemData, itemSize]);

  const gridRef = React.useRef();
  
  // Ensure the list resets when props change
  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndex(0, true);
    }
  }, [children, itemCount]);

  return (
    <div ref={ref}>
      <VariableSizeList
        height={Math.min(maxHeight, itemCount * itemSize)}
        width="100%&quot;
        ref={gridRef}
        outerElementType="div"
        innerElementType="div&quot;
        itemCount={itemCount}
        itemData={itemData}
        itemSize={getItemSize}
        overscanCount={5}
        {...other}
      >
        {renderRow}
      </VariableSizeList>
    </div>
  );
});

VirtualizedList.propTypes = {
  children: PropTypes.node,
  groupBy: PropTypes.func,
  itemCount: PropTypes.number.isRequired,
  itemData: PropTypes.array.isRequired,
  itemSize: PropTypes.number.isRequired,
  renderRow: PropTypes.func.isRequired,
  maxHeight: PropTypes.number,
};

VirtualizedList.displayName = "VirtualizedList';

// Virtualized row renderer
const VirtualizedRow = React.memo(({ data, index, style }) => {
  const { items, renderOption, getOptionLabel, groupItems, groupBy } = data;
  
  // Handle group headers
  if (groupItems && index in groupItems) {
    return (
      <ListSubheader 
        component="div&quot;
        style={{
          ...style,
          backgroundColor: "#f5f5f5',
          fontWeight: 'bold',
        }}
      >
        {groupItems[index]}
      </ListSubheader>
    );
  }
  
  // Find the actual item index accounting for group headers
  let itemIndex = index;
  if (groupItems) {
    let headerCount = 0;
    Object.keys(groupItems).forEach(groupIndex => {
      if (Number(groupIndex) < index) {
        headerCount++;
      }
    });
    itemIndex = index - headerCount;
  }
  
  const item = items[itemIndex];
  
  if (!item) {
    return null; // Handle edge cases
  }
  
  return (
    <div style={style}>
      {renderOption ? (
        renderOption(item, { selected: false })
      ) : (
        <div style={{ padding: '8px 16px' }}>
          {getOptionLabel(item)}
        </div>
      )}
    </div>
  );
});

VirtualizedRow.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

VirtualizedRow.displayName = 'VirtualizedRow';

/**
 * Enhanced autocomplete component with virtualization and accessibility
 */
const Autocomplete = React.memo(React.forwardRef((props, ref) => {
  // Destructure props
  const {
    // Required props
    id,
    options = [],
    value,
    onChange,
    
    // Optional props with defaults
    label = '',
    placeholder = '',
    helperText = '',
    error = false,
    disabled = false,
    required = false,
    multiple = false,
    freeSolo = false,
    loading = false,
    limitTags = -1,
    enableVirtualization = true,
    virtualizationThreshold = 100,
    maxHeight = 300,
    itemSize = 48,
    
    // Callback props
    getOptionLabel = (option) => option.label || option,
    isOptionEqualToValue = (option, value) => option.id === value.id,
    filterOptions = null,
    groupBy = null,
    renderOption = null,
    renderTags = null,
    renderInput = null,
    
    // ARIA props
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    
    // Rest of props
    ...otherProps
  } = props;
  
  // Only use virtualization with large datasets
  const shouldVirtualize = enableVirtualization && options.length > virtualizationThreshold;
  
  // Prepare group data if using groupBy
  const [groupItems, setGroupItems] = React.useState({});
  React.useEffect(() => {
    if (shouldVirtualize && groupBy) {
      const groups = {};
      const groupMap = {};
      let index = 0;
      
      options.forEach(option => {
        const group = groupBy(option);
        if (group && !groupMap[group]) {
          groupMap[group] = true;
          groups[index] = group;
        }
        index++;
      });
      
      setGroupItems(groups);
    }
  }, [options, groupBy, shouldVirtualize]);
  
  // Compute ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy || (label ? `${id}-label` : undefined),
    describedBy: ariaDescribedBy || (helperText ? `${id}-helper-text` : undefined),
    required,
    disabled,
    hasError: error
  });
  
  // Check if on mobile
  const isMobile = useMediaQuery('(max-width:600px)');

  // Create the virtualized popper component
  const VirtualizedPopper = React.useCallback((listboxProps) => {
  // Added display name
  VirtualizedPopper.displayName = 'VirtualizedPopper';

    const { children, ...other } = listboxProps;
    
    // Don't virtualize on mobile or small datasets
    if (isMobile || !shouldVirtualize) {
      return <Popper {...other}>{children}</Popper>;
    }
    
    // For large datasets, use virtualization
    return (
      <Popper {...other}>
        <VirtualizedList
          itemCount={options.length + (groupBy ? Object.keys(groupItems).length : 0)}
          itemData={{
            items: options,
            renderOption,
            getOptionLabel,
            groupItems,
            groupBy
          }}
          itemSize={itemSize}
          maxHeight={maxHeight}
          renderRow={VirtualizedRow}
          groupBy={groupBy}
        />
      </Popper>
    );
  }, [options, shouldVirtualize, isMobile, maxHeight, itemSize, renderOption, getOptionLabel, groupItems, groupBy]);
  
  // Default render input if not provided
  const defaultRenderInput = React.useCallback((params) => (
    <TextField
      {...params}
      id={id}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      InputProps={{
        ...params.InputProps,
        ...ariaAttributes
      }}
    />
  ), [id, label, placeholder, helperText, error, required, disabled, ariaAttributes]);
  
  return (
    <ErrorBoundary fallback={<div>Error loading autocomplete</div>}>
      <div className="ds-autocomplete ds-autocomplete-adapted&quot;>
        <Autocomplete
          ref={ref}
          id={id}
          options={options}
          value={value}
          onChange={onChange}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          renderInput={renderInput || defaultRenderInput}
          filterOptions={filterOptions}
          groupBy={groupBy}
          renderOption={renderOption}
          renderTags={renderTags}
          multiple={multiple}
          freeSolo={freeSolo}
          loading={loading}
          limitTags={limitTags}
          disableCloseOnSelect={multiple}
          ListboxComponent={shouldVirtualize ? "div' : undefined}
          PopperComponent={shouldVirtualize ? VirtualizedPopper : Popper}
          {...otherProps}
        />
      </div>
    </ErrorBoundary>
  );
}));

AutocompleteAdapted.propTypes = {
  // Required props
  id: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  
  // Optional props
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  freeSolo: PropTypes.bool,
  loading: PropTypes.bool,
  limitTags: PropTypes.number,
  enableVirtualization: PropTypes.bool,
  virtualizationThreshold: PropTypes.number,
  maxHeight: PropTypes.number,
  itemSize: PropTypes.number,
  
  // Callback props
  getOptionLabel: PropTypes.func,
  isOptionEqualToValue: PropTypes.func,
  filterOptions: PropTypes.func,
  groupBy: PropTypes.func,
  renderOption: PropTypes.func,
  renderTags: PropTypes.func,
  renderInput: PropTypes.func,
  
  // ARIA props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;