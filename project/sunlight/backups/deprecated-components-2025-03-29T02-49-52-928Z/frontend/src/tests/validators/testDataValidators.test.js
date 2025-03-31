/**
 * Test suite for test data validators
 */
import {
  validate,
  validateUser,
  validateTenant,
  validateUserWithRelationships,
  validateAllRelationships,
  formatErrors,
  formatRelationshipErrors
} from '../../shared/testData/validators';
import { userSchema } from '../../shared/testData/validators/entitySchemas';
import mockFactory from '../utils/mockFactory';

describe('Test Data Validators', () => {
  describe('Schema Validation', () => {
    it('validates a valid user', () => {
      const user = mockFactory.createUser();
      const result = validateUser(user);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('detects missing required fields', () => {
      const user = mockFactory.createUser();
      delete user.name;
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });
    
    it('validates custom field types', () => {
      const user = mockFactory.createUser({ role: 'invalid-role' });
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('role');
    });
    
    it('formats validation errors', () => {
      const user = mockFactory.createUser({ role: 'invalid-role' });
      delete user.email;
      const result = validate(user, userSchema);
      const formattedErrors = formatErrors(result.errors);
      expect(formattedErrors).toContain('role');
      expect(formattedErrors).toContain('email');
    });
  });
  
  describe('Relationship Validation', () => {
    it('validates user tenant relationships', () => {
      const tenant = mockFactory.createTenant({ id: 'tenant-123' });
      const user = mockFactory.createUser({ tenantId: 'tenant-123' });
      
      const context = {
        tenants: [tenant]
      };
      
      const result = validateUserWithRelationships(user, context);
      expect(result.valid).toBe(true);
      expect(result.relationshipErrors).toHaveLength(0);
    });
    
    it('detects invalid tenant relationships', () => {
      const tenant = mockFactory.createTenant({ id: 'tenant-123' });
      const user = mockFactory.createUser({ tenantId: 'non-existent-tenant' });
      
      const context = {
        tenants: [tenant]
      };
      
      const result = validateUserWithRelationships(user, context);
      expect(result.valid).toBe(false);
      expect(result.relationshipErrors).toHaveLength(1);
      expect(result.relationshipErrors[0].field).toBe('tenantId');
    });
    
    it('validates entire test data context', () => {
      // Create consistent set of related entities
      const tenant = mockFactory.createTenant({ id: 'tenant-123' });
      const user = mockFactory.createUser({ id: 'user-123', tenantId: 'tenant-123' });
      const application = mockFactory.createApplication({ tenantId: 'tenant-123' });
      const integration = mockFactory.createIntegration({ 
        tenantId: 'tenant-123',
        createdBy: 'user-123'
      });
      
      const context = {
        tenants: [tenant],
        users: [user],
        applications: [application],
        integrations: [integration]
      };
      
      const result = validateAllRelationships(context);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('formats relationship errors', () => {
      const tenant = mockFactory.createTenant({ id: 'tenant-123' });
      const user = mockFactory.createUser({ id: 'user-123', tenantId: 'wrong-tenant' });
      
      const context = {
        tenants: [tenant],
        users: [user]
      };
      
      const result = validateAllRelationships(context);
      expect(result.valid).toBe(false);
      
      const formattedErrors = formatRelationshipErrors(result.errors);
      expect(formattedErrors).toContain('tenant');
      expect(formattedErrors).toContain('wrong-tenant');
    });
  });
});