import React, { lazy, Suspense } from 'react';
import LoadingFallback from '../components/LoadingFallback';

// Minimum-delay helper to prevent visual flickering on fast connections (Supplementary Requirement)
const lazyWithMinDelay = (factory, minDelay = 300) => {
  return lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minDelay))
    ]).then(([moduleExports]) => moduleExports)
  );
};

// Lazily load the heavy third-party chart component on demand
const HeavyChart = lazyWithMinDelay(() => import('../components/HeavyChart'), 300);

export default function Analytics() {
  return (
    <div className="page-container">
      <h2>📊 Productivity & Analytics</h2>
      <p className="page-description">
        Analyze task efficiency, completion trends, and team productivity. The chart below is loaded lazily on demand.
      </p>

      <div className="analytics-stats">
        <div className="stat-card">
          <h4>Total Completed</h4>
          <p className="stat-number">35</p>
        </div>
        <div className="stat-card">
          <h4>Average Time</h4>
          <p className="stat-number">2.4 hrs</p>
        </div>
        <div className="stat-card">
          <h4>Efficiency Score</h4>
          <p className="stat-number">94%</p>
        </div>
      </div>

      <div className="chart-container">
        <Suspense fallback={<LoadingFallback message="Loading Heavy Chart Component..." />}>
          <HeavyChart />
        </Suspense>
      </div>
    </div>
  );
}
