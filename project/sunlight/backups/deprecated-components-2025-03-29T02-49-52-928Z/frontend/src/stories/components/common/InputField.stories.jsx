import React, { useState } from 'react';
import InputField from '@components/common/InputField';

/**
 * InputField component documentation
 * 
 * This is the InputField component from the common components library.
 * It's a modern input field with brand color highlight on focus, supporting various input types.
 */
export default {
  title: 'Components/Common/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Modern input field with brand color highlight on focus.
          Supports various input types and error states.`,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    type: { 
      control: { type: 'select' }, 
      options: ['text', 'password', 'email', 'number', 'date', 'tel'] 
    },
    value: { control: 'text' },
    onChange: { action: 'changed' },
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Input Label',
    type: 'text',
    placeholder: 'Enter value...',
    error: false,
    disabled: false,
    required: false,
  },
};

/**
 * Default input field story
 */
export const Default = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: '300px' }}>
        <InputField 
          {...args} 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
        />
      </div>
    );
  },
};

/**
 * Input field with error
 */
export const WithError = {
  args: {
    error: true,
    helperText: 'This field contains an error',
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: '300px' }}>
        <InputField 
          {...args} 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
        />
      </div>
    );
  },
};

/**
 * Password input type
 */
export const PasswordInput = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password...',
    helperText: 'Password must be at least 8 characters',
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: '300px' }}>
        <InputField 
          {...args} 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
        />
      </div>
    );
  },
};

/**
 * Disabled input field
 */
export const DisabledInput = {
  args: {
    disabled: true,
    value: 'Cannot edit this value',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <InputField {...args} onChange={() => {}} />
    </div>
  ),
};

/**
 * Required input field
 */
export const RequiredInput = {
  args: {
    label: 'Email (Required)',
    type: 'email',
    placeholder: 'Enter your email...',
    required: true,
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: '300px' }}>
        <InputField 
          {...args} 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
        />
      </div>
    );
  },
};

/**
 * Form with multiple fields
 */
export const FormExample = {
  render: () => {
    const [formState, setFormState] = useState({
      name: '',
      email: '',
      password: '',
      age: '',
    });
    
    const handleChange = (field) => (e) => {
      setFormState({
        ...formState,
        [field]: e.target.value,
      });
    };
    
    return (
      <div style={{ width: '400px' }}>
        <InputField 
          label="Full Name&quot; 
          value={formState.name}
          onChange={handleChange("name')}
          placeholder="Enter your full name&quot;
          required
        />
        <InputField 
          label="Email Address" 
          type="email&quot;
          value={formState.email}
          onChange={handleChange("email')}
          placeholder="Enter your email&quot;
          required
        />
        <InputField 
          label="Password" 
          type="password&quot;
          value={formState.password}
          onChange={handleChange("password')}
          placeholder="Create a password&quot;
          helperText="Password must be at least 8 characters"
          required
        />
        <InputField 
          label="Age&quot; 
          type="number"
          value={formState.age}
          onChange={handleChange('age')}
          placeholder="Enter your age&quot;
        />
        <button 
          style={{ 
            marginTop: "16px', 
            padding: '8px 16px', 
            backgroundColor: '#fc741c', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Submit Form
        </button>
      </div>
    );
  },
};