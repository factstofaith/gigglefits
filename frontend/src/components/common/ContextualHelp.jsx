import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling/"; /**
                                                                                       * Contextual Help Component
                                                                                       * 
                                                                                       * A reusable component to provide context-sensitive help throughout the application.
                                                                                       * Supports various help types including tooltips, popovers, and inline help text.
                                                                                       * 
                                                                                       * @component
                                                                                       */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Tooltip, Popover, IconButton, Paper, Fade, Link, Divider } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Contextual Help component providing context-sensitive help information
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the help content
 * @param {string} props.title - Help title
 * @param {string|React.ReactNode} props.content - Help content (text or JSX)
 * @param {string} [props.type="tooltip"] - Help display type (tooltip, popover, inline)
 * @param {'info'|'help'} [props.icon="help"] - Icon to display (help or info)
 * @param {string} [props.size="medium"] - Icon size (small, medium, large)
 * @param {Object} [props.iconProps] - Additional props for the icon
 * @param {Object} [props.tooltipProps] - Additional props for the tooltip
 * @param {Object} [props.popoverProps] - Additional props for the popover
 * @param {Object} [props.sx] - Custom styles
 * @returns {JSX.Element} The ContextualHelp component
 */
const ContextualHelp = ({
  id,
  title,
  content,
  type = 'tooltip',
  icon = 'help',
  size = 'medium',
  iconProps = {},
  tooltipProps = {},
  popoverProps = {},
  relatedLinks = [],
  sx = {},
  ...rest
}) => {
  const [formError, setFormError] = useState(null);
  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popoverId = open ? `${id}-popover` : undefined;

  // Handle popover open/close
  const handlePopoverOpen = useCallback(event => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Determine icon size
  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  // Choose icon component based on icon prop
  const IconComponent = icon === 'info' ? InfoIcon : HelpIcon;

  // Determine max height for popover content
  const maxContentHeight = window.innerHeight * 0.6;

  // Render based on type
  if (type === 'tooltip') {
    return <Tooltip title={<Box sx={{
      p: 0.5
    }}>
            {title && <Typography variant="subtitle2">{title}</Typography>}
            <Typography variant="body2">{content}</Typography>
          </Box>} arrow placement="top" {...tooltipProps}>

        <IconButton size={iconSize} color="primary" aria-label={`Help: ${title || 'Information'}`} sx={{
        padding: size === 'small' ? '4px' : '8px',
        ...sx
      }} {...iconProps} {...rest}>

          <IconComponent fontSize={iconSize} />
        </IconButton>
      </Tooltip>;
  }
  if (type === 'popover') {
    return <>
        <IconButton aria-describedby={popoverId} size={iconSize} color="primary" onClick={handlePopoverOpen} aria-label={`Help: ${title || 'Information'}`} sx={{
        padding: size === 'small' ? '4px' : '8px',
        ...sx
      }} {...iconProps} {...rest}>

          <IconComponent fontSize={iconSize} />
        </IconButton>
        
        <Popover id={popoverId} open={open} anchorEl={anchorEl} onClose={handlePopoverClose} anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }} transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }} PaperProps={{
        elevation: 4,
        sx: {
          maxWidth: '400px',
          maxHeight: `${maxContentHeight}px`,
          overflow: 'auto'
        }
      }} {...popoverProps}>

          <Fade in={open}>
            <Paper sx={{
            p: 0
          }}>
              <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 1.5
            }}>
                <Typography variant="subtitle1" sx={{
                fontWeight: 'medium'
              }}>
                  {title || 'Help Information'}
                </Typography>
                <IconButton size="small" onClick={handlePopoverClose} color="inherit" aria-label="Close help">

                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{
              p: 2
            }}>
                <Typography variant="body2" component="div">
                  {content}
                </Typography>
                
                {relatedLinks && relatedLinks.length > 0 && <>
                    <Divider sx={{
                  my: 1.5
                }} />
                    <Typography variant="subtitle2" sx={{
                  mt: 1,
                  mb: 0.5
                }}>
                      Related Information
                    </Typography>
                    <Box component="ul" sx={{
                  m: 0,
                  pl: 2
                }}>
                      {relatedLinks.map((link, index) => <Box component="li" key={index} sx={{
                    mb: 0.5
                  }}>
                          <Link href={link.url} onClick={e => {
                      e.preventDefault();
                      if (link.onClick) link.onClick();
                    }} sx={{
                      fontSize: '0.875rem'
                    }}>

                            {link.label}
                          </Link>
                        </Box>)}

                    </Box>
                  </>}

              </Box>
            </Paper>
          </Fade>
        </Popover>
      </>;
  }
  if (type === 'inline') {
    return <Box sx={{
      display: 'flex',
      p: 1.5,
      borderRadius: 1,
      bgcolor: 'info.lightest',
      border: '1px solid',
      borderColor: 'info.light',
      mb: 2,
      ...sx
    }} {...rest}>

        <IconComponent fontSize={iconSize} color="info" sx={{
        mr: 1.5,
        mt: '2px'
      }} />

        <Box>
          {title && <Typography variant="subtitle2" color="info.dark" sx={{
          mb: 0.5
        }}>
              {title}
            </Typography>}

          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
          
          {relatedLinks && relatedLinks.length > 0 && <Box sx={{
          mt: 1
        }}>
              {relatedLinks.map((link, index) => <Link key={index} href={link.url} onClick={e => {
            e.preventDefault();
            if (link.onClick) link.onClick();
          }} sx={{
            fontSize: '0.875rem',
            mr: 2,
            display: 'inline-block'
          }}>

                  {link.label}
                </Link>)}

            </Box>}

        </Box>
      </Box>;
  }

  // Default fallback
  return null;
};
ContextualHelp.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  type: PropTypes.oneOf(['tooltip', 'popover', 'inline']),
  icon: PropTypes.oneOf(['help', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  iconProps: PropTypes.object,
  tooltipProps: PropTypes.object,
  popoverProps: PropTypes.object,
  relatedLinks: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    url: PropTypes.string,
    onClick: PropTypes.func
  })),
  sx: PropTypes.object
};
export default ContextualHelp;