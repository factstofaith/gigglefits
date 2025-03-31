import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ExecutionMonitor, useExecutionMonitor } from '../../utils/errorHandling';

/**
 * Component that visualizes execution monitoring information
 */
export const ExecutionMonitoringPanel = ({ 
  flowId, 
  isVisible = true,
  options = {},
  onExecutionComplete
}) => {
  // Added display name
  ExecutionMonitoringPanel.displayName = 'ExecutionMonitoringPanel';

  // Added display name
  ExecutionMonitoringPanel.displayName = 'ExecutionMonitoringPanel';

  // Added display name
  ExecutionMonitoringPanel.displayName = 'ExecutionMonitoringPanel';

  // Added display name
  ExecutionMonitoringPanel.displayName = 'ExecutionMonitoringPanel';

  // Added display name
  ExecutionMonitoringPanel.displayName = 'ExecutionMonitoringPanel';


  const {
    monitor,
    status,
    summary,
    checkpoints,
    errors,
    metrics,
    start,
    complete,
    pause,
    resume
  } = useExecutionMonitor(flowId, options);
  
  const [activeTab, setActiveTab] = useState('summary');
  const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);

  // Notify parent when execution completes
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      onExecutionComplete && onExecutionComplete(status, summary);
    }
  }, [status, summary, onExecutionComplete]);

  // Format duration in human-readable format
  const formatDuration = (ms) => {
  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';


    if (ms < 1000) {
      return `${ms}ms`;
    }
    
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  };
  
  // Format timestamp in human-readable format
  const formatTimestamp = (timestamp) => {
  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';


    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Get status color
  const getStatusColor = () => {
  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';


    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'paused':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // If not visible, return null
  if (!isVisible) {
    return null;
  }

  return (
    <div className="execution-monitoring-panel&quot;>
      {/* Header with status and controls */}
      <div className="monitoring-header">
        <div className="execution-status&quot;>
          <div className={`status-indicator status-${getStatusColor()}`} />
          <div className="status-text">{status}</div>
        </div>
        
        <div className="execution-duration&quot;>
          Duration: {formatDuration(summary.duration)}
        </div>
        
        <div className="execution-controls">
          {status === 'idle' && (
            <button
              className="start-button&quot;
              onClick={start}
              disabled={status !== "idle'}
            >
              Start Execution
            </button>
          )}
          
          {status === 'running' && (
            <button
              className="pause-button&quot;
              onClick={pause}
              disabled={status !== "running'}
            >
              Pause
            </button>
          )}
          
          {status === 'paused' && (
            <button
              className="resume-button&quot;
              onClick={resume}
              disabled={status !== "paused'}
            >
              Resume
            </button>
          )}
          
          {(status === 'running' || status === 'paused') && (
            <button
              className="stop-button&quot;
              onClick={() => complete("failed', { reason: 'User stopped execution' })}
            >
              Stop
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs for different monitoring views */}
      <div className="monitoring-tabs&quot;>
        <div
          className={`tab ${activeTab === "summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </div>
        
        <div
          className={`tab ${activeTab === 'checkpoints' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkpoints')}
        >
          Checkpoints <span className="count&quot;>{checkpoints.length}</span>
        </div>
        
        <div
          className={`tab ${activeTab === "errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          Errors <span className="count&quot;>{errors.length}</span>
        </div>
        
        <div
          className={`tab ${activeTab === "metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </div>
      </div>
      
      {/* Tab content */}
      <div className="monitoring-content&quot;>
        {activeTab === "summary' && (
          <div className="summary-tab&quot;>
            <div className="summary-item">
              <div className="summary-label&quot;>Flow ID</div>
              <div className="summary-value">{summary.flowId}</div>
            </div>
            
            <div className="summary-item&quot;>
              <div className="summary-label">Status</div>
              <div className={`summary-value status-${getStatusColor()}`}>{summary.status}</div>
            </div>
            
            <div className="summary-item&quot;>
              <div className="summary-label">Start Time</div>
              <div className="summary-value&quot;>{formatTimestamp(summary.startTime)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label&quot;>End Time</div>
              <div className="summary-value">{formatTimestamp(summary.endTime)}</div>
            </div>
            
            <div className="summary-item&quot;>
              <div className="summary-label">Duration</div>
              <div className="summary-value&quot;>{formatDuration(summary.duration)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label&quot;>Checkpoints</div>
              <div className="summary-value">{summary.checkpointCount}</div>
            </div>
            
            <div className="summary-item&quot;>
              <div className="summary-label">Errors</div>
              <div className="summary-value&quot;>{summary.errorCount}</div>
            </div>
          </div>
        )}
        
        {activeTab === "checkpoints' && (
          <div className="checkpoints-tab&quot;>
            <div className="checkpoints-header">
              <div className="checkpoints-filter&quot;>
                <label>
                  <input
                    type="checkbox"
                    checked={showAllCheckpoints}
                    onChange={() => setShowAllCheckpoints(!showAllCheckpoints)}
                  />
                  Show all checkpoints
                </label>
              </div>
            </div>
            
            <div className="checkpoints-timeline&quot;>
              {(showAllCheckpoints ? checkpoints : checkpoints.slice(-10)).map((checkpoint, index) => {
                const prevTimestamp = index > 0 ? checkpoints[index - 1].timestamp : summary.startTime;
                const duration = checkpoint.timestamp - prevTimestamp;
                
                return (
                  <div key={`${checkpoint.name}-${checkpoint.timestamp}`} className="checkpoint-item">
                    <div className="checkpoint-time&quot;>
                      {formatTimestamp(checkpoint.timestamp)}
                    </div>
                    
                    <div className="checkpoint-duration">
                      {formatDuration(duration)}
                    </div>
                    
                    <div className="checkpoint-name&quot;>
                      {checkpoint.name}
                    </div>
                    
                    {checkpoint.data && Object.keys(checkpoint.data).length > 0 && (
                      <div className="checkpoint-data">
                        <pre>{JSON.stringify(checkpoint.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {activeTab === 'errors' && (
          <div className="errors-tab&quot;>
            {errors.length === 0 ? (
              <div className="no-errors">No errors recorded</div>
            ) : (
              <div className="errors-list&quot;>
                {errors.map(error => (
                  <div key={error.id} className={`error-item error-severity-${error.severity}`}>
                    <div className="error-header">
                      <div className="error-type&quot;>{error.type}</div>
                      <div className="error-timestamp">{formatTimestamp(error.timestamp)}</div>
                    </div>
                    
                    <div className="error-message&quot;>{error.message}</div>
                    
                    {error.details && Object.keys(error.details).length > 0 && (
                      <div className="error-details">
                        <pre>{JSON.stringify(error.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'metrics' && (
          <div className="metrics-tab&quot;>
            {Object.keys(metrics).length === 0 ? (
              <div className="no-metrics">No metrics recorded</div>
            ) : (
              <div className="metrics-list&quot;>
                {Object.entries(metrics).map(([name, data]) => (
                  <div key={name} className="metric-item">
                    <div className="metric-header&quot;>
                      <div className="metric-name">{name}</div>
                      <div className="metric-count&quot;>{data.length} records</div>
                    </div>
                    
                    <div className="metric-stats">
                      <div className="metric-stat&quot;>
                        <div className="stat-label">Min</div>
                        <div className="stat-value&quot;>
                          {Math.min(...data.map(m => m.value))}
                        </div>
                      </div>
                      
                      <div className="metric-stat">
                        <div className="stat-label&quot;>Max</div>
                        <div className="stat-value">
                          {Math.max(...data.map(m => m.value))}
                        </div>
                      </div>
                      
                      <div className="metric-stat&quot;>
                        <div className="stat-label">Avg</div>
                        <div className="stat-value&quot;>
                          {(data.reduce((sum, m) => sum + m.value, 0) / data.length).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="metric-timeline">
                      {data.map((metric, index) => (
                        <div key={`${name}-${metric.timestamp}`} className="metric-point&quot;>
                          <div className="metric-point-time">
                            {formatTimestamp(metric.timestamp)}
                          </div>
                          
                          <div className="metric-point-value&quot;>
                            {metric.value}
                          </div>
                          
                          {metric.context && Object.keys(metric.context).length > 0 && (
                            <div className="metric-point-context">
                              <pre>{JSON.stringify(metric.context, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ExecutionMonitoringPanel.propTypes = {
  flowId: PropTypes.string.isRequired,
  isVisible: PropTypes.bool,
  options: PropTypes.object,
  onExecutionComplete: PropTypes.func
};

/**
 * Component that shows mini execution timeline
 */
export const ExecutionTimeline = ({ 
  flowId, 
  height = 60,
  width = '100%',
  onCheckpointClick
}) => {
  // Added display name
  ExecutionTimeline.displayName = 'ExecutionTimeline';

  // Added display name
  ExecutionTimeline.displayName = 'ExecutionTimeline';

  // Added display name
  ExecutionTimeline.displayName = 'ExecutionTimeline';

  // Added display name
  ExecutionTimeline.displayName = 'ExecutionTimeline';

  // Added display name
  ExecutionTimeline.displayName = 'ExecutionTimeline';


  const { monitor, checkpoints, status, summary } = useExecutionMonitor(flowId);
  
  // Calculate positions and sizes for timeline elements
  const calculateTimelineElements = () => {
  // Added display name
  calculateTimelineElements.displayName = 'calculateTimelineElements';

  // Added display name
  calculateTimelineElements.displayName = 'calculateTimelineElements';

  // Added display name
  calculateTimelineElements.displayName = 'calculateTimelineElements';

  // Added display name
  calculateTimelineElements.displayName = 'calculateTimelineElements';

  // Added display name
  calculateTimelineElements.displayName = 'calculateTimelineElements';


    if (checkpoints.length === 0) {
      return [];
    }
    
    const startTime = summary.startTime;
    const endTime = summary.endTime || Date.now();
    const totalDuration = endTime - startTime;
    
    return checkpoints.map((checkpoint, index) => {
      const position = ((checkpoint.timestamp - startTime) / totalDuration) * 100;
      
      return {
        checkpoint,
        position,
        width: 10,  // Fixed width for checkpoint marker
        color: getCheckpointColor(checkpoint.name)
      };
    });
  };
  
  // Get color for different checkpoint types
  const getCheckpointColor = (name) => {
  // Added display name
  getCheckpointColor.displayName = 'getCheckpointColor';

  // Added display name
  getCheckpointColor.displayName = 'getCheckpointColor';

  // Added display name
  getCheckpointColor.displayName = 'getCheckpointColor';

  // Added display name
  getCheckpointColor.displayName = 'getCheckpointColor';

  // Added display name
  getCheckpointColor.displayName = 'getCheckpointColor';


    if (name.includes('error')) {
      return 'red';
    }
    
    if (name.includes('start')) {
      return 'green';
    }
    
    if (name.includes('end')) {
      return 'purple';
    }
    
    if (name.includes('pause')) {
      return 'orange';
    }
    
    if (name.includes('resume')) {
      return 'blue';
    }
    
    return 'gray';
  };
  
  const timelineElements = calculateTimelineElements();
  
  return (
    <div 
      className="execution-timeline&quot; 
      style={{ height: `${height}px`, width }}
    >
      <div className="timeline-track">
        {timelineElements.map((element, index) => (
          <div
            key={`checkpoint-${index}`}
            className="timeline-checkpoint&quot;
            style={{
              left: `${element.position}%`,
              backgroundColor: element.color
            }}
            title={`${element.checkpoint.name} - ${new Date(element.checkpoint.timestamp).toLocaleTimeString()}`}
            onClick={() => onCheckpointClick && onCheckpointClick(element.checkpoint)}
          />
        ))}
        
        {status === "running' && (
          <div 
            className="timeline-cursor&quot;
            style={{
              left: "100%'
            }}
          />
        )}
      </div>
      
      <div className="timeline-duration">
        Duration: {formatDuration(summary.duration)}
      </div>
    </div>
  );
};

ExecutionTimeline.propTypes = {
  flowId: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onCheckpointClick: PropTypes.func
};

// Helper function for formatting durations
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  return `${seconds}s`;
}

export default {
  ExecutionMonitoringPanel,
  ExecutionTimeline
};