/**
 * Breakpoints for responsive design
 */

export const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const breakpoints = {
  values: breakpointValues,
  up: key => `@media (min-width: ${breakpointValues[key]}px)`,
  down: key => `@media (max-width: ${breakpointValues[key] - 0.05}px)`,
  between: (start, end) =>
    `@media (min-width: ${breakpointValues[start]}px) and (max-width: ${breakpointValues[end] - 0.05}px)`,
};

export default breakpoints;
