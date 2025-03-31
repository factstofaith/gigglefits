/**
 * DialogTitle component
 * 
 * A design system wrapper around Material UI's DialogTitle component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiDialogTitle } from '@design-system';
;

const DialogTitle = React.forwardRef((props, ref) => {
  DialogTitle.displayName = 'DialogTitle';
  
  return <MuiDialogTitle ref={ref} {...props} />;
});

DialogTitle.propTypes = {
  children: PropTypes.node
};

export default DialogTitle;
