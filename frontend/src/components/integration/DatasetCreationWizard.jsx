/**
 * Dataset Creation Wizard
 *
 * A multi-step wizard for creating datasets with source selection and configuration.
 * This component guides users through the dataset creation process step by step,
 * with validation at each stage.
 *
 * @component
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';

import { useDatasetManagement } from './use_dataset_management';
import {
  WIZARD_STEPS,
  STEP_INDICES,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  getNextStep,
  getPreviousStep,
  getValidationSchemaForStep,
  getInitialValues,
  transformToDatasetModel,
} from './dataset_wizard_utils';

// Step components
import BasicInfoStep from './wizard-steps/BasicInfoStep';
import SourceSelectionStep from './wizard-steps/SourceSelectionStep';
import SourceConfigStep from './wizard-steps/SourceConfigStep';
import SchemaConfigStep from './wizard-steps/SchemaConfigStep';
import PermissionsStep from './wizard-steps/PermissionsStep';
import ReviewStep from './wizard-steps/ReviewStep';

/**
 * Dataset Creation Wizard
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the wizard dialog is open
 * @param {Function} props.onClose - Function to call when the wizard is closed
 * @param {Function} props.onComplete - Function to call when the wizard is completed
 * @param {Object} props.initialValues - Initial values for the wizard form
 * @returns {JSX.Element} The DatasetCreationWizard component
 */
const DatasetCreationWizard = ({ open, onClose, onComplete, initialValues = null }) => {
  // State for the current step
  const [activeStep, setActiveStep] = useState(WIZARD_STEPS.BASIC_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dataset management hook
  const { createDataset } = useDatasetManagement();

  // Initialize form with proper initial values
  const formik = useFormik({
    initialValues: initialValues || getInitialValues(),
    validationSchema: getValidationSchemaForStep(activeStep),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (activeStep === WIZARD_STEPS.REVIEW) {
        try {
          setIsSubmitting(true);
          // Transform wizard form data to dataset model
          const datasetModel = transformToDatasetModel(values);
          // Create the dataset
          const newDataset = await createDataset(datasetModel);
          // Call onComplete with the new dataset
          onComplete(newDataset);
          // Close the wizard
          handleClose();
        } catch (error) {
          console.error('Error creating dataset:', error);
          // TODO: Show error message to user
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // Move to the next step
        const nextStep = getNextStep(activeStep, values);
        setActiveStep(nextStep);
      }
    },
  });

  // Get step components based on active step
  const StepComponent = useCallback(() => {
    switch (activeStep) {
      case WIZARD_STEPS.BASIC_INFO:
        return <BasicInfoStep formik={formik} />;
      case WIZARD_STEPS.SOURCE_SELECTION:
        return <SourceSelectionStep formik={formik} />;
      case WIZARD_STEPS.SOURCE_CONFIG:
        return <SourceConfigStep formik={formik} />;
      case WIZARD_STEPS.SCHEMA_CONFIG:
        return <SchemaConfigStep formik={formik} />;
      case WIZARD_STEPS.PERMISSIONS:
        return <PermissionsStep formik={formik} />;
      case WIZARD_STEPS.REVIEW:
        return <ReviewStep formik={formik} />;
      default:
        return <div>Unknown step</div>;
    }
  }, [activeStep, formik]);

  /**
   * Handle going to the previous step
   */
  const handleBack = () => {
    const prevStep = getPreviousStep(activeStep, formik.values);
    if (prevStep) {
      setActiveStep(prevStep);
    }
  };

  /**
   * Handle closing the wizard
   */
  const handleClose = () => {
    // Reset form and state
    formik.resetForm();
    setActiveStep(WIZARD_STEPS.BASIC_INFO);
    setIsSubmitting(false);
    // Call onClose
    onClose();
  };

  /**
   * Check if the current step is the first step
   */
  const isFirstStep = useMemo(() => {
    return getPreviousStep(activeStep, formik.values) === null;
  }, [activeStep, formik.values]);

  /**
   * Check if the current step is the last step
   */
  const isLastStep = useMemo(() => {
    return activeStep === WIZARD_STEPS.REVIEW;
  }, [activeStep]);

  /**
   * Get the active step index for the stepper
   */
  const activeStepIndex = useMemo(() => {
    return STEP_INDICES[activeStep] || 0;
  }, [activeStep]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' },
      }}
    >
      <DialogTitle>
        Create New Dataset
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ width: '100%' }}>
          {/* Stepper */}
          <Stepper activeStep={activeStepIndex} sx={{ mb: 4 }}>
            {Object.values(WIZARD_STEPS).map((step, index) => (
              <Step key={step}>
                <StepLabel>{STEP_LABELS[step]}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Title and Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2">
              {STEP_LABELS[activeStep]}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {STEP_DESCRIPTIONS[activeStep]}
            </Typography>
          </Box>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            <form onSubmit={formik.handleSubmit} id="dataset-wizard-form">
              <StepComponent />
            </form>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          disabled={isFirstStep || isSubmitting}
        >
          Back
        </Button>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          form="dataset-wizard-form"
          endIcon={isLastStep ? <CheckIcon /> : <ArrowForwardIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ mr: 1 }} />
          ) : isLastStep ? (
            'Create Dataset'
          ) : (
            'Continue'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DatasetCreationWizard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

export default DatasetCreationWizard;