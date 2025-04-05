/**
 * FileTypeDetectorDemo Component
 * 
 * A demo component to showcase the FileTypeDetector functionality
 * with sample files and detailed explanation.
 */

import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Button, Divider, Alert, Stack, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

// Import icons
import { FilePresent as FileIcon, TableChart as TableIcon, Code as CodeIcon, Description as DocumentIcon, Image as ImageIcon, PictureAsPdf as PdfIcon, DataObject as DataObjectIcon, Scanner as ScannerIcon, Check as CheckIcon, DataArray as DataArrayIcon, Storage as StorageIcon, FolderZip as ArchiveIcon } from '@mui/icons-material';

// Import components
import FileTypeDetector from './FileTypeDetector';
import { FILE_TYPES } from "@/utils/fileTypeDetector";

/**
 * FileTypeDetectorDemo Component
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const FileTypeDetectorDemo = () => {
  const [detectionResult, setDetectionResult] = useState(null);

  // Handle detection complete
  const handleDetectionComplete = result => {
    setDetectionResult(result);
    console.log('Detection result:', result);
  };
  return <Container maxWidth="lg" sx={{
    mt: 4,
    mb: 4
  }}>
      <Typography variant="h4" component="h1" gutterBottom>
        File Type Detector Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the file type detection functionality using content inspection and signature
        analysis. Upload or drag a file to see it in action.
      </Typography>
      
      <Alert severity="info" sx={{
      mb: 3
    }}>
        Try uploading different types of files to see how the detector works with various formats! 
        The detector supports CSV, JSON, XML, Excel, PDF, images, and many more file types.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <FileTypeDetector onDetectionComplete={handleDetectionComplete} allowFileDrop={true} showDetailedResults={true} performDeepInspection={true} />

        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{
          p: 2
        }}>
            <Typography variant="h6" gutterBottom>
              Supported File Types
            </Typography>
            
            <Typography variant="body2" paragraph color="text.secondary">
              The detector supports a wide range of file types across multiple categories:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DataObjectIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Data Formats" secondary="CSV, TSV, JSON, XML, YAML, Parquet, Avro, ORC" />

              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TableIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Spreadsheets" secondary="Excel, ODS" />

              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DocumentIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Documents" secondary="PDF, Word, ODT, TXT, Markdown" />

              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <ImageIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Images" secondary="JPEG, PNG, GIF, SVG" />

              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <ArchiveIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Archives" secondary="ZIP, GZIP, TAR" />

              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <StorageIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Databases" secondary="SQLite" />

              </ListItem>
            </List>
          </Paper>
          
          {detectionResult && <Card sx={{
          mt: 2
        }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detection Result
                </Typography>
                
                <Box sx={{
              mt: 1
            }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {detectionResult.detectedType.fullName}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Confidence:</strong> {Math.round(detectionResult.confidence * 100)}%
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Category:</strong> {detectionResult.detectedType.category}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Text-based:</strong> {detectionResult.detectedType.isTextBased ? 'Yes' : 'No'}
                  </Typography>
                  
                  {detectionResult.possibleTypes && detectionResult.possibleTypes.length > 0 && <>
                      <Typography variant="body2" sx={{
                  mt: 1
                }}>
                        <strong>Other Possible Types:</strong>
                      </Typography>
                      
                      <Stack direction="row" spacing={1} sx={{
                  mt: 0.5
                }} flexWrap="wrap">
                        {detectionResult.possibleTypes.map((pt, index) => <Chip key={index} label={`${pt.type.name} (${Math.round(pt.confidence * 100)}%)`} size="small" variant="outlined" sx={{
                    mb: 0.5
                  }} />)}


                      </Stack>
                    </>}

                </Box>
              </CardContent>
            </Card>}

        </Grid>
      </Grid>
      
      <Box sx={{
      mt: 4
    }}>
        <Typography variant="h5" gutterBottom>
          About File Type Detection
        </Typography>
        <Divider sx={{
        mb: 2
      }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <ScannerIcon sx={{
                  mr: 1
                }} />
                  Detection Methods
                </Typography>
                
                <Typography variant="body2" paragraph>
                  The file type detector uses multiple methods to accurately identify file types:
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Extension Analysis" secondary="Examines file extensions as initial indicators" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Binary Signatures" secondary="Detects file type-specific byte patterns" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Content Inspection" secondary="Analyzes file content structure and patterns" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Deep Inspection" secondary="Performs thorough content validation for ambiguous files" />

                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <DataArrayIcon sx={{
                  mr: 1
                }} />
                  Key Features
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Our file type detector offers several advanced capabilities:
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Confidence Scoring" secondary="Indicates detection reliability with numeric confidence scores" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Alternative Type Detection" secondary="Provides other possible file types when detection is ambiguous" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Detailed Metadata" secondary="Includes comprehensive information about detected file types" />

                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Browser-based Detection" secondary="Works entirely in the browser without server-side processing" />

                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>;
};
export default FileTypeDetectorDemo;