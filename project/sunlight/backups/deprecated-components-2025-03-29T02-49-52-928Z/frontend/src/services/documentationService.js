/**
 * Documentation Service
 * 
 * This service handles all interactions with the documentation API,
 * including fetching documentation, filtering by audience, and
 * managing documentation access permissions.
 */

import axios from 'axios';
import authService from './/authService';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Get all documentation with optional filtering
 * 
 * @param {Object} filters - Optional filters for documentation
 * @param {string} filters.audience - Filter by audience (internal, public, both)
 * @param {string} filters.category - Filter by category
 * @param {string} filters.query - Search query
 * @returns {Promise<Array>} List of documentation items
 */
async function getAllDocumentation(filters = {}) {
  // Added display name
  getAllDocumentation.displayName = 'getAllDocumentation';

  try {
    const token = authService.getToken();
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Build query parameters
    const params = new URLSearchParams();
    if (filters.audience) params.append('audience', filters.audience);
    if (filters.category) params.append('category', filters.category);
    if (filters.query) params.append('query', filters.query);

    const response = await axios.get(`${API_URL}/api/documentation${params.toString() ? '?' + params.toString() : ''}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching documentation:', error);
    
    // Fallback: try to load from local file if in development or testing
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      try {
        const response = await fetch('/documentation-index.json');
        if (!response.ok) throw new Error('Failed to fetch local documentation');
        return response.json();
      } catch (localError) {
        console.error('Error loading local documentation:', localError);
        return [];
      }
    }
    
    throw error;
  }
}

/**
 * Get public documentation only with optional filtering
 * 
 * @param {Object} filters - Optional filters for documentation
 * @param {string} filters.category - Filter by category
 * @param {string} filters.query - Search query
 * @returns {Promise<Array>} List of public documentation items
 */
async function getPublicDocumentation(filters = {}) {
  // Added display name
  getPublicDocumentation.displayName = 'getPublicDocumentation';

  try {
    // For public documentation, no authentication is needed
    // Build query parameters
    const params = new URLSearchParams();
    params.append('audience', 'public'); // Always filter by public audience
    if (filters.category) params.append('category', filters.category);
    if (filters.query) params.append('query', filters.query);

    const response = await axios.get(`${API_URL}/api/public/documentation${params.toString() ? '?' + params.toString() : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public documentation:', error);
    
    // Fallback: try to load from local file if in development or testing
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      try {
        const response = await fetch('/documentation-index.json');
        if (!response.ok) throw new Error('Failed to fetch local documentation');
        const data = await response.json();
        // Filter to only include public documentation
        return Object.values(data).filter(doc => 
          doc.audience === 'public' || doc.audience === 'both'
        );
      } catch (localError) {
        console.error('Error loading local documentation:', localError);
        return [];
      }
    }
    
    throw error;
  }
}

/**
 * Get a single document by ID
 * 
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Document details and content
 */
async function getDocumentById(id) {
  // Added display name
  getDocumentById.displayName = 'getDocumentById';

  try {
    const token = authService.getToken();
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    const response = await axios.get(`${API_URL}/api/documentation/${id}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    
    // Fallback for development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      try {
        // Try to find document in index
        const indexResponse = await fetch('/documentation-index.json');
        if (!indexResponse.ok) throw new Error('Failed to fetch local documentation index');
        const indexData = await indexResponse.json();
        
        // Get document metadata from index
        const document = indexData[id];
        if (!document) throw new Error(`Document ${id} not found in index`);
        
        // Try to get document content
        const contentResponse = await fetch(document.path);
        if (!contentResponse.ok) throw new Error(`Failed to fetch document content for ${id}`);
        const content = await contentResponse.text();
        
        return { ...document, content };
      } catch (localError) {
        console.error(`Error loading local document ${id}:`, localError);
        throw localError;
      }
    }
    
    throw error;
  }
}

/**
 * Get a public document by ID
 * 
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Document details and content
 */
async function getPublicDocumentById(id) {
  // Added display name
  getPublicDocumentById.displayName = 'getPublicDocumentById';

  try {
    const response = await axios.get(`${API_URL}/api/public/documentation/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public document ${id}:`, error);
    
    // Fallback for development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      try {
        // Try to find document in index
        const indexResponse = await fetch('/documentation-index.json');
        if (!indexResponse.ok) throw new Error('Failed to fetch local documentation index');
        const indexData = await indexResponse.json();
        
        // Get document metadata from index
        const document = indexData[id];
        if (!document) throw new Error(`Document ${id} not found in index`);
        
        // Check if document is public
        if (document.audience !== 'public' && document.audience !== 'both') {
          throw new Error(`Document ${id} is not public`);
        }
        
        // Try to get document content
        const contentResponse = await fetch(document.path);
        if (!contentResponse.ok) throw new Error(`Failed to fetch document content for ${id}`);
        const content = await contentResponse.text();
        
        return { ...document, content };
      } catch (localError) {
        console.error(`Error loading local public document ${id}:`, localError);
        throw localError;
      }
    }
    
    throw error;
  }
}

/**
 * Check if user has access to a document
 * 
 * @param {Object} document - Document metadata
 * @returns {boolean} Whether the user has access
 */
function hasDocumentAccess(document) {
  // Added display name
  hasDocumentAccess.displayName = 'hasDocumentAccess';

  // Public documents are accessible to everyone
  if (document.audience === 'public' || document.audience === 'both') {
    return true;
  }
  
  // If not public, check if user is authenticated
  if (!authService.isAuthenticated()) {
    return false;
  }
  
  // Check user role against required role
  const userRole = authService.getUserRole();
  
  // Role hierarchy: admin > developer > user > anonymous
  const roleHierarchy = {
    admin: 4,
    developer: 3,
    user: 2,
    anonymous: 1
  };
  
  const userRoleLevel = roleHierarchy[userRole] || 1;
  const requiredRoleLevel = roleHierarchy[document.requiredRole] || 1;
  
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Add a bookmark for a document
 * 
 * @param {string} documentId - Document ID to bookmark
 * @returns {Promise<boolean>} Success status
 */
async function addBookmark(documentId) {
  // Added display name
  addBookmark.displayName = 'addBookmark';

  try {
    const token = authService.getToken();
    if (!token) {
      // For non-authenticated users, store in localStorage
      const bookmarks = JSON.parse(localStorage.getItem('documentBookmarks') || '[]');
      if (!bookmarks.includes(documentId)) {
        bookmarks.push(documentId);
        localStorage.setItem('documentBookmarks', JSON.stringify(bookmarks));
      }
      return true;
    }
    
    // For authenticated users, store on server
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    await axios.post(`${API_URL}/api/documentation/bookmarks/${documentId}`, {}, config);
    return true;
  } catch (error) {
    console.error(`Error bookmarking document ${documentId}:`, error);
    return false;
  }
}

/**
 * Remove a bookmark for a document
 * 
 * @param {string} documentId - Document ID to remove bookmark for
 * @returns {Promise<boolean>} Success status
 */
async function removeBookmark(documentId) {
  // Added display name
  removeBookmark.displayName = 'removeBookmark';

  try {
    const token = authService.getToken();
    if (!token) {
      // For non-authenticated users, remove from localStorage
      const bookmarks = JSON.parse(localStorage.getItem('documentBookmarks') || '[]');
      const newBookmarks = bookmarks.filter(id => id !== documentId);
      localStorage.setItem('documentBookmarks', JSON.stringify(newBookmarks));
      return true;
    }
    
    // For authenticated users, remove from server
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    await axios.delete(`${API_URL}/api/documentation/bookmarks/${documentId}`, config);
    return true;
  } catch (error) {
    console.error(`Error removing bookmark for document ${documentId}:`, error);
    return false;
  }
}

/**
 * Get all bookmarked documents
 * 
 * @returns {Promise<Array>} List of bookmarked documents
 */
async function getBookmarkedDocuments() {
  // Added display name
  getBookmarkedDocuments.displayName = 'getBookmarkedDocuments';

  try {
    const token = authService.getToken();
    if (!token) {
      // For non-authenticated users, get from localStorage
      const bookmarkIds = JSON.parse(localStorage.getItem('documentBookmarks') || '[]');
      
      // Get full documentation for each bookmark
      try {
        const indexResponse = await fetch('/documentation-index.json');
        if (!indexResponse.ok) throw new Error('Failed to fetch local documentation index');
        const indexData = await indexResponse.json();
        
        return bookmarkIds.map(id => indexData[id]).filter(Boolean);
      } catch (localError) {
        console.error('Error loading local bookmarks:', localError);
        return [];
      }
    }
    
    // For authenticated users, get from server
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    const response = await axios.get(`${API_URL}/api/documentation/bookmarks`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarked documents:', error);
    return [];
  }
}

/**
 * Track document view for analytics
 * 
 * @param {string} documentId - Document ID that was viewed
 * @returns {Promise<void>}
 */
async function trackDocumentView(documentId) {
  // Added display name
  trackDocumentView.displayName = 'trackDocumentView';

  try {
    // Don't track views in development or test
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return;
    }
    
    // Try to track view even for anonymous users
    await axios.post(`${API_URL}/api/documentation/analytics/view/${documentId}`);
  } catch (error) {
    // Silently fail for analytics errors
    console.debug(`Error tracking document view for ${documentId}:`, error);
  }
}

const documentationService = {
  getAllDocumentation,
  getPublicDocumentation,
  getDocumentById,
  getPublicDocumentById,
  hasDocumentAccess,
  addBookmark,
  removeBookmark,
  getBookmarkedDocuments,
  trackDocumentView
};

export default documentationService;