import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PageErrorFallback from './components/PageErrorFallback';
import PrivateRoute from './components/PrivateRoute';
import SessionExpirationWarning from './components/SessionExpirationWarning';

// Lazy load all page components
// This splits each page into its own chunk, loaded only when needed
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AllLanes = lazy(() => import('./pages/AllLanes'));
const LaneMappingLanes = lazy(() => import('./pages/LaneMappingLanes'));
const Edit = lazy(() => import('./pages/edit'));
const Accounts = lazy(() => import('./pages/Accounts'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));

// Loading component shown while lazy components load
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <SessionExpirationWarning />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <LoginPage />
                </ErrorBoundary>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/lanes"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <AllLanes />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/edit"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <Edit />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/laneMappingLanes/:laneMappingId"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <LaneMappingLanes />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/accounts"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <Accounts />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/accounts/:id"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <AccountDetail />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/"
              element={
                <ErrorBoundary fallback={<PageErrorFallback />}>
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
