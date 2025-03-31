# AvatarAdapted

The `AvatarAdapted` component is used to represent a user, entity, or object with an image, initials, or icon.

## Features

- **Multiple shapes** - circular, rounded, or square avatars
- **Various sizes** - predefined or custom sizes
- **Fallback mechanisms** - displays initials when image is unavailable
- **Color customization** - themed or custom colors
- **Image handling** - optimized image rendering with fallbacks

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alt` | `string` | `''` | Alternative text for the avatar. Also used to generate initials when image is not available. |
| `children` | `node` | | The content of the component. Used as a fallback when `src` is not available. |
| `color` | `'default'` \| `'primary'` \| `'secondary'` \| `'error'` \| `'info'` \| `'success'` \| `'warning'` \| `string` | `'default'` | The color of the component. |
| `imgProps` | `object` | `{}` | Props applied to the img element if the component is used to display an image. |
| `size` | `'small'` \| `'medium'` \| `'large'` \| `'xlarge'` \| `number` | `'medium'` | The size of the avatar. |
| `sizes` | `string` | `''` | The `sizes` attribute for the img element. |
| `src` | `string` | | The source of the image. |
| `srcSet` | `string` | `''` | The `srcSet` attribute for the img element. |
| `variant` | `'circular'` \| `'rounded'` \| `'square'` | `'circular'` | The shape of the avatar. |

## Usage Examples

### Basic Avatar with Image

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';

function UserAvatar() {
  return (
    <AvatarAdapted
      alt="Jane Doe"
      src="/images/jane-doe.jpg"
      size="medium"
    />
  );
}
```

### Initials Avatar

When no `src` or `children` are provided, the component will generate initials from the `alt` text.

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';

function UserInitialsAvatar() {
  return (
    <AvatarAdapted
      alt="Jane Doe"
      size="large"
      color="primary"
    />
  );
}
```

### Avatar with Icon

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';
import PersonIcon from '@mui/icons-material/Person';

function IconAvatar() {
  return (
    <AvatarAdapted
      size="medium"
      color="success"
    >
      <PersonIcon />
    </AvatarAdapted>
  );
}
```

### Avatars with Different Shapes

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';
import { Box } from '../../../design-system/adapter';

function AvatarShapes() {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <AvatarAdapted
        alt="Circular Avatar"
        variant="circular"
        color="primary"
      />
      <AvatarAdapted
        alt="Rounded Avatar"
        variant="rounded"
        color="secondary"
      />
      <AvatarAdapted
        alt="Square Avatar"
        variant="square"
        color="error"
      />
    </Box>
  );
}
```

### Avatars with Different Sizes

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';
import { Box } from '../../../design-system/adapter';

function AvatarSizes() {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <AvatarAdapted
        alt="Small Avatar"
        size="small"
        color="primary"
      />
      <AvatarAdapted
        alt="Medium Avatar"
        size="medium"
        color="primary"
      />
      <AvatarAdapted
        alt="Large Avatar"
        size="large"
        color="primary"
      />
      <AvatarAdapted
        alt="XLarge Avatar"
        size="xlarge"
        color="primary"
      />
      <AvatarAdapted
        alt="Custom Size Avatar"
        size={72}
        color="primary"
      />
    </Box>
  );
}
```

### Avatar with Custom Color

```jsx
import { AvatarAdapted } from '../../../design-system/adapter';

function CustomColorAvatar() {
  return (
    <AvatarAdapted
      alt="Custom Color"
      color="#ff5722"
    />
  );
}
```

## Accessibility

The component handles accessibility features:

1. When used with an image, the `alt` attribute provides descriptive text for screen readers
2. If no image is provided, initials are generated from the `alt` text for visual representation
3. The component ensures sufficient color contrast for text content

## Customization

The component can be customized with:

1. Color themes matching the application design system
2. Custom sizes beyond the predefined options
3. Different shapes for various use cases
4. Custom image handling through `imgProps`