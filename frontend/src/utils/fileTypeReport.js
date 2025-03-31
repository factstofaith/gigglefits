/**
 * File Type Report Utility
 * 
 * Provides functions for analyzing file types in storage containers
 * and generating reports about the file distribution and characteristics.
 */

import { 
  getFileCategory, 
  getFileTypeDescription, 
  getMimeTypeFromFilename,
  getFileExtension
} from './fileTypeUtils';

/**
 * Analyzes a list of files and generates a report on file types
 * @param {Array} files - Array of file objects with name, size, and optional type properties
 * @returns {Object} Report object with file type statistics
 */
export const generateFileTypeReport = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      categories: {},
      extensions: {},
      mimeTypes: {},
      sizeDistribution: {
        small: 0,   // < 100KB
        medium: 0,  // 100KB - 1MB
        large: 0,   // 1MB - 10MB
        veryLarge: 0 // > 10MB
      }
    };
  }
  
  const report = {
    totalFiles: files.length,
    totalSize: 0,
    categories: {},
    extensions: {},
    mimeTypes: {},
    sizeDistribution: {
      small: 0,
      medium: 0,
      large: 0,
      veryLarge: 0
    },
    largestFiles: [],
    smallestFiles: [],
    oldestFiles: [],
    newestFiles: []
  };
  
  // Size thresholds in bytes
  const SIZE_THRESHOLDS = {
    SMALL: 102400,    // 100KB
    MEDIUM: 1048576,  // 1MB
    LARGE: 10485760   // 10MB
  };
  
  // Process each file
  files.forEach(file => {
    // Skip directories
    if (file.type === 'directory' || file.name.endsWith('/')) {
      return;
    }
    
    // Extract file information
    const fileName = file.name || '';
    const fileSize = file.size || file.contentLength || 0;
    const fileType = file.type || file.contentType || getMimeTypeFromFilename(fileName);
    const extension = getFileExtension(fileName);
    const lastModified = file.lastModified || file.modifiedDate || null;
    
    // Update total size
    report.totalSize += fileSize;
    
    // Categorize by size
    if (fileSize < SIZE_THRESHOLDS.SMALL) {
      report.sizeDistribution.small++;
    } else if (fileSize < SIZE_THRESHOLDS.MEDIUM) {
      report.sizeDistribution.medium++;
    } else if (fileSize < SIZE_THRESHOLDS.LARGE) {
      report.sizeDistribution.large++;
    } else {
      report.sizeDistribution.veryLarge++;
    }
    
    // Track by category
    const category = getFileCategory(fileType);
    if (!report.categories[category]) {
      report.categories[category] = {
        count: 0,
        totalSize: 0,
        extensions: {},
        description: getCategoryDescription(category)
      };
    }
    report.categories[category].count++;
    report.categories[category].totalSize += fileSize;
    
    // Track extensions within category
    if (extension) {
      if (!report.categories[category].extensions[extension]) {
        report.categories[category].extensions[extension] = {
          count: 0,
          totalSize: 0
        };
      }
      report.categories[category].extensions[extension].count++;
      report.categories[category].extensions[extension].totalSize += fileSize;
    }
    
    // Track overall extensions
    if (extension) {
      if (!report.extensions[extension]) {
        report.extensions[extension] = {
          count: 0,
          totalSize: 0,
          mimeType: fileType,
          description: getFileTypeDescription(fileType)
        };
      }
      report.extensions[extension].count++;
      report.extensions[extension].totalSize += fileSize;
    }
    
    // Track MIME types
    if (fileType) {
      if (!report.mimeTypes[fileType]) {
        report.mimeTypes[fileType] = {
          count: 0,
          totalSize: 0,
          description: getFileTypeDescription(fileType)
        };
      }
      report.mimeTypes[fileType].count++;
      report.mimeTypes[fileType].totalSize += fileSize;
    }
    
    // Track largest and smallest files
    const fileInfo = {
      name: fileName,
      size: fileSize,
      type: fileType,
      lastModified: lastModified
    };
    
    updateTopFiles(report.largestFiles, fileInfo, 5, (a, b) => b.size - a.size);
    updateTopFiles(report.smallestFiles, fileInfo, 5, (a, b) => a.size - b.size);
    
    // Track oldest and newest files if lastModified is available
    if (lastModified) {
      updateTopFiles(
        report.oldestFiles, 
        fileInfo, 
        5, 
        (a, b) => new Date(a.lastModified) - new Date(b.lastModified)
      );
      
      updateTopFiles(
        report.newestFiles, 
        fileInfo, 
        5, 
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
    }
  });
  
  // Calculate percentages
  calculatePercentages(report);
  
  return report;
};

