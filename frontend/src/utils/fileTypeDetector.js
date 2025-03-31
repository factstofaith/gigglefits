/**
 * File Type Detector Utility
 * 
 * Provides comprehensive file type detection capabilities through content inspection,
 * extension analysis, and signature detection. Supports a wide range of file formats
 * with confidence scoring and detailed metadata extraction.
 */

/**
 * Known file types with their metadata
 * @type {Object}
 */
export const FILE_TYPES = {
  // Data formats
  CSV: {
    category: 'data',
    name: 'CSV',
    fullName: 'Comma-Separated Values',
    mimeType: 'text/csv',
    extensions: ['.csv'],
    isTextBased: true,
    description: 'Tabular data in comma-separated format',
    icon: 'table_view'
  },
  TSV: {
    category: 'data',
    name: 'TSV',
    fullName: 'Tab-Separated Values',
    mimeType: 'text/tab-separated-values',
    extensions: ['.tsv', '.tab'],
    isTextBased: true,
    description: 'Tabular data in tab-separated format',
    icon: 'table_view'
  },
  JSON: {
    category: 'data',
    name: 'JSON',
    fullName: 'JavaScript Object Notation',
    mimeType: 'application/json',
    extensions: ['.json'],
    isTextBased: true, 
    description: 'Structured data in JavaScript object notation',
    icon: 'data_object'
  },
  XML: {
    category: 'data',
    name: 'XML',
    fullName: 'Extensible Markup Language',
    mimeType: 'application/xml',
    extensions: ['.xml'],
    isTextBased: true,
    description: 'Structured data in XML format',
    icon: 'code'
  },
  YAML: {
    category: 'data',
    name: 'YAML',
    fullName: 'YAML Ain\'t Markup Language',
    mimeType: 'text/yaml',
    extensions: ['.yaml', '.yml'],
    isTextBased: true,
    description: 'Human-readable data serialization format',
    icon: 'data_object'
  },
  PARQUET: {
    category: 'data',
    name: 'Parquet',
    fullName: 'Apache Parquet',
    mimeType: 'application/parquet',
    extensions: ['.parquet'],
    isTextBased: false,
    description: 'Columnar storage file format',
    icon: 'database'
  },
  AVRO: {
    category: 'data',
    name: 'Avro',
    fullName: 'Apache Avro',
    mimeType: 'application/avro',
    extensions: ['.avro'],
    isTextBased: false,
    description: 'Row-based data serialization format',
    icon: 'database'
  },
  ORC: {
    category: 'data',
    name: 'ORC',
    fullName: 'Optimized Row Columnar',
    mimeType: 'application/orc',
    extensions: ['.orc'],
    isTextBased: false,
    description: 'Columnar storage file format for Hadoop',
    icon: 'database'
  },
  
  // Spreadsheet formats
  EXCEL: {
    category: 'spreadsheet',
    name: 'Excel',
    fullName: 'Microsoft Excel Spreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx', '.xls'],
    isTextBased: false,
    description: 'Microsoft Excel spreadsheet document',
    icon: 'grid_on'
  },
  ODS: {
    category: 'spreadsheet',
    name: 'ODS',
    fullName: 'OpenDocument Spreadsheet',
    mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
    extensions: ['.ods'],
    isTextBased: false,
    description: 'OpenDocument spreadsheet format',
    icon: 'grid_on'
  },
  
  // Document formats
  PDF: {
    category: 'document',
    name: 'PDF',
    fullName: 'Portable Document Format',
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
    isTextBased: false,
    description: 'Portable Document Format for documents',
    icon: 'picture_as_pdf'
  },
  WORD: {
    category: 'document',
    name: 'Word',
    fullName: 'Microsoft Word Document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx', '.doc'],
    isTextBased: false,
    description: 'Microsoft Word document',
    icon: 'description'
  },
  ODT: {
    category: 'document',
    name: 'ODT',
    fullName: 'OpenDocument Text',
    mimeType: 'application/vnd.oasis.opendocument.text',
    extensions: ['.odt'],
    isTextBased: false,
    description: 'OpenDocument text document format',
    icon: 'description'
  },
  TEXT: {
    category: 'document',
    name: 'TXT',
    fullName: 'Plain Text',
    mimeType: 'text/plain',
    extensions: ['.txt', '.text'],
    isTextBased: true,
    description: 'Plain text document',
    icon: 'text_snippet'
  },
  MARKDOWN: {
    category: 'document',
    name: 'Markdown',
    fullName: 'Markdown Document',
    mimeType: 'text/markdown',
    extensions: ['.md', '.markdown'],
    isTextBased: true,
    description: 'Markdown formatted text document',
    icon: 'article'
  },
  
  // Image formats
  JPEG: {
    category: 'image',
    name: 'JPEG',
    fullName: 'JPEG Image',
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
    isTextBased: false,
    description: 'JPEG compressed image format',
    icon: 'image'
  },
  PNG: {
    category: 'image',
    name: 'PNG',
    fullName: 'Portable Network Graphics',
    mimeType: 'image/png',
    extensions: ['.png'],
    isTextBased: false,
    description: 'Portable Network Graphics image format',
    icon: 'image'
  },
  GIF: {
    category: 'image',
    name: 'GIF',
    fullName: 'Graphics Interchange Format',
    mimeType: 'image/gif',
    extensions: ['.gif'],
    isTextBased: false,
    description: 'Graphics Interchange Format for animated images',
    icon: 'gif'
  },
  SVG: {
    category: 'image',
    name: 'SVG',
    fullName: 'Scalable Vector Graphics',
    mimeType: 'image/svg+xml',
    extensions: ['.svg'],
    isTextBased: true,
    description: 'Scalable Vector Graphics format',
    icon: 'format_shapes'
  },
  
  // Archive formats
  ZIP: {
    category: 'archive',
    name: 'ZIP',
    fullName: 'ZIP Archive',
    mimeType: 'application/zip',
    extensions: ['.zip'],
    isTextBased: false,
    description: 'ZIP compressed archive format',
    icon: 'folder_zip'
  },
  GZIP: {
    category: 'archive',
    name: 'GZIP',
    fullName: 'GZIP Compressed',
    mimeType: 'application/gzip',
    extensions: ['.gz', '.gzip'],
    isTextBased: false,
    description: 'GZIP compressed file format',
    icon: 'folder_zip'
  },
  TAR: {
    category: 'archive',
    name: 'TAR',
    fullName: 'Tape Archive',
    mimeType: 'application/x-tar',
    extensions: ['.tar'],
    isTextBased: false,
    description: 'Tape archive file format',
    icon: 'folder_zip'
  },
  
  // Database formats
  SQLITE: {
    category: 'database',
    name: 'SQLite',
    fullName: 'SQLite Database',
    mimeType: 'application/vnd.sqlite3',
    extensions: ['.sqlite', '.db', '.sqlite3'],
    isTextBased: false,
    description: 'SQLite database file',
    icon: 'storage'
  },
  
  // Other formats
  UNKNOWN: {
    category: 'other',
    name: 'Unknown',
    fullName: 'Unknown File Type',
    mimeType: 'application/octet-stream',
    extensions: [],
    isTextBased: false,
    description: 'Unknown or unrecognized file type',
    icon: 'help_outline'
  }
};

