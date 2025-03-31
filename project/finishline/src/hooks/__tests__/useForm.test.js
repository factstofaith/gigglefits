/**
 * useForm Tests
 * 
 * Tests for the useForm hook.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import useForm from '../useForm';

// Mock event for testing
const createMockEvent = (name, value, type = 'text', checked = false) => ({
  target: { name, value, type, checked },
  preventDefault: jest.fn(),
});

describe('useForm', () => {
  describe('Initialization', () => {
    it('initializes with provided values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(initialValues));
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.submitCount).toBe(0);
    });
    
    it('validates on mount when validateOnMount is true', () => {
      const initialValues = { name: '', email: 'invalid' };
      const validate = values => {
        const errors = {};
        if (!values.name) errors.name = 'Name is required';
        if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Invalid email';
        return errors;
      };
      
      const { result } = renderHook(() => useForm(initialValues, validate, jest.fn(), { validateOnMount: true }));
      
      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Invalid email',
      });
      expect(result.current.isValid).toBe(false);
    });
  });
  
  describe('Field handling', () => {
    it('updates values on handleChange', () => {
      const { result } = renderHook(() => useForm({ name: '' }));
      
      act(() => {
        result.current.handleChange(createMockEvent('name', 'John'));
      });
      
      expect(result.current.values.name).toBe('John');
      expect(result.current.isDirty).toBe(true);
    });
    
    it('handles checkbox inputs correctly', () => {
      const { result } = renderHook(() => useForm({ remember: false }));
      
      act(() => {
        result.current.handleChange(createMockEvent('remember', '', 'checkbox', true));
      });
      
      expect(result.current.values.remember).toBe(true);
    });
    
    it('updates touched state on handleBlur', () => {
      const { result } = renderHook(() => useForm({ name: '' }));
      
      act(() => {
        result.current.handleBlur(createMockEvent('name', ''));
      });
      
      expect(result.current.touched.name).toBe(true);
    });
    
    it('uses setFieldValue to update field value', () => {
      const { result } = renderHook(() => useForm({ name: '' }));
      
      act(() => {
        result.current.setFieldValue('name', 'John');
      });
      
      expect(result.current.values.name).toBe('John');
      expect(result.current.isDirty).toBe(true);
    });
  });
  
  describe('Validation', () => {
    const validate = values => {
      const errors = {};
      if (!values.name) errors.name = 'Name is required';
      if (values.password && values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      return errors;
    };
    
    it('validates fields on change when validateOnChange is true', () => {
      const { result } = renderHook(() => useForm({ name: 'John', password: '' }, validate));
      
      act(() => {
        result.current.handleChange(createMockEvent('password', '1234'));
      });
      
      expect(result.current.errors.password).toBe('Password must be at least 8 characters');
      expect(result.current.isValid).toBe(false);
    });
    
    it('validates fields on blur when validateOnBlur is true', () => {
      const { result } = renderHook(() => useForm({ name: '', password: '1234' }, validate));
      
      act(() => {
        result.current.handleBlur(createMockEvent('name', ''));
      });
      
      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.password).toBe('Password must be at least 8 characters');
      expect(result.current.isValid).toBe(false);
    });
    
    it('does not validate on change when validateOnChange is false', () => {
      const { result } = renderHook(() => 
        useForm({ name: '', password: '' }, validate, jest.fn(), { validateOnChange: false })
      );
      
      act(() => {
        result.current.handleChange(createMockEvent('password', '1234'));
      });
      
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });
    
    it('does not validate on blur when validateOnBlur is false', () => {
      const { result } = renderHook(() => 
        useForm({ name: '', password: '' }, validate, jest.fn(), { validateOnBlur: false })
      );
      
      act(() => {
        result.current.handleBlur(createMockEvent('name', ''));
      });
      
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });
  });
  
  describe('Form submission', () => {
    it('calls onSubmit with values when form is valid', async () => {
      const onSubmit = jest.fn();
      const values = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(values, () => ({}), onSubmit));
      
      await act(async () => {
        const success = await result.current.handleSubmit();
        expect(success).toBe(true);
      });
      
      expect(onSubmit).toHaveBeenCalledWith(values);
      expect(result.current.submitCount).toBe(1);
      expect(result.current.touched).toEqual({ name: true, email: true });
    });
    
    it('does not call onSubmit when form is invalid', async () => {
      const onSubmit = jest.fn();
      const validate = () => ({ name: 'Name is required' });
      const { result } = renderHook(() => useForm({ name: '' }, validate, onSubmit));
      
      await act(async () => {
        const success = await result.current.handleSubmit();
        expect(success).toBe(false);
      });
      
      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.submitCount).toBe(1);
      expect(result.current.touched).toEqual({ name: true });
    });
    
    it('sets isSubmitting flag during submission', async () => {
      const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 10)));
      const { result } = renderHook(() => useForm({ name: 'John' }, () => ({}), onSubmit));
      
      let submissionPromise;
      
      act(() => {
        submissionPromise = result.current.handleSubmit();
        expect(result.current.isSubmitting).toBe(true);
      });
      
      await act(async () => {
        await submissionPromise;
      });
      
      expect(result.current.isSubmitting).toBe(false);
    });
    
    it('handles errors during submission', async () => {
      const error = new Error('Submission failed');
      const onSubmit = jest.fn(() => Promise.reject(error));
      const { result } = renderHook(() => useForm({ name: 'John' }, () => ({}), onSubmit));
      
      // Mock console.error to prevent error output in tests
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(console.error).toHaveBeenCalledWith('Form submission error:', error);
      expect(result.current.isSubmitting).toBe(false);
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });
  
  describe('Form reset', () => {
    it('resets form to initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(initialValues));
      
      act(() => {
        result.current.handleChange(createMockEvent('name', 'Jane'));
        result.current.handleBlur(createMockEvent('name', 'Jane'));
      });
      
      expect(result.current.values.name).toBe('Jane');
      expect(result.current.touched.name).toBe(true);
      
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });
    
    it('can reset form with new values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const newValues = { name: 'Jane', email: 'jane@example.com' };
      const { result } = renderHook(() => useForm(initialValues));
      
      act(() => {
        result.current.resetForm(newValues);
      });
      
      expect(result.current.values).toEqual(newValues);
      expect(result.current.isDirty).toBe(false);
    });
  });
  
  describe('Field helpers', () => {
    it('getFieldProps returns correct props', () => {
      const { result } = renderHook(() => useForm(
        { name: 'John' },
        values => (values.name ? {} : { name: 'Required' })
      ));
      
      const nameProps = result.current.getFieldProps('name');
      
      expect(nameProps).toEqual({
        name: 'name',
        id: 'name',
        value: 'John',
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        'aria-invalid': 'false',
        'aria-describedby': undefined,
      });
      
      act(() => {
        result.current.setFieldValue('name', '');
      });
      
      const invalidProps = result.current.getFieldProps('name');
      
      expect(invalidProps['aria-invalid']).toBe('true');
      expect(invalidProps['aria-describedby']).toBe('name-error');
    });
    
    it('getFieldMeta returns correct meta info', () => {
      const initialValues = { name: 'John' };
      const { result } = renderHook(() => useForm(
        initialValues,
        values => (values.name ? {} : { name: 'Required' })
      ));
      
      let meta = result.current.getFieldMeta('name');
      
      expect(meta).toEqual({
        value: 'John',
        error: undefined,
        touched: false,
        isDirty: false,
      });
      
      act(() => {
        result.current.handleChange(createMockEvent('name', 'Jane'));
        result.current.handleBlur(createMockEvent('name', 'Jane'));
      });
      
      meta = result.current.getFieldMeta('name');
      
      expect(meta).toEqual({
        value: 'Jane',
        error: undefined,
        touched: true,
        isDirty: true,
      });
    });
    
    it('getFieldHelpers returns helper functions', () => {
      const { result } = renderHook(() => useForm({ name: '' }));
      
      const helpers = result.current.getFieldHelpers('name');
      
      expect(helpers).toEqual({
        setValue: expect.any(Function),
        setTouched: expect.any(Function),
        setError: expect.any(Function),
      });
      
      act(() => {
        helpers.setValue('John');
        helpers.setTouched(true);
        helpers.setError('Custom error');
      });
      
      expect(result.current.values.name).toBe('John');
      expect(result.current.touched.name).toBe(true);
      expect(result.current.errors.name).toBe('Custom error');
    });
  });
});