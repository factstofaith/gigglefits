# TypeScript Migration Guide

## Overview

This guide outlines the process for migrating existing components to use TypeScript type definitions provided by the design system. It provides step-by-step instructions and examples to help you transition your code to leverage the type safety benefits.

## Migration Steps

### 1. Adding TypeScript JSDoc to JavaScript Files

The simplest way to add type checking to existing JavaScript files is to use JSDoc annotations:

```jsx
// Before
import React from 'react';
import { Button } from '@design-system/adapter';

function MyComponent({ title, onAction }) {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Click me</Button>
    </div>
  );
}

export default MyComponent;
```

```jsx
// After
import React from 'react';
import { Button } from '@design-system/adapter';

/**
 * @typedef {Object} MyComponentProps
 * @property {string} title - The title of the component
 * @property {() => void} onAction - The action callback
 */

/**
 * @type {React.FC<MyComponentProps>}
 */
function MyComponent({ title, onAction }) {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Click me</Button>
    </div>
  );
}

export default MyComponent;
```

### 2. Using Imported Types in JSDoc

You can reference design system types directly in your JSDoc:

```jsx
import React from 'react';
import { Button } from '@design-system/adapter';

/**
 * @typedef {Object} MyComponentProps
 * @property {string} title - The title of the component
 * @property {() => void} onAction - The action callback
 * @property {import('@design-system/types').ButtonProps} buttonProps - Props for the button
 */

/**
 * @type {React.FC<MyComponentProps>}
 */
function MyComponent({ title, onAction, buttonProps }) {
  return (
    <div>
      <h2>{title}</h2>
      <Button {...buttonProps} onClick={onAction}>Click me</Button>
    </div>
  );
}

export default MyComponent;
```

### 3. Converting to TypeScript (.tsx)

For full TypeScript support, convert your files to TypeScript:

```tsx
import React from 'react';
import { Button } from '@design-system/adapter';
import { ButtonProps } from '@design-system/types';

interface MyComponentProps {
  title: string;
  onAction: () => void;
  buttonProps?: ButtonProps;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction, buttonProps }) => {
  return (
    <div>
      <h2>{title}</h2>
      <Button {...buttonProps} onClick={onAction}>Click me</Button>
    </div>
  );
};

export default MyComponent;
```

## Using Complex Components

### Data Grid Example

```jsx
import React from 'react';
import { DataGrid } from '@design-system/adapter';

/**
 * @typedef {Object} UserData
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 */

/**
 * @type {React.FC<{users: UserData[]}>}
 */
function UserGrid({ users }) {
  /** @type {import('@design-system/types').DataGridAdaptedProps<UserData>} */
  const gridProps = {
    id: 'user-grid',
    columns: [
      { field: 'name', headerName: 'Name' },
      { field: 'email', headerName: 'Email' }
    ],
    rows: users,
    height: 400
  };
  
  return <DataGrid {...gridProps} />;
}

export default UserGrid;
```

### Form Components Example

```jsx
import React from 'react';
import { TextField, Button } from '@design-system/adapter';

/**
 * @typedef {Object} FormData
 * @property {string} name
 * @property {string} email
 */

/**
 * @type {React.FC<{onSubmit: (data: FormData) => void}>}
 */
function ContactForm({ onSubmit }) {
  /** @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]} */
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  });
  
  /** 
   * @param {React.ChangeEvent<HTMLInputElement>} e 
   */
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField 
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default ContactForm;
```

## Testing TypeScript Integration

1. Run the TypeScript checker:
   ```bash
   npm run typecheck
   ```

2. Monitor changes during development:
   ```bash
   npm run typecheck:watch
   ```

3. Generate a TypeScript report:
   ```bash
   npm run typecheck:report
   ```

## Common Migration Issues

### Issue: Property does not exist on type
**Solution**: Verify prop names match the component's interface

### Issue: Type is incompatible
**Solution**: Use proper type casting or modify your code to match the expected types

### Issue: Cannot find module
**Solution**: Ensure paths are correct in imports and tsconfig.json

## Migration Strategy

1. Start with shared components most widely used in the application
2. Add JSDoc annotations first before converting to TypeScript
3. Focus on prop types before implementing function return types
4. Run type checking frequently to catch issues early
5. Update one file at a time to manage complexity

## Need Help?

Refer to the `TYPESCRIPT_GUIDE.md` document for more details on the type system, or contact the design system team for assistance with complex migration scenarios.