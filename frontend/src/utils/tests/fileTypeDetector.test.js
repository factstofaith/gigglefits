/**
 * FileTypeDetector Tests
 * 
 * Tests for the file type detector utility functions
 */

import { 
  detectFileType, 
  getFileSample, 
  analyzeFile,
  FILE_TYPES,
  getFileTypeIcon 
} from '../fileTypeDetector';

// Mock File and FileReader for testing
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.size = bits.length;
    this._content = bits.join('');
  }
  
  slice() {
    return new MockFile([this._content], this.name);
  }
};

global.FileReader = class MockFileReader {
  constructor() {
    this.DONE = 2;
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = file._content;
      this.onload({ target: this });
    }, 0);
  }
  
  readAsArrayBuffer(file) {
    setTimeout(() => {
      // Simple mock for ArrayBuffer
      this.result = {
        byteLength: file.size,
        mockBytes: file._content.split('').map(c => c.charCodeAt(0))
      };
      this.onload({ target: this });
    }, 0);
  }
};

// Sample file contents
const CSV_CONTENT = `id,name,age,city
1,John Doe,32,New York
2,Jane Smith,28,Los Angeles
3,Bob Johnson,45,Chicago`;

const JSON_CONTENT = `{
  "users": [
    {"id": 1, "name": "John Doe", "age": 32},
    {"id": 2, "name": "Jane Smith", "age": 28},
    {"id": 3, "name": "Bob Johnson", "age": 45}
  ]
}`;

const XML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>John Doe</name>
    <age>32</age>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <age>28</age>
  </user>
</users>`;

const YAML_CONTENT = `users:
  - id: 1
    name: John Doe
    age: 32
  - id: 2
    name: Jane Smith
    age: 28
settings:
  darkMode: true
  language: en`;

const PLAIN_TEXT = `This is a plain text file.
It contains multiple lines of text.
No special formatting or structure.`;

const MARKDOWN_CONTENT = `# Sample Markdown File

## Introduction

This is a *sample* markdown file with **formatting**.

- List item 1
- List item 2

[Link example](https://example.com)`;

// Mock binary signatures
const PDF_SIGNATURE = '%PDF-1.5';
const JPEG_SIGNATURE = String.fromCharCode(0xFF, 0xD8, 0xFF);
const PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4E, 0x47);

describe('FileTypeDetector', () => {
  describe('detectFileType', () => {
    test('should detect CSV files', async () => {
      const file = new File([CSV_CONTENT], 'data.csv');
      const result = await detectFileType({ file, content: CSV_CONTENT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.CSV.name);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
    
    test('should detect JSON files', async () => {
      const file = new File([JSON_CONTENT], 'data.json');
      const result = await detectFileType({ file, content: JSON_CONTENT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.JSON.name);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
    
    test('should detect XML files', async () => {
      const file = new File([XML_CONTENT], 'data.xml');
      const result = await detectFileType({ file, content: XML_CONTENT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.XML.name);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
    
    test('should detect YAML files', async () => {
      const file = new File([YAML_CONTENT], 'data.yaml');
      const result = await detectFileType({ file, content: YAML_CONTENT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.YAML.name);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    test('should detect plain text files', async () => {
      const file = new File([PLAIN_TEXT], 'plain.txt');
      const result = await detectFileType({ file, content: PLAIN_TEXT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.TEXT.name);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    test('should detect Markdown files', async () => {
      const file = new File([MARKDOWN_CONTENT], 'readme.md');
      const result = await detectFileType({ file, content: MARKDOWN_CONTENT });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.MARKDOWN.name);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    test('should detect file types based on known extensions', async () => {
      const file = new File([''], 'document.pdf');
      const result = await detectFileType({ file });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.PDF.name);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    test('should handle unknown file types gracefully', async () => {
      const file = new File(['unknown content'], 'unknown.xyz');
      const result = await detectFileType({ file, content: 'unknown content' });
      
      expect(result.detectedType.name).toBe(FILE_TYPES.UNKNOWN.name);
      expect(result.confidence).toBeLessThan(0.5);
    });
    
    test('should provide alternative type possibilities for ambiguous files', async () => {
      // A JSON-like file with .txt extension
      const file = new File([JSON_CONTENT], 'data.txt');
      const result = await detectFileType({ file, content: JSON_CONTENT });
      
      // Should detect as JSON despite the extension
      expect(result.detectedType.name).toBe(FILE_TYPES.JSON.name);
      
      // But should also suggest TEXT as an alternative
      expect(result.possibleTypes.some(pt => pt.type.name === FILE_TYPES.TEXT.name)).toBe(true);
    });
  });
  
  describe('analyzeFile', () => {
    // This is a more limited test since we're mocking FileReader
    test('should analyze files by reading their content', async () => {
      const file = new File([CSV_CONTENT], 'data.csv');
      const result = await analyzeFile(file);
      
      expect(result.detectedType.name).toBe(FILE_TYPES.CSV.name);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.metadata.fileName).toBe('data.csv');
    });
    
    test('should handle null or invalid files', async () => {
      const result = await analyzeFile(null);
      
      expect(result.detectedType.name).toBe(FILE_TYPES.UNKNOWN.name);
      expect(result.confidence).toBe(0);
    });
  });
  
  describe('getFileTypeIcon', () => {
    test('should return the correct icon names for file types', () => {
      // Test icon for specific file types
      expect(getFileTypeIcon(FILE_TYPES.CSV.name)).toBe(FILE_TYPES.CSV.icon);
      expect(getFileTypeIcon(FILE_TYPES.PDF.name)).toBe(FILE_TYPES.PDF.icon);
      expect(getFileTypeIcon(FILE_TYPES.JPEG.name)).toBe(FILE_TYPES.JPEG.icon);
      
      // Test with unknown type
      expect(getFileTypeIcon('nonexistent')).toBe('insert_drive_file');
    });
    
    test('should handle direct file type objects', () => {
      expect(getFileTypeIcon(FILE_TYPES.CSV)).toBe(FILE_TYPES.CSV.icon);
    });
  });
});