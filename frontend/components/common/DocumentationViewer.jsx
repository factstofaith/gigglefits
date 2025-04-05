/**
 * Documentation Viewer Component
 * 
 * A component for displaying API documentation, user guides, and examples
 * in the application. Part of the zero technical debt documentation implementation.
 * 
 * @component
 * @category Documentation
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
Box,
Typography,
Paper,
Tabs,
Tab,
Divider,
List,
ListItem,
ListItemText,
ListItemButton,
TextField,
InputAdornment,
IconButton,
Button,
Link as MuiLink,
Card,
CardContent,
CardActions,
Chip } from
'@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CodeIcon from '@mui/icons-material/Code';
import BookIcon from '@mui/icons-material/Book';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';

// Import A11y components
import A11yTooltip from './A11yTooltip';
import A11yButton from './A11yButton';

// Import hooks
import { useA11yAnnouncement } from '../../hooks/a11y/useA11yAnnouncement';

// Import documentation data
import componentDocs from '../../utils/docs/data/component-docs.json';
import hookDocs from '../../utils/docs/data/hook-docs.json';
import utilityDocs from '../../utils/docs/data/utility-docs.json';
import docPages from '../../utils/docs/data/documentation-pages.json';

// Import markdown renderer
import { withErrorBoundary } from '../error-handling/withErrorBoundary';const ReactMarkdown = ({ children }) => {
  // This is a simplified implementation
  // In a real implementation, use a proper markdown library

  // Process content with basic replacements for display
  const processedContent = children
  // Replace headings
  .replace(/^# (.+)$/gm, '<h1>$1</h1>').
  replace(/^## (.+)$/gm, '<h2>$1</h2>').
  replace(/^### (.+)$/gm, '<h3>$1</h3>').
  replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  // Replace code blocks
  .replace(/```(\w+)\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  // Replace inline code
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  // Replace emphasis and strong
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').
  replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // Replace links
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  // Replace lists
  .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
  // Replace paragraphs
  .replace(/^([^<#\-\*].+)$/gm, '<p>$1</p>')
  // Replace horizontal rules
  .replace(/^---$/gm, '<hr>');

  // Wrap lists
  const finalContent = processedContent.replace(/(<li>[\s\S]+?)((?=<h)|$)/g, '<ul>$1</ul>$2');

  return <div dangerouslySetInnerHTML={{ __html: finalContent }} />;
};

ReactMarkdown.propTypes = {
  children: PropTypes.string.isRequired
};

/**
 * Documentation Viewer component that displays API documentation, user guides, and examples
 * 
 * @param {Object} props - Component props
 * @param {string} [props.initialSection='components'] - Initial documentation section to display
 * @param {string} [props.initialItem] - Initial documentation item to display
 * @param {Function} [props.onNavigate] - Function called when navigation changes
 * @returns {JSX.Element} The rendered component
 */
