# SliderAdapted

The `SliderAdapted` component provides a way to select a value or range from a predefined range of allowed values. It supports single value and range selection, custom marks, orientation options, and comprehensive accessibility features.

## Features

- **Single and range selection modes**
- **Customizable marks and labels**
- **Keyboard accessibility** with arrow key navigation
- **Touch device support**
- **Horizontal and vertical orientations**
- **Multiple size variants**
- **Value label display options**

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` or `number[]` | | The value for controlled sliders |
| `defaultValue` | `number` or `number[]` | `0` | The default value for uncontrolled sliders |
| `min` | `number` | `0` | Minimum allowed value |
| `max` | `number` | `100` | Maximum allowed value |
| `step` | `number` | `1` | Step increment value |
| `onChange` | `function` | | Callback fired when value changes |
| `range` | `boolean` | `false` | If `true`, slider becomes a range slider |
| `marks` | `boolean` or `array` or `object` | `false` | Displays marks on the slider track |
| `valueLabelDisplay` | `'on'` \| `'auto'` \| `'off'` | `'off'` | Controls value label display |
| `valueLabelFormat` | `function` | `(x) => x` | Formats the displayed value label |
| `color` | `string` | `'primary'` | Color of the slider |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Size of the slider |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | Orientation of the slider |
| `track` | `'normal'` \| `'inverted'` \| `'false'` | `'normal'` | Display of the track |
| `disabled` | `boolean` | `false` | If `true`, slider is disabled |
| `ariaLabel` | `string` | | Accessibility label |
| `ariaLabelledby` | `string` | | ID of element that labels the slider |

## Usage Examples

### Basic Slider

```jsx
import { SliderAdapted } from '../../../design-system/adapter';

function BasicSlider() {
  const [value, setValue] = React.useState(30);
  
  const handleChange = (newValue) => {
    setValue(newValue);
  };
  
  return (
    <SliderAdapted
      value={value}
      onChange={handleChange}
      aria-label="Volume"
    />
  );
}
```

### Range Slider

```jsx
import { SliderAdapted } from '../../../design-system/adapter';

function RangeSlider() {
  const [value, setValue] = React.useState([20, 70]);
  
  const handleChange = (newValue) => {
    setValue(newValue);
  };
  
  return (
    <SliderAdapted
      range
      value={value}
      onChange={handleChange}
      aria-label="Price range"
    />
  );
}
```

### Slider with Marks and Labels

```jsx
import { SliderAdapted } from '../../../design-system/adapter';

function MarkedSlider() {
  const marks = [
    {
      value: 0,
      label: '0°C',
    },
    {
      value: 25,
      label: '25°C',
    },
    {
      value: 50,
      label: '50°C',
    },
    {
      value: 75,
      label: '75°C',
    },
    {
      value: 100,
      label: '100°C',
    },
  ];
  
  return (
    <SliderAdapted
      defaultValue={50}
      marks={marks}
      valueLabelDisplay="on"
      aria-label="Temperature"
    />
  );
}
```

### Vertical Slider

```jsx
import { SliderAdapted } from '../../../design-system/adapter';

function VerticalSlider() {
  return (
    <div style={{ height: 300 }}>
      <SliderAdapted
        orientation="vertical"
        defaultValue={50}
        aria-label="Volume"
        sx={{ height: '100%' }}
      />
    </div>
  );
}
```

### Custom Colored Slider

```jsx
import { SliderAdapted } from '../../../design-system/adapter';

function ColoredSlider() {
  return (
    <div>
      <SliderAdapted
        defaultValue={30}
        color="secondary"
        aria-label="Secondary"
      />
      <SliderAdapted
        defaultValue={50}
        color="success"
        aria-label="Success"
      />
      <SliderAdapted
        defaultValue={70}
        color="warning"
        aria-label="Warning"
      />
    </div>
  );
}
```

## Accessibility

The SliderAdapted component implements the following accessibility features:

- Follows WAI-ARIA Slider pattern
- Supports keyboard navigation:
  - Arrow keys for value adjustment
  - Home/End keys to jump to min/max values
- Properly labeled with aria-label or aria-labelledby
- Focus indication for keyboard users
- Touch support for mobile devices

## Customization

The slider appearance can be customized using the `sx` prop:

```jsx
<SliderAdapted
  defaultValue={50}
  sx={{
    '& .MuiSlider-thumb': {
      borderRadius: '0px',
      width: 16,
      height: 16,
    },
    '& .MuiSlider-track': {
      height: 8,
    },
    '& .MuiSlider-rail': {
      height: 8,
    },
  }}
/>
```