import React from 'react';

export default function LoadingFallback({ message = 'Loading chunk content...' }) {
  return (
    <div className="loading-fallback-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}