const DocumentationViewer = ({
  initialSection = 'components',
  initialItem,
  onNavigate
}) => {
  // State for navigation
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeItem, setActiveItem] = useState(initialItem);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Screen reader announcements
  const { announcePolite } = useA11yAnnouncement();

  // Handle section change
  const handleSectionChange = (event, newSection) => {
    setActiveSection(newSection);
    setActiveItem(null);
    announcePolite(`Changed to ${newSection} section`);

    if (onNavigate) {
      onNavigate({
        section: newSection,
        item: null
      });
    }
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    setActiveItem(item);
    setShowSearch(false);

    if (onNavigate) {
      onNavigate({
        section: activeSection,
        item
      });
    }

    // Announce the selected item
    const itemType = activeSection === 'components' ? 'component' :
    activeSection === 'hooks' ? 'hook' :
    activeSection === 'utilities' ? 'utility' : 'page';

    announcePolite(`Selected ${itemType} ${item}`);
  };

  // Handle search
  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const searchRegex = new RegExp(query, 'i');

    // Search components
    Object.entries(componentDocs).forEach(([name, doc]) => {
      if (searchRegex.test(name) || searchRegex.test(doc.description)) {
        results.push({
          type: 'component',
          name,
          description: doc.description
        });
      }
    });

    // Search hooks
    Object.entries(hookDocs).forEach(([name, doc]) => {
      if (searchRegex.test(name) || searchRegex.test(doc.description)) {
        results.push({
          type: 'hook',
          name,
          description: doc.description
        });
      }
    });

    // Search utilities
    Object.entries(utilityDocs).forEach(([name, doc]) => {
      if (searchRegex.test(name) || searchRegex.test(doc.description)) {
        results.push({
          type: 'utility',
          name,
          description: doc.description
        });
      }
    });

    // Search documentation pages
    Object.entries(docPages).forEach(([id, page]) => {
      if (searchRegex.test(page.title) || searchRegex.test(page.description) ||
      page.tags && page.tags.some((tag) => searchRegex.test(tag))) {
        results.push({
          type: 'guide',
          name: id,
          title: page.title,
          description: page.description
        });
      }
    });

    setSearchResults(results);
    announcePolite(`Found ${results.length} results for ${query}`);
  }, [announcePolite]);

  // Handle search input
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const section = result.type === 'component' ? 'components' :
    result.type === 'hook' ? 'hooks' :
    result.type === 'utility' ? 'utilities' : 'guides';

    setActiveSection(section);

    const item = result.type === 'guide' ? result.name : result.name;
    handleItemSelect(item);
  };

  // Initialize from props
  useEffect(() => {
    if (initialItem) {
      setActiveItem(initialItem);
    }

    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialItem, initialSection]);

  // Get documentation content based on active section and item
  const getDocumentationContent = () => {
    if (!activeItem) {
      return renderSectionOverview();
    }

    switch (activeSection) {
      case 'components':
        return renderComponentDoc(activeItem);
      case 'hooks':
        return renderHookDoc(activeItem);
      case 'utilities':
        return renderUtilityDoc(activeItem);
      case 'guides':
        return renderGuideDoc(activeItem);
      default:
        return <Typography>Select a documentation item from the sidebar</Typography>;}

  };

  // Render the section overview
  const renderSectionOverview = () => {
    switch (activeSection) {
      case 'components':
        return renderComponentsOverview();
      case 'hooks':
        return renderHooksOverview();
      case 'utilities':
        return renderUtilitiesOverview();
      case 'guides':
        return renderGuidesOverview();
      default:
        return <Typography>Select a documentation section</Typography>;}

  };

  // Render components overview
  const renderComponentsOverview = () => {
    // Group components by category
    const componentsByCategory = {};

    Object.entries(componentDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!componentsByCategory[category]) {
        componentsByCategory[category] = [];
      }

      componentsByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return (
      <>
        <Typography variant="h4" gutterBottom>Components</Typography>
        <Typography paragraph>
          Explore our library of React components. Click on a component to view detailed documentation.
        </Typography>
        
        {Object.entries(componentsByCategory).map(([category, components]) =>
        <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {components.map((component) =>
            <Card key={component.name} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{component.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {component.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => handleItemSelect(component.name)}>

                      View Documentation
                    </Button>
                  </CardActions>
                </Card>)}

            </Box>
          </Box>)}

      </>);

  };

  // Render hooks overview
  const renderHooksOverview = () => {
    // Group hooks by category
    const hooksByCategory = {};

    Object.entries(hookDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!hooksByCategory[category]) {
        hooksByCategory[category] = [];
      }

      hooksByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return (
      <>
        <Typography variant="h4" gutterBottom>Hooks</Typography>
        <Typography paragraph>
          Explore our custom React hooks. Click on a hook to view detailed documentation.
        </Typography>
        
        {Object.entries(hooksByCategory).map(([category, hooks]) =>
        <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {hooks.map((hook) =>
            <Card key={hook.name} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{hook.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hook.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => handleItemSelect(hook.name)}>

                      View Documentation
                    </Button>
                  </CardActions>
                </Card>)}

            </Box>
          </Box>)}

      </>);

  };

  // Render utilities overview
  const renderUtilitiesOverview = () => {
    // Group utilities by category
    const utilitiesByCategory = {};

    Object.entries(utilityDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!utilitiesByCategory[category]) {
        utilitiesByCategory[category] = [];
      }

      utilitiesByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return (
      <>
        <Typography variant="h4" gutterBottom>Utilities</Typography>
        <Typography paragraph>
          Explore our utility functions and modules. Click on a utility to view detailed documentation.
        </Typography>
        
        {Object.entries(utilitiesByCategory).map(([category, utilities]) =>
        <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {utilities.map((utility) =>
            <Card key={utility.name} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{utility.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {utility.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => handleItemSelect(utility.name)}>

                      View Documentation
                    </Button>
                  </CardActions>
                </Card>)}

            </Box>
          </Box>)}

      </>);

  };

  // Render guides overview
  const renderGuidesOverview = () => {
    // Group guides by category
    const guidesByCategory = {};

    Object.entries(docPages).forEach(([id, page]) => {
      const category = page.category || 'Uncategorized';

      if (!guidesByCategory[category]) {
        guidesByCategory[category] = [];
      }

      guidesByCategory[category].push({
        id,
        title: page.title,
        description: page.description,
        tags: page.tags || []
      });
    });

    return (
      <>
        <Typography variant="h4" gutterBottom>User Guides</Typography>
        <Typography paragraph>
          Explore our comprehensive user guides and documentation. Click on a guide to read detailed instructions.
        </Typography>
        
        {Object.entries(guidesByCategory).map(([category, guides]) =>
        <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {guides.map((guide) =>
            <Card key={guide.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{guide.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {guide.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {guide.tags && guide.tags.map((tag) =>
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}

                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => handleItemSelect(guide.id)}>

                      Read Guide
                    </Button>
                  </CardActions>
                </Card>)}

            </Box>
          </Box>)}

      </>);

  };

  // Render component documentation
  const renderComponentDoc = (componentName) => {
    const doc = componentDocs[componentName];

    if (!doc) {
      return (
        <Box>
          <Typography variant="h5" color="error">Component not found</Typography>
          <Typography paragraph>
            The component "{componentName}" does not exist in the documentation.
          </Typography>
          <Button variant="contained" onClick={() => setActiveItem(null)}>
            Back to Components
          </Button>
        </Box>);

    }

    return (
      <Box>
        <Typography variant="h4" gutterBottom>{doc.name}</Typography>
        <Typography paragraph>{doc.description}</Typography>
        
        {doc.category &&
        <Chip label={doc.category} sx={{ mb: 2 }} />}

        
        {doc.props && doc.props.length > 0 &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Props</Typography>
            <Paper variant="outlined" sx={{ overflow: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'background.default' }}>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Name</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Type</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Required</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Default</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Description</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {doc.props.map((prop) =>
                <Box key={prop.name} component="tr" sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{prop.name}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{prop.type}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>{prop.required ? 'Yes' : 'No'}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>
                        {prop.defaultValue !== undefined ? prop.defaultValue : '-'}
                      </Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>{prop.description}</Box>
                    </Box>)}

                </Box>
              </Box>
            </Paper>
          </Box>}

        
        {doc.examples && doc.examples.length > 0 &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Examples</Typography>
            {doc.examples.map((example, index) =>
          <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1">{example.title || `Example ${index + 1}`}</Typography>
                  {example.description &&
              <Typography variant="body2">{example.description}</Typography>}

                </Box>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', overflowX: 'auto' }}>
                  <pre style={{ margin: 0 }}>
                    <code>{example.code}</code>
                  </pre>
                </Box>
              </Paper>)}

          </Box>}

        
        {doc.filepath &&
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Defined in: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{doc.filepath}</Typography>
            </Typography>
          </Box>}

      </Box>);

  };

  // Render hook documentation
  const renderHookDoc = (hookName) => {
    const doc = hookDocs[hookName];

    if (!doc) {
      return (
        <Box>
          <Typography variant="h5" color="error">Hook not found</Typography>
          <Typography paragraph>
            The hook "{hookName}" does not exist in the documentation.
          </Typography>
          <Button variant="contained" onClick={() => setActiveItem(null)}>
            Back to Hooks
          </Button>
        </Box>);

    }

    return (
      <Box>
        <Typography variant="h4" gutterBottom>{doc.name}</Typography>
        <Typography paragraph>{doc.description}</Typography>
        
        {doc.category &&
        <Chip label={doc.category} sx={{ mb: 2 }} />}

        
        {doc.params && doc.params.length > 0 &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Parameters</Typography>
            <Paper variant="outlined" sx={{ overflow: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'background.default' }}>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Name</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Type</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Required</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Default</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Description</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {doc.params.map((param) =>
                <Box key={param.name} component="tr" sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{param.name}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{param.type}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>{param.required ? 'Yes' : 'No'}</Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>
                        {param.defaultValue !== undefined ? param.defaultValue : '-'}
                      </Box>
                      <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>{param.description}</Box>
                    </Box>)}

                </Box>
              </Box>
            </Paper>
          </Box>}

        
        {doc.returns &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Returns</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Type: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{doc.returns.type}</Typography></Typography>
              <Typography variant="body2">{doc.returns.description}</Typography>
            </Paper>
          </Box>}

        
        {doc.examples && doc.examples.length > 0 &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Examples</Typography>
            {doc.examples.map((example, index) =>
          <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', overflowX: 'auto' }}>
                  <pre style={{ margin: 0 }}>
                    <code>{example}</code>
                  </pre>
                </Box>
              </Paper>)}

          </Box>}

        
        {doc.filepath &&
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Defined in: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{doc.filepath}</Typography>
            </Typography>
          </Box>}

      </Box>);

  };

  // Render utility documentation
  const renderUtilityDoc = (utilityName) => {
    const doc = utilityDocs[utilityName];

    if (!doc) {
      return (
        <Box>
          <Typography variant="h5" color="error">Utility not found</Typography>
          <Typography paragraph>
            The utility "{utilityName}" does not exist in the documentation.
          </Typography>
          <Button variant="contained" onClick={() => setActiveItem(null)}>
            Back to Utilities
          </Button>
        </Box>);

    }

    return (
      <Box>
        <Typography variant="h4" gutterBottom>{doc.name}</Typography>
        <Typography paragraph>{doc.description}</Typography>
        
        {doc.category &&
        <Chip label={doc.category} sx={{ mb: 2 }} />}

        
        {doc.functions && doc.functions.length > 0 && doc.functions.map((func, index) =>
        <Paper key={index} variant="outlined" sx={{ mb: 3, p: 2 }}>
            <Typography variant="h5" gutterBottom>{func.name}</Typography>
            <Typography paragraph>{func.description}</Typography>
            
            {func.params && func.params.length > 0 &&
          <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Parameters</Typography>
                <Paper variant="outlined" sx={{ overflow: 'auto' }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ bgcolor: 'background.default' }}>
                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Name</Box>
                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Type</Box>
                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Required</Box>
                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Default</Box>
                        <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }}>Description</Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {func.params.map((param) =>
                  <Box key={param.name} component="tr" sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{param.name}</Box>
                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>{param.type}</Box>
                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{param.required ? 'Yes' : 'No'}</Box>
                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace' }}>
                            {param.defaultValue !== undefined ? param.defaultValue : '-'}
                          </Box>
                          <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{param.description}</Box>
                        </Box>)}

                    </Box>
                  </Box>
                </Paper>
              </Box>}

            
            {func.returns &&
          <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Returns</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Type: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{func.returns.type}</Typography></Typography>
                  <Typography variant="body2">{func.returns.description}</Typography>
                </Paper>
              </Box>}

            
            {func.examples && func.examples.length > 0 &&
          <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Examples</Typography>
                {func.examples.map((example, i) =>
            <Paper key={i} variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', overflowX: 'auto' }}>
                      <pre style={{ margin: 0 }}>
                        <code>{example}</code>
                      </pre>
                    </Box>
                  </Paper>)}

              </Box>}

          </Paper>)}

        
        {doc.examples && doc.examples.length > 0 &&
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Examples</Typography>
            {doc.examples.map((example, index) =>
          <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', overflowX: 'auto' }}>
                  <pre style={{ margin: 0 }}>
                    <code>{example}</code>
                  </pre>
                </Box>
              </Paper>)}

          </Box>}

        
        {doc.filepath &&
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Defined in: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{doc.filepath}</Typography>
            </Typography>
          </Box>}

      </Box>);

  };

  // Render guide documentation
  const renderGuideDoc = (guideId) => {
    const doc = docPages[guideId];

    if (!doc) {
      return (
        <Box>
          <Typography variant="h5" color="error">Guide not found</Typography>
          <Typography paragraph>
            The guide "{guideId}" does not exist in the documentation.
          </Typography>
          <Button variant="contained" onClick={() => setActiveItem(null)}>
            Back to Guides
          </Button>
        </Box>);

    }

    return (
      <Box>
        <Typography variant="h4" gutterBottom>{doc.title}</Typography>
        <Typography paragraph>{doc.description}</Typography>
        
        {doc.category &&
        <Chip label={doc.category} sx={{ mb: 2 }} />}

        
        <Box sx={{ mt: 3, mb: 4 }}>
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </Box>
        
        {doc.tags && doc.tags.length > 0 &&
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" gutterBottom>Tags:</Typography>
            <Box>
              {doc.tags.map((tag) =>
            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}

            </Box>
          </Box>}

        
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>);

  };

  // Render the navigation
  const renderNavigation = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <A11yTooltip title="Search documentation">
            <IconButton
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search documentation">

              <SearchIcon />
            </IconButton>
          </A11yTooltip>
        </Box>
        
        {showSearch ?
        <Box sx={{ mb: 2 }}>
            <TextField
          fullWidth
          placeholder="Search documentation..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchInput}
          InputProps={{
            startAdornment:
            <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>

          }}
          aria-label="Search documentation" />

            
            <Paper sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {searchResults.length === 0 ?
              searchQuery ?
              <ListItem>
                      <ListItemText primary="No results found" />
                    </ListItem> :
              null :

              searchResults.map((result, index) =>
              <ListItemButton
              key={index}
              onClick={() => handleSearchResultSelect(result)}>

                      <ListItemText
                primary={result.type === 'guide' ? result.title : result.name}
                secondary={`${result.type === 'component' ? 'Component' :
                result.type === 'hook' ? 'Hook' :
                result.type === 'utility' ? 'Utility' : 'Guide'}: ${result.description}`} />

                    </ListItemButton>)}


              </List>
            </Paper>
          </Box> :
        null}
        
        <Tabs
        value={activeSection}
        onChange={handleSectionChange}
        variant="fullWidth"
        aria-label="Documentation sections">

          <Tab
          icon={<CodeIcon />}
          iconPosition="start"
          label="Components"
          value="components"
          aria-label="Components section" />

          <Tab
          icon={<BookIcon />}
          iconPosition="start"
          label="Hooks"
          value="hooks"
          aria-label="Hooks section" />

          <Tab
          icon={<DescriptionIcon />}
          iconPosition="start"
          label="Utilities"
          value="utilities"
          aria-label="Utilities section" />

          <Tab
          icon={<HomeIcon />}
          iconPosition="start"
          label="Guides"
          value="guides"
          aria-label="Guides section" />

        </Tabs>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <List sx={{ maxHeight: '70vh', overflow: 'auto' }} dense>
            {activeSection === 'components' && renderComponentItems()}
            {activeSection === 'hooks' && renderHookItems()}
            {activeSection === 'utilities' && renderUtilityItems()}
            {activeSection === 'guides' && renderGuideItems()}
          </List>
        </Box>
      </Box>);

  };

  // Render component items in navigation
  const renderComponentItems = () => {
    // Group components by category
    const componentsByCategory = {};

    Object.entries(componentDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!componentsByCategory[category]) {
        componentsByCategory[category] = [];
      }

      componentsByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return Object.entries(componentsByCategory).map(([category, components]) =>
    <React.Fragment key={category}>
        <ListItem sx={{ bgcolor: 'background.default' }}>
          <ListItemText
        primary={category}
        primaryTypographyProps={{ fontWeight: 'bold', variant: 'subtitle2' }} />

        </ListItem>
        
        {components.map((component) =>
      <ListItemButton
      key={component.name}
      selected={activeItem === component.name}
      onClick={() => handleItemSelect(component.name)}>

            <ListItemText
        primary={component.name}
        secondary={component.description}
        secondaryTypographyProps={{ noWrap: true }} />

          </ListItemButton>)}

      </React.Fragment>);

  };

  // Render hook items in navigation
  const renderHookItems = () => {
    // Group hooks by category
    const hooksByCategory = {};

    Object.entries(hookDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!hooksByCategory[category]) {
        hooksByCategory[category] = [];
      }

      hooksByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return Object.entries(hooksByCategory).map(([category, hooks]) =>
    <React.Fragment key={category}>
        <ListItem sx={{ bgcolor: 'background.default' }}>
          <ListItemText
        primary={category}
        primaryTypographyProps={{ fontWeight: 'bold', variant: 'subtitle2' }} />

        </ListItem>
        
        {hooks.map((hook) =>
      <ListItemButton
      key={hook.name}
      selected={activeItem === hook.name}
      onClick={() => handleItemSelect(hook.name)}>

            <ListItemText
        primary={hook.name}
        secondary={hook.description}
        secondaryTypographyProps={{ noWrap: true }} />

          </ListItemButton>)}

      </React.Fragment>);

  };

  // Render utility items in navigation
  const renderUtilityItems = () => {
    // Group utilities by category
    const utilitiesByCategory = {};

    Object.entries(utilityDocs).forEach(([name, doc]) => {
      const category = doc.category || 'Uncategorized';

      if (!utilitiesByCategory[category]) {
        utilitiesByCategory[category] = [];
      }

      utilitiesByCategory[category].push({
        name,
        description: doc.description
      });
    });

    return Object.entries(utilitiesByCategory).map(([category, utilities]) =>
    <React.Fragment key={category}>
        <ListItem sx={{ bgcolor: 'background.default' }}>
          <ListItemText
        primary={category}
        primaryTypographyProps={{ fontWeight: 'bold', variant: 'subtitle2' }} />

        </ListItem>
        
        {utilities.map((utility) =>
      <ListItemButton
      key={utility.name}
      selected={activeItem === utility.name}
      onClick={() => handleItemSelect(utility.name)}>

            <ListItemText
        primary={utility.name}
        secondary={utility.description}
        secondaryTypographyProps={{ noWrap: true }} />

          </ListItemButton>)}

      </React.Fragment>);

  };

  // Render guide items in navigation
  const renderGuideItems = () => {
    // Group guides by category
    const guidesByCategory = {};

    Object.entries(docPages).forEach(([id, page]) => {
      const category = page.category || 'Uncategorized';

      if (!guidesByCategory[category]) {
        guidesByCategory[category] = [];
      }

      guidesByCategory[category].push({
        id,
        title: page.title,
        description: page.description
      });
    });

    return Object.entries(guidesByCategory).map(([category, guides]) =>
    <React.Fragment key={category}>
        <ListItem sx={{ bgcolor: 'background.default' }}>
          <ListItemText
        primary={category}
        primaryTypographyProps={{ fontWeight: 'bold', variant: 'subtitle2' }} />

        </ListItem>
        
        {guides.map((guide) =>
      <ListItemButton
      key={guide.id}
      selected={activeItem === guide.id}
      onClick={() => handleItemSelect(guide.id)}>

            <ListItemText
        primary={guide.title}
        secondary={guide.description}
        secondaryTypographyProps={{ noWrap: true }} />

          </ListItemButton>)}

      </React.Fragment>);

  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: 280, borderRight: '1px solid', borderColor: 'divider', p: 2 }}>
        {renderNavigation()}
      </Box>
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        {getDocumentationContent()}
      </Box>
    </Box>);

};export default withErrorBoundary(DocumentationViewer, { fallback: (error, resetErrorBoundary) => <div className="error-boundary-fallback"><h3>Something went wrong</h3><p>{error.message}</p><button onClick={resetErrorBoundary}>Try again</button></div> });

DocumentationViewer.propTypes = {
  initialSection: PropTypes.oneOf(['components', 'hooks', 'utilities', 'guides']),
  initialItem: PropTypes.string,
  onNavigate: PropTypes.func
};

export default DocumentationViewer;