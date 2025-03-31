# Design System Legacy Component Wrappers

This document provides information about the legacy wrapper components that facilitate the migration from Material UI to our custom design system.

## Overview

Legacy wrapper components maintain the same API as Material UI components but use the design system components under the hood. They provide backward compatibility while allowing gradual migration.

## Available Legacy Wrappers

### Core Components

#### ButtonLegacy

Maps Material UI Button API to design system Button.

```jsx
// Before
import Button from '@mui/material/Button';

// After
import { ButtonLegacy } from '../design-system/legacy';

// Usage remains the same
<ButtonLegacy 
  variant="contained" 
  color="primary" 
  onClick={handleClick}
>
  Click Me
</ButtonLegacy>
```

Key features:
- Supports all Material UI Button variants (`contained`, `outlined`, `text`)
- Maps colors (`primary`, `secondary`, `error`, etc.)
- Handles icons, loading states, and sizes

#### TypographyLegacy

Maps Material UI Typography API to design system Typography.

```jsx
// Before
import Typography from '@mui/material/Typography';

// After
import { TypographyLegacy } from '../design-system/legacy';

// Usage remains the same
<TypographyLegacy variant="h4" gutterBottom>
  Heading Text
</TypographyLegacy>
```

#### IconButtonLegacy

Maps Material UI IconButton API to design system Button with icon variant.

```jsx
// Before
import IconButton from '@mui/material/IconButton';

// After
import { IconButtonLegacy } from '../design-system/legacy';

// Usage remains the same
<IconButtonLegacy color="primary" onClick={handleClick}>
  <DeleteIcon />
</IconButtonLegacy>
```

### Layout Components

#### BoxLegacy

Maps Material UI Box API to design system Box.

```jsx
// Before
import Box from '@mui/material/Box';

// After
import { BoxLegacy } from '../design-system/legacy';

// Usage remains the same
<BoxLegacy sx={{ p: 2, display: 'flex' }}>
  Content
</BoxLegacy>
```

#### GridLegacy

Maps Material UI Grid API to design system Grid.

```jsx
// Before
import Grid from '@mui/material/Grid';

// After
import { GridLegacy } from '../design-system/legacy';

// Usage remains the same
<GridLegacy container spacing={2}>
  <GridLegacy item xs={12} md={6}>
    Column 1
  </GridLegacy>
  <GridLegacy item xs={12} md={6}>
    Column 2
  </GridLegacy>
</GridLegacy>
```

#### CardLegacy

Maps Material UI Card and related components to design system Card.

```jsx
// Before
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

// After
import { CardLegacy } from '../design-system/legacy';

// Usage remains the same
<CardLegacy>
  <CardLegacy.Header title="Card Title" />
  <CardLegacy.Content>
    Card content
  </CardLegacy.Content>
</CardLegacy>
```

#### DividerLegacy

Maps Material UI Divider API to design system Divider.

```jsx
// Before
import Divider from '@mui/material/Divider';

// After
import { DividerLegacy } from '../design-system/legacy';

// Usage remains the same
<DividerLegacy />
<DividerLegacy orientation="vertical" />
```

#### PaperLegacy

Maps Material UI Paper API to design system Paper.

```jsx
// Before
import Paper from '@mui/material/Paper';

// After
import { PaperLegacy } from '../design-system/legacy';

// Usage remains the same
<PaperLegacy elevation={3} sx={{ p: 2 }}>
  Content
</PaperLegacy>
```

### Form Components

#### TextFieldLegacy

Maps Material UI TextField API to design system TextField.

```jsx
// Before
import TextField from '@mui/material/TextField';

// After
import { TextFieldLegacy } from '../design-system/legacy';

// Usage remains the same
<TextFieldLegacy
  label="Name"
  value={name}
  onChange={handleNameChange}
  error={!!errors.name}
  helperText={errors.name}
/>
```

#### InputFieldLegacy

Maps custom InputField to design system TextField.

```jsx
// Before
import InputField from '../components/common/InputField';

// After
import { InputFieldLegacy } from '../design-system/legacy';

// Usage remains the same
<InputFieldLegacy
  label="Email"
  value={email}
  onChange={handleEmailChange}
/>
```

#### SelectLegacy

Maps Material UI Select API to design system Select.

