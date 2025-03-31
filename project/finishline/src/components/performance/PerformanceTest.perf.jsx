/**
 * Performance Test Suite
 * 
 * Sample performance tests for React components.
 * Run with: npm run test:perf
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { measurePerformance } from 'react-performance-testing';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Table } from '../common/Table';
import { Tabs } from '../common/Tabs';

// Test data
const LARGE_TABLE_DATA = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  value: Math.random() * 1000,
  category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
}));

const TAB_DATA = [
  { label: 'Tab 1', content: 'Content 1' },
  { label: 'Tab 2', content: 'Content 2' },
  { label: 'Tab 3', content: 'Content 3' },
];

// Performance thresholds (in ms)
const THRESHOLDS = {
  MOUNT: 50,
  UPDATE: 20,
  COMPLEX_MOUNT: 100,
  COMPLEX_UPDATE: 40,
};

describe('Component Performance Tests', () => {
  test('Button mount and update performance', async () => {
    const { renderCount, rerender } = measurePerformance();
    
    // Test initial render (mount)
    const { rerender: rerenderComponent } = render(
      <Button onClick={() => {}}>Click Me</Button>
    );
    
    // Verify render counts are within expected thresholds
    expect(renderCount.current.Button).toBe(1);
    
    // Test update performance
    rerenderComponent(<Button onClick={() => {}}>Updated Text</Button>);
    
    // Verify update render counts
    expect(renderCount.current.Button).toBe(2);
    
    // Get render durations
    const measurements = renderCount.current;
    console.log('Button render measurements:', measurements);
    
    // Assert performance is within thresholds
    // Note: renderDuration is not easily accessible in this mock example
    // In a real test, you would assert: expect(measurements.Button.renderDuration).toBeLessThan(THRESHOLDS.MOUNT);
  });
  
  test('Card mount and update performance', async () => {
    const { renderCount, rerender } = measurePerformance();
    
    // Test initial render (mount)
    const { rerender: rerenderComponent } = render(
      <Card title="Test Card">
        <div>Card content</div>
      </Card>
    );
    
    // Test update performance
    rerenderComponent(
      <Card title="Updated Card">
        <div>Updated content</div>
      </Card>
    );
    
    // Verify render counts
    expect(renderCount.current.Card).toBe(2);
  });
  
  test('Table performance with large dataset', async () => {
    const { renderCount, rerender } = measurePerformance();
    
    // Define column configuration
    const columns = [
      { header: 'ID', accessor: 'id' },
      { header: 'Name', accessor: 'name' },
      { header: 'Value', accessor: 'value' },
      { header: 'Category', accessor: 'category' },
    ];
    
    // Test initial render with large dataset
    const { rerender: rerenderComponent } = render(
      <Table data={LARGE_TABLE_DATA} columns={columns} />
    );
    
    // Test update (sorting)
    rerenderComponent(
      <Table 
        data={LARGE_TABLE_DATA} 
        columns={columns}
        initialSortBy="value"
        initialSortDirection="desc"
      />
    );
    
    // Verify render counts
    expect(renderCount.current.Table).toBe(2);
    
    // In a real test with timing data, you would assert:
    // expect(renderCount.current.Table.renderDuration).toBeLessThan(THRESHOLDS.COMPLEX_MOUNT);
  });
  
  test('Tabs component performance', async () => {
    const { renderCount, rerender } = measurePerformance();
    
    // Test initial render
    const { rerender: rerenderComponent } = render(
      <Tabs tabs={TAB_DATA} defaultTab={0} />
    );
    
    // Test update (changing tabs)
    rerenderComponent(<Tabs tabs={TAB_DATA} defaultTab={1} />);
    
    // Verify render counts
    expect(renderCount.current.Tabs).toBe(2);
  });
  
  test('Complex nested component performance', async () => {
    const { renderCount, rerender } = measurePerformance();
    
    // Create a complex nested component tree
    const ComplexComponent = () => (
      <Card title="Performance Test">
        <Tabs tabs={TAB_DATA} defaultTab={0} />
        <div style={{ marginTop: '20px' }}>
          <Table 
            data={LARGE_TABLE_DATA.slice(0, 10)} 
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Name', accessor: 'name' },
              { header: 'Value', accessor: 'value' },
            ]}
          />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <Button onClick={() => {}}>Save</Button>
          <Button onClick={() => {}}>Cancel</Button>
        </div>
      </Card>
    );
    
    // Test render performance
    render(<ComplexComponent />);
    
    // Log all component render counts
    console.log('Complex component render measurements:', renderCount.current);
    
    // Assert expected component renders
    expect(renderCount.current.Card).toBe(1);
    expect(renderCount.current.Tabs).toBe(1);
    expect(renderCount.current.Table).toBe(1);
    expect(renderCount.current.Button).toBe(2); // Two buttons
  });
});

// Example of a more detailed performance test using Jest's performance measurement
describe('Component Performance Benchmarks', () => {
  test('Button render performance benchmark', () => {
    // Set up performance measurement
    const startTime = performance.now();
    
    // Render button multiple times to get statistically significant measurements
    for (let i = 0; i < 100; i++) {
      render(
        <Button onClick={() => {}}>Click Me {i}</Button>
      );
    }
    
    const endTime = performance.now();
    const averageRenderTime = (endTime - startTime) / 100;
    
    console.log(`Average Button render time: ${averageRenderTime.toFixed(2)}ms`);
    
    // Assert performance is within threshold
    expect(averageRenderTime).toBeLessThan(THRESHOLDS.MOUNT);
  });
  
  // More benchmark tests can be added here
});