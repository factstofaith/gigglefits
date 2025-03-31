import React from 'react';
import ApplicationForm from './application_form';
import ApplicationFormDialog from './application_form_dialog';
import DatasetForm from './dataset_form';
import DatasetFormDialog from './dataset_form_dialog';

/**
 * Integration module for application and dataset forms
 * 
 * This file provides a unified export point for all form components
 * related to applications and datasets in the admin dashboard.
 */

export {
  ApplicationForm,
  ApplicationFormDialog,
  DatasetForm,
  DatasetFormDialog
};

/**
 * Form Integration Guide
 * 
 * How to integrate these forms with the existing application management panel:
 * 
 * 1. For ApplicationManagementPanel integration:
 *    - Replace <ApplicationCreationDialog> with <ApplicationFormDialog>
 *    - Update the onSubmit handler to use the new form data structure
 *    - Use the same open/onClose props from the existing dialog
 * 
 * 2. For ApplicationDetailView integration:
 *    - Embed <ApplicationForm> directly in the detail view
 *    - Provide the application data as a prop
 *    - Handle the form submission and cancelation
 * 
 * 3. For DatasetBrowser integration:
 *    - Use <DatasetFormDialog> for dataset creation/editing
 *    - Provide necessary props like applications and connections
 *    - Handle form submission to create/update datasets
 * 
 * Example usage:
 * 
 * // Replace this:
 * <ApplicationCreationDialog
 *   open={isCreateDialogOpen}
 *   onClose={() => setIsCreateDialogOpen(false)}
 *   onSubmit={handleCreateApplication}
 *   tenant={tenant}
 * />
 * 
 * // With this:
 * <ApplicationFormDialog
 *   open={isCreateDialogOpen}
 *   onClose={() => setIsCreateDialogOpen(false)}
 *   onSubmit={handleCreateApplication}
 *   availableRoles={availableRoles}
 *   availableTimeZones={availableTimeZones}
 * />
 */