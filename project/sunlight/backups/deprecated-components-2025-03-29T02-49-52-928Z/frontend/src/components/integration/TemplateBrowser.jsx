import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Design system components
import { Box } from '../../design-system'
import { Typography } from '../../design-system'
import { Button } from '../../design-system'
import { Grid } from '../../design-system'

// Material UI components
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
import  from '@mui/material/';;

// Icons
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SaveIcon from '@mui/icons-material/Save';
import SchemaIcon from '@mui/icons-material/Schema';
import { Alert, Card, CardActions, CardContent, CardMedia, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Snackbar, Stack, Tab, Tabs, TextField, Tooltip } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Removed duplicate import
/**
 * TemplateBrowser Component
 * 
 * A component for browsing, applying, and managing flow templates.
 * Provides functionality for:
 * - Browsing templates by category
 * - Searching templates
 * - Applying templates to the canvas
 * - Managing templates (edit, delete, duplicate)
 * - Creating new templates from existing flows
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.templates - List of available templates
 * @param {Function} props.onApplyTemplate - Callback when a template is applied
 * @param {Function} props.onExportTemplate - Callback to export the current flow as a template
 * @param {boolean} [props.asDialog=false] - Whether the component is being used in a dialog
 */
const TemplateBrowser = ({ 
  templates = [], 
  onApplyTemplate, 
  onExportTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  asDialog = false
}) => {
  // Added display name
  TemplateBrowser.displayName = 'TemplateBrowser';

  // Added display name
  TemplateBrowser.displayName = 'TemplateBrowser';

  // Added display name
  TemplateBrowser.displayName = 'TemplateBrowser';

  // Added display name
  TemplateBrowser.displayName = 'TemplateBrowser';

  // Added display name
  TemplateBrowser.displayName = 'TemplateBrowser';


  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Extract unique categories from templates
  const categories = useMemo(() => {
  // Added display name
  categories.displayName = 'categories';

    const allCategories = templates.map(template => template.category);
    return ['all', ...new Set(allCategories)];
  }, [templates]);

  // Filter templates based on selected category and search term
  const filteredTemplates = useMemo(() => {
  // Added display name
  filteredTemplates.displayName = 'filteredTemplates';

    let filtered = templates;

    // Filter by category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(template => template.category === currentCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(template => {
        return (
          template.name.toLowerCase().includes(search) ||
          (template.description && template.description.toLowerCase().includes(search)) ||
          (template.tags && template.tags.some(tag => tag.toLowerCase().includes(search)))
        );
      });
    }

    return filtered;
  }, [templates, currentCategory, searchTerm]);

  // Handle template selection for apply
  const handleApplyTemplate = useCallback((template) => {
  // Added display name
  handleApplyTemplate.displayName = 'handleApplyTemplate';

    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
  }, [onApplyTemplate]);

  // Handle context menu open
  const handleContextMenuOpen = useCallback((event, template) => {
  // Added display name
  handleContextMenuOpen.displayName = 'handleContextMenuOpen';

    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setSelectedTemplate(template);
  }, []);

  // Handle context menu close
  const handleContextMenuClose = useCallback(() => {
  // Added display name
  handleContextMenuClose.displayName = 'handleContextMenuClose';

    setContextMenu(null);
    setSelectedTemplate(null);
  }, []);

  // Handle edit template
  const handleEditClick = useCallback(() => {
  // Added display name
  handleEditClick.displayName = 'handleEditClick';

    if (selectedTemplate) {
      setTemplateForm({
        name: selectedTemplate.name,
        description: selectedTemplate.description || '',
        category: selectedTemplate.category || 'Custom',
        tags: selectedTemplate.tags || []
      });
      setEditDialogOpen(true);
    }
    handleContextMenuClose();
  }, [selectedTemplate, handleContextMenuClose]);

  // Handle delete confirmation
  const handleDeleteClick = useCallback(() => {
  // Added display name
  handleDeleteClick.displayName = 'handleDeleteClick';

    if (selectedTemplate) {
      setConfirmDeleteOpen(true);
    }
    handleContextMenuClose();
  }, [selectedTemplate, handleContextMenuClose]);

  // Handle duplicate template
  const handleDuplicateClick = useCallback(() => {
  // Added display name
  handleDuplicateClick.displayName = 'handleDuplicateClick';

    if (selectedTemplate && onDuplicateTemplate) {
      try {
        onDuplicateTemplate(selectedTemplate.id);
        setSuccess('Template duplicated successfully');
      } catch (err) {
        setError(`Failed to duplicate template: ${err.message}`);
      }
    }
    handleContextMenuClose();
  }, [selectedTemplate, onDuplicateTemplate, handleContextMenuClose]);

  // Handle save template changes
  const handleSaveTemplate = useCallback(() => {
  // Added display name
  handleSaveTemplate.displayName = 'handleSaveTemplate';

    if (selectedTemplate && onUpdateTemplate) {
      try {
        onUpdateTemplate(selectedTemplate.id, templateForm);
        setEditDialogOpen(false);
        setSuccess('Template updated successfully');
      } catch (err) {
        setError(`Failed to update template: ${err.message}`);
      }
    }
  }, [selectedTemplate, templateForm, onUpdateTemplate]);

  // Handle adding a new tag
  const handleAddTag = useCallback((event) => {
  // Added display name
  handleAddTag.displayName = 'handleAddTag';

    if (event.key === 'Enter' && event.target.value) {
      const newTag = event.target.value.trim();
      if (newTag && !templateForm.tags.includes(newTag)) {
        setTemplateForm(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        event.target.value = '';
      }
    }
  }, [templateForm.tags]);

  // Handle removing a tag
  const handleRemoveTag = useCallback((tagToRemove) => {
  // Added display name
  handleRemoveTag.displayName = 'handleRemoveTag';

    setTemplateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Render template card
  const renderTemplateCard = useCallback((template) => {
  // Added display name
  renderTemplateCard.displayName = 'renderTemplateCard';

    const isRemote = template.isRemote || false;
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
      >
        <CardMedia
          component="div&quot;
          sx={{
            height: 140,
            bgcolor: template.category === "Enterprise' ? '#2E7EED' :
                    template.category === 'Basic' ? '#27AE60' :
                    template.category === 'Advanced' ? '#F2994A' : 
                    template.category === 'Custom' ? '#9B51E0' : '#888888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <SchemaIcon sx={{ fontSize: 60, color: 'white' }} />
        </CardMedia>
        
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6&quot; component="h3" gutterBottom>
              {template.name}
            </Typography>
            
            <IconButton 
              size="small&quot; 
              onClick={(e) => handleContextMenuOpen(e, template)}
              aria-label="template options"
            >
              <MoreVertIcon fontSize="small&quot; />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary&quot; sx={{ mb: 1, height: "40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {template.description || 'No description provided'}
          </Typography>
          
          <Stack direction="row&quot; spacing={0.5} sx={{ mb: 1, flexWrap: "wrap', gap: 0.5 }}>
            <Chip 
              size="small&quot; 
              label={template.category} 
              color="primary" 
              variant="outlined&quot; 
              icon={<CategoryIcon fontSize="small" />}
            />
            {isRemote && (
              <Chip 
                size="small&quot; 
                label="Remote" 
                color="secondary&quot; 
                variant="outlined" 
                icon={<CloudSyncIcon fontSize="small&quot; />}
              />
            )}
            {template.tags && template.tags.slice(0, 2).map(tag => (
              <Chip 
                key={tag} 
                size="small" 
                label={tag} 
                variant="outlined&quot;
              />
            ))}
            {template.tags && template.tags.length > 2 && (
              <Chip 
                size="small" 
                label={`+${template.tags.length - 2}`} 
                variant="outlined&quot;
              />
            )}
          </Stack>
          
          <Box sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption&quot; color="text.secondary">
              Nodes: {template.nodes?.length || 0}
            </Typography>
            <Typography variant="caption&quot; color="text.secondary">
              {new Date(template.modified || template.created).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions>
          <Button 
            size="small&quot; 
            variant="contained" 
            fullWidth
            onClick={() => handleApplyTemplate(template)}
          >
            Apply Template
          </Button>
        </CardActions>
      </Card>
    );
  }, [handleApplyTemplate, handleContextMenuOpen]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with search and export */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Search templates...&quot;
          variant="outlined"
          size="small&quot;
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2, flexGrow: 1 }}
        />
        
        <Button
          variant="outlined&quot;
          startIcon={<SaveIcon />}
          onClick={onExportTemplate}
          size="small"
        >
          Save Current Flow
        </Button>
      </Box>
      
      {/* Category tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentCategory}
          onChange={(_, newValue) => setCurrentCategory(newValue)}
          variant="scrollable&quot;
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab 
              key={category} 
              label={category === 'all' ? 'All Templates' : category} 
              value={category} 
            />
          ))}
        </Tabs>
      </Paper>
      
      {/* Templates grid */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1&quot; color="text.secondary">
              {searchTerm ? 'No templates match your search' : 'No templates available in this category'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={asDialog ? 4 : 6} lg={asDialog ? 3 : 4} key={template.id}>
                {renderTemplateCard(template)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Context menu for template actions */}
      <Menu
        id="template-context-menu&quot;
        open={Boolean(contextMenu)}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small&quot; />
          </ListItemIcon>
          <ListItemText>Edit Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small&quot; color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Template</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Edit template dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm&quot; fullWidth>
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Template Name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal&quot;
              required
            />
            
            <TextField
              label="Description"
              value={templateForm.description}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              margin="normal&quot;
              multiline
              rows={3}
            />
            
            <TextField
              label="Category"
              value={templateForm.category}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
              fullWidth
              margin="normal&quot;
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              
              <Stack direction="row&quot; spacing={1} sx={{ flexWrap: "wrap', gap: 1, mb: 1 }}>
                {templateForm.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Stack>
              
              <TextField
                placeholder="Add tag (press Enter)&quot;
                size="small"
                fullWidth
                onKeyDown={handleAddTag}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained&quot; color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained&quot; color="error" onClick={() => {
            if (selectedTemplate && onDeleteTemplate) {
              try {
                onDeleteTemplate(selectedTemplate.id);
                setConfirmDeleteOpen(false);
                setSuccess('Template deleted successfully');
              } catch (err) {
                setError(`Failed to delete template: ${err.message}`);
                setConfirmDeleteOpen(false);
              }
            }
          }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="error&quot; onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom', horizontal: 'left' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

TemplateBrowser.propTypes = {
  templates: PropTypes.array,
  onApplyTemplate: PropTypes.func.isRequired,
  onExportTemplate: PropTypes.func.isRequired,
  onUpdateTemplate: PropTypes.func,
  onDeleteTemplate: PropTypes.func,
  onDuplicateTemplate: PropTypes.func,
  asDialog: PropTypes.bool
};

export default TemplateBrowser;