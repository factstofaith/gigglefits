/**
 * DialogActions component
 * 
 * A design system wrapper around Material UI's DialogActions component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiDialogActions } from '@design-system';
;

const DialogActions = React.forwardRef((props, ref) => {
  DialogActions.displayName = 'DialogActions';
  
  return <MuiDialogActions ref={ref} {...props} />;
});

DialogActions.propTypes = {
  children: PropTypes.node
};

export default DialogActions;