/**
 * Updates a sorted list of top files based on a comparison function
 * @param {Array} list - The list to update
 * @param {Object} file - The file to add
 * @param {number} maxSize - Maximum size of the list
 * @param {Function} compareFn - Function to compare files
 */
const updateTopFiles = (list, file, maxSize, compareFn) => {
  // Add the file if the list is not at capacity
  if (list.length < maxSize) {
    list.push(file);
    list.sort(compareFn);
    return;
  }
  
  // Check if the file should be added
  const lastIndex = list.length - 1;
  if (compareFn(list[lastIndex], file) > 0) {
    list[lastIndex] = file;
    list.sort(compareFn);
  }
};

/**
 * Gets a description for a file category
 * @param {string} category - The category name
 * @returns {string} The description
 */
const getCategoryDescription = (category) => {
  const descriptions = {
    TEXT: 'Text Files',
    DOCUMENT: 'Documents',
    IMAGE: 'Images',
    AUDIO: 'Audio Files',
    VIDEO: 'Video Files',
    ARCHIVE: 'Archives',
    DATA: 'Data Files',
    CODE: 'Code Files',
    OTHER: 'Other Files'
  };
  
  return descriptions[category] || 'Unknown';
};

/**
 * Calculates percentage values for the report
 * @param {Object} report - The report object to update
 */
const calculatePercentages = (report) => {
  // Skip if no files
  if (report.totalFiles === 0) return;
  
  // Add category percentages
  Object.keys(report.categories).forEach(category => {
    const categoryData = report.categories[category];
    categoryData.countPercentage = (categoryData.count / report.totalFiles) * 100;
    categoryData.sizePercentage = (categoryData.totalSize / report.totalSize) * 100;
  });
  
  // Add extension percentages
  Object.keys(report.extensions).forEach(extension => {
    const extensionData = report.extensions[extension];
    extensionData.countPercentage = (extensionData.count / report.totalFiles) * 100;
    extensionData.sizePercentage = (extensionData.totalSize / report.totalSize) * 100;
  });
  
  // Add mime type percentages
  Object.keys(report.mimeTypes).forEach(mimeType => {
    const mimeTypeData = report.mimeTypes[mimeType];
    mimeTypeData.countPercentage = (mimeTypeData.count / report.totalFiles) * 100;
    mimeTypeData.sizePercentage = (mimeTypeData.totalSize / report.totalSize) * 100;
  });
  
  // Add size distribution percentages
  Object.keys(report.sizeDistribution).forEach(sizeCategory => {
    report.sizeDistribution[`${sizeCategory}Percentage`] = 
      (report.sizeDistribution[sizeCategory] / report.totalFiles) * 100;
  });
};

/**
 * Formats a file size in a human-readable format
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generates a text summary from a file type report
 * @param {Object} report - The report object
 * @returns {string} A formatted text summary
 */
