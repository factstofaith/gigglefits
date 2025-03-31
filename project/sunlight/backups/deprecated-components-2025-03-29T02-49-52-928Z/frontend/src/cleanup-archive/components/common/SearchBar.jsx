/**
 * @component SearchBar
 * @description Advanced search bar component with syntax highlighting, autocompletion,
 * and saved search functionality. Provides a comprehensive search experience with
 * field search, operators, tags, and phrase search capabilities.
 *
 * @example
 * // Basic usage with search hook
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   filteredItems,
 *   savedSearches,
 *   saveSearch,
 *   deleteSavedSearch,
 *   getSearchSuggestions
 * } = useAdvancedSearch(items, {
 *   searchableFields: ['name', 'description', 'tags']
 * });
 *
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onSearch={handleSearch}
 *   suggestions={getSearchSuggestions()}
 *   savedSearches={savedSearches}
 *   onSaveSearch={saveSearch}
 *   onDeleteSavedSearch={deleteSavedSearch}
 *   placeholder="Search integrations...&quot;
 *   autoFocus
 * />
 */

import React, { useState, useEffect, useRef, useMemo } from "react';
import PropTypes from 'prop-types';

// Design system components
import { Box } from '../../../design-system'
import { Typography, Button } from '../../../design-system'
import { TextField } from '../../../design-system'
import { Chip } from '../../../design-system'
import { Menu } from '../../../design-system'
import { Dialog } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';

// Still using some Material UI components until design system equivalents are ready
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import  from '@mui/material/';;

// Material UI icons (to be replaced later with design system icons)
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  FileCopy as FileCopyIcon,
  HelpOutline as HelpIcon,
  MenuBook as GuideIcon,
  Label as TagIcon,
  History as HistoryIcon,
  Code as SyntaxIcon,
  Key as KeywordIcon,
  ImportExport as FilterIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Import search utilities
import { parseSearchQuery } from '../../utils/searchUtils';

// Import accessibility utilities
import { getAriaAttributes, announceToScreenReader } from '../../utils/accessibilityUtils';

