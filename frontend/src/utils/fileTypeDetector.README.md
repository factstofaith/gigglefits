# File Type Detector

This utility provides comprehensive file type detection capabilities through content inspection, extension analysis, and signature detection. It's designed to accurately identify various file formats with detailed confidence scoring and metadata extraction.

## Core Features

- **Multi-Method Detection**: Combines extension analysis, binary signature detection, and content pattern matching for accurate type identification
- **Confidence Scoring**: Provides confidence levels for detection results to indicate reliability
- **Alternative Type Detection**: Identifies possible alternative file types for ambiguous files
- **Deep Content Inspection**: Performs thorough content analysis for enhanced accuracy
- **Extensive Format Support**: Detects a wide range of file formats across multiple categories
- **Detailed Metadata**: Extracts and provides comprehensive metadata about detected file types

## Usage

### Basic Usage

```jsx
import { analyzeFile, detectFileType } from './utils/fileTypeDetector';

// Analyzing a complete file
const file = event.target.files[0];
const result = await analyzeFile(file);

console.log('Detected type:', result.detectedType.name);
console.log('Confidence:', result.confidence);
console.log('Metadata:', result.metadata);
```

### Custom Detection Process

For more control over the detection process:

```jsx
import { detectFileType, getFileSample } from './utils/fileTypeDetector';

// Get a sample of the file content
const file = event.target.files[0];
const { content, buffer } = await getFileSample(file, {
  readAsText: true,
  readAsBuffer: true,
  maxSampleSize: 4096
});

// Detect file type with content and buffer
const result = await detectFileType({
  file,
  content,
  buffer,
  deepInspection: true
});

console.log('Detected type:', result.detectedType.name);
console.log('Category:', result.detectedType.category);
console.log('MIME type:', result.detectedType.mimeType);
console.log('Alternative types:', result.possibleTypes);
```

### Detection Result Format

The detection results include:

```js
{
  // Primary detected type
  detectedType: {
    name: 'CSV',
    fullName: 'Comma-Separated Values',
    category: 'data',
    mimeType: 'text/csv',
    extensions: ['.csv'],
    isTextBased: true,
    description: 'Tabular data in comma-separated format',
    icon: 'table_view'
  },
  
  // Detection confidence (0-1)
  confidence: 0.92,
  
  // Alternative possible types with their confidence
  possibleTypes: [
    {
      type: {
        name: 'TSV',
        // Full type information...
      },
      confidence: 0.65
    }
  ],
  
  // File metadata
  metadata: {
    fileName: 'data.csv',
    fileSize: 1024,
    extension: '.csv',
    isTextBased: true,
    category: 'data',
    mimeType: 'text/csv'
  }
}
```

### Getting File Type Icons

To get the appropriate icon for a file type:

```jsx
import { getFileTypeIcon, FILE_TYPES } from './utils/fileTypeDetector';

// Get icon by type name
const iconName = getFileTypeIcon('CSV');

// Or by type object
const iconName = getFileTypeIcon(FILE_TYPES.CSV);

// Use with Material Icons
import { Icon } from '@mui/material';

<Icon>{iconName}</Icon>
```

## Supported File Types

The detector supports a wide range of file types across multiple categories:

### Data Formats
- CSV (Comma-Separated Values)
- TSV (Tab-Separated Values)
- JSON (JavaScript Object Notation)
- XML (Extensible Markup Language)
- YAML (YAML Ain't Markup Language)
- Parquet (Apache Parquet)
- Avro (Apache Avro)
- ORC (Optimized Row Columnar)

### Spreadsheets
- Excel (XLSX, XLS)
- ODS (OpenDocument Spreadsheet)

### Documents
- PDF (Portable Document Format)
- Word (DOCX, DOC)
- ODT (OpenDocument Text)
- TXT (Plain Text)
- Markdown (MD)

### Images
- JPEG (Joint Photographic Experts Group)
- PNG (Portable Network Graphics)
- GIF (Graphics Interchange Format)
- SVG (Scalable Vector Graphics)

### Archives
- ZIP (ZIP Archive)
- GZIP (GZIP Compressed)
- TAR (Tape Archive)

### Databases
- SQLite (SQLite Database)

## Detection Methods

The file type detector uses multiple methods to identify file types:

1. **Extension Analysis**: Examines file extensions as initial indicators of file type
2. **Binary Signature Detection**: Identifies file types based on characteristic byte patterns
3. **Content Pattern Matching**: Analyzes text content for structure and patterns
4. **Deep Content Inspection**: Performs specialized validation for ambiguous files

The detector combines results from these methods to provide the most accurate type identification with appropriate confidence levels.

## Components

The file type detection system includes:

1. **FileTypeDetector**: A React component for uploading and analyzing files
2. **File Detection Utility**: Core functions for file type analysis and detection

## Integration with DataPreview

The file type detection capability is designed to be used with the DataPreview component to automatically determine the appropriate view for different file types:

```jsx
<DataPreview 
  file={file}
  detectFileType={true}
  onFileTypeDetected={(fileType) => {
    console.log('Detected file type:', fileType);
    // Configure view based on file type
  }}
/>
```

## Best Practices

1. **Content Inspection**: For most accurate results, provide both file extension and content for detection
2. **Deep Inspection**: Enable deep inspection for ambiguous files, but be aware it may be more CPU-intensive
3. **Confidence Threshold**: Use the confidence score to determine reliability - consider scores below 0.7 as potentially ambiguous
4. **Alternative Types**: Check alternative type suggestions when primary detection has lower confidence
5. **File Size**: For large files, use the `maxSampleSize` parameter to limit the amount of data read for inspection

## Error Handling

The file type detector includes robust error handling:

- File reading errors are caught and reported
- Invalid or corrupted files are handled gracefully
- Default to "unknown" type for unrecognizable files
- Provide confidence scores to indicate detection reliability

## Future Enhancements

Planned enhancements for the file type detection system:

1. Support for additional specialized file formats (HDF5, NetCDF, etc.)
2. Machine learning-based detection for complex or ambiguous files
3. Enhanced content parsing for deeper inspection
4. Support for detecting nested formats (e.g., zipped XML files)
5. Content preview generation based on detected file type