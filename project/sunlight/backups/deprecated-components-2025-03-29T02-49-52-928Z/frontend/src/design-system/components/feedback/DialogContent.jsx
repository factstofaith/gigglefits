/**
 * DialogContent component
 * 
 * A design system wrapper around Material UI's DialogContent component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiDialogContent } from '@design-system';
;

const DialogContent = React.forwardRef((props, ref) => {
  DialogContent.displayName = 'DialogContent';
  
  return <MuiDialogContent ref={ref} {...props} />;
});

DialogContent.propTypes = {
  children: PropTypes.node
};

export default DialogContent;