export const generateReportSummary = (report) => {
  if (!report || report.totalFiles === 0) {
    return 'No files to analyze.';
  }
  
  let summary = `# File Type Analysis Report\n\n`;
  
  // Overview
  summary += `## Overview\n\n`;
  summary += `- Total Files: ${report.totalFiles}\n`;
  summary += `- Total Size: ${formatFileSize(report.totalSize)}\n\n`;
  
  // Size Distribution
  summary += `## Size Distribution\n\n`;
  summary += `- Small (< 100KB): ${report.sizeDistribution.small} files (${report.sizeDistribution.smallPercentage.toFixed(1)}%)\n`;
  summary += `- Medium (100KB - 1MB): ${report.sizeDistribution.medium} files (${report.sizeDistribution.mediumPercentage.toFixed(1)}%)\n`;
  summary += `- Large (1MB - 10MB): ${report.sizeDistribution.large} files (${report.sizeDistribution.largePercentage.toFixed(1)}%)\n`;
  summary += `- Very Large (> 10MB): ${report.sizeDistribution.veryLarge} files (${report.sizeDistribution.veryLargePercentage.toFixed(1)}%)\n\n`;
  
  // Categories
  summary += `## File Categories\n\n`;
  
  const sortedCategories = Object.entries(report.categories)
    .sort((a, b) => b[1].count - a[1].count);
  
  for (const [category, data] of sortedCategories) {
    summary += `### ${data.description} (${category})\n\n`;
    summary += `- Files: ${data.count} (${data.countPercentage.toFixed(1)}% of total)\n`;
    summary += `- Total Size: ${formatFileSize(data.totalSize)} (${data.sizePercentage.toFixed(1)}% of total)\n`;
    
    // Top extensions in this category
    const topExtensions = Object.entries(data.extensions)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    if (topExtensions.length > 0) {
      summary += `- Top Extensions:\n`;
      for (const [ext, extData] of topExtensions) {
        summary += `  - .${ext}: ${extData.count} files, ${formatFileSize(extData.totalSize)}\n`;
      }
    }
    
    summary += `\n`;
  }
  
  // Top file extensions
  summary += `## Top File Extensions\n\n`;
  
  const sortedExtensions = Object.entries(report.extensions)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  for (const [extension, data] of sortedExtensions) {
    summary += `- .${extension}: ${data.count} files (${data.countPercentage.toFixed(1)}%), ${formatFileSize(data.totalSize)}, ${data.description}\n`;
  }
  
  summary += `\n`;
  
  // Largest files
  if (report.largestFiles.length > 0) {
    summary += `## Largest Files\n\n`;
    
    for (const file of report.largestFiles) {
      summary += `- ${file.name}: ${formatFileSize(file.size)}\n`;
    }
    
    summary += `\n`;
  }
  
  // Newest files
  if (report.newestFiles.length > 0) {
    summary += `## Most Recent Files\n\n`;
    
    for (const file of report.newestFiles) {
      const date = new Date(file.lastModified).toLocaleString();
      summary += `- ${file.name}: ${date}\n`;
    }
    
    summary += `\n`;
  }
  
  summary += `Report generated on ${new Date().toLocaleString()}`;
  
  return summary;
};

/**
 * Generates a file structure summary from a list of files
 * @param {Array} files - Array of file objects with name property
 * @returns {Object} Structure object with directories and their contents
 */
export const generateFileStructure = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return { directories: {}, rootFiles: [] };
  }
  
  const structure = {
    directories: {},
    rootFiles: []
  };
  
  files.forEach(file => {
    const filePath = file.name;
    const parts = filePath.split('/');
    
    // Handle root files
    if (parts.length === 1) {
      structure.rootFiles.push({
        name: parts[0],
        size: file.size || file.contentLength || 0,
        type: file.type || file.contentType || getMimeTypeFromFilename(parts[0]),
        lastModified: file.lastModified || file.modifiedDate
      });
      return;
    }
    
    // Handle directories
    const fileName = parts.pop();
    let currentLevel = structure.directories;
    
    // Build directory tree
    for (let i = 0; i < parts.length; i++) {
      const dirName = parts[i];
      
      // Skip empty dir names
      if (!dirName) continue;
      
      if (!currentLevel[dirName]) {
        currentLevel[dirName] = {
          files: [],
          directories: {},
          path: parts.slice(0, i + 1).join('/')
        };
      }
      
      currentLevel = currentLevel[dirName].directories;
    }
    
    // Add file to its directory
    const dirName = parts[parts.length - 1];
    if (dirName && fileName) {
      if (!currentLevel[dirName]) {
        currentLevel[dirName] = {
          files: [],
          directories: {},
          path: parts.join('/')
        };
      }
      
      currentLevel[dirName].files.push({
        name: fileName,
        size: file.size || file.contentLength || 0,
        type: file.type || file.contentType || getMimeTypeFromFilename(fileName),
        lastModified: file.lastModified || file.modifiedDate
      });
    }
  });
  
  return structure;
};