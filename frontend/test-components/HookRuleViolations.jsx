/**
 * Component with intentional React hook rule violations for testing the hook-rules-fixer tool
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../src/contexts/UserContext';

// Example component with rule violations
function HookRuleViolations({ initialCount = 0, items = [] }) {
  // Correctly placed hooks
  const [count, setCount] = useState(initialCount);
  const user = useContext(UserContext);
  
  // Violation 1: Hook in a conditional
  if (count > 5) {
    const [warning, setWarning] = useState(true);
    useEffect(() => {
      console.log('Count exceeded 5!');
      return () => setWarning(false);
    }, []);
  }
  
  // Violation 2: Hook in a loop
  for (let i = 0; i < items.length; i++) {
    // Each iteration would create a new state
    const [itemState, setItemState] = useState(items[i]);
  }
  
  // Violation 3: Hook in a nested function
  const handleClick = () => {
    const clickRef = useRef(null);
    useEffect(() => {
      console.log('Button clicked!');
    }, []);
  };
  
  // Conditionally calling hooks (violation of Rule 1)
  if (user.isAdmin) {
    useEffect(() => {
      console.log('Admin user actions');
    }, [user]);
  }
  
  // Helper function that improperly calls hooks
  function processData() {
    const [processedData, setProcessedData] = useState(null);
    return processedData;
  }
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Click Me</button>
      <div>
        {items.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}

export default HookRuleViolations;