```jsx
// Before
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// After
import { SelectLegacy, MenuItemLegacy } from '../design-system/legacy';

// Usage remains the same
<SelectLegacy
  value={value}
  onChange={handleChange}
  label="Options"
>
  <MenuItemLegacy value="option1">Option 1</MenuItemLegacy>
  <MenuItemLegacy value="option2">Option 2</MenuItemLegacy>
</SelectLegacy>
```

#### AutocompleteLegacy

Maps Material UI Autocomplete API to design system Autocomplete.

```jsx
// Before
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// After
import { AutocompleteLegacy, TextFieldLegacy } from '../design-system/legacy';

// Usage remains the same
<AutocompleteLegacy
  options={options}
  value={value}
  onChange={handleChange}
  renderInput={(params) => (
    <TextFieldLegacy {...params} label="Select Option" />
  )}
/>
```

#### FormControlLegacy

Maps Material UI FormControl API to design system FormControl.

```jsx
// Before
import FormControl from '@mui/material/FormControl';

// After
import { FormControlLegacy } from '../design-system/legacy';

// Usage remains the same
<FormControlLegacy fullWidth>
  <InputLabelLegacy>Label</InputLabelLegacy>
  <SelectLegacy value={value} onChange={handleChange}>
    <MenuItemLegacy value="option1">Option 1</MenuItemLegacy>
  </SelectLegacy>
</FormControlLegacy>
```

#### FormControlLabelLegacy

Maps Material UI FormControlLabel API to design system FormControlLabel.

```jsx
// Before
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

// After
import { FormControlLabelLegacy, SwitchLegacy } from '../design-system/legacy';

// Usage remains the same
<FormControlLabelLegacy
  control={<SwitchLegacy checked={checked} onChange={handleChange} />}
  label="Toggle option"
/>
```

#### SwitchLegacy

Maps Material UI Switch API to design system Switch.

```jsx
// Before
import Switch from '@mui/material/Switch';

// After
import { SwitchLegacy } from '../design-system/legacy';

// Usage remains the same
<SwitchLegacy
  checked={checked}
  onChange={handleChange}
  color="primary"
/>
```

#### FormHelperTextLegacy

Maps Material UI FormHelperText API to design system FormHelperText.

```jsx
// Before
import FormHelperText from '@mui/material/FormHelperText';

// After
import { FormHelperTextLegacy } from '../design-system/legacy';

// Usage remains the same
<FormHelperTextLegacy error={!!error}>
  {error || 'Helper text'}
</FormHelperTextLegacy>
```

#### InputLabelLegacy

Maps Material UI InputLabel API to design system InputLabel.

```jsx
// Before
import InputLabel from '@mui/material/InputLabel';

// After
import { InputLabelLegacy } from '../design-system/legacy';

// Usage remains the same
<InputLabelLegacy>Email</InputLabelLegacy>
```

### Dialog Components

#### DialogLegacy

Maps Material UI Dialog API to design system Dialog.

```jsx
// Before
import Dialog from '@mui/material/Dialog';

// After
import { DialogLegacy } from '../design-system/legacy';

// Usage remains the same
<DialogLegacy
  open={open}
  onClose={handleClose}
  maxWidth="md"
  fullWidth
>
  Dialog content
</DialogLegacy>
```

#### DialogTitleLegacy

Maps Material UI DialogTitle API to design system DialogTitle.

```jsx
// Before
import DialogTitle from '@mui/material/DialogTitle';

// After
import { DialogTitleLegacy } from '../design-system/legacy';

// Usage remains the same
<DialogTitleLegacy>
  Dialog Title
</DialogTitleLegacy>
```

#### DialogContentLegacy

Maps Material UI DialogContent API to design system DialogContent.

```jsx
// Before
import DialogContent from '@mui/material/DialogContent';

// After
import { DialogContentLegacy } from '../design-system/legacy';

// Usage remains the same
<DialogContentLegacy>
  Dialog content goes here
</DialogContentLegacy>
```

#### DialogActionsLegacy

Maps Material UI DialogActions API to design system DialogActions.

```jsx
// Before
import DialogActions from '@mui/material/DialogActions';

// After
import { DialogActionsLegacy } from '../design-system/legacy';

// Usage remains the same
<DialogActionsLegacy>
  <ButtonLegacy onClick={handleClose}>Cancel</ButtonLegacy>
  <ButtonLegacy onClick={handleSubmit} color="primary">Submit</ButtonLegacy>
</DialogActionsLegacy>
```

