import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import AllLanes from "./pages/allLanes";
import Accounts from './pages/Accounts';
import AccountLanes from './pages/AccountLanes';
import Edit from "./pages/edit";
import ErrorBoundary from "./components/ErrorBoundary";
import PageErrorFallback from "./components/PageErrorFallback";


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={
            <ErrorBoundary fallback={<PageErrorFallback />}>
              <LoginPage />
            </ErrorBoundary>
          } />


        <Route path="/dashboard" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </ErrorBoundary>
        } />

        <Route path="/lanes" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <AllLanes />
            </PrivateRoute>
          </ErrorBoundary>
        } />

        <Route path="/Accounts" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <Accounts />
            </PrivateRoute>
          </ErrorBoundary>
        } />


        <Route path="/edit" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <Edit />
            </PrivateRoute>
          </ErrorBoundary>
        } />

        <Route path="/accountLanes/:accountId" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <AccountLanes />
            </PrivateRoute>
          </ErrorBoundary>
        } />


        <Route path="/" element={
          <ErrorBoundary fallback={<PageErrorFallback />}>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </ErrorBoundary>
        } />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
