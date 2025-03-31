# Dynamic Imports Implementation Guide

Implement dynamic imports for large modules and non-critical components:

## React Router Example:

```jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Replace static imports with dynamic imports
// Instead of: import Home from './Home';
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Dashboard = lazy(() => import('./Dashboard'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Suspense>
  </Router>
);
```

## For Large Libraries:

```jsx
// Instead of importing the entire library
// import { Chart, Line, Bar, Pie } from 'chart.js';

// Use dynamic imports when needed
const loadChartJs = async () => {
  const ChartModule = await import('chart.js');
  return ChartModule.default;
};

// Use in component
useEffect(() => {
  loadChartJs().then(Chart => {
    // Initialize chart
  });
}, []);
```

## Finding Large Modules:

Run bundle analyzer to identify large modules:

```bash
npx webpack-bundle-analyzer stats.json
```

Look for modules > 50KB and consider implementing dynamic imports for them.
