/**
 * useFlowTemplates.js
 * -----------------------------------------------------------------------------
 * Custom React hook for managing integration flow templates.
 * Provides functionality for loading, saving, and managing templates with
 * support for local storage persistence and remote template management.
 * 
 * @module hooks/useFlowTemplates
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing flow templates in the integration platform
 * 
 * This hook provides comprehensive template management capabilities including:
 * - Loading templates from localStorage and/or API
 * - Filtering and searching templates by category and search terms
 * - Creating, updating, duplicating, and deleting templates
 * - Persisting templates to localStorage
 * - Syncing with remote template storage via integration service if provided
 * 
 * @function
 * @param {Array} [initialTemplates=[]] - Initial set of templates to include
 * @param {Object} [integrationService=null] - Service for remote template operations
 * @returns {Object} Template management methods and state
 * 
 * @example
 * // Basic usage with local storage only
 * function TemplateManager() {
  // Added display name
  TemplateManager.displayName = 'TemplateManager';

 *   const { 
 *     templates, 
 *     saveAsTemplate,
 *     getTemplatesByCategory,
 *     searchTemplates
 *   } = useFlowTemplates();
 *   
 *   const saveCurrentFlow = () => {
  // Added display name
  saveCurrentFlow.displayName = 'saveCurrentFlow';

  // Added display name
  saveCurrentFlow.displayName = 'saveCurrentFlow';

  // Added display name
  saveCurrentFlow.displayName = 'saveCurrentFlow';

  // Added display name
  saveCurrentFlow.displayName = 'saveCurrentFlow';

  // Added display name
  saveCurrentFlow.displayName = 'saveCurrentFlow';


 *     saveAsTemplate({
 *       name: 'My Template',
 *       description: 'A custom flow template',
 *       category: 'Custom',
 *       nodes: flowNodes,
 *       edges: flowEdges,
 *       tags: ['custom', 'example']
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={saveCurrentFlow}>Save as Template</button>
 *       <div>
 *         {templates.map(template => (
 *           <TemplateCard key={template.id} template={template} />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 */
