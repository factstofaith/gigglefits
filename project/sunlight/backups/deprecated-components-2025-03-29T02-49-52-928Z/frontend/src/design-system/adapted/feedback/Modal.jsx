/**
 * @component Modal
 * @description An accessible modal dialog component that adapts Material UI Dialog
 * with enhanced accessibility and performance features.
 * @typedef {import('../../types/complex-components').ModalAdaptedProps} ModalAdaptedProps
 * @type {React.ForwardRefExoticComponent<ModalAdaptedProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@design-system/components/feedback';
import { getAriaAttributes, getKeyboardHandlers } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary';

const Modal = React.memo(React.forwardRef(({
  // Dialog props
  open = false,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = false,
  fullScreen = false,
  
  // Accessibility props
  ariaLabelledBy,
  ariaDescribedBy,
  
  // Styling props
  className,
  contentClassName,
  backdropClassName,
  paperClassName,
  
  // Animation props
  transitionDuration,
  
  // Additional props
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  hideBackdrop = false,
  keepMounted = false,
  
  ...otherProps
}, ref) => {
  // Unique ID for the modal if none is provided
  const modalId = React.useId();
  const titleId = ariaLabelledBy || `${modalId}-title`;
  const descriptionId = ariaDescribedBy || `${modalId}-description`;
  
  // Generate accessibility attributes
  const ariaAttributes = getAriaAttributes({
    labelledBy: titleId,
    describedBy: descriptionId,
    modal: true,
  });
  
  // Generate keyboard handlers
  const keyboardHandlers = getKeyboardHandlers({
    onEscape: !disableEscapeKeyDown ? onClose : undefined,
  });
  
  // Handle backdrop click
  const handleBackdropClick = (event) => {
  // Added display name
  handleBackdropClick.displayName = 'handleBackdropClick';

  // Added display name
  handleBackdropClick.displayName = 'handleBackdropClick';

  // Added display name
  handleBackdropClick.displayName = 'handleBackdropClick';

  // Added display name
  handleBackdropClick.displayName = 'handleBackdropClick';

  // Added display name
  handleBackdropClick.displayName = 'handleBackdropClick';


    if (disableBackdropClick) {
      event.stopPropagation();
      return;
    }
    
    if (onClose) {
      onClose(event, 'backdropClick');
    }
  };
  
  // Render header, content, and actions
  const renderHeader = () => {
  // Added display name
  renderHeader.displayName = 'renderHeader';

  // Added display name
  renderHeader.displayName = 'renderHeader';

  // Added display name
  renderHeader.displayName = 'renderHeader';

  // Added display name
  renderHeader.displayName = 'renderHeader';

  // Added display name
  renderHeader.displayName = 'renderHeader';


    if (!title) return null;
    
    return (
      <div 
        id={titleId}
        className="ds-modal-header&quot;
      >
        {typeof title === "string' ? (
          <h2>{title}</h2>
        ) : (
          title
        )}
      </div>
    );
  };
  
  const renderContent = () => (
    <div 
      id={descriptionId}
      className={`ds-modal-content ${contentClassName || ''}`}
    >
      {children}
    </div>
  );
  
  const renderActions = () => {
  // Added display name
  renderActions.displayName = 'renderActions';

  // Added display name
  renderActions.displayName = 'renderActions';

  // Added display name
  renderActions.displayName = 'renderActions';

  // Added display name
  renderActions.displayName = 'renderActions';

  // Added display name
  renderActions.displayName = 'renderActions';


    if (!actions) return null;
    
    return (
      <div className="ds-modal-actions&quot;>
        {actions}
      </div>
    );
  };
  
  return (
    <ErrorBoundary
      fallback={
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
        >
          <div className="ds-modal-error&quot;>
            <h2>Error Loading Modal</h2>
            <p>There was a problem loading this modal. Please try again or contact support.</p>
            {onClose && (
              <button onClick={onClose}>Close</button>
            )}
          </div>
        </Dialog>
      }
    >
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        keepMounted={keepMounted}
        hideBackdrop={hideBackdrop}
        className={`ds-modal ds-modal-adapted ${className || "'}`}
        BackdropProps={{
          onClick: handleBackdropClick,
          className: backdropClassName,
        }}
        PaperProps={{
          className: paperClassName,
        }}
        transitionDuration={transitionDuration}
        {...ariaAttributes}
        {...keyboardHandlers}
        {...otherProps}
      >
        {renderHeader()}
        {renderContent()}
        {renderActions()}
      </Dialog>
    </ErrorBoundary>
  );
}));

ModalAdapted.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  backdropClassName: PropTypes.string,
  paperClassName: PropTypes.string,
  transitionDuration: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
  disableBackdropClick: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  hideBackdrop: PropTypes.bool,
  keepMounted: PropTypes.bool,
};

Modal.displayName = 'Modal';

export default Modal;