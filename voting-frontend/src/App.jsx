import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { setAuthContext } from './services/api';

import ErrorBoundary from './components/shared/ErrorBoundary';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute from './components/shared/AdminRoute';

import LoginPage from './pages/LoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import VotingPage from './pages/VotingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';

// Wire up the API service with AuthContext
function ApiWirer() {
  const auth = useAuth();
  useEffect(() => { setAuthContext(auth); }, [auth]);
  return null;
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <>
      <ApiWirer />
      <Routes>
        <Route path="/login" element={
          isAuthenticated
            ? <Navigate to={role?.includes('ADMIN') ? '/admin' : '/vote'} replace />
            : <LoginPage />
        } />

        <Route path="/verify-otp" element={<OTPVerificationPage />} />

        <Route path="/vote" element={
          <ProtectedRoute><VotingPage /></ProtectedRoute>
        } />

        <Route path="/confirmation" element={
          <ProtectedRoute><ConfirmationPage /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
