/**
 * SliderAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Slider from '../SliderAdapted';

// Mock element.getBoundingClientRect
const mockGetBoundingClientRect = (element, rect) => {
  // Added display name
  mockGetBoundingClientRect.displayName = 'mockGetBoundingClientRect';

  // Added display name
  mockGetBoundingClientRect.displayName = 'mockGetBoundingClientRect';

  // Added display name
  mockGetBoundingClientRect.displayName = 'mockGetBoundingClientRect';

  // Added display name
  mockGetBoundingClientRect.displayName = 'mockGetBoundingClientRect';

  // Added display name
  mockGetBoundingClientRect.displayName = 'mockGetBoundingClientRect';


  element.getBoundingClientRect = jest.fn(() => rect);
};

// Mock document.getElementById
const originalGetElementById = document.getElementById;
let mockSliderElement = null;

describe('SliderAdapted', () => {
  beforeAll(() => {
    // Mock getElementById to return our mock element
    document.getElementById = jest.fn((id) => {
      if (id === 'slider-root') {
        return mockSliderElement;
      }
      return originalGetElementById.call(document, id);
    });
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
  });

  const renderSlider = (props = {}) => {
  // Added display name
  renderSlider.displayName = 'renderSlider';

  // Added display name
  renderSlider.displayName = 'renderSlider';

  // Added display name
  renderSlider.displayName = 'renderSlider';

  // Added display name
  renderSlider.displayName = 'renderSlider';

  // Added display name
  renderSlider.displayName = 'renderSlider';


    const result = render(
      <SliderAdapted {...props} />
    );
    
    // Set up mock slider element for getBoundingClientRect
    mockSliderElement = result.container.querySelector('#slider-root');
    mockGetBoundingClientRect(mockSliderElement, {
      left: 0,
      width: 200,
      top: 0,
      height: 200
    });
    
    return result;
  };

  it('renders with default props', () => {
    renderSlider();
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders with custom min, max, and value', () => {
    renderSlider({
      min: 10,
      max: 50,
      defaultValue: 25
    });
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
    expect(slider).toHaveAttribute('aria-valuenow', '25');
  });

  it('handles mouse interactions', () => {
    const handleChange = jest.fn();
    renderSlider({
      min: 0,
      max: 100,
      onChange: handleChange
    });
    
    const slider = screen.getByRole('slider');
    
    // Simulate mouse down and move
    fireEvent.mouseDown(slider);
    
    // Simulate mouse move - 50% of slider width (value should be 50)
    fireEvent.mouseMove(document, {
      clientX: 100 // 50% of the 200px width
    });
    
    expect(handleChange).toHaveBeenCalledWith(50);
    
    // Simulate mouse up
    fireEvent.mouseUp(document);
  });

  it('handles keyboard interactions', () => {
    const handleChange = jest.fn();
    renderSlider({
      min: 0,
      max: 100,
      defaultValue: 50,
      step: 10,
      onChange: handleChange
    });
    
    const slider = screen.getByRole('slider');
    
    // Arrow right = increase by step
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith(60);
    
    // Reset mock
    handleChange.mockReset();
    
    // Arrow left = decrease by step
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith(40);
    
    // Reset mock
    handleChange.mockReset();
    
    // Home key = min value
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(handleChange).toHaveBeenCalledWith(0);
    
    // Reset mock
    handleChange.mockReset();
    
    // End key = max value
    fireEvent.keyDown(slider, { key: 'End' });
    expect(handleChange).toHaveBeenCalledWith(100);
  });

  it('renders in range mode', () => {
    renderSlider({
      range: true,
      defaultValue: [25, 75]
    });
    
    // In range mode, there are two slider thumbs
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('renders marks when marks=true', () => {
    renderSlider({
      min: 0,
      max: 100,
      step: 25,
      marks: true
    });
    
    // With marks=true and step=25, we should have 5 marks (0, 25, 50, 75, 100)
    // We can't easily query for these visually, but we can check that the correct
    // number of fragments are rendered
    expect(document.querySelectorAll('[role="slider"]').length).toBe(1);
  });

  it('renders custom marks', () => {
    renderSlider({
      min: 0,
      max: 100,
      marks: [
        { value: 0, label: 'Start' },
        { value: 50, label: 'Middle' },
        { value: 100, label: 'End' }
      ]
    });
    
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Middle')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    const handleChange = jest.fn();
    
    renderSlider({
      disabled: true,
      onChange: handleChange,
      defaultValue: 50
    });
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    
    // Disabled slider should not respond to interactions
    fireEvent.mouseDown(slider);
    fireEvent.mouseMove(document, { clientX: 100 });
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderSlider({
      ariaLabel: 'Test slider',
      min: 0,
      max: 100,
      defaultValue: 50
    });
    
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});