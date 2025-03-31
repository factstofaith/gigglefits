import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import { setupUserEvent } from '../../utils/user-event-setup';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock components for the form - these would be actual components in a real test
const IntegrationFormMock = ({ onSubmit }) => {
  // Added display name
  IntegrationFormMock.displayName = 'IntegrationFormMock';

  // Added display name
  IntegrationFormMock.displayName = 'IntegrationFormMock';

  // Added display name
  IntegrationFormMock.displayName = 'IntegrationFormMock';

  // Added display name
  IntegrationFormMock.displayName = 'IntegrationFormMock';

  // Added display name
  IntegrationFormMock.displayName = 'IntegrationFormMock';


  return (
    <form 
      data-testid="integration-form" 
      onSubmit={(e) => {
        e.preventDefault();
        const name = e.target.elements.name.value;
        const type = e.target.elements.type.value;
        const description = e.target.elements.description.value;
        onSubmit({ name, type, description });
      }}
    >
      <div>
        <label htmlFor="name&quot;>Integration Name</label>
        <input 
          id="name" 
          name="name&quot; 
          data-testid="name-input" 
          type="text&quot; 
          required 
        />
      </div>
      <div>
        <label htmlFor="type">Integration Type</label>
        <select 
          id="type&quot; 
          name="type" 
          data-testid="type-select" 
          required
        >
          <option value="&quot;>Select a type</option>
          <option value="api">API</option>
          <option value="database&quot;>Database</option>
          <option value="file">File</option>
        </select>
      </div>
      <div>
        <label htmlFor="description&quot;>Description</label>
        <textarea 
          id="description" 
          name="description&quot; 
          data-testid="description-input"
        />
      </div>
      <button type="submit&quot; data-testid="submit-button">
        Create Integration
      </button>
    </form>
  );
};

// Mock the page that contains the form
const CreateIntegrationPage = () => {
  // Added display name
  CreateIntegrationPage.displayName = 'CreateIntegrationPage';

  // Added display name
  CreateIntegrationPage.displayName = 'CreateIntegrationPage';

  // Added display name
  CreateIntegrationPage.displayName = 'CreateIntegrationPage';

  // Added display name
  CreateIntegrationPage.displayName = 'CreateIntegrationPage';

  // Added display name
  CreateIntegrationPage.displayName = 'CreateIntegrationPage';


  const [status, setStatus] = React.useState('idle');
  const [error, setError] = React.useState(null);
  const [createdId, setCreatedId] = React.useState(null);

  const handleSubmit = async (formData) => {
    try {
      setStatus('loading');
      setError(null);
      
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create integration');
      }
      
      const data = await response.json();
      setCreatedId(data.id);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <div>
      <h1>Create New Integration</h1>
      {status === 'success' ? (
        <div data-testid="success-message">
          <p>Integration created successfully!</p>
          <p>Integration ID: {createdId}</p>
          <button onClick={() => window.location.href = `/integrations/${createdId}`}>
            View Integration
          </button>
        </div>
      ) : (
        <>
          {error && <div data-testid="error-message" style={{ color: 'red' }}>{error}</div>}
          <IntegrationFormMock onSubmit={handleSubmit} />
          {status === 'loading' && <div data-testid="loading">Loading...</div>}
        </>
      )}
    </div>
  );
};

describe('Integration Form', () => {
  // Test successful form submission
  it('submits the form and displays success message', async () => {
    // Mock API response
    server.use(
      http.post('/api/integrations', async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json({
          id: '12345',
          ...data,
          createdAt: new Date().toISOString(),
        });
      })
    );
    
    const user = setupUserEvent();
    
    render(<CreateIntegrationPage />);
    
    // Fill in the form
    await user.type(screen.getByTestId('name-input'), 'Test Integration');
    await user.selectOptions(screen.getByTestId('type-select'), 'api');
    await user.type(screen.getByTestId('description-input'), 'This is a test integration');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-button'));
    
    // Verify loading state appears
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
    
    // Verify success details
    expect(screen.getByText('Integration created successfully!')).toBeInTheDocument();
    expect(screen.getByText('Integration ID: 12345')).toBeInTheDocument();
  });

  // Test error handling
  it('handles API errors correctly', async () => {
    // Mock API error response
    server.use(
      http.post('/api/integrations', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    const user = setupUserEvent();
    
    render(<CreateIntegrationPage />);
    
    // Fill in the form
    await user.type(screen.getByTestId('name-input'), 'Test Integration');
    await user.selectOptions(screen.getByTestId('type-select'), 'database');
    await user.type(screen.getByTestId('description-input'), 'This is a test integration');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-button'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Verify error details
    expect(screen.getByText('Failed to create integration')).toBeInTheDocument();
    
    // Form should still be visible
    expect(screen.getByTestId('integration-form')).toBeInTheDocument();
  });

  // Test validation
  it('enforces required fields', async () => {
    const user = setupUserEvent();
    
    render(<CreateIntegrationPage />);
    
    // Try to submit form without filling required fields
    await user.click(screen.getByTestId('submit-button'));
    
    // The form should prevent submission
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    
    // Fill only the name field
    await user.type(screen.getByTestId('name-input'), 'Test Integration');
    await user.click(screen.getByTestId('submit-button'));
    
    // The form should still prevent submission
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
    // Form should enforce built-in HTML validation
    // Note: We're relying on the browser's validation behavior, which may be mocked
    // in actual implementation
  });
});