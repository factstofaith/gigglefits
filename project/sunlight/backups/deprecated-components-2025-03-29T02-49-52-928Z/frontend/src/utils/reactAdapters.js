/**
 * React 18 Compatibility Adapters
 * 
 * This index file exports all the React adapter components designed to ensure
 * compatibility with React 18, especially for third-party dependencies that
 * may have issues with React 18's new features and rendering behavior.
 */

// Export the ErrorBoundary component from design system
export { ErrorBoundary } from '../design-system/adapted/index';

// Export the HOC wrapper for React 18 compatibility
export { default as withReact18Compatibility } from './withReact18Compatibility';

// Export specific component adapters
export { default as ReactJsonAdapter } from './ReactJsonAdapter';

// Add other adapters as they are created
// export { default as SomeOtherAdapter } from './SomeOtherAdapter';

/**
 * Usage examples:
 * 
 * 1. Using ReactJsonAdapter:
 * ```jsx
 * import { ReactJsonAdapter } from './path/to/react_adapters';
 * 
 * function MyComponent({ data }) {
 *   return <ReactJsonAdapter src={data} theme="monokai" />;
 * }
 * ```
 * 
 * 2. Creating a custom adapter with withReact18Compatibility:
 * ```jsx
 * import { withReact18Compatibility } from './path/to/react_adapters';
 * import SomeComponent from 'some-library';
 * 
 * const CompatibleComponent = withReact18Compatibility(SomeComponent, {
 *   fallback: MyFallbackComponent,
 *   enableLogging: true
 * });
 * 
 * function MyComponent(props) {
 *   return <CompatibleComponent {...props} />;
 * }
 * ```
 * 
 * 3. Using ErrorBoundary directly:
 * ```jsx
 * import { ErrorBoundary } from './path/to/react_adapters';
 * 
 * function MyComponent() {
 *   return (
 *     <ErrorBoundary fallback={MyFallbackComponent}>
 *       <ComponentThatMightError />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */