// Components accelerator index file
// Exports all production-ready component templates and generators

import TransformationNodeTemplate from './TransformationNodeTemplate';
import { 
  generateTransformationNode, 
  generateComponentFile 
} from './ComponentGenerator';

export {
  // Templates
  TransformationNodeTemplate,
  
  // Generators
  generateTransformationNode,
  generateComponentFile
};

/**
 * Components Accelerator
 * 
 * This module provides production-ready component templates and generators
 * to speed up development while maintaining high quality standards.
 * 
 * Principles:
 * 
 * 1. Production-Ready: All templates include built-in validation, error handling,
 *    accessibility features, and performance optimizations.
 * 
 * 2. Zero Technical Debt: Components are designed with best practices from
 *    the start, eliminating the need for future refactoring.
 * 
 * 3. Consistent Patterns: All generated components follow the same patterns,
 *    making the codebase more maintainable.
 * 
 * 4. Developer Experience: Generators make it easy to create new components
 *    without having to write boilerplate code.
 * 
 * Usage:
 * 
 * 1. For quick component creation:
 *    ```
 *    import { generateComponentFile } from './accelerators/components';
 *    
 *    const config = {
 *      name: 'MyTransformationNode',
 *      type: 'transformation',
 *      description: 'Transforms data in a specific way',
 *      // ...other config
 *    };
 *    
 *    const code = generateComponentFile(config);
 *    ```
 * 
 * 2. For custom implementations using the templates:
 *    ```
 *    import { TransformationNodeTemplate } from './accelerators/components';
 *    
 *    const MyCustomNode = (props) => {
 *      return (
 *        <TransformationNodeTemplate
 *          title="My Custom Node"
 *          // ...other props
 *        />
 *      );
 *    };
 *    ```
 */