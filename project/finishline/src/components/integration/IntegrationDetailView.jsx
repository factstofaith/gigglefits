/**
 * Integration Detail View
 * 
 * Displays detailed information about an integration with code-split components.
 * 
 * @module components/integration/IntegrationDetailView
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import { withRenderTime } from '../../utils/performance';

// Eagerly loaded small components
import { Card } from '../common/Card';
import { Button } from '../common/Button';

// Lazy load larger components
const IntegrationStatusPanel = lazy(() => import('./panels/IntegrationStatusPanel'));
const IntegrationConfigPanel = lazy(() => import('./panels/IntegrationConfigPanel'));
const IntegrationHistoryPanel = lazy(() => import('./panels/IntegrationHistoryPanel'));
const IntegrationActionPanel = lazy(() => import('./panels/IntegrationActionPanel'));

// Conditionally loaded components based on integration type
const FilePreview = lazy(() => import('../common/FilePreview'));
const DataPreview = lazy(() => import('./DataPreview'));
const SpecializedFileViewer = lazy(() => import('./SpecializedFileViewer'));

// Loading fallback for lazy components
const ComponentLoading = () => (
  <div className="component-loading" style={{ padding: '20px', textAlign: 'center' }}>
    <div className="loading-spinner-small"></div>
    <p>Loading component...</p>
  </div>
);

/**
 * Integration Detail View Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.integration - Integration object
 * @param {Function} props.onUpdate - Update callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onRun - Run integration callback
 * @returns {JSX.Element} Integration detail view
 */
const IntegrationDetailView = ({ integration, onUpdate, onDelete, onRun }) => {
  const { theme } = useTheme();
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('config');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load preview data when integration changes
  useEffect(() => {
    const loadPreviewData = async () => {
      if (!integration?.id) return;
      
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPreviewData({
          type: integration.type,
          data: {
            sample: 'Sample data would be loaded here',
            integration: integration.id,
          }
        });
      } catch (error) {
        console.error('Error loading preview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreviewData();
  }, [integration]);
  
  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  // Handle run button click
  const handleRun = useCallback(() => {
    if (onRun && integration?.id) {
      onRun(integration.id);
    }
  }, [onRun, integration]);
  
  // Early return if no integration
  if (!integration) {
    return (
      <Card title="Integration Details">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          No integration selected.
        </div>
      </Card>
    );
  }
  
  return (
    <div className="integration-detail-view">
      <Card title={`Integration: ${integration.name}`}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{integration.name}</h2>
              <div>
                <Button onClick={handleRun} style={{ marginRight: '10px' }}>
                  Run Now
                </Button>
                <Button onClick={() => onUpdate(integration)} style={{ marginRight: '10px' }}>
                  Edit
                </Button>
                <Button onClick={() => onDelete(integration.id)} variant="danger">
                  Delete
                </Button>
              </div>
            </div>
            <p style={{ color: theme.palette.text.secondary }}>
              {integration.description}
            </p>
          </div>
          
          {/* Tab navigation */}
          <div style={{ marginBottom: '20px', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <div style={{ display: 'flex' }}>
              {['config', 'status', 'history', 'preview', 'actions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    color: activeTab === tab 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary,
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab content */}
          <div style={{ minHeight: '300px' }}>
            {activeTab === 'config' && (
              <Suspense fallback={<ComponentLoading />}>
                <IntegrationConfigPanel integration={integration} />
              </Suspense>
            )}
            
            {activeTab === 'status' && (
              <Suspense fallback={<ComponentLoading />}>
                <IntegrationStatusPanel integration={integration} />
              </Suspense>
            )}
            
            {activeTab === 'history' && (
              <Suspense fallback={<ComponentLoading />}>
                <IntegrationHistoryPanel integration={integration} />
              </Suspense>
            )}
            
            {activeTab === 'actions' && (
              <Suspense fallback={<ComponentLoading />}>
                <IntegrationActionPanel 
                  integration={integration}
                  onRun={handleRun}
                  onUpdate={() => onUpdate(integration)}
                  onDelete={() => onDelete(integration.id)}
                />
              </Suspense>
            )}
            
            {activeTab === 'preview' && (
              <div>
                {isLoading ? (
                  <ComponentLoading />
                ) : (
                  previewData && (
                    <Suspense fallback={<ComponentLoading />}>
                      {previewData.type === 'file' ? (
                        <FilePreview file={previewData.data} />
                      ) : previewData.type === 'data' ? (
                        <DataPreview data={previewData.data} />
                      ) : (
                        <SpecializedFileViewer data={previewData.data} type={previewData.type} />
                      )}
                    </Suspense>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

IntegrationDetailView.propTypes = {
  /** Integration object */
  integration: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    status: PropTypes.string,
    config: PropTypes.object,
  }),
  
  /** Update callback */
  onUpdate: PropTypes.func,
  
  /** Delete callback */
  onDelete: PropTypes.func,
  
  /** Run integration callback */
  onRun: PropTypes.func,
};

// Export with performance monitoring in development
export default process.env.NODE_ENV !== 'production'
  ? withRenderTime(IntegrationDetailView, { 
      name: 'IntegrationDetailView',
      logToConsole: true,
      logThreshold: 50, // Log renders taking more than 50ms
    })
  : React.memo(IntegrationDetailView);