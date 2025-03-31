/**
 * @file transitions.js
 * @description Transition tokens for the TAP Integration Platform design system.
 * Defines consistent animation durations, easings, and properties.
 */

/**
 * Duration tokens
 * Defines consistent animation durations in milliseconds
 */
export const duration = {
  instant: 0,
  fastest: 50,
  fast: 100,
  normal: 200,
  slow: 300,
  slowest: 500,

  // Named tokens for specific interactions
  hover: 150,
  focus: 200,
  press: 100,
  expand: 250,
  collapse: 200,
  slide: 300,
  fade: 200,
  modal: 300,
};

/**
 * Easing tokens
 * Defines CSS easing functions for consistent animation curves
 */
export const easing = {
  // Basic easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Material-inspired easings
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard interactions
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)', // Accelerated interactions
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)', // Decelerated interactions
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', // Sharp interactions

  // Spring-like easings
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

/**
 * Transition property tokens
 * Defines which CSS properties should animate
 */
export const property = {
  none: 'none',
  all: 'all',
  common: 'color, background-color, border-color, box-shadow, opacity, transform',
  colors: 'color, background-color, border-color',
  opacity: 'opacity',
  transform: 'transform',
  shadow: 'box-shadow',
  size: 'width, height',
  position: 'top, right, bottom, left',
};

/**
 * Predefined transitions
 * Common transition combinations for consistent usage
 */
export const transitions = {
  none: 'none',

  // Basic transitions
  default: `${property.common} ${duration.normal}ms ${easing.standard}`,

  // Button transitions
  button: `${property.common} ${duration.fast}ms ${easing.standard}`,

  // Hover effect transitions
  hover: `${property.colors} ${duration.hover}ms ${easing.easeOut}`,

  // Expansion transitions
  expand: `${property.common} ${duration.expand}ms ${easing.easeOut}`,
  collapse: `${property.common} ${duration.collapse}ms ${easing.easeOut}`,

  // Fade transitions
  fade: `opacity ${duration.fade}ms ${easing.easeInOut}`,
  fadeIn: `opacity ${duration.fade}ms ${easing.easeOut}`,
  fadeOut: `opacity ${duration.fade}ms ${easing.easeIn}`,

  // Modal and overlay transitions
  modal: `${property.transform}, ${property.opacity} ${duration.modal}ms ${easing.easeOut}`,

  // Custom transitions for specific components
  card: `${property.shadow}, ${property.transform} ${duration.hover}ms ${easing.easeOut}`,
  tooltip: `${property.opacity}, ${property.transform} ${duration.fast}ms ${easing.easeOut}`,
  dropdown: `${property.common} ${duration.normal}ms ${easing.standard}`,
};

export default {
  duration,
  easing,
  property,
  transitions,
};
