/**
 * Function Catalog Component
 * 
 * Displays available functions with categorization, search, and insertion capability.
 * 
 * This component leverages our zero technical debt approach by implementing
 * an ideal function discovery interface without legacy UI constraints.
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FunctionCategories } from './function-registry';
import './function-catalog.css';

/**
 * Function catalog with categorization and search
 * 
 * @param {Object} props - Component props
 * @param {Array} props.functions - Available functions
 * @param {Function} props.onSelectFunction - Function selection handler
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearch - Search handler
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onSelectCategory - Category selection handler
 */
const FunctionCatalog = ({ 
  functions, 
  onSelectFunction, 
  searchTerm, 
  onSearch, 
  selectedCategory, 
  onSelectCategory 
}) => {
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    onSearch(e.target.value);
  }, [onSearch]);
  
  // Handle category selection
  const handleCategoryClick = useCallback((category) => {
    onSelectCategory(category === selectedCategory ? null : category);
  }, [selectedCategory, onSelectCategory]);
  
  // Handle function selection/insertion
  const handleFunctionClick = useCallback((func) => {
    onSelectFunction(func);
  }, [onSelectFunction]);
  
  // Group functions by category
  const functionsByCategory = useMemo(() => {
    const grouped = {};
    
    Object.values(FunctionCategories).forEach(category => {
      grouped[category] = [];
    });
    
    functions.forEach(func => {
      if (grouped[func.category]) {
        grouped[func.category].push(func);
      } else {
        // If category doesn't exist, create it
        grouped[func.category] = [func];
      }
    });
    
    return grouped;
  }, [functions]);
  
  // Determine which categories to display
  const categoriesToShow = useMemo(() => {
    if (searchTerm) {
      // When searching, show all categories that have matching functions
      return Object.keys(functionsByCategory).filter(
        category => functionsByCategory[category].length > 0
      );
    }
    if (selectedCategory) {
      // When a category is selected, only show that category
      return [selectedCategory];
    }
    // Otherwise show all categories
    return Object.values(FunctionCategories);
  }, [functionsByCategory, searchTerm, selectedCategory]);

  // This is a placeholder implementation
  // The full component will be built according to the implementation plan
  return (
    <div className="function-catalog">
      <div className="function-catalog-search">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search functions..."
          className="function-catalog-search-input"
          data-testid="function-search"
        />
      </div>
      
      <div className="function-catalog-categories">
        {Object.entries(FunctionCategories).map(([key, category]) => (
          <button
            key={key}
            className={`function-catalog-category ${selectedCategory === category ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
            disabled={searchTerm && !categoriesToShow.includes(category)}
            data-testid={`category-${key}`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="function-catalog-list">
        {categoriesToShow.map(category => (
          <div key={category} className="function-catalog-category-section">
            <h4 className="function-catalog-category-title">{category}</h4>
            <div className="function-catalog-functions">
              {functionsByCategory[category]?.map(func => (
                <div 
                  key={func.name} 
                  className="function-catalog-function"
                  onClick={() => handleFunctionClick(func)}
                  data-testid={`function-${func.name}`}
                >
                  <div className="function-catalog-function-name">{func.name}</div>
                  <div className="function-catalog-function-description">{func.description}</div>
                </div>
              ))}
              {(!functionsByCategory[category] || functionsByCategory[category].length === 0) && (
                <div className="function-catalog-no-functions">
                  No functions in this category
                </div>
              )}
            </div>
          </div>
        ))}
        
        {categoriesToShow.length === 0 && (
          <div className="function-catalog-no-results">
            No functions found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

FunctionCatalog.propTypes = {
  functions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    params: PropTypes.array,
    returnType: PropTypes.object,
    examples: PropTypes.array
  })).isRequired,
  onSelectFunction: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  onSelectCategory: PropTypes.func.isRequired
};

FunctionCatalog.defaultProps = {
  searchTerm: '',
  selectedCategory: null
};

export default FunctionCatalog;