export const useFlowTemplates = (initialTemplates = [], integrationService = null) => {
  // Added display name
  useFlowTemplates.displayName = 'useFlowTemplates';

  // Added display name
  useFlowTemplates.displayName = 'useFlowTemplates';

  // Added display name
  useFlowTemplates.displayName = 'useFlowTemplates';

  // Added display name
  useFlowTemplates.displayName = 'useFlowTemplates';

  // Added display name
  useFlowTemplates.displayName = 'useFlowTemplates';


  // State for templates 
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load templates on mount from localStorage and API if service provided
  useEffect(() => {
    /**
     * Loads templates from various sources:
     * 1. Local storage
     * 2. Remote API (if integration service provided)
     * 3. Initial templates passed to the hook
     */
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load from localStorage first
        const storedTemplates = localStorage.getItem('flowTemplates');
        let localTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];
        
        if (integrationService) {
          // If service provided, load from API
          try {
            const remoteTemplates = await integrationService.getTemplates();
            
            // Merge remote and local templates, remote templates take precedence 
            // if same ID exists in both
            const remoteIds = remoteTemplates.map(t => t.id);
            localTemplates = localTemplates.filter(t => !remoteIds.includes(t.id));
            
            // Combine templates
            localTemplates = [...localTemplates, ...remoteTemplates];
          } catch (err) {
            console.warn('Failed to load remote templates:', err);
            // Continue with local templates only
          }
        }
        
        // Add initial templates if provided
        if (initialTemplates.length > 0) {
          const initialIds = initialTemplates.map(t => t.id);
          localTemplates = localTemplates.filter(t => !initialIds.includes(t.id));
          localTemplates = [...localTemplates, ...initialTemplates];
        }
        
        // Sort templates by category and name
        localTemplates.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
        
        setTemplates(localTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, [initialTemplates, integrationService]);
  
  /**
   * Get all available templates
   * 
   * @function
   * @returns {Array} All templates
   */
  const getTemplates = useCallback(() => {
  // Added display name
  getTemplates.displayName = 'getTemplates';

    return templates;
  }, [templates]);
  
  /**
   * Get templates filtered by category
   * 
   * @function
   * @param {string} category - Category name to filter by
   * @returns {Array} Templates in the specified category
   */
  const getTemplatesByCategory = useCallback((category) => {
  // Added display name
  getTemplatesByCategory.displayName = 'getTemplatesByCategory';

    return templates.filter(template => template.category === category);
  }, [templates]);
  
  /**
   * Get all unique categories from available templates
   * 
   * @function
   * @returns {Array} Unique category names
   */
  const getCategories = useCallback(() => {
  // Added display name
  getCategories.displayName = 'getCategories';

    const categories = templates.map(template => template.category);
    return [...new Set(categories)];
  }, [templates]);
  
  /**
   * Search templates by name, description, or tags
   * 
   * @function
   * @param {string} searchTerm - Term to search for
   * @returns {Array} Templates matching the search term
   */
  const searchTemplates = useCallback((searchTerm) => {
  // Added display name
  searchTemplates.displayName = 'searchTemplates';

    searchTerm = searchTerm.toLowerCase();
    return templates.filter(template => {
      // Search in name and description
      if (template.name.toLowerCase().includes(searchTerm) || 
          (template.description && template.description.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Search in tags
      if (template.tags && Array.isArray(template.tags)) {
        return template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      }
      
      return false;
    });
  }, [templates]);
  
  /**
   * Save a new template
   * 
   * @function
   * @async
   * @param {Object} templateData - Template data to save
   * @param {string} templateData.name - Template name
   * @param {string} [templateData.description] - Template description
   * @param {string} [templateData.category='Custom'] - Template category
   * @param {Array} [templateData.nodes] - Flow nodes
   * @param {Array} [templateData.edges] - Flow edges
   * @param {Array} [templateData.tags] - Template tags
   * @returns {Promise<Object>} The saved template
   * @throws {Error} If template name is missing
   */
  const saveAsTemplate = useCallback(async (templateData) => {
  // Added display name
  saveAsTemplate.displayName = 'saveAsTemplate';

    if (!templateData.name) {
      throw new Error('Template name is required');
    }
    
    // Ensure template has all required properties
    const template = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category || 'Custom',
      nodes: templateData.nodes || [],
      edges: templateData.edges || [],
      tags: templateData.tags || [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isRemote: false // This is a local template
    };
    
    // Update templates state
    setTemplates(prevTemplates => {
      const newTemplates = [...prevTemplates, template];
      
      // Save to localStorage
      localStorage.setItem('flowTemplates', JSON.stringify(newTemplates));
      
      return newTemplates;
    });
    
    // Save to API if service provided
    if (integrationService) {
      try {
        await integrationService.saveTemplate(template);
      } catch (err) {
        console.warn('Failed to save template to API, but saved locally:', err);
      }
    }
    
    return template;
  }, [integrationService]);
  
  /**
   * Update an existing template
   * 
   * @function
   * @async
   * @param {string} templateId - ID of template to update
   * @param {Object} updates - Properties to update
   * @returns {Promise<void>}
   */
  const updateTemplate = useCallback(async (templateId, updates) => {
  // Added display name
  updateTemplate.displayName = 'updateTemplate';

    setTemplates(prevTemplates => {
      const templateIndex = prevTemplates.findIndex(t => t.id === templateId);
      
      if (templateIndex === -1) {
        return prevTemplates;
      }
      
      // Update template
      const updatedTemplate = {
        ...prevTemplates[templateIndex],
        ...updates,
        modified: new Date().toISOString()
      };
      
      const newTemplates = [...prevTemplates];
      newTemplates[templateIndex] = updatedTemplate;
      
      // Save to localStorage
      localStorage.setItem('flowTemplates', JSON.stringify(newTemplates));
      
      return newTemplates;
    });
    
    // Update in API if service provided and it's a remote template
    if (integrationService) {
      const template = templates.find(t => t.id === templateId);
      if (template && template.isRemote) {
        try {
          await integrationService.updateTemplate(templateId, updates);
        } catch (err) {
          console.warn('Failed to update template in API, but updated locally:', err);
        }
      }
    }
  }, [templates, integrationService]);
  
  /**
   * Delete a template
   * 
   * @function
   * @async
   * @param {string} templateId - ID of template to delete
   * @returns {Promise<void>}
   */
  const deleteTemplate = useCallback(async (templateId) => {
  // Added display name
  deleteTemplate.displayName = 'deleteTemplate';

    // Check if this is a remote template
    const template = templates.find(t => t.id === templateId);
    const isRemote = template?.isRemote || false;
    
    setTemplates(prevTemplates => {
      const newTemplates = prevTemplates.filter(t => t.id !== templateId);
      
      // Save to localStorage
      localStorage.setItem('flowTemplates', JSON.stringify(newTemplates));
      
      return newTemplates;
    });
    
    // Delete from API if service provided and it's a remote template
    if (integrationService && isRemote) {
      try {
        await integrationService.deleteTemplate(templateId);
      } catch (err) {
        console.warn('Failed to delete template from API, but deleted locally:', err);
      }
    }
  }, [templates, integrationService]);
  
  /**
   * Duplicate an existing template
   * 
   * @function
   * @param {string} templateId - ID of template to duplicate
   * @returns {Object} The duplicated template
   * @throws {Error} If template not found
   */
  const duplicateTemplate = useCallback((templateId) => {
  // Added display name
  duplicateTemplate.displayName = 'duplicateTemplate';

    const templateToDuplicate = templates.find(t => t.id === templateId);
    
    if (!templateToDuplicate) {
      throw new Error('Template not found');
    }
    
    const duplicatedTemplate = {
      ...templateToDuplicate,
      id: `template-${Date.now()}`,
      name: `${templateToDuplicate.name} (Copy)`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isRemote: false // Local duplicate
    };
    
    setTemplates(prevTemplates => {
      const newTemplates = [...prevTemplates, duplicatedTemplate];
      
      // Save to localStorage
      localStorage.setItem('flowTemplates', JSON.stringify(newTemplates));
      
      return newTemplates;
    });
    
    return duplicatedTemplate;
  }, [templates]);
  
  /**
   * Clear all custom templates (mostly used for testing)
   * 
   * @function
   */
  const clearTemplates = useCallback(() => {
  // Added display name
  clearTemplates.displayName = 'clearTemplates';

    localStorage.removeItem('flowTemplates');
    setTemplates([]);
  }, []);
  
  return {
    /** Current templates */
    templates,
    /** Whether templates are currently loading */
    loading,
    /** Error message if template loading failed */
    error,
    /** Get all templates */
    getTemplates,
    /** Get templates by category */
    getTemplatesByCategory,
    /** Get all unique categories */
    getCategories,
    /** Search templates by name, description, or tags */
    searchTemplates,
    /** Save a new template */
    saveAsTemplate,
    /** Update an existing template */
    updateTemplate,
    /** Delete a template */
    deleteTemplate,
    /** Duplicate an existing template */
    duplicateTemplate,
    /** Clear all templates */
    clearTemplates
  };
};