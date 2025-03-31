// import { } from '../adapter';
/**
 * Collapse component for legacy support
 * Wraps Material UI's Collapse component
 */

import { Collapse as MuiCollapse } from '../adapter';

const Collapse = MuiCollapse;

Collapse.displayName = 'Collapse';

export default Collapse;