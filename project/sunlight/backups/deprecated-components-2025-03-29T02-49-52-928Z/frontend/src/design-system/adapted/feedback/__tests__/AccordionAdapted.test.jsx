/**
 * AccordionAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Accordion from '../AccordionAdapted';
import AccordionSummary from '../AccordionSummaryAdapted';
import AccordionDetails from '../AccordionDetailsAdapted';

describe('AccordionAdapted', () => {
  const renderAccordion = (props = {}) => {
  // Added display name
  renderAccordion.displayName = 'renderAccordion';

  // Added display name
  renderAccordion.displayName = 'renderAccordion';

  // Added display name
  renderAccordion.displayName = 'renderAccordion';

  // Added display name
  renderAccordion.displayName = 'renderAccordion';

  // Added display name
  renderAccordion.displayName = 'renderAccordion';


    return render(
      <AccordionAdapted {...props}>
        <AccordionSummaryAdapted>
          Accordion Title
        </AccordionSummaryAdapted>
        <AccordionDetailsAdapted>
          Accordion Content
        </AccordionDetailsAdapted>
      </AccordionAdapted>
    );
  };

  it('renders with default props', () => {
    renderAccordion();
    
    expect(screen.getByText('Accordion Title')).toBeInTheDocument();
    expect(screen.getByText('Accordion Content')).toBeInTheDocument();
  });

  it('starts collapsed by default', () => {
    renderAccordion();
    
    const summary = screen.getByText('Accordion Title');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts expanded when defaultExpanded is true', () => {
    renderAccordion({ defaultExpanded: true });
    
    const summary = screen.getByText('Accordion Title');
    expect(summary).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands when clicked', () => {
    renderAccordion();
    
    const summary = screen.getByText('Accordion Title');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(summary);
    
    expect(summary).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    
    renderAccordion({
      onChange: handleChange
    });
    
    const summary = screen.getByText('Accordion Title');
    fireEvent.click(summary);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), true);
  });

  it('supports controlled mode', () => {
    const handleChange = jest.fn();
    
    const { rerender } = renderAccordion({
      expanded: false,
      onChange: handleChange
    });
    
    const summary = screen.getByText('Accordion Title');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(summary);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), true);
    
    // Still collapsed because we're in controlled mode
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    
    // Update expanded prop
    rerender(
      <AccordionAdapted expanded={true} onChange={handleChange}>
        <AccordionSummaryAdapted>
          Accordion Title
        </AccordionSummaryAdapted>
        <AccordionDetailsAdapted>
          Accordion Content
        </AccordionDetailsAdapted>
      </AccordionAdapted>
    );
    
    expect(summary).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not expand when disabled', () => {
    const handleChange = jest.fn();
    
    renderAccordion({
      disabled: true,
      onChange: handleChange
    });
    
    const summary = screen.getByText('Accordion Title');
    fireEvent.click(summary);
    
    expect(handleChange).not.toHaveBeenCalled();
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  it('responds to keyboard interaction', () => {
    const handleChange = jest.fn();
    
    renderAccordion({
      onChange: handleChange
    });
    
    const summary = screen.getByText('Accordion Title');
    
    // Test Enter key
    fireEvent.keyDown(summary, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(summary, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderAccordion({
      ariaLabel: 'Test Accordion'
    });
    
    await waitFor(() => {
      expect(screen.getByText('Accordion Title')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});