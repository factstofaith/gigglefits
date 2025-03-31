/**
 * Test Data Generators - Root Export
 * 
 * This module exports all test data generators from a single location.
 * These generators can be used in both Jest and Cypress test environments.
 * 
 * @version 1.0.0
 */

// Re-export all generators
export * from './generators/entityGenerators';
export * from './generators/uiStateGenerators';
export * from './generators/integrationGenerators';
export * from './generators/contextGenerators';

// Export default object with all generators
import * as entityGenerators from './generators/entityGenerators';
import * as uiStateGenerators from './generators/uiStateGenerators';
import * as integrationGenerators from './generators/integrationGenerators';
import * as contextGenerators from './generators/contextGenerators';

export default {
  ...entityGenerators,
  ...uiStateGenerators,
  ...integrationGenerators,
  ...contextGenerators
};