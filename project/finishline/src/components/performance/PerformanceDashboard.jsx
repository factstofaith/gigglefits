/**
 * Performance Dashboard Component
 * 
 * Component for visualizing and monitoring application performance metrics.
 * 
 * @module components/performance/PerformanceDashboard
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { performanceMonitor } from '../../utils/performance';

/**
 * Performance Dashboard
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.showControls=true] - Whether to show dashboard controls
 * @param {boolean} [props.initiallyExpanded=false] - Whether the dashboard is initially expanded
 * @param {number} [props.refreshInterval=2000] - Dashboard refresh interval in ms
 * @param {Function} [props.onClear] - Callback when metrics are cleared
 * @returns {JSX.Element} Performance dashboard component
 */
const PerformanceDashboard = ({ 
  showControls = true,
  initiallyExpanded = false,
  refreshInterval = 2000,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({});
  const [, setRefreshTrigger] = useState(0);
  
  // Format render time in milliseconds
  const formatTime = (time) => {
    if (time < 1) {
      return `${(time * 1000).toFixed(2)}μs`;
    }
    return `${time.toFixed(2)}ms`;
  };
  
  // Toggle dashboard expansion
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  // Clear all performance metrics
  const clearMetrics = () => {
    performanceMonitor.clear();
    setMetrics({});
    if (onClear) {
      onClear();
    }
  };
  
  // Refresh metrics on interval
  useEffect(() => {
    const refreshMetrics = () => {
      setMetrics(performanceMonitor.getAllMetrics());
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Initial load
    refreshMetrics();
    
    // Set up interval
    const intervalId = setInterval(refreshMetrics, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const componentCount = Object.keys(metrics).length;
    let totalRenderTime = 0;
    let totalRenderCount = 0;
    let slowestComponent = { name: '', time: 0 };
    let mostFrequentlyRendered = { name: '', count: 0 };
    
    Object.entries(metrics).forEach(([name, metric]) => {
      totalRenderTime += metric.totalRenderTime;
      totalRenderCount += metric.renderCount;
      
      if (metric.maxRenderTime > slowestComponent.time) {
        slowestComponent = { name, time: metric.maxRenderTime };
      }
      
      if (metric.renderCount > mostFrequentlyRendered.count) {
        mostFrequentlyRendered = { name, count: metric.renderCount };
      }
    });
    
    const averageRenderTime = totalRenderCount > 0 
      ? totalRenderTime / totalRenderCount 
      : 0;
    
    return {
      componentCount,
      totalRenderTime,
      totalRenderCount,
      averageRenderTime,
      slowestComponent,
      mostFrequentlyRendered,
    };
  }, [metrics]);
  
  // Get sorted metrics for display
  const getSortedMetrics = (sortBy = 'averageRenderTime', limit = 10) => {
    const metricsList = Object.entries(metrics).map(([name, metric]) => ({
      name,
      ...metric,
    }));
    
    let sorted;
    switch (sortBy) {
      case 'renderCount':
        sorted = metricsList.sort((a, b) => b.renderCount - a.renderCount);
        break;
      case 'maxRenderTime':
        sorted = metricsList.sort((a, b) => b.maxRenderTime - a.maxRenderTime);
        break;
      case 'totalRenderTime':
        sorted = metricsList.sort((a, b) => b.totalRenderTime - a.totalRenderTime);
        break;
      case 'averageRenderTime':
      default:
        sorted = metricsList.sort((a, b) => b.averageRenderTime - a.averageRenderTime);
        break;
    }
    
    return sorted.slice(0, limit);
  };
  
  if (!isExpanded) {
    return (
      <div className="performance-dashboard-toggle" style={styles.toggle}>
        <button 
          onClick={toggleExpanded}
          style={styles.toggleButton}
          aria-label="Expand performance dashboard"
        >
          📊 Performance
        </button>
      </div>
    );
  }
  
  return (
    <div className="performance-dashboard" style={styles.container}>
      <div className="performance-dashboard-header" style={styles.header}>
        <h3 style={styles.title}>Performance Dashboard</h3>
        
        {showControls && (
          <div className="performance-dashboard-controls" style={styles.controls}>
            <button 
              onClick={clearMetrics}
              style={{ ...styles.button, ...styles.clearButton }}
              aria-label="Clear performance metrics"
            >
              Clear
            </button>
            <button 
              onClick={toggleExpanded}
              style={styles.button}
              aria-label="Collapse performance dashboard"
            >
              Collapse
            </button>
          </div>
        )}
      </div>
      
      <div className="performance-dashboard-tabs" style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'overview' ? styles.activeTab : {}),
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('components')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'components' ? styles.activeTab : {}),
          }}
        >
          Components
        </button>
        <button 
          onClick={() => setActiveTab('timeline')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'timeline' ? styles.activeTab : {}),
          }}
        >
          Timeline
        </button>
      </div>
      
      <div className="performance-dashboard-content" style={styles.content}>
        {activeTab === 'overview' && (
          <div className="performance-overview">
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Components Tracked</div>
                <div style={styles.metricValue}>{derivedMetrics.componentCount}</div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Total Renders</div>
                <div style={styles.metricValue}>{derivedMetrics.totalRenderCount}</div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Average Render Time</div>
                <div style={styles.metricValue}>
                  {formatTime(derivedMetrics.averageRenderTime)}
                </div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Total Render Time</div>
                <div style={styles.metricValue}>
                  {formatTime(derivedMetrics.totalRenderTime)}
                </div>
              </div>
            </div>
            
            <div style={styles.insightsSection}>
              <h4 style={styles.insightsTitle}>Performance Insights</h4>
              
              <div style={styles.insightCard}>
                <div style={styles.insightHeader}>Slowest Component</div>
                <div style={styles.insightContent}>
                  <div style={styles.insightName}>{derivedMetrics.slowestComponent.name}</div>
                  <div style={styles.insightValue}>
                    {formatTime(derivedMetrics.slowestComponent.time)}
                  </div>
                </div>
              </div>
              
              <div style={styles.insightCard}>
                <div style={styles.insightHeader}>Most Frequently Rendered</div>
                <div style={styles.insightContent}>
                  <div style={styles.insightName}>
                    {derivedMetrics.mostFrequentlyRendered.name}
                  </div>
                  <div style={styles.insightValue}>
                    {derivedMetrics.mostFrequentlyRendered.count} renders
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'components' && (
          <div className="performance-components">
            <div style={styles.componentControls}>
              <select 
                style={styles.sortSelect}
                onChange={(e) => setActiveTab(`components:${e.target.value}`)}
                value={activeTab.startsWith('components:') ? activeTab.split(':')[1] : 'averageRenderTime'}
              >
                <option value="averageRenderTime">Sort by Average Render Time</option>
                <option value="maxRenderTime">Sort by Max Render Time</option>
                <option value="renderCount">Sort by Render Count</option>
                <option value="totalRenderTime">Sort by Total Render Time</option>
              </select>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Component</th>
                  <th style={styles.tableHeader}>Renders</th>
                  <th style={styles.tableHeader}>Average</th>
                  <th style={styles.tableHeader}>Min</th>
                  <th style={styles.tableHeader}>Max</th>
                  <th style={styles.tableHeader}>Total</th>
                </tr>
              </thead>
              <tbody>
                {getSortedMetrics(
                  activeTab.startsWith('components:') ? activeTab.split(':')[1] : 'averageRenderTime'
                ).map((metric) => (
                  <tr key={metric.name} style={styles.tableRow}>
                    <td style={styles.tableCell}>{metric.name}</td>
                    <td style={styles.tableCell}>{metric.renderCount}</td>
                    <td style={styles.tableCell}>{formatTime(metric.averageRenderTime)}</td>
                    <td style={styles.tableCell}>{formatTime(metric.minRenderTime)}</td>
                    <td style={styles.tableCell}>{formatTime(metric.maxRenderTime)}</td>
                    <td style={styles.tableCell}>{formatTime(metric.totalRenderTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="performance-timeline">
            <div style={styles.timelineHeader}>
              <h4 style={styles.timelineTitle}>Render Timeline</h4>
              <div style={styles.timelineDescription}>
                Visualizes the most recent render times for each component
              </div>
            </div>
            
            <div style={styles.timelineContent}>
              {getSortedMetrics('lastRenderTime').map((metric) => (
                <div key={metric.name} style={styles.timelineItem}>
                  <div style={styles.timelineComponent}>{metric.name}</div>
                  <div style={styles.timelineBar}>
                    <div 
                      style={{
                        ...styles.timelineBarFill,
                        width: `${Math.min(100, (metric.lastRenderTime / 30) * 100)}%`,
                        backgroundColor: getBarColor(metric.lastRenderTime),
                      }}
                    />
                  </div>
                  <div style={styles.timelineTime}>{formatTime(metric.lastRenderTime)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to get color based on render time
const getBarColor = (time) => {
  if (time < 5) return '#4caf50'; // Good (green)
  if (time < 15) return '#ff9800'; // Warning (orange)
  return '#f44336'; // Poor (red)
};

// Component styles
const styles = {
  container: {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    width: '400px',
    maxHeight: '80vh',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#eee',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  clearButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
  },
  tabButton: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRight: '1px solid #ddd',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeTab: {
    backgroundColor: '#fff',
    fontWeight: 'bold',
    borderBottom: '2px solid #2196f3',
  },
  content: {
    padding: '15px',
    backgroundColor: '#fff',
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  metricCard: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  metricTitle: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  insightsSection: {
    marginTop: '15px',
  },
  insightsTitle: {
    fontSize: '14px',
    margin: '0 0 10px 0',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  insightCard: {
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  insightHeader: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  insightContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightName: {
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  insightValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2196f3',
  },
  componentControls: {
    marginBottom: '15px',
  },
  sortSelect: {
    padding: '5px',
    borderRadius: '3px',
    border: '1px solid #ddd',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
  },
  tableCell: {
    padding: '8px',
    whiteSpace: 'nowrap',
  },
  timelineHeader: {
    marginBottom: '15px',
  },
  timelineTitle: {
    fontSize: '14px',
    margin: '0 0 5px 0',
  },
  timelineDescription: {
    fontSize: '12px',
    color: '#666',
  },
  timelineContent: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  timelineItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr 80px',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  timelineComponent: {
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineBar: {
    height: '10px',
    backgroundColor: '#eee',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  timelineBarFill: {
    height: '100%',
    backgroundColor: '#2196f3',
  },
  timelineTime: {
    fontSize: '12px',
    textAlign: 'right',
  },
  toggle: {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    zIndex: 9999,
  },
  toggleButton: {
    padding: '8px 12px',
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
};

PerformanceDashboard.propTypes = {
  /** Whether to show dashboard controls */
  showControls: PropTypes.bool,
  
  /** Whether the dashboard is initially expanded */
  initiallyExpanded: PropTypes.bool,
  
  /** Dashboard refresh interval in ms */
  refreshInterval: PropTypes.number,
  
  /** Callback when metrics are cleared */
  onClear: PropTypes.func,
};

export default PerformanceDashboard;