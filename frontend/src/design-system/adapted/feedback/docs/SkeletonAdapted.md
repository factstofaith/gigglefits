# SkeletonAdapted

The `SkeletonAdapted` component provides a placeholder preview for content that is loading. It mitigates the feeling of slowness by displaying shapes that approximate the content that will eventually appear, improving perceived performance.

## Features

- **Multiple shape variants** (text, circle, rectangular, rounded)
- **Animation options** (pulse, wave)
- **Customizable dimensions**
- **Multiple line support** for text variants
- **Accessibility support** with proper ARIA attributes

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text'` \| `'circle'` \| `'rect'` \| `'rectangular'` \| `'rounded'` | `'text'` | Type of skeleton |
| `animation` | `'pulse'` \| `'wave'` \| `'false'` \| `false` | `'pulse'` | Animation effect |
| `width` | `number` \| `string` | variant-specific | Width of the skeleton |
| `height` | `number` \| `string` | variant-specific | Height of the skeleton |
| `lines` | `number` | `1` | Number of lines for text variant |
| `diameter` | `number` \| `string` | `40` | Size for circle variant |

## Usage Examples

### Basic Usage

```jsx
import { SkeletonAdapted } from '../../../design-system/adapter';

function BasicSkeleton() {
  return (
    <div>
      <SkeletonAdapted variant="text" />
      <SkeletonAdapted variant="circle" />
      <SkeletonAdapted variant="rectangular" height={100} />
    </div>
  );
}
```

### Text with Multiple Lines

```jsx
import { SkeletonAdapted } from '../../../design-system/adapter';

function TextSkeleton() {
  return (
    <div>
      <SkeletonAdapted variant="text" lines={3} />
    </div>
  );
}
```

### Different Animation Types

```jsx
import { SkeletonAdapted, Box } from '../../../design-system/adapter';

function AnimatedSkeletons() {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box width={200}>
        <SkeletonAdapted animation="pulse" height={200} />
        <Typography>Pulse Animation</Typography>
      </Box>
      
      <Box width={200}>
        <SkeletonAdapted animation="wave" height={200} />
        <Typography>Wave Animation</Typography>
      </Box>
      
      <Box width={200}>
        <SkeletonAdapted animation={false} height={200} />
        <Typography>No Animation</Typography>
      </Box>
    </Box>
  );
}
```

### Complex Content Example

```jsx
import { SkeletonAdapted, Card, CardContent, Box } from '../../../design-system/adapter';

function ProfileCardSkeleton() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SkeletonAdapted variant="circle" diameter={40} />
          <Box sx={{ ml: 2 }}>
            <SkeletonAdapted variant="text" width={120} />
            <SkeletonAdapted variant="text" width={80} />
          </Box>
        </Box>
        
        <SkeletonAdapted variant="rectangular" height={200} />
        
        <Box sx={{ mt: 2 }}>
          <SkeletonAdapted variant="text" />
          <SkeletonAdapted variant="text" />
          <SkeletonAdapted variant="text" width="60%" />
        </Box>
      </CardContent>
    </Card>
  );
}
```

### Conditionally Showing Content or Skeleton

```jsx
import { SkeletonAdapted, Typography } from '../../../design-system/adapter';
import { useState, useEffect } from 'react';

function ConditionalSkeleton() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setData('Content has loaded!');
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      {loading ? (
        <SkeletonAdapted variant="text" width={200} height={30} />
      ) : (
        <Typography variant="h4">{data}</Typography>
      )}
    </div>
  );
}
```

## Accessibility

The SkeletonAdapted component implements the following accessibility features:

- Proper ARIA roles and attributes (`role="progressbar"`, `aria-busy="true"`)
- Appropriate value range attributes (`aria-valuemin="0"`, `aria-valuemax="100"`)
- Additional lines for text skeletons are hidden from screen readers (`aria-hidden="true"`)

These features ensure that screen reader users are aware that content is loading, without announcing each individual skeleton element.

## Customization

The skeleton appearance can be customized using the `sx` prop:

```jsx
<SkeletonAdapted 
  variant="text" 
  width={200} 
  sx={{
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Lighter color
    borderRadius: 8, // Rounded corners
    transform: 'skewX(-10deg)', // Slight skew effect
  }}
/>
```