/**
 * File signatures for binary detection
 * @type {Array<Object>}
 */
const FILE_SIGNATURES = [
  // Zip-based formats (Office documents, archives, etc.)
  {
    type: FILE_TYPES.ZIP.name,
    signature: [0x50, 0x4B, 0x03, 0x04],
    offset: 0
  },
  // Excel 2007+ file
  {
    type: FILE_TYPES.EXCEL.name,
    signature: [0x50, 0x4B, 0x03, 0x04],
    offset: 0,
    extraCheck: (fileType, fileName) => {
      return fileName && /\.(xlsx|xlsm|xlsb)$/i.test(fileName);
    }
  },
  // Word 2007+ file
  {
    type: FILE_TYPES.WORD.name,
    signature: [0x50, 0x4B, 0x03, 0x04],
    offset: 0,
    extraCheck: (fileType, fileName) => {
      return fileName && /\.(docx|docm)$/i.test(fileName);
    }
  },
  // PDF
  {
    type: FILE_TYPES.PDF.name,
    signature: [0x25, 0x50, 0x44, 0x46],
    offset: 0
  },
  // JPEG
  {
    type: FILE_TYPES.JPEG.name,
    signature: [0xFF, 0xD8, 0xFF],
    offset: 0
  },
  // PNG
  {
    type: FILE_TYPES.PNG.name,
    signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    offset: 0
  },
  // GIF
  {
    type: FILE_TYPES.GIF.name,
    signature: [0x47, 0x49, 0x46, 0x38],
    offset: 0
  },
  // GZIP
  {
    type: FILE_TYPES.GZIP.name,
    signature: [0x1F, 0x8B],
    offset: 0
  },
  // SQLite
  {
    type: FILE_TYPES.SQLITE.name,
    signature: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74],
    offset: 0
  }
];

