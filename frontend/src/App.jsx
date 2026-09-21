import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import AuthForm from './components/AuthForm';
import LoadingFallback from './components/LoadingFallback';

// Dynamic import factories for lazy loading & predictive preloading
const loadTaskManager = () => import('./TaskManager');
const loadProjects = () => import('./pages/Projects');
const loadAnalytics = () => import('./pages/Analytics');
const loadContact = () => import('./pages/Contact');

// Route-based dynamic lazy components
const TaskManager = lazy(loadTaskManager);
const Projects = lazy(loadProjects);
const Analytics = lazy(loadAnalytics);
const Contact = lazy(loadContact);

function NavigationHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>PR8 — Task Manager</h1>
        <span className="user-badge">{user?.email}</span>
      </div>
      <nav className="nav-links">
        <NavLink
          to="/"
          end
          onMouseEnter={loadTaskManager}
          onFocus={loadTaskManager}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          📋 Tasks
        </NavLink>
        <NavLink
          to="/projects"
          onMouseEnter={loadProjects}
          onFocus={loadProjects}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          📁 Projects
        </NavLink>
        <NavLink
          to="/analytics"
          onMouseEnter={loadAnalytics}
          onFocus={loadAnalytics}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          📊 Analytics
        </NavLink>
        <NavLink
          to="/contact"
          onMouseEnter={loadContact}
          onFocus={loadContact}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          ✉️ Contact
        </NavLink>
      </nav>
      <button className="btn btn-secondary btn-logout" onClick={logout}>
        Log Out
      </button>
    </header>
  );
}

function AppContent() {
  const { isAuthenticated, checkingSession, sessionExpired, clearSessionExpired } = useAuth();

  useEffect(() => {
    if (isAuthenticated && sessionExpired) clearSessionExpired();
  }, [isAuthenticated, sessionExpired, clearSessionExpired]);

  if (checkingSession) {
    return <LoadingFallback message="Checking session authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="app app-narrow">
        <h1>PR8 — Task Manager</h1>
        <p className="subtitle">Register or log in to manage your tasks</p>
        <AuthForm
          initialMessage={sessionExpired ? 'Your session expired. Please log in again.' : null}
        />
      </div>
    );
  }

  return (
    <div className="app-main-layout">
      <NavigationHeader />
      <main className="main-content">
        <Suspense fallback={<LoadingFallback message="Loading page route..." />}>
          <Routes>
            <Route path="/" element={<TaskManager />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
