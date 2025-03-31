/**
 * Paper component
 * 
 * A design system wrapper around Material UI's Paper component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiPaper } from '@design-system';
;

const Paper = React.forwardRef((props, ref) => {
  Paper.displayName = 'Paper';
  
  return <MuiPaper ref={ref} {...props} />;
});

Paper.propTypes = {
  children: PropTypes.node
};

export default Paper;