// Import Code icon, which was missing before
import { Code as CodeIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
// Token type to icon mapping
const TOKEN_ICONS = {
  term: <SearchIcon fontSize="small&quot; color="primary" />,
  phrase: <SearchIcon fontSize="small&quot; color="secondary" />,
  field: <KeywordIcon fontSize="small&quot; color="info" />,
  operator: <SyntaxIcon fontSize="small&quot; color="warning" />,
  tag: <TagIcon fontSize="small&quot; color="success" />,
  saved: <BookmarkIcon fontSize="small&quot; color="primary" />,
  syntax: <CodeIcon fontSize="small&quot; color="default" />,
};

/**
 * Suggestion component for a single search suggestion item
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.suggestion - The suggestion data object
 * @param {string} props.suggestion.type - Type of suggestion (term, phrase, field, operator, tag, saved)
 * @param {string} props.suggestion.value - The suggestion text value
 * @param {string} props.suggestion.description - Optional description text for the suggestion
 * @param {Function} props.onClick - Callback function when suggestion is clicked
 * @param {boolean} props.active - Whether this suggestion is currently active/highlighted
 * @returns {React.ReactElement} Rendered suggestion list item
 */
const SearchSuggestion = ({ suggestion, onClick, active }) => {
  // Added display name
  SearchSuggestion.displayName = 'SearchSuggestion';

  // Added display name
  SearchSuggestion.displayName = 'SearchSuggestion';

  // Added display name
  SearchSuggestion.displayName = 'SearchSuggestion';

  // Added display name
  SearchSuggestion.displayName = 'SearchSuggestion';

  // Added display name
  SearchSuggestion.displayName = 'SearchSuggestion';


  const { theme } = useTheme();

  return (
    <ListItem
      button
      onClick={() => onClick(suggestion)}
      style={{
        paddingTop: '4px',
        paddingBottom: '4px',
        backgroundColor: active 
          ? `${theme?.colors?.primary?.light || '#e3f2fd'}30' // 30% opacity
          : 'transparent',
        cursor: 'pointer',
      }}
    >
      <ListItemIcon style={{ minWidth: '36px' }}>
        {TOKEN_ICONS[suggestion.type] || <SearchIcon fontSize="small&quot; />}
      </ListItemIcon>
      <ListItemText
        primary={suggestion.value}
        secondary={suggestion.description}
        primaryTypographyProps={{
          fontWeight: active ? "medium' : 'normal',
        }}
        secondaryTypographyProps={{
          variant: 'caption',
          style: { fontSize: '0.7rem' },
        }}
      />
    </ListItem>
  );
};

/**
 * Component for displaying a saved search item in the saved searches list
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.search - The saved search data object
 * @param {string} props.search.id - Unique identifier for the saved search
 * @param {string} props.search.name - Display name of the saved search
 * @param {string} props.search.query - The saved search query string
 * @param {Function} props.onSelect - Callback function when user selects to use this saved search
 * @param {Function} props.onDelete - Callback function when user selects to delete this saved search
 * @returns {React.ReactElement} Rendered saved search list item
 */
const SavedSearchItem = ({ search, onSelect, onDelete }) => {
  // Added display name
  SavedSearchItem.displayName = 'SavedSearchItem';

  // Added display name
  SavedSearchItem.displayName = 'SavedSearchItem';

  // Added display name
  SavedSearchItem.displayName = 'SavedSearchItem';

  // Added display name
  SavedSearchItem.displayName = 'SavedSearchItem';

  // Added display name
  SavedSearchItem.displayName = 'SavedSearchItem';


  const { theme } = useTheme();

  return (
    <ListItem
      style={{
        borderBottom: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      <ListItemIcon style={{ minWidth: '36px' }}>
        <BookmarkIcon fontSize="small&quot; color="primary" />
      </ListItemIcon>
      <ListItemText
        primary={search.name}
        secondary={search.query}
        primaryTypographyProps={{
          variant: 'body2',
          style: { fontWeight: 'medium' },
        }}
        secondaryTypographyProps={{
          variant: 'caption',
          style: {
            maxWidth: '100%',
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
      <Box style={{ marginLeft: '8px', display: 'flex' }}>
        <Box
          as="button&quot;
          title="Use this search"
          onClick={() => onSelect(search)}
          aria-label={'Use saved search: ${search.name}'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
          }}
        >
          <FileCopyIcon fontSize="small&quot; />
        </Box>
        <Box
          as="button"
          title="Delete saved search&quot;
          onClick={() => onDelete(search.id)}
          aria-label={"Delete saved search: ${search.name}'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            color: theme?.colors?.error?.main || '#f44336',
          }}
        >
          <DeleteIcon fontSize="small&quot; />
        </Box>
      </Box>
    </ListItem>
  );
};

/**
 * Dialog component for saving the current search query
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is currently open/visible
 * @param {Function} props.onClose - Callback function when dialog is closed
 * @param {Function} props.onSave - Callback function when search is saved, receives search name as parameter
 * @param {string} props.currentQuery - The current search query text to be saved
 * @returns {React.ReactElement} Rendered dialog component
 */
const SaveSearchDialog = ({ open, onClose, onSave, currentQuery }) => {
  // Added display name
  SaveSearchDialog.displayName = "SaveSearchDialog';

  // Added display name
  SaveSearchDialog.displayName = 'SaveSearchDialog';

  // Added display name
  SaveSearchDialog.displayName = 'SaveSearchDialog';

  // Added display name
  SaveSearchDialog.displayName = 'SaveSearchDialog';

  // Added display name
  SaveSearchDialog.displayName = 'SaveSearchDialog';


  const { theme } = useTheme();
  const [searchName, setSearchName] = useState(');

  // Reset the name when dialog opens
  useEffect(() => {
    if (open) {
      setSearchName('');
    }
  }, [open]);

  /**
   * Handle saving the search when Save button is clicked
   */
  const handleSave = () => {
  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';


    if (searchName.trim()) {
      onSave(searchName);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Save Search&quot;
      size="sm"
      actions={
        <>
          <Button variant="text&quot; onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={!searchName.trim()}
          >
            Save
          </Button>
        </>
      }
    >
      <Box>
        <Typography variant="body2&quot; style={{ color: theme?.colors?.text?.secondary || "#666666', marginBottom: '16px' }}>
          Save this search query to quickly access it later.
        </Typography>

        <Box style={{ marginBottom: '16px' }}>
          <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
            Query
          </Typography>
          <Box
            style={{
              padding: '12px',
              backgroundColor: '${theme?.colors?.primary?.light || '#e3f2fd'}20', // 20% opacity
              borderRadius: '4px',
              border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
            }}
          >
            <Typography variant="body2&quot; style={{ fontFamily: "monospace' }}>
              {currentQuery}
            </Typography>
          </Box>
        </Box>

        <TextField
          autoFocus
          id="search-name&quot;
          label="Search Name"
          fullWidth
          variant="outlined&quot;
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          placeholder="Enter a name for this search"
          helperText="Choose a descriptive name to help you remember what this search does&quot;
        />
      </Box>
    </Dialog>
  );
};

/**
 * Dialog component displaying help documentation for advanced search features
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is currently open/visible
 * @param {Function} props.onClose - Callback function when dialog is closed
 * @returns {React.ReactElement} Rendered dialog component with search documentation
 */
const SearchHelpDialog = ({ open, onClose }) => {
  // Added display name
  SearchHelpDialog.displayName = "SearchHelpDialog';

  // Added display name
  SearchHelpDialog.displayName = 'SearchHelpDialog';

  // Added display name
  SearchHelpDialog.displayName = 'SearchHelpDialog';

  // Added display name
  SearchHelpDialog.displayName = 'SearchHelpDialog';

  // Added display name
  SearchHelpDialog.displayName = 'SearchHelpDialog';


  const { theme } = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg&quot;
      title={
        <Box style={{ display: "flex', alignItems: 'center' }}>
          <GuideIcon style={{ marginRight: '12px' }} />
          Advanced Search Guide
        </Box>
      }
      actions={
        <Button variant="primary&quot; onClick={onClose}>
          Close
        </Button>
      }
    >
      <Box>
        <Typography 
          variant="subtitle1" 
          style={{ 
            marginBottom: '8px',
            fontWeight: 'medium'
          }}
        >
          Basic Search
        </Typography>
        <Typography variant="body2&quot; style={{ marginBottom: "16px' }}>
          Simply type words to search across all supported fields. Multiple words will match items
          containing any of those words.
        </Typography>

        <Divider style={{ margin: '16px 0' }} />

        <Typography 
          variant="subtitle1&quot; 
          style={{ 
            marginBottom: "8px',
            fontWeight: 'medium'
          }}
        >
          Search Operators
        </Typography>
        <Box style={{ marginBottom: '16px' }}>
          <Typography variant="body2&quot; as="div">
            <Box as="ul&quot; style={{ marginTop: "8px', paddingLeft: '16px' }}>
              <li>
                <code>AND</code> - Items must match both conditions (default between terms)
              </li>
              <li>
                <code>OR</code> - Items can match either condition
              </li>
              <li>
                <code>NOT</code> - Exclude items matching this condition
              </li>
            </Box>
          </Typography>
          <Box
            style={{
              marginTop: '8px',
              backgroundColor: theme?.colors?.background?.paper || '#ffffff',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
            }}
          >
            <Typography variant="caption&quot; as="div" style={{ fontFamily: 'monospace' }}>
              Example: status:active AND priority:high
            </Typography>
          </Box>
        </Box>

        <Divider style={{ margin: '16px 0' }} />

        <Typography 
          variant="subtitle1&quot; 
          style={{ 
            marginBottom: "8px',
            fontWeight: 'medium'
          }}
        >
          Field Search
        </Typography>
        <Typography variant="body2&quot;>
          Search in specific fields using <code>field:value</code> syntax. This performs an exact
          field match.
        </Typography>
        <Box
          style={{
            marginTop: "8px',
            backgroundColor: theme?.colors?.background?.paper || '#ffffff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
          }}
        >
          <Typography variant="caption&quot; as="div" style={{ fontFamily: 'monospace' }}>
            Example: name:John type:customer
          </Typography>
        </Box>

        <Divider style={{ margin: '16px 0' }} />

        <Typography 
          variant="subtitle1&quot; 
          style={{ 
            marginBottom: "8px',
            fontWeight: 'medium'
          }}
        >
          Phrase Search
        </Typography>
        <Typography variant="body2&quot;>
          Use quotes to search for exact phrases that contain multiple words.
        </Typography>
        <Box
          style={{
            marginTop: "8px',
            backgroundColor: theme?.colors?.background?.paper || '#ffffff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
          }}
        >
          <Typography variant="caption&quot; as="div" style={{ fontFamily: 'monospace' }}>
            Example: "New York" OR "San Francisco"
          </Typography>
        </Box>

        <Divider style={{ margin: '16px 0' }} />

        <Typography 
          variant="subtitle1&quot; 
          style={{ 
            marginBottom: "8px',
            fontWeight: 'medium'
          }}
        >
          Tag Search
        </Typography>
        <Typography variant="body2&quot;>
          Search for items with specific tags using the <code>#tag</code> syntax.
        </Typography>
        <Box
          style={{
            marginTop: "8px',
            backgroundColor: theme?.colors?.background?.paper || '#ffffff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
          }}
        >
          <Typography variant="caption&quot; as="div" style={{ fontFamily: 'monospace' }}>
            Example: #urgent #finance
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

/**
 * SearchBar component - Main component that provides an advanced search interface
 * with syntax highlighting, autocompletion, and saved search functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.value='] - The current search query value
 * @param {Function} props.onChange - Callback fired when the search query changes
 * @param {Function} props.onSearch - Callback fired when a search is submitted
 * @param {Array} [props.suggestions=[]] - Array of search suggestion objects
 * @param {Array} [props.savedSearches=[]] - Array of saved search objects
 * @param {Function} [props.onSaveSearch] - Callback fired when a search is saved
 * @param {Function} [props.onDeleteSavedSearch] - Callback fired when a saved search is deleted
 * @param {string} [props.placeholder='Search...'] - Placeholder text for the search input
 * @param {string|number} [props.width='100%'] - Width of the search bar
 * @param {boolean} [props.autoFocus=false] - Whether to autofocus the search input on mount
 * @param {boolean} [props.showHelp=true] - Whether to show the help button
 * @param {boolean} [props.allowSavedSearches=true] - Whether to enable saved search functionality
 * @param {string} [props.ariaLabel='Search input'] - Accessible label for the search input
 * @returns {React.ReactElement} Rendered SearchBar component
 */
const SearchBar = ({
  value = ',
  onChange,
  onSearch,
  suggestions = [],
  savedSearches = [],
  onSaveSearch,
  onDeleteSavedSearch,
  placeholder = 'Search...',
  width = '100%',
  autoFocus = false,
  showHelp = true,
  allowSavedSearches = true,
  ariaLabel = 'Search input',
}) => {
  // Added display name
  SearchBar.displayName = 'SearchBar';

  // Added display name
  SearchBar.displayName = 'SearchBar';

  // Added display name
  SearchBar.displayName = 'SearchBar';

  // Added display name
  SearchBar.displayName = 'SearchBar';

  // Added display name
  SearchBar.displayName = 'SearchBar';


  const theme = useTheme();
  const inputRef = useRef(null);

  // State
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Parse the current query for token highlighting
  const parsedQuery = useMemo(() => parseSearchQuery(inputValue), [inputValue]);

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /**
   * Handle input change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input field
   */
  const handleInputChange = event => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Notify parent component
    if (onChange) {
      onChange(newValue);
    }

    // Show suggestions when typing
    if (newValue.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Reset active suggestion
    setActiveSuggestionIndex(-1);
  };

  /**
   * Handle search submission
   * Executes the search and notifies parent components
   */
  const handleSearch = () => {
  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';

  // Added display name
  handleSearch.displayName = 'handleSearch';


    // Don't search if input is empty
    if (!inputValue.trim()) return;

    // Hide suggestions
    setShowSuggestions(false);

    // Notify parent component
    if (onSearch) {
      onSearch(inputValue);
    }

    // Announce to screen readers
    announceToScreenReader('Search results for ${inputValue}');
  };

  /**
   * Handle suggestion click/selection
   * Either replaces current search (for saved searches) or inserts at cursor position
   *
   * @param {Object} suggestion - The suggestion object that was clicked
   * @param {string} suggestion.type - Type of suggestion (term, phrase, field, operator, tag, saved)
   * @param {string} suggestion.value - The suggestion value to insert or replace with
   */
  const handleSuggestionClick = suggestion => {
    // Clear existing input if it's a saved search
    if (suggestion.type === 'saved') {
      setInputValue(suggestion.value);

      // Notify parent component
      if (onChange) {
        onChange(suggestion.value);
      }

      // Automatically perform search
      if (onSearch) {
        onSearch(suggestion.value);
      }
    } else {
      // For other suggestions, add to current input at cursor position
      const input = inputRef.current;
      const cursorPosition = input.selectionStart;

      // Handle adding the suggestion value at the cursor position
      let updatedValue;

      if (suggestion.type === 'operator') {
        // Add space before and after operators
        updatedValue =
          inputValue.substring(0, cursorPosition) +
          ' ${suggestion.value} ' +
          inputValue.substring(cursorPosition);
      } else {
        updatedValue =
          inputValue.substring(0, cursorPosition) +
          suggestion.value +
          inputValue.substring(cursorPosition);
      }

      setInputValue(updatedValue);

      // Notify parent component
      if (onChange) {
        onChange(updatedValue);
      }

      // Set focus back to input
      setTimeout(() => {
        input.focus();
        // Set cursor position after the inserted suggestion
        const newPosition = cursorPosition + suggestion.value.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    }

    // Hide suggestions
    setShowSuggestions(false);
  };

  /**
   * Handle keyboard navigation for suggestions
   * Supports arrow keys for navigation, Enter for selection, and Escape to dismiss
   *
   * @param {React.KeyboardEvent} event - The keyboard event
   */
  const handleKeyDown = event => {
    // If suggestions are not shown, don't handle navigation keys
    if (!showSuggestions) {
      // Still handle Enter for search submission
      if (event.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        // Move to next suggestion
        setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        event.preventDefault(); // Prevent cursor from moving
        break;

      case 'ArrowUp':
        // Move to previous suggestion
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        event.preventDefault(); // Prevent cursor from moving
        break;

      case 'Enter':
        // Select active suggestion or submit search
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          handleSearch();
        }
        event.preventDefault(); // Prevent form submission
        break;

      case 'Escape':
        // Hide suggestions
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;

      default:
        // Other keys don't need special handling
        break;
    }
  };

  // Handle clear button click
  const handleClear = () => {
  // Added display name
  handleClear.displayName = 'handleClear';

  // Added display name
  handleClear.displayName = 'handleClear';

  // Added display name
  handleClear.displayName = 'handleClear';

  // Added display name
  handleClear.displayName = 'handleClear';

  // Added display name
  handleClear.displayName = 'handleClear';


    setInputValue(');

    // Notify parent component
    if (onChange) {
      onChange('');
    }

    // Set focus back to input
    inputRef.current.focus();

    // Hide suggestions
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);

    // Announce to screen readers
    announceToScreenReader('Search cleared');
  };

  // Handle saved search selection
  const handleSelectSavedSearch = search => {
    setInputValue(search.query);

    // Notify parent component
    if (onChange) {
      onChange(search.query);
    }

    // Automatically perform search
    if (onSearch) {
      onSearch(search.query);
    }

    // Hide saved searches
    setShowSavedSearches(false);

    // Announce to screen readers
    announceToScreenReader('Loaded saved search: ${search.name}');
  };

  // Handle saved search deletion
  const handleDeleteSavedSearch = searchId => {
    if (onDeleteSavedSearch) {
      onDeleteSavedSearch(searchId);
    }

    // Announce to screen readers
    announceToScreenReader('Saved search deleted');
  };

  // Handle save search dialog
  const handleSaveSearch = name => {
    if (onSaveSearch) {
      onSaveSearch(name);
    }

    // Announce to screen readers
    announceToScreenReader('Search saved as: ${name}');
  };

  // Handle menu open
  const handleMenuOpen = event => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';


    setMenuAnchorEl(null);
  };

  // Handle input focus
  const handleInputFocus = () => {
  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';

  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';

  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';

  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';

  // Added display name
  handleInputFocus.displayName = 'handleInputFocus';


    // Show suggestions if there's a value and suggestions exist
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = event => {
    // Check if related target is within the suggestions or saved searches
    // to prevent closing them when clicking on a suggestion
    if (
      event.relatedTarget &&
      (event.relatedTarget.closest('.search-suggestions') ||
        event.relatedTarget.closest('.saved-searches'))
    ) {
      return;
    }

    // Hide suggestions after a short delay to allow click events to fire
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }, 150);
  };

  // Handle the display of token chips
  const renderTokenChips = () => {
  // Added display name
  renderTokenChips.displayName = 'renderTokenChips';

  // Added display name
  renderTokenChips.displayName = 'renderTokenChips';

  // Added display name
  renderTokenChips.displayName = 'renderTokenChips';

  // Added display name
  renderTokenChips.displayName = 'renderTokenChips';

  // Added display name
  renderTokenChips.displayName = 'renderTokenChips';


    if (!parsedQuery.tokens || parsedQuery.tokens.length === 0) {
      return null;
    }

    return (
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          padding: '8px',
          backgroundColor: theme?.colors?.background?.paper || '#ffffff',
          border: '1px solid ${theme?.colors?.primary?.light || '#e3f2fd'}80', // 50% opacity
          borderRadius: '4px',
          marginTop: '8px',
        }}
      >
        {parsedQuery.tokens.map((token, index) => {
          let label, color;

          switch (token.type) {
            case 'term':
              label = token.value;
              color = 'default';
              break;
            case 'phrase':
              label = '${token.value}';
              color = 'secondary';
              break;
            case 'field':
              label = '${token.field}:${token.value}';
              color = 'primary';
              break;
            case 'operator':
              label = token.value;
              color = 'warning';
              break;
            case 'tag':
              label = '#${token.value}';
              color = 'success';
              break;
            default:
              label = token.value;
              color = 'default';
          }

          return (
            <Chip
              key={'${token.type}-${index}'}
              label={label}
              size="small&quot;
              color={color}
              icon={TOKEN_ICONS[token.type]}
              variant="outlined"
            />
          );
        })}
      </Box>
    );
  };

  // Get ARIA attributes for accessibility
  const inputAriaAttributes = getAriaAttributes({
    role: 'searchbox',
    label: ariaLabel,
    expanded: showSuggestions,
    controls: 'search-suggestions-list',
    activeDescendant:
      activeSuggestionIndex >= 0 ? 'search-suggestion-${activeSuggestionIndex}' : undefined,
  });

  // Render suggestions popover
  const renderSuggestions = () => {
  // Added display name
  renderSuggestions.displayName = 'renderSuggestions';

  // Added display name
  renderSuggestions.displayName = 'renderSuggestions';

  // Added display name
  renderSuggestions.displayName = 'renderSuggestions';

  // Added display name
  renderSuggestions.displayName = 'renderSuggestions';

  // Added display name
  renderSuggestions.displayName = 'renderSuggestions';


    if (!showSuggestions || suggestions.length === 0) {
      return null;
    }

    return (
      <Box
        className="search-suggestions&quot;
        style={{
          position: "absolute',
          zIndex: 1300,
          width: '100%',
          maxHeight: 300,
          overflow: 'auto',
          marginTop: '4px',
          border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
          boxShadow: theme?.shadows?.[3] || '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
          backgroundColor: theme?.colors?.background?.paper || '#ffffff',
          borderRadius: '4px',
        }}
      >
        <List dense id="search-suggestions-list&quot; aria-label="Search suggestions">
          {suggestions.map((suggestion, index) => (
            <SearchSuggestion
              key={'${suggestion.type}-${suggestion.value}-${index}'}
              suggestion={suggestion}
              onClick={handleSuggestionClick}
              active={index === activeSuggestionIndex}
              id={'search-suggestion-${index}'}
            />
          ))}
        </List>
      </Box>
    );
  };

  // Render saved searches popover
  const renderSavedSearches = () => {
  // Added display name
  renderSavedSearches.displayName = 'renderSavedSearches';

  // Added display name
  renderSavedSearches.displayName = 'renderSavedSearches';

  // Added display name
  renderSavedSearches.displayName = 'renderSavedSearches';

  // Added display name
  renderSavedSearches.displayName = 'renderSavedSearches';

  // Added display name
  renderSavedSearches.displayName = 'renderSavedSearches';


    if (!showSavedSearches) {
      return null;
    }

    return (
      <Box
        className="saved-searches&quot;
        style={{
          position: "absolute',
          zIndex: 1300,
          width: '100%',
          maxHeight: 300,
          overflow: 'auto',
          marginTop: '4px',
          border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
          boxShadow: theme?.shadows?.[3] || '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
          backgroundColor: theme?.colors?.background?.paper || '#ffffff',
          borderRadius: '4px',
        }}
      >
        <Box 
          style={{ 
            padding: '16px 16px 8px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2&quot;>Saved Searches</Typography>
          <Box
            as="button"
            onClick={() => setShowSavedSearches(false)}
            aria-label="Close saved searches"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
            }}
          >
            <ClearIcon fontSize="small&quot; />
          </Box>
        </Box>

        <Box 
          style={{ 
            height: "1px', 
            backgroundColor: theme?.colors?.divider || '#e0e0e0', 
            width: '100%' 
          }} 
        />

        {savedSearches.length === 0 ? (
          <Box style={{ padding: '16px', textAlign: 'center' }}>
            <Typography 
              variant="body2&quot; 
              style={{ color: theme?.colors?.text?.secondary || "#666666' }}
            >
              No saved searches yet
            </Typography>
            <Button
              size="small&quot;
              onClick={() => setSaveDialogOpen(true)}
              disabled={!inputValue.trim()}
              startIcon={<SaveIcon />}
              style={{ marginTop: "8px' }}
            >
              Save Current Search
            </Button>
          </Box>
        ) : (
          <List dense>
            {savedSearches.map(search => (
              <SavedSearchItem
                key={search.id}
                search={search}
                onSelect={handleSelectSavedSearch}
                onDelete={handleDeleteSavedSearch}
              />
            ))}
          </List>
        )}
      </Box>
    );
  };

  return (
    <Box style={{ width, position: 'relative' }}>
      {/* Search input */}
      <TextField
        inputRef={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        fullWidth
        variant="outlined&quot;
        autoFocus={autoFocus}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start&quot;>
              <SearchIcon style={{ opacity: 0.7 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box style={{ display: 'flex' }}>
                {inputValue && (
                  <Box
                    as="button&quot;
                    aria-label="Clear search"
                    onClick={handleClear}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      margin: '0 2px',
                      borderRadius: '50%',
                    }}
                  >
                    <ClearIcon fontSize="small&quot; style={{ opacity: 0.7 }} />
                  </Box>
                )}

                <Box
                  as="button"
                  aria-label="Search options"
                  onClick={handleMenuOpen}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    margin: '0 2px',
                    borderRadius: '50%',
                  }}
                >
                  <MoreVertIcon fontSize="small&quot; style={{ opacity: 0.7 }} />
                </Box>
              </Box>
            </InputAdornment>
          ),
        }}
        {...inputAriaAttributes}
      />

      {/* Token chips display */}
      {parsedQuery.tokens && parsedQuery.tokens.length > 0 && renderTokenChips()}

      {/* Suggestions popover */}
      {renderSuggestions()}

      {/* Saved searches popover */}
      {renderSavedSearches()}

      {/* Options menu */}
      <Menu 
        anchorEl={menuAnchorEl} 
        open={Boolean(menuAnchorEl)} 
        onClose={handleMenuClose}
        placement="bottom-end"
      >
        {allowSavedSearches && [
          <Menu.Item
            key="saved&quot;
            onClick={() => {
              setShowSavedSearches(true);
              setMenuAnchorEl(null);
            }}
            icon={<BookmarkIcon fontSize="small" />}
          >
            Saved Searches
          </Menu.Item>,

          <Menu.Item
            key="save&quot;
            onClick={() => {
              setSaveDialogOpen(true);
              setMenuAnchorEl(null);
            }}
            disabled={!inputValue.trim()}
            icon={<SaveIcon fontSize="small" />}
          >
            Save This Search
          </Menu.Item>,

          <Menu.Item key="divider&quot; divider />,
        ]}

        {showHelp && (
          <Menu.Item
            onClick={() => {
              setHelpDialogOpen(true);
              setMenuAnchorEl(null);
            }}
            icon={<HelpIcon fontSize="small" />}
          >
            Search Help
          </Menu.Item>
        )}
      </Menu>

      {/* Save search dialog */}
      <SaveSearchDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveSearch}
        currentQuery={inputValue}
      />

      {/* Help dialog */}
      <SearchHelpDialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />
    </Box>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  suggestions: PropTypes.array,
  savedSearches: PropTypes.array,
  onSaveSearch: PropTypes.func,
  onDeleteSavedSearch: PropTypes.func,
  placeholder: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  autoFocus: PropTypes.bool,
  showHelp: PropTypes.bool,
  allowSavedSearches: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

export default SearchBar;
