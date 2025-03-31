/**
 * @component KeyboardShortcutsHelp
 * @description A dialog that displays available keyboard shortcuts in the application,
 * organized by category with clear instructions and visualizations.
 */

import React from 'react';
import { Box, Grid } from '../../design-system'
import { Typography, Button } from '../../design-system'
import { Dialog } from '../../design-system'
import { Chip } from '../../design-system'
import { Tabs } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';

// Material UI icons for now
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TuneIcon from '@mui/icons-material/Tune';

// Still using some Material UI components until design system equivalents are ready
import { useMediaQuery } from '@mui/material';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Component for keyboard key visualization
const KeyCap = ({ children }) => {
  // Added display name
  KeyCap.displayName = 'KeyCap';

  // Added display name
  KeyCap.displayName = 'KeyCap';

  // Added display name
  KeyCap.displayName = 'KeyCap';


  const { theme } = useTheme();
  return (
    <Box
      style={{
        padding: '4px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        backgroundColor: theme?.colors?.grey?.[100] || '#f5f5f5',
        border: `1px solid ${theme?.colors?.grey?.[300] || '#e0e0e0'}`,
        boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
        minWidth: '28px',
        height: '28px',
        margin: '0 4px',
      }}
    >
      {children}
    </Box>
  );
};

// Component for keyboard shortcut combination
const ShortcutContainer = ({ children }) => {
  // Added display name
  ShortcutContainer.displayName = 'ShortcutContainer';

  // Added display name
  ShortcutContainer.displayName = 'ShortcutContainer';

  // Added display name
  ShortcutContainer.displayName = 'ShortcutContainer';


  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
      }}
    >
      {children}
    </Box>
  );
};

// Component to render a keyboard shortcut with proper visualization
const KeyboardShortcut = ({ combo, description, icon }) => {
  // Added display name
  KeyboardShortcut.displayName = 'KeyboardShortcut';

  // Added display name
  KeyboardShortcut.displayName = 'KeyboardShortcut';

  // Added display name
  KeyboardShortcut.displayName = 'KeyboardShortcut';


  const keySequence = combo.split(' + ');
  const Icon = icon;

  return (
    <Grid.Container style={{ marginBottom: '8px' }} alignItems="center" spacing={2}>
      <Grid.Item xs={5} md={4}>
        <ShortcutContainer>
          {keySequence.map((key, index) => (
            <React.Fragment key={index}>
              <KeyCap>{key}</KeyCap>
              {index < keySequence.length - 1 && (
                <Typography variant="body2" style={{ margin: '0 2px' }}>
                  +
                </Typography>
              )}
            </React.Fragment>
          ))}
        </ShortcutContainer>
      </Grid.Item>
      <Grid.Item xs={7} md={8}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <Icon fontSize="small" style={{ marginRight: '8px', opacity: 0.7 }} />}
          <Typography variant="body2">{description}</Typography>
        </Box>
      </Grid.Item>
    </Grid.Container>
  );
};

/**
 * KeyboardShortcutsHelp Component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Array} props.shortcuts - Array of shortcut objects
 * @param {string} props.shortcuts[].combo - Key combination (e.g., "Ctrl + Z")
 * @param {string} props.shortcuts[].description - Description of the shortcut
 * @param {string} props.shortcuts[].category - Optional category for grouping
 * @param {Object} props.shortcuts[].icon - Optional icon component
 */
