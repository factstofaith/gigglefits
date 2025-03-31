/**
 * fileTypeUtils.js
 * 
 * Comprehensive utilities for handling various file types in the application.
 * This module provides functions for file type detection, validation, visualization,
 * and processing of different file formats.
 */

// Common MIME Types grouped by category
export const MimeTypeCategories = {
  TEXT: [
    'text/plain', 
    'text/csv', 
    'text/tab-separated-values',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'text/xml',
    'application/json',
    'application/ld+json',
    'application/x-yaml',
    'application/yaml'
  ],
  
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation'
  ],
  
  IMAGE: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/x-icon'
  ],
  
  AUDIO: [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/aac',
    'audio/flac'
  ],
  
  VIDEO: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv'
  ],
  
  ARCHIVE: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-bzip',
    'application/x-bzip2'
  ],
  
  DATA: [
    'text/csv',
    'application/json',
    'application/xml',
    'text/xml',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/tab-separated-values',
    'application/parquet',
    'application/avro',
    'application/octet-stream'
  ],
  
  CODE: [
    'text/javascript',
    'application/javascript',
    'text/css',
    'text/html',
    'application/json',
    'text/x-python',
    'text/x-java',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust',
    'text/x-typescript'
  ]
};

// File extensions mapped to MIME types
export const FileExtensionToMimeType = {
  // Text files
  'txt': 'text/plain',
  'csv': 'text/csv',
  'tsv': 'text/tab-separated-values',
  'md': 'text/markdown',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'application/json',
  'xml': 'text/xml',
  'yaml': 'application/yaml',
  'yml': 'application/yaml',
  
  // Document files
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  
  // Image files
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'ico': 'image/x-icon',
  
  // Audio files
  'mp3': 'audio/mpeg',
  'ogg': 'audio/ogg',
  'wav': 'audio/wav',
  'aac': 'audio/aac',
  'flac': 'audio/flac',
  
  // Video files
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'ogv': 'video/ogg',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'wmv': 'video/x-ms-wmv',
  
  // Archive files
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'bz': 'application/x-bzip',
  'bz2': 'application/x-bzip2',
  
  // Data files
  'parquet': 'application/parquet',
  'avro': 'application/avro',
  'bin': 'application/octet-stream',
  
  // Code files
  'ts': 'text/x-typescript',
  'py': 'text/x-python',
  'java': 'text/x-java',
  'c': 'text/x-c',
  'cpp': 'text/x-c++',
  'cs': 'text/x-csharp',
  'php': 'text/x-php',
  'rb': 'text/x-ruby',
  'go': 'text/x-go',
  'rs': 'text/x-rust'
};

/**
 * Gets MIME type from file extension
 * @param {string} filename - The filename or file path
 * @returns {string} The MIME type or 'application/octet-stream' if unknown
 */
export const getMimeTypeFromFilename = (filename) => {
  if (!filename) return 'application/octet-stream';
  
  const extension = filename.split('.').pop().toLowerCase();
  return FileExtensionToMimeType[extension] || 'application/octet-stream';
};

/**
 * Gets file extension from filename
 * @param {string} filename - The filename or file path
 * @returns {string} The file extension (without the dot) or empty string if none
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Checks if a file is of a specific category based on its MIME type
 * @param {string} mimeType - The MIME type to check
 * @param {string} category - The category to check against (TEXT, DOCUMENT, IMAGE, etc.)
 * @returns {boolean} True if the file is of the specified category
 */
export const isFileCategory = (mimeType, category) => {
  if (!mimeType || !category || !MimeTypeCategories[category]) return false;
  return MimeTypeCategories[category].includes(mimeType);
};

/**
 * Gets the file category for a given MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} The category name or 'OTHER' if unknown
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return 'OTHER';
  
  for (const [category, types] of Object.entries(MimeTypeCategories)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  
  return 'OTHER';
};

/**
 * Gets a readable file type description from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} A human-readable description of the file type
 */
export const getFileTypeDescription = (mimeType) => {
  if (!mimeType) return 'Unknown File';
  
  // Common descriptions for specific MIME types
  const specificMimeTypes = {
    'text/plain': 'Text File',
    'text/csv': 'CSV File',
    'text/tab-separated-values': 'TSV File',
    'text/markdown': 'Markdown File',
    'text/html': 'HTML File',
    'application/json': 'JSON File',
    'application/xml': 'XML File', 
    'text/xml': 'XML File',
    'application/pdf': 'PDF Document',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'audio/mpeg': 'MP3 Audio',
    'video/mp4': 'MP4 Video',
    'application/zip': 'ZIP Archive',
    'application/x-tar': 'TAR Archive',
    'application/gzip': 'GZIP Archive'
  };
  
  if (specificMimeTypes[mimeType]) {
    return specificMimeTypes[mimeType];
  }
  
  // General descriptions based on MIME type category
  const category = getFileCategory(mimeType);
  switch (category) {
    case 'TEXT':
      return 'Text File';
    case 'DOCUMENT':
      return 'Document';
    case 'IMAGE':
      return 'Image';
    case 'AUDIO':
      return 'Audio File';
    case 'VIDEO':
      return 'Video File';
    case 'ARCHIVE':
      return 'Archive';
    case 'DATA':
      return 'Data File';
    case 'CODE':
      return 'Source Code';
    default:
      return 'Binary File';
  }
};

