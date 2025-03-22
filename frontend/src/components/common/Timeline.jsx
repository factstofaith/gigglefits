// Timeline.jsx
// -----------------------------------------------------------------------------
// Simple timeline component for displaying chronological events

import React from 'react';

function Timeline({ items = [] }) {
  const timelineStyle = {
    position: 'relative',
    margin: '2rem 0',
    paddingLeft: '2rem'
  };

  const lineStyle = {
    position: 'absolute',
    left: '0.5rem',
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: '#E0E0E0',
    transform: 'translateX(-50%)'
  };

  // Format the date for display
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return timestamp; // If it's not a valid date, return the original timestamp
    }
  };

  return (
    <div style={timelineStyle}>
      <div style={lineStyle}></div>
      
      {items.map((item, index) => (
        <div 
          key={index}
          style={{
            position: 'relative',
            marginBottom: '1.5rem',
            paddingLeft: '1rem'
          }}
        >
          {/* Timeline dot */}
          <div 
            style={{
              position: 'absolute',
              left: '-2rem',
              top: '0.25rem',
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              backgroundColor: '#48C2C5',
              border: '2px solid #FFFFFF'
            }}
          ></div>
          
          {/* Timeline content */}
          <div>
            <div style={{ fontWeight: 'bold', color: '#3B3D3D' }}>
              {formatDate(item.timestamp)}
            </div>
            <div style={{ marginTop: '0.25rem', color: '#555555' }}>
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;