/**
 * DialogContext
 * 
 * Context provider for managing modal dialogs across the application.
 * 
 * @module contexts/DialogContext
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Create the context
const DialogContext = createContext({
  dialogs: {},
  openDialog: () => {},
  closeDialog: () => {},
  updateDialog: () => {},
});

/**
 * Dialog Provider Component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Child components
 * @returns {JSX.Element} Dialog provider
 */
export function DialogProvider({ children }) {
  // State for tracking open dialogs
  const [dialogs, setDialogs] = useState({});
  
  // Open a dialog with given id and props
  const openDialog = useCallback((id, props = {}) => {
    setDialogs(prevDialogs => ({
      ...prevDialogs,
      [id]: {
        isOpen: true,
        props,
      },
    }));
  }, []);
  
  // Close a dialog by id
  const closeDialog = useCallback((id) => {
    setDialogs(prevDialogs => {
      // If dialog doesn't exist, do nothing
      if (!prevDialogs[id]) return prevDialogs;
      
      // Create a shallow copy of the state
      const newDialogs = { ...prevDialogs };
      
      // Update the dialog's isOpen state
      newDialogs[id] = {
        ...newDialogs[id],
        isOpen: false,
      };
      
      return newDialogs;
    });
  }, []);
  
  // Update dialog props
  const updateDialog = useCallback((id, newProps) => {
    setDialogs(prevDialogs => {
      // If dialog doesn't exist, do nothing
      if (!prevDialogs[id]) return prevDialogs;
      
      return {
        ...prevDialogs,
        [id]: {
          ...prevDialogs[id],
          props: {
            ...prevDialogs[id].props,
            ...newProps,
          },
        },
      };
    });
  }, []);
  
  // Value object for the context
  const contextValue = useMemo(() => ({
    dialogs,
    openDialog,
    closeDialog,
    updateDialog,
  }), [dialogs, openDialog, closeDialog, updateDialog]);
  
  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

/**
 * Hook to use dialog context
 * 
 * @returns {Object} Dialog context value
 */
export function useDialog() {
  const context = useContext(DialogContext);
  
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  
  return context;
}

/**
 * Hook to use a specific dialog
 * 
 * @param {string} id - ID of the dialog to manage
 * @returns {Object} Methods to control the specific dialog
 */
export function useSpecificDialog(id) {
  const { dialogs, openDialog, closeDialog, updateDialog } = useDialog();
  
  const isOpen = useMemo(() => {
    return dialogs[id]?.isOpen || false;
  }, [dialogs, id]);
  
  const props = useMemo(() => {
    return dialogs[id]?.props || {};
  }, [dialogs, id]);
  
  const open = useCallback((dialogProps = {}) => {
    openDialog(id, dialogProps);
  }, [openDialog, id]);
  
  const close = useCallback(() => {
    closeDialog(id);
  }, [closeDialog, id]);
  
  const update = useCallback((newProps) => {
    updateDialog(id, newProps);
  }, [updateDialog, id]);
  
  return {
    isOpen,
    props,
    open,
    close,
    update,
  };
}

DialogProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
};

export default DialogContext;