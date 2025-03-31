/**
 * Design System Adapter Layer
 * -----------------------------------------------------------------------------
 * Direct export of MUI components to provide a consistent design system API.
 * This adapter ensures that components can be imported from one central location
 * while allowing for future design system customization.
 * 
 * TECHNICAL DEBT NOTE:
 * This is an intentionally simplified approach to standardize imports 
 * and remove complex adapter logic that was causing build failures.
 */

// Import direct MUI components to standardize as design system
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Backdrop from '@mui/material/Backdrop';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Zoom from '@mui/material/Zoom';

// Import theme utilities
import { useTheme, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled as muiStyled, alpha as muiAlpha } from '@mui/material/styles';

// Simplified theme implementation
const theme = {
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    },
    error: {
      main: '#f44336'
    },
    warning: {
      main: '#ed6c02'
    },
    info: {
      main: '#0288d1'
    },
    success: {
      main: '#2e7d32'
    }
  },
  spacing: (factor) => `${8 * factor}px`
};

// Create aliases for better API compatibility
const ThemeProvider = ({ children }) => children; // Simple passthrough implementation
const styled = muiStyled;
const alpha = muiAlpha;

// Export all components
export {
  Collapse,
  Drawer,
  Snackbar,
  Box,
  Popper,
  Fade,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Typography,
  TextField,
  Grid,
  Dialog,
  Select,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Tabs,
  Tab,
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Divider,
  ButtonGroup,
  FormHelperText,
  InputAdornment,
  Slider,
  Skeleton,
  Pagination,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Backdrop,
  ClickAwayListener,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Zoom,
  
  // Theme utilities
  useTheme,
  useMediaQuery,
  theme,
  ThemeProvider,
  styled,
  alpha,
  createTheme
};