const KeyboardShortcutsHelp = ({ open, onClose, shortcuts = [] }) => {
  // Added display name
  KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';

  // Added display name
  KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';

  // Added display name
  KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';


  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [activeTab, setActiveTab] = React.useState(0);

  // Group shortcuts by category if provided
  const categories = React.useMemo(() => {
  // Added display name
  categories.displayName = 'categories';

    if (shortcuts.length === 0) return [];

    // Use provided categories or default to basic categories
    const uniqueCategories = [
      ...new Set(shortcuts.map(shortcut => shortcut.category || 'General')),
    ];

    return uniqueCategories;
  }, [shortcuts]);

  // Get shortcuts for the active category
  const categoryShortcuts = React.useMemo(() => {
  // Added display name
  categoryShortcuts.displayName = 'categoryShortcuts';

    if (categories.length === 0 || shortcuts.length === 0) return [];

    const category = categories[activeTab];
    return shortcuts.filter(shortcut => (shortcut.category || 'General') === category);
  }, [categories, activeTab, shortcuts]);

  // Default shortcuts if none provided
  const defaultShortcuts = [
    { combo: 'Ctrl + Z', description: 'Undo last action', icon: UndoIcon, category: 'General' },
    { combo: 'Ctrl + Y', description: 'Redo undone action', category: 'General' },
    { combo: 'Ctrl + S', description: 'Save flow', icon: SaveIcon, category: 'General' },
    { combo: 'Ctrl + R', description: 'Run/test flow', icon: PlayArrowIcon, category: 'General' },
    {
      combo: 'Delete',
      description: 'Delete selected node/edge',
      icon: DeleteIcon,
      category: 'General',
    },
    {
      combo: 'Ctrl + C',
      description: 'Copy selected node',
      icon: ContentCopyIcon,
      category: 'General',
    },
    {
      combo: 'Ctrl + V',
      description: 'Paste copied node',
      icon: ContentPasteIcon,
      category: 'General',
    },
    { combo: 'Ctrl + A', description: 'Select all nodes', category: 'General' },
    { combo: 'Ctrl + +', description: 'Zoom in', icon: ZoomInIcon, category: 'Navigation' },
    { combo: 'Ctrl + -', description: 'Zoom out', category: 'Navigation' },
    { combo: 'Ctrl + 0', description: 'Fit view to screen', category: 'Navigation' },
    { combo: 'Ctrl + F', description: 'Search', icon: SearchIcon, category: 'Navigation' },
    { combo: 'Ctrl + P', description: 'Toggle node palette', icon: TuneIcon, category: 'Panels' },
    { combo: 'Ctrl + E', description: 'Toggle properties panel', category: 'Panels' },
    { combo: 'Ctrl + D', description: 'Toggle debug mode', category: 'Panels' },
    { combo: '?', description: 'Show keyboard shortcuts', icon: HelpOutlineIcon, category: 'Help' },
  ];

  // Use provided shortcuts or default ones
  const displayShortcuts =
    shortcuts.length > 0
      ? categoryShortcuts
      : defaultShortcuts.filter(s => s.category === categories[activeTab]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };

  // Header component for dialog
  const DialogHeader = () => (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: theme?.colors?.primary?.main || '#1976d2',
        color: theme?.colors?.primary?.contrastText || '#ffffff',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        <KeyboardIcon style={{ marginRight: '12px' }} />
        <Typography variant="h6" component="span">
          Keyboard Shortcuts
        </Typography>
      </Box>
      <Box
        as="button"
        onClick={onClose}
        aria-label="close"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme?.colors?.primary?.contrastText || '#ffffff',
          padding: '8px',
          borderRadius: '50%',
        }}
      >
        <CloseIcon />
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      fullScreen={isMobile}
    >
      <DialogHeader />

      {/* Category tabs */}
      {categories.length > 1 && (
        <Box 
          style={{ 
            borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}` 
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
          >
            {categories.map((category, index) => (
              <Tabs.Tab
                key={index}
                label={category}
                id={`shortcuts-tab-${index}`}
                aria-controls={`shortcuts-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Box 
        style={{ 
          padding: '16px 24px',
          borderTop: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
          borderBottom: `1px solid ${theme?.colors?.divider || '#e0e0e0'}`,
          overflowY: 'auto',
          maxHeight: '60vh'
        }}
      >
        {displayShortcuts.length > 0 ? (
          <Grid.Container spacing={2}>
            {displayShortcuts.map((shortcut, index) => (
              <Grid.Item xs={12} md={6} key={index}>
                <KeyboardShortcut
                  combo={shortcut.combo}
                  description={shortcut.description}
                  icon={shortcut.icon}
                />
              </Grid.Item>
            ))}
          </Grid.Container>
        ) : (
          <Box style={{ textAlign: 'center', padding: '32px 0' }}>
            <Typography color="textSecondary">No shortcuts available in this category.</Typography>
          </Box>
        )}
      </Box>

      <Box 
        style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px'
        }}
      >
        <Box style={{ flex: 1 }}>
          <Chip
            icon={<HelpOutlineIcon />}
            label="Press ? key anytime to show this dialog"
            variant="outlined"
            size="small"
          />
        </Box>
        <Button onClick={onClose} variant="primary">
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