### Feedback Components

#### AlertLegacy

Maps Material UI Alert API to design system Alert.

```jsx
// Before
import Alert from '@mui/material/Alert';

// After
import { AlertLegacy } from '../design-system/legacy';

// Usage remains the same
<AlertLegacy severity="success">
  Operation completed successfully!
</AlertLegacy>
```

#### CircularProgressLegacy

Maps Material UI CircularProgress API to design system CircularProgress.

```jsx
// Before
import CircularProgress from '@mui/material/CircularProgress';

// After
import { CircularProgressLegacy } from '../design-system/legacy';

// Usage remains the same
<CircularProgressLegacy size={24} color="primary" />
```

### Display Components

#### ChipLegacy

Maps Material UI Chip API to design system Chip.

```jsx
// Before
import Chip from '@mui/material/Chip';

// After
import { ChipLegacy } from '../design-system/legacy';

// Usage remains the same
<ChipLegacy
  label="Tag"
  color="primary"
  onDelete={handleDelete}
/>
```

#### BadgeLegacy

Maps Material UI Badge API to design system Badge.

```jsx
// Before
import Badge from '@mui/material/Badge';

// After
import { BadgeLegacy } from '../design-system/legacy';

// Usage remains the same
<BadgeLegacy badgeContent={4} color="primary">
  <MailIcon />
</BadgeLegacy>
```

### Navigation Components

#### StepperLegacy and Related

Maps Material UI Stepper, Step, StepLabel, StepContent to design system equivalents.

```jsx
// Before
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// After
import { 
  StepperLegacy, 
  StepLegacy, 
  StepLabelLegacy 
} from '../design-system/legacy';

// Usage remains the same
<StepperLegacy activeStep={activeStep}>
  <StepLegacy>
    <StepLabelLegacy>Step 1</StepLabelLegacy>
  </StepLegacy>
  <StepLegacy>
    <StepLabelLegacy>Step 2</StepLabelLegacy>
  </StepLegacy>
</StepperLegacy>
```

#### ToggleButtonGroupLegacy and ToggleButtonLegacy

Maps Material UI ToggleButtonGroup and ToggleButton to design system equivalents.

```jsx
// Before
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

// After
import { 
  ToggleButtonGroupLegacy, 
  ToggleButtonLegacy 
} from '../design-system/legacy';

// Usage remains the same
<ToggleButtonGroupLegacy
  value={alignment}
  exclusive
  onChange={handleChange}
>
  <ToggleButtonLegacy value="left">Left</ToggleButtonLegacy>
  <ToggleButtonLegacy value="center">Center</ToggleButtonLegacy>
  <ToggleButtonLegacy value="right">Right</ToggleButtonLegacy>
</ToggleButtonGroupLegacy>
```

## Implementation Details

All legacy wrappers:

1. Accept the same props as their Material UI counterparts
2. Map those props to the design system component API
3. Include PropTypes for proper type checking
4. Show deprecation warnings in development mode
5. Pass through any unhandled props to the design system component

## Adding New Wrappers

If you need a wrapper that doesn't exist yet:

1. Identify the Material UI component that needs to be wrapped
2. Create a new wrapper component in `/frontend/src/design-system/legacy/`
3. Follow the naming convention `ComponentNameLegacy.jsx`
4. Export the new component from `index.js`
5. Add tests to verify functionality

Example implementation pattern:

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { DesignSystemComponent } from '../components/path';

const ComponentNameLegacy = ({ materialUIProp1, materialUIProp2, ...otherProps }) => {
  // Map Material UI props to design system props
  const designSystemProp1 = mapProp(materialUIProp1);
  
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'ComponentNameLegacy is a compatibility component and will be deprecated. ' +
      'Please migrate to the design system ComponentName component.'
    );
  }
  
  return (
    <DesignSystemComponent
      prop1={designSystemProp1}
      {...otherProps}
    />
  );
};

ComponentNameLegacy.propTypes = {
  materialUIProp1: PropTypes.string,
  materialUIProp2: PropTypes.bool,
};

export default ComponentNameLegacy;
```

## Testing Wrappers

All wrapper components should have tests to verify:

1. Basic rendering works
2. Props are correctly mapped
3. Event handlers are properly triggered
4. Edge cases are handled

Tests are located in `/frontend/src/tests/design-system/legacy-wrappers/`.