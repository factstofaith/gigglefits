/**
 * @component AccordionDetails
 * @description The content container for an accordion panel.
 * 
 * @typedef {import('../../types/feedback').AccordionDetailsProps} AccordionDetailsProps
 * @type {React.FC<AccordionDetailsProps>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * AccordionDetailsAdapted - Contains the content of an accordion panel
 */
const AccordionDetails = React.memo(({
  children,
  // Additional props
  ...rest
}) => {
  return (
    <Box
      component="div&quot;
      sx={{
        padding: 2,
        ...(rest.sx || {})
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

AccordionDetailsAdapted.propTypes = {
  // Content
  children: PropTypes.node,
};

AccordionDetails.displayName = "AccordionDetails';

export default AccordionDetails;