/**
 * Gets appropriate Material UI icon for file type
 * @param {string} mimeType - The MIME type
 * @returns {string} The name of the Material UI icon to use
 */
export const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'InsertDriveFile';
  
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'TEXT':
      if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') {
        return 'TableChart';
      }
      if (mimeType === 'application/json') {
        return 'Code';
      }
      return 'Description';
      
    case 'DOCUMENT':
      if (mimeType === 'application/pdf') {
        return 'PictureAsPdf';
      }
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return 'GridOn';
      }
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        return 'Slideshow';
      }
      return 'Description';
      
    case 'IMAGE':
      return 'Image';
      
    case 'AUDIO':
      return 'AudioFile';
      
    case 'VIDEO':
      return 'VideoFile';
      
    case 'ARCHIVE':
      return 'FolderZip';
      
    case 'DATA':
      if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') {
        return 'TableChart';
      }
      return 'Storage';
      
    case 'CODE':
      return 'Code';
      
    default:
      return 'InsertDriveFile';
  }
};

/**
 * Gets color for file type icon
 * @param {string} mimeType - The MIME type
 * @returns {string} Material UI color to use for the icon
 */
export const getFileTypeColor = (mimeType) => {
  if (!mimeType) return 'action.active';
  
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'TEXT':
      return 'info.main';
      
    case 'DOCUMENT':
      if (mimeType === 'application/pdf') {
        return 'error.main';
      }
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return 'success.main';
      }
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        return 'warning.main';
      }
      return 'primary.main';
      
    case 'IMAGE':
      return 'success.main';
      
    case 'AUDIO':
      return 'secondary.main';
      
    case 'VIDEO':
      return 'error.main';
      
    case 'ARCHIVE':
      return 'warning.dark';
      
    case 'DATA':
      return 'info.dark';
      
    case 'CODE':
      return 'secondary.dark';
      
    default:
      return 'text.secondary';
  }
};

/**
 * Checks if a file type is supported for preview
 * @param {string} mimeType - The MIME type
 * @returns {boolean} True if the file type is supported for preview
 */
export const isPreviewSupported = (mimeType) => {
  if (!mimeType) return false;
  
  // List of supported MIME types for preview
  const supportedMimeTypes = [
    // Text files
    'text/plain',
    'text/csv',
    'text/tab-separated-values',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'application/yaml',
    
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    
    // PDFs
    'application/pdf',
    
    // Special code types we can syntax highlight
    'text/x-python',
    'text/x-java',
    'text/javascript',
    'application/javascript',
    'text/x-typescript'
  ];
  
  return supportedMimeTypes.includes(mimeType);
};

/**
 * Gets the appropriate preview component type for a file
 * @param {string} mimeType - The MIME type
 * @returns {string} The preview type: 'text', 'image', 'pdf', 'code', or 'none'
 */
export const getPreviewType = (mimeType) => {
  if (!isPreviewSupported(mimeType)) return 'none';
  
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  
  if (MimeTypeCategories.CODE.includes(mimeType)) {
    return 'code';
  }
  
  if (MimeTypeCategories.TEXT.includes(mimeType) || 
      mimeType === 'application/json' || 
      mimeType === 'application/xml' ||
      mimeType === 'text/xml') {
    return 'text';
  }
  
  return 'none';
};

/**
 * Gets the appropriate syntax highlighting language for code preview
 * @param {string} mimeType - The MIME type
 * @returns {string} The syntax highlighting language
 */
export const getSyntaxHighlightLanguage = (mimeType) => {
  const mimeToLanguage = {
    'text/javascript': 'javascript',
    'application/javascript': 'javascript',
    'text/x-typescript': 'typescript',
    'text/x-python': 'python',
    'text/x-java': 'java',
    'text/x-c': 'c',
    'text/x-c++': 'cpp',
    'text/x-csharp': 'csharp',
    'text/x-php': 'php',
    'text/x-ruby': 'ruby',
    'text/x-go': 'go',
    'text/x-rust': 'rust',
    'text/css': 'css',
    'text/html': 'html',
    'application/json': 'json',
    'application/ld+json': 'json',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'application/yaml': 'yaml',
    'text/markdown': 'markdown',
    'text/csv': 'csv',
    'text/tab-separated-values': 'tsv'
  };
  
  return mimeToLanguage[mimeType] || 'plaintext';
};

/**
 * Generates simplified metadata for a file
 * @param {Object} file - The file object or file info
 * @returns {Object} Simplified metadata object with useful properties
 */
export const generateFileMetadata = (file) => {
  if (!file) return null;
  
  // Extract filename from path if needed
  const filename = file.name || file.filename || 
                   (file.path ? file.path.split('/').pop() : 'unknown');
  
  // Determine MIME type
  const mimeType = file.contentType || file.type || 
                   getMimeTypeFromFilename(filename);
  
  // Get file extension
  const extension = getFileExtension(filename);
  
  return {
    filename,
    mimeType,
    extension,
    size: file.size || file.contentLength || 0,
    lastModified: file.lastModified || file.modifiedDate || new Date().toISOString(),
    category: getFileCategory(mimeType),
    description: getFileTypeDescription(mimeType),
    icon: getFileTypeIcon(mimeType),
    color: getFileTypeColor(mimeType),
    isPreviewable: isPreviewSupported(mimeType),
    previewType: getPreviewType(mimeType)
  };
};