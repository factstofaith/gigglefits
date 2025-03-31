/**
 * Type definitions for form components
 */

import React from 'react';
import {
  AccessibilityProps,
  ChangeHandler,
  ColorVariant,
  ComponentStateProps,
  FormControlProps,
  SizeVariant,
  SortDirection,
  SxProps
} from './common';

/**
 * SliderAdapted component props
 */
export interface SliderProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLDivElement> {
  /** The value for controlled sliders */
  value?: number | number[];
  /** The default value for uncontrolled sliders */
  defaultValue?: number | number[];
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment value */
  step?: number;
  /** Callback fired when value changes */
  onChange?: (value: number | number[]) => void;
  /** If true, slider becomes a range slider */
  range?: boolean;
  /** Displays marks on the slider track */
  marks?: boolean | Array<{ value: number; label?: React.ReactNode }> | Record<number, React.ReactNode>;
  /** Controls value label display */
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  /** Formats the displayed value label */
  valueLabelFormat?: (value: number) => React.ReactNode;
  /** Color of the slider */
  color?: ColorVariant;
  /** Size of the slider */
  size?: SizeVariant;
  /** Orientation of the slider */
  orientation?: 'horizontal' | 'vertical';
  /** Display of the track */
  track?: 'normal' | 'inverted' | 'false';
}

/**
 * ButtonAdapted component props
 */
export interface ButtonProps extends SxProps, AccessibilityProps, ComponentStateProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'contained' | 'outlined' | 'text';
  /** Button color */
  color?: ColorVariant;
  /** Button size */
  size?: SizeVariant;
  /** The content of the button */
  children?: React.ReactNode;
  /** If true, button will take the full width of its container */
  fullWidth?: boolean;
  /** Element to render for the button's start icon */
  startIcon?: React.ReactNode;
  /** Element to render for the button's end icon */
  endIcon?: React.ReactNode;
  /** If true, circular button */
  circular?: boolean;
  /** If true, removes button effect */
  disableRipple?: boolean;
  /** If true, removes elevation */
  disableElevation?: boolean;
  /** If true, no uppercase transform */
  disableTransform?: boolean;
  /** Button href attribute, turns it into an anchor when provided */
  href?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * TextFieldAdapted component props
 */
export interface TextFieldProps extends SxProps, AccessibilityProps, ComponentStateProps, FormControlProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Variant of the input component */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Type of the input */
  type?: string;
  /** Value of the input */
  value?: string;
  /** Default value of the input, for uncontrolled components */
  defaultValue?: string;
  /** Callback fired when the value changes */
  onChange?: ChangeHandler<string>;
  /** Start adornment for the input */
  startAdornment?: React.ReactNode;
  /** End adornment for the input */
  endAdornment?: React.ReactNode;
  /** Size of the input */
  size?: 'small' | 'medium';
  /** Name of the input */
  name?: string;
  /** Pattern for validation */
  pattern?: string;
  /** Maximum length of characters */
  maxLength?: number;
  /** Minimum length of characters */
  minLength?: number;
  /** If true, the input is auto focused */
  autoFocus?: boolean;
  /** The ID of an input element to use as an autocomplete source */
  list?: string;
  /** If true, input element is automatically focused */
  autoComplete?: string;
  /** Placeholder for the input */
  placeholder?: string;
  /** If true, input is in read-only mode */
  readOnly?: boolean;
  /** The input component to use */
  inputComponent?: React.ElementType;
  /** Input component props */
  inputProps?: object;
  /** Props for the form control component */
  FormControlProps?: object;
  /** Props for the input label component */
  InputLabelProps?: object;
}

/**
 * CheckboxAdapted component props
 */
export interface CheckboxProps extends SxProps, AccessibilityProps, ComponentStateProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** If true, the checkbox is checked */
  checked?: boolean;
  /** Default checked state, for uncontrolled components */
  defaultChecked?: boolean;
  /** Callback fired when the state changes */
  onChange?: ChangeHandler<boolean>;
  /** Color of the checkbox */
  color?: ColorVariant;
  /** Size of the checkbox */
  size?: 'small' | 'medium' | 'large';
  /** If true, the checkbox appears indeterminate */
  indeterminate?: boolean;
  /** Icon to use for the unchecked state */
  icon?: React.ReactNode;
  /** Icon to use for the checked state */
  checkedIcon?: React.ReactNode;
  /** Icon to use for the indeterminate state */
  indeterminateIcon?: React.ReactNode;
  /** The input component props */
  inputProps?: object;
  /** Props for the form control component */
  FormControlProps?: object;
}

/**
 * SelectAdapted component props
 */
export interface SelectProps extends SxProps, AccessibilityProps, ComponentStateProps, FormControlProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Value for controlled components */
  value?: unknown;
  /** Default value for uncontrolled components */
  defaultValue?: unknown;
  /** Callback fired when value changes */
  onChange?: ChangeHandler<unknown>;
  /** The select options */
  children?: React.ReactNode;
  /** Placeholder text displayed when no option is selected */
  placeholder?: string;
  /** Native HTML select */
  native?: boolean;
  /** Multiple select options */
  multiple?: boolean;
  /** Variant of the component */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Size of the component */
  size?: 'small' | 'medium';
  /** If true, display loading animation */
  loading?: boolean;
  /** Custom render value function */
  renderValue?: (value: unknown) => React.ReactNode;
  /** Props for the menu component */
  MenuProps?: object;
  /** Input component props */
  inputProps?: object;
}

/**
 * RadioGroupAdapted component props
 */
export interface RadioGroupProps extends SxProps, AccessibilityProps, ComponentStateProps {
  /** Value of the selected radio */
  value?: unknown;
  /** Default value for uncontrolled components */
  defaultValue?: unknown;
  /** Callback fired when value changes */
  onChange?: ChangeHandler<unknown>;
  /** Radio components or RadioItem components */
  children?: React.ReactNode;
  /** Row or column layout */
  row?: boolean;
  /** Name attribute for all radio inputs */
  name?: string;
}

/**
 * DatePickerAdapted component props
 */
export interface DatePickerProps extends SxProps, AccessibilityProps, ComponentStateProps, FormControlProps {
  /** Selected date value */
  value?: Date | null;
  /** Default date value for uncontrolled components */
  defaultValue?: Date | null;
  /** Callback fired when date changes */
  onChange?: (date: Date | null) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format string */
  format?: string;
  /** If true, opens the picker on input focus */
  openOnFocus?: boolean;
  /** If true, shows the toolbar in the picker */
  showToolbar?: boolean;
  /** Customize the inputs */
  renderInput?: (props: object) => React.ReactNode;
  /** Customize the display of days */
  renderDay?: (day: Date, selected: boolean) => React.ReactNode;
  /** Initial focused date when opening the picker */
  initialFocusedDate?: Date;
  /** If true, opens to year selection first */
  openToYearSelection?: boolean;
  /** Disable specific dates */
  shouldDisableDate?: (date: Date) => boolean;
  /** Locale for date formatting */
  locale?: string;
  /** Variant of the picker */
  variant?: 'dialog' | 'inline' | 'static';
  /** Size of the input */
  size?: 'small' | 'medium';
}

/**
 * AutocompleteAdapted component props
 */
export interface AutocompleteProps<T = any> extends SxProps, AccessibilityProps, ComponentStateProps, FormControlProps {
  /** Options to display in the dropdown */
  options: readonly T[];
  /** The value of the autocomplete */
  value?: T | T[] | null;
  /** Callback fired when the value changes */
  onChange?: (event: React.SyntheticEvent, value: T | T[] | null) => void;
  /** Used to determine the string value for a given option */
  getOptionLabel?: (option: T) => string;
  /** Used to determine if an option is equal to the selected value */
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /** If true, the component is in multiple selection mode */
  multiple?: boolean;
  /** If true, allows arbitrary values */
  freeSolo?: boolean;
  /** If true, the component is in a loading state */
  loading?: boolean;
  /** The maximum number of tags to display when multiple */
  limitTags?: number;
  /** If true, virtualization will be used for large datasets */
  enableVirtualization?: boolean;
  /** Minimum number of options to enable virtualization */
  virtualizationThreshold?: number;
  /** Maximum height of the dropdown */
  maxHeight?: number;
  /** Height of each item in the dropdown */
  itemSize?: number;
  /** Used to group the options by category */
  groupBy?: (option: T) => string;
  /** Used to filter the available options */
  filterOptions?: (options: T[], state: object) => T[];
  /** Render the option in the dropdown */
  renderOption?: (option: T, state: { selected: boolean }) => React.ReactNode;
  /** Render the selected value in the input */
  renderTags?: (value: T[], getTagProps: (index: number) => object) => React.ReactNode;
  /** Render the input */
  renderInput?: (params: object) => React.ReactNode;
  /** Props passed to the Popper component */
  PopperProps?: object;
  /** Props passed to the Paper component */
  PaperProps?: object;
  /** Props passed to the ListBox component */
  ListboxProps?: object;
  /** Class name applied to the input element */
  className?: string;
}