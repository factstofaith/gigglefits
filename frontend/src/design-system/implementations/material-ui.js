/**
 * Material UI Implementation
 * 
 * Default implementation of the design system adapter using Material UI.
 * 
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 */

import React from 'react';

// Import Material UI components
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  styled,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import { 
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails, 
  Alert,
  Modal,
  Tooltip,
  Skeleton,
  Button,
  Checkbox,
  TextField,
  RadioGroup,
  Select,
  Slider,
  Avatar,
  Chip,
  List,
  Table,
  TableHead,
  TableBody,
  Link,
  Pagination,
  Tabs,
  Tab,
  Popper,
  Fade,
  Collapse,
} from '@mui/material';

// DataGrid specific imports
// Mock DataGrid for Docker environment
// import { DataGrid } from '@mui/x-data-grid';

// Re-export Material UI components with any necessary adaptations

// Theme 
export { createTheme, styled, alpha, useTheme, useMediaQuery };

export const ThemeProvider = ({ children, theme }) => (
  <MuiThemeProvider theme={theme || createTheme()}>
    {children}
  </MuiThemeProvider>
);

export const ThemeCompatibilityProvider = ({ children }) => {
  return <>{children}</>;
};

// Feedback components
export { Accordion, AccordionSummary, AccordionDetails, Alert, Modal, Tooltip, Skeleton };

// Form components
export { Button, Checkbox, TextField, RadioGroup, Select, Slider };

// Mock DatePicker if not available
export const DatePicker = props => {
  return <TextField {...props} type="date" />;
};

// Display components
export { Avatar, Chip, List, Table, TableHead, TableBody };

// Mock DataGrid for Docker environment
export const DataGrid = props => {
  return (
    <Box sx={{ border: '1px solid #e0e0e0', height: props.height || 400, width: '100%' }}>
      <Typography variant="subtitle1" p={2}>Mock DataGrid</Typography>
      <Table>
        <TableHead>
          <tr>
            {props.columns?.map((column, index) => (
              <th key={index}>{column.headerName || column.field}</th>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {props.rows?.slice(0, 5).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {props.columns?.map((column, colIndex) => (
                <td key={colIndex}>{row[column.field]}</td>
              ))}
            </tr>
          ))}
        </TableBody>
      </Table>
      {props.rows?.length > 5 && (
        <Typography variant="caption" p={2}>
          Showing 5 of {props.rows.length} rows
        </Typography>
      )}
    </Box>
  );
};

// Mock DataPreview if not available
export const DataPreview = props => {
  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle1">{props.title || 'Data Preview'}</Typography>
      <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '300px' }}>
        {JSON.stringify(props.data || {}, null, 2)}
      </pre>
    </Box>
  );
};

// Navigation components
export { Link, Pagination, Tabs, Tab };

// Mock TabPanel if not available
export const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Layout components
export { Box, Container, Grid, Stack };

// Typography
export { Typography };

// Other components and utilities
export { Popper, Fade, Collapse };
