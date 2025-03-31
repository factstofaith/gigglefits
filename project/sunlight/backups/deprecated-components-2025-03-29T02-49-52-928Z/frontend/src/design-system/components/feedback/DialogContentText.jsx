/**
 * DialogContentText component
 * 
 * A design system wrapper around Material UI's DialogContentText component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiDialogContentText } from '@design-system';
;

const DialogContentText = React.forwardRef((props, ref) => {
  DialogContentText.displayName = 'DialogContentText';
  
  return <MuiDialogContentText ref={ref} {...props} />;
});

DialogContentText.propTypes = {
  children: PropTypes.node
};

export default DialogContentText;