/**
 * Content patterns for text-based detection
 * @type {Array<Object>}
 */
const CONTENT_PATTERNS = [
  // CSV
  {
    type: FILE_TYPES.CSV.name,
    pattern: /^[\w"']+(,[\w"']+)*(\r?\n[\w"']+(,[\w"']+)*)*$/,
    minSample: 50,
    confidence: 0.8,
    validationFn: (content) => {
      // Additional checks to increase confidence
      const lines = content.trim().split(/\r?\n/);
      if (lines.length < 2) return 0.5; // Need at least 2 lines
      
      // Check if all lines have the same number of fields
      const firstLineFields = lines[0].split(',').length;
      const consistentFields = lines.every(line => line.split(',').length === firstLineFields);
      
      return consistentFields ? 0.9 : 0.6;
    }
  },
  // TSV
  {
    type: FILE_TYPES.TSV.name,
    pattern: /^[\w"']+([\t][\w"']+)*(\r?\n[\w"']+([\t][\w"']+)*)*$/,
    minSample: 50,
    confidence: 0.8,
    validationFn: (content) => {
      // Additional checks to increase confidence
      const lines = content.trim().split(/\r?\n/);
      if (lines.length < 2) return 0.5; // Need at least 2 lines
      
      // Check if all lines have the same number of fields
      const firstLineFields = lines[0].split('\t').length;
      const consistentFields = lines.every(line => line.split('\t').length === firstLineFields);
      
      return consistentFields ? 0.9 : 0.6;
    }
  },
  // JSON
  {
    type: FILE_TYPES.JSON.name,
    pattern: /^\s*[{\[]/,
    minSample: 10,
    confidence: 0.7,
    validationFn: (content) => {
      try {
        JSON.parse(content);
        return 0.95; // Valid JSON
      } catch (e) {
        return 0.3; // Invalid JSON
      }
    }
  },
  // XML
  {
    type: FILE_TYPES.XML.name,
    pattern: /^\s*<\?xml|^\s*<[a-zA-Z0-9]+>/,
    minSample: 30,
    confidence: 0.7,
    validationFn: (content) => {
      // Simple XML validation - more complex validation would use a parser
      if (content.includes('<?xml version=')) {
        return 0.9;
      }
      
      // Check for balanced tags
      const openTags = content.match(/<[^\/!][^>]*>/g) || [];
      const closeTags = content.match(/<\/[^>]*>/g) || [];
      
      return openTags.length > 0 && openTags.length >= closeTags.length ? 0.8 : 0.4;
    }
  },
  // YAML
  {
    type: FILE_TYPES.YAML.name,
    pattern: /^\s*([a-zA-Z0-9_-]+):\s*(.+)(\r?\n\s*[a-zA-Z0-9_-]+:\s*(.+))*$/,
    minSample: 30,
    confidence: 0.6,
    validationFn: (content) => {
      // Simple YAML validation
      const lines = content.trim().split(/\r?\n/);
      const keyValuePairs = lines.filter(line => 
        /^\s*[a-zA-Z0-9_-]+:\s*.+$/.test(line)
      ).length;
      
      return keyValuePairs > 0 ? 0.7 + Math.min(0.2, keyValuePairs / lines.length) : 0.3;
    }
  },
  // Markdown
  {
    type: FILE_TYPES.MARKDOWN.name,
    pattern: /^#+ |^-{3,}$|^\*{3,}$|^> |^```|^\* |^\d+\. |^!\[.*\]\(.*\)/m,
    minSample: 50,
    confidence: 0.6,
    validationFn: (content) => {
      // Check for multiple Markdown features
      let score = 0.6;
      
      if (content.match(/^#+ /m)) score += 0.1; // Headers
      if (content.match(/\*\*.*\*\*|__.*__/)) score += 0.05; // Bold
      if (content.match(/\*.*\*|_.*_/)) score += 0.05; // Italic
      if (content.match(/^> /m)) score += 0.05; // Blockquote
      if (content.match(/^```/m)) score += 0.1; // Code block
      if (content.match(/!\[.*\]\(.*\)/)) score += 0.05; // Image
      
      return Math.min(0.9, score);
    }
  },
  // SVG
  {
    type: FILE_TYPES.SVG.name,
    pattern: /<svg[^>]*>/,
    minSample: 30,
    confidence: 0.7,
    validationFn: (content) => {
      if (content.includes('<svg') && content.includes('</svg>')) {
        return 0.9;
      }
      return 0.5;
    }
  },
  // Plain text (fallback)
  {
    type: FILE_TYPES.TEXT.name,
    pattern: /^[\x20-\x7E\r\n\t]+$/,
    minSample: 100,
    confidence: 0.5,
    validationFn: (content) => {
      // Check if it's mostly printable ASCII
      const printableChars = content.match(/[\x20-\x7E]/g) || [];
      const ratio = printableChars.length / content.length;
      
      return ratio > 0.9 ? 0.7 : 0.4;
    }
  }
];

/**
 * Detect file type based on file object and optional content sample
 * 
 * @param {Object} options - Detection options
 * @param {File|Object} options.file - File object or file-like object with name and size
 * @param {string} [options.content] - Content sample for text-based detection
 * @param {ArrayBuffer} [options.buffer] - Binary buffer for signature-based detection
 * @param {boolean} [options.deepInspection=false] - Whether to perform deep content inspection
 * @returns {Object} Detection result with type info and confidence
 */
export const detectFileType = async ({ file, content, buffer, deepInspection = false }) => {
  if (!file) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }

  const fileName = file.name;
  const fileSize = file.size;
  
  // Initialize detection result
  let result = {
    detectedType: FILE_TYPES.UNKNOWN,
    confidence: 0,
    possibleTypes: [],
    metadata: {
      fileName,
      fileSize,
      extension: getFileExtension(fileName),
      isTextBased: false,
      category: 'unknown'
    }
  };

  // Step 1: Extension-based detection
  const extensionResult = detectByExtension(fileName);
  result = mergeResults(result, extensionResult);

  // Step 2: Binary signature detection for non-text files
  if (buffer && buffer.byteLength > 0) {
    const signatureResult = detectBySignature(buffer, fileName);
    result = mergeResults(result, signatureResult);
  }

  // Step 3: Content-based detection for text files
  if (content && content.length > 0) {
    const contentResult = detectByContent(content);
    result = mergeResults(result, contentResult);
  }

  // Step 4: Deep inspection if enabled and confidence is low
  if (deepInspection && result.confidence < 0.8 && content) {
    const deepResult = await performDeepInspection(content, result.detectedType);
    result = mergeResults(result, deepResult);
  }

  // Update metadata based on final detected type
  result.metadata = {
    ...result.metadata,
    isTextBased: result.detectedType.isTextBased || false,
    category: result.detectedType.category || 'unknown',
    mimeType: result.detectedType.mimeType || 'application/octet-stream'
  };

  return result;
};

/**
 * Get content sample from file
 * 
 * @param {File} file - File object to read from
 * @param {Object} options - Reading options
 * @param {boolean} [options.readAsText=true] - Whether to read as text
 * @param {boolean} [options.readAsBuffer=false] - Whether to read as buffer
 * @param {number} [options.maxSampleSize=4096] - Maximum sample size to read
 * @returns {Promise<Object>} Object containing content and/or buffer
 */
export const getFileSample = (file, options = {}) => {
  const {
    readAsText = true,
    readAsBuffer = false,
    maxSampleSize = 4096
  } = options;
  
  return new Promise((resolve, reject) => {
    // For empty files
    if (!file || file.size === 0) {
      resolve({ content: '', buffer: null });
      return;
    }
    
    // Initialize FileReader
    const reader = new FileReader();
    
    // Handle load completion
    reader.onload = (event) => {
      const result = {
        content: null,
        buffer: null
      };
      
      if (readAsText) {
        result.content = event.target.result;
      }
      
      if (readAsBuffer) {
        result.buffer = event.target.result;
      }
      
      resolve(result);
    };
    
    // Handle errors
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Read appropriate slice of the file
    const slice = file.slice(0, Math.min(file.size, maxSampleSize));
    
    if (readAsBuffer) {
      reader.readAsArrayBuffer(slice);
    } else if (readAsText) {
      reader.readAsText(slice);
    } else {
      resolve({ content: null, buffer: null });
    }
  });
};

/**
 * Detect file type with full analysis
 * 
 * @param {File} file - File object to analyze
 * @param {Object} [options] - Analysis options
 * @param {boolean} [options.deepInspection=false] - Whether to perform deep inspection
 * @param {number} [options.maxSampleSize=8192] - Maximum sample size to read
 * @returns {Promise<Object>} Detection result with type info and confidence
 */
export const analyzeFile = async (file, options = {}) => {
  const {
    deepInspection = false,
    maxSampleSize = 8192
  } = options;
  
  if (!file) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  try {
    // Read sample of the file for analysis
    const { content, buffer } = await getFileSample(file, {
      readAsText: true,
      readAsBuffer: true,
      maxSampleSize
    });
    
    // Detect file type using all available information
    const result = await detectFileType({
      file,
      content,
      buffer,
      deepInspection
    });
    
    return result;
  } catch (error) {
    console.error('Error analyzing file:', error);
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
};

/**
 * Detect file type based on extension
 * 
 * @param {string} fileName - File name with extension
 * @returns {Object} Detection result with type info and confidence
 */
function detectByExtension(fileName) {
  if (!fileName) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  const extension = getFileExtension(fileName);
  if (!extension) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  // Find file type by extension (case insensitive)
  const matchingType = Object.values(FILE_TYPES).find(type => 
    type.extensions && type.extensions.some(ext => 
      ext.toLowerCase() === extension.toLowerCase()
    )
  );
  
  if (matchingType) {
    // Extension match is pretty reliable, but not definitive
    return createDetectionResult(matchingType, 0.7);
  }
  
  return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
}

/**
 * Detect file type based on binary signature
 * 
 * @param {ArrayBuffer} buffer - Binary buffer to analyze
 * @param {string} fileName - File name for additional checks
 * @returns {Object} Detection result with type info and confidence
 */
function detectBySignature(buffer, fileName) {
  if (!buffer || buffer.byteLength === 0) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  const bytes = new Uint8Array(buffer);
  
  // Check each signature
  for (const sig of FILE_SIGNATURES) {
    let matches = true;
    
    // Check if enough bytes to compare
    if (bytes.length < sig.signature.length + sig.offset) {
      continue;
    }
    
    // Compare bytes
    for (let i = 0; i < sig.signature.length; i++) {
      if (bytes[i + sig.offset] !== sig.signature[i]) {
        matches = false;
        break;
      }
    }
    
    // If signature matches
    if (matches) {
      // Run extra checks if needed
      if (sig.extraCheck && !sig.extraCheck(sig.type, fileName)) {
        continue;
      }
      
      // Get full type info
      const detectedType = Object.values(FILE_TYPES).find(type => type.name === sig.type);
      
      if (detectedType) {
        // Binary signatures are very reliable
        return createDetectionResult(detectedType, 0.9);
      }
    }
  }
  
  return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
}

/**
 * Detect file type based on content analysis
 * 
 * @param {string} content - Text content to analyze
 * @returns {Object} Detection result with type info and confidence
 */
function detectByContent(content) {
  if (!content || typeof content !== 'string' || content.length === 0) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  // Trim to reasonable length for pattern matching
  const trimmedContent = content.slice(0, 2000);
  
  // Try each pattern
  const matches = [];
  
  for (const pattern of CONTENT_PATTERNS) {
    // Skip if content is shorter than required sample
    if (trimmedContent.length < pattern.minSample) {
      continue;
    }
    
    // Check if pattern matches
    if (pattern.pattern.test(trimmedContent)) {
      let confidence = pattern.confidence;
      
      // Run additional validation if available
      if (pattern.validationFn) {
        confidence = pattern.validationFn(trimmedContent);
      }
      
      if (confidence > 0) {
        const detectedType = Object.values(FILE_TYPES).find(type => type.name === pattern.type);
        
        if (detectedType) {
          matches.push({
            detectedType,
            confidence
          });
        }
      }
    }
  }
  
  // If no matches found
  if (matches.length === 0) {
    return createDetectionResult(FILE_TYPES.UNKNOWN, 0);
  }
  
  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Return best match
  return createDetectionResult(
    matches[0].detectedType,
    matches[0].confidence,
    matches.slice(1).map(m => ({ type: m.detectedType, confidence: m.confidence }))
  );
}

/**
 * Perform deep inspection of content
 * 
 * @param {string} content - Content to inspect
 * @param {Object} currentType - Currently detected type
 * @returns {Promise<Object>} Refined detection result
 */
async function performDeepInspection(content, currentType) {
  // Default to current detection
  let result = createDetectionResult(currentType, 0.5);
  
  try {
    switch (currentType.name) {
      case FILE_TYPES.CSV.name:
        result = inspectCsvFormat(content);
        break;
        
      case FILE_TYPES.JSON.name:
        result = inspectJsonFormat(content);
        break;
        
      case FILE_TYPES.XML.name:
        result = inspectXmlFormat(content);
        break;
        
      // Add more specialized inspections as needed
        
      default:
        // Generic text analysis
        result = inspectGenericText(content);
    }
  } catch (error) {
    console.error('Error in deep inspection:', error);
  }
  
  return result;
}

/**
 * Inspect CSV format in detail
 * 
 * @param {string} content - CSV content to inspect
 * @returns {Object} Refined detection result
 */
function inspectCsvFormat(content) {
  // Try to determine if it's valid CSV
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return createDetectionResult(FILE_TYPES.TEXT, 0.6);
  }
  
  // Count commas in first 5 lines
  const commasCounts = lines.slice(0, 5).map(line => 
    (line.match(/,/g) || []).length
  );
  
  // If consistent comma counts, likely CSV
  const allEqual = commasCounts.every(count => count === commasCounts[0]);
  
  if (allEqual && commasCounts[0] > 0) {
    return createDetectionResult(FILE_TYPES.CSV, 0.9);
  }
  
  // Check for TSV
  const tabsCounts = lines.slice(0, 5).map(line => 
    (line.match(/\t/g) || []).length
  );
  
  const tabsAllEqual = tabsCounts.every(count => count === tabsCounts[0]);
  
  if (tabsAllEqual && tabsCounts[0] > 0) {
    return createDetectionResult(FILE_TYPES.TSV, 0.9);
  }
  
  // Otherwise, could be another delimiter or just text
  return createDetectionResult(FILE_TYPES.TEXT, 0.7);
}

/**
 * Inspect JSON format in detail
 * 
 * @param {string} content - JSON content to inspect
 * @returns {Object} Refined detection result
 */
function inspectJsonFormat(content) {
  try {
    // Try parsing as JSON
    JSON.parse(content);
    
    // Check for array of objects (common data format)
    if (content.trim().startsWith('[{') && content.trim().endsWith('}]')) {
      return createDetectionResult(FILE_TYPES.JSON, 0.95, [
        { type: FILE_TYPES.TEXT, confidence: 0.4 }
      ]);
    }
    
    // Valid JSON but not array of objects
    return createDetectionResult(FILE_TYPES.JSON, 0.9, [
      { type: FILE_TYPES.TEXT, confidence: 0.5 }
    ]);
  } catch (error) {
    // Not valid JSON
    return createDetectionResult(FILE_TYPES.TEXT, 0.7, [
      { type: FILE_TYPES.JSON, confidence: 0.3 }
    ]);
  }
}

/**
 * Inspect XML format in detail
 * 
 * @param {string} content - XML content to inspect
 * @returns {Object} Refined detection result
 */
function inspectXmlFormat(content) {
  // Check for XML declaration
  if (content.trim().startsWith('<?xml')) {
    return createDetectionResult(FILE_TYPES.XML, 0.95);
  }
  
  // Check for root element
  const rootMatch = content.match(/<([a-zA-Z][a-zA-Z0-9:_.-]*)[^>]*>/);
  if (rootMatch) {
    const rootTag = rootMatch[1];
    
    // Look for matching closing tag
    const closingTagMatch = new RegExp(`</${rootTag}\\s*>`, 'i');
    
    if (closingTagMatch.test(content)) {
      return createDetectionResult(FILE_TYPES.XML, 0.9);
    }
  }
  
  // Might be HTML or invalid XML
  if (content.indexOf('<html') >= 0 || content.indexOf('<!DOCTYPE html') >= 0) {
    return createDetectionResult(FILE_TYPES.TEXT, 0.8);
  }
  
  return createDetectionResult(FILE_TYPES.TEXT, 0.6);
}

/**
 * Inspect generic text content
 * 
 * @param {string} content - Text content to inspect
 * @returns {Object} Refined detection result
 */
function inspectGenericText(content) {
  // Check for markdown features
  const markdownFeatures = [
    /^#+ /m,           // Headers
    /\*\*.*\*\*/,      // Bold
    /\*.*\*/,          // Italic
    /^> /m,            // Blockquote
    /^- /m,            // List
    /^[0-9]+\. /m,     // Numbered list
    /^```/m,           // Code block
    /!\[.*\]\(.*\)/    // Image
  ];
  
  const markdownCount = markdownFeatures.filter(regex => regex.test(content)).length;
  
  if (markdownCount >= 3) {
    return createDetectionResult(FILE_TYPES.MARKDOWN, 0.85);
  }
  
  // Check for YAML structure
  const yamlFeatures = [
    /^[a-zA-Z0-9_-]+:\s*(.+)/m,  // Key-value pairs
    /^-\s+[a-zA-Z0-9_-]+:/m,     // List items with keys
    /^  [a-zA-Z0-9_-]+:/m       // Indented keys
  ];
  
  const yamlCount = yamlFeatures.filter(regex => regex.test(content)).length;
  
  if (yamlCount >= 2) {
    return createDetectionResult(FILE_TYPES.YAML, 0.8);
  }
  
  // Fall back to plain text
  return createDetectionResult(FILE_TYPES.TEXT, 0.7);
}

/**
 * Create a detection result object
 * 
 * @param {Object} detectedType - Detected file type
 * @param {number} confidence - Confidence score (0-1)
 * @param {Array} [possibleTypes=[]] - Other possible types
 * @returns {Object} Detection result
 */
function createDetectionResult(detectedType, confidence, possibleTypes = []) {
  return {
    detectedType: detectedType || FILE_TYPES.UNKNOWN,
    confidence: confidence || 0,
    possibleTypes: possibleTypes || []
  };
}

/**
 * Merge detection results, keeping the highest confidence result
 * 
 * @param {Object} currentResult - Current detection result
 * @param {Object} newResult - New detection result to merge
 * @returns {Object} Merged detection result
 */
function mergeResults(currentResult, newResult) {
  // If new result has higher confidence, use it
  if (newResult.confidence > currentResult.confidence) {
    // Add current type to possible types if different
    const possibleTypes = [...newResult.possibleTypes];
    
    if (currentResult.detectedType.name !== newResult.detectedType.name && 
        currentResult.confidence > 0.3) {
      possibleTypes.push({
        type: currentResult.detectedType,
        confidence: currentResult.confidence
      });
    }
    
    // Add current possible types
    currentResult.possibleTypes.forEach(pt => {
      if (!possibleTypes.some(npt => npt.type.name === pt.type.name)) {
        possibleTypes.push(pt);
      }
    });
    
    // Sort by confidence
    possibleTypes.sort((a, b) => b.confidence - a.confidence);
    
    return {
      ...newResult,
      possibleTypes: possibleTypes.slice(0, 3) // Keep top 3
    };
  }
  
  // Otherwise, keep current result but maybe update possible types
  const possibleTypes = [...currentResult.possibleTypes];
  
  if (newResult.detectedType.name !== currentResult.detectedType.name && 
      newResult.confidence > 0.3) {
    possibleTypes.push({
      type: newResult.detectedType,
      confidence: newResult.confidence
    });
  }
  
  // Add new possible types
  newResult.possibleTypes.forEach(pt => {
    if (!possibleTypes.some(cpt => cpt.type.name === pt.type.name)) {
      possibleTypes.push(pt);
    }
  });
  
  // Sort by confidence
  possibleTypes.sort((a, b) => b.confidence - a.confidence);
  
  return {
    ...currentResult,
    possibleTypes: possibleTypes.slice(0, 3) // Keep top 3
  };
}

/**
 * Get file extension from file name
 * 
 * @param {string} fileName - File name to extract extension from
 * @returns {string} File extension with leading dot, or empty string
 */
function getFileExtension(fileName) {
  if (!fileName) return '';
  
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) return '';
  
  return fileName.slice(lastDotIndex);
}

/**
 * Get a suggested icon for a file type
 * 
 * @param {string} fileType - File type name
 * @returns {string} Icon name to use (Material Icons)
 */
export const getFileTypeIcon = (fileType) => {
  const type = typeof fileType === 'string' 
    ? Object.values(FILE_TYPES).find(t => t.name === fileType)
    : fileType;
  
  return type?.icon || 'insert_drive_file';
};