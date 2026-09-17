import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RequesterDashboard from './pages/RequesterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TaskDiscoveryPage from './pages/TaskDiscoveryPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateTaskPage from './pages/CreateTaskPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import ImpactPage from './pages/ImpactPage';
import SavedTasksPage from './pages/SavedTasksPage';
import QuickTaskPage from './pages/QuickTaskPage';
import LearningPage from './pages/LearningPage';
import PortfolioPage from './pages/PortfolioPage';
import CertificatesPage from './pages/CertificatesPage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';
import OrganizationPage from './pages/OrganizationPage';
import MessagesPage from './pages/MessagesPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tasks" element={<TaskDiscoveryPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/quick-tasks" element={<QuickTaskPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/portfolio/:username" element={<PortfolioPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/certificates/:verificationId/verify" element={<VerifyCertificatePage />} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Volunteer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-tasks"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <SavedTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />

        {/* Requester Routes */}
        <Route
          path="/requester/dashboard"
          element={
            <ProtectedRoute allowedRoles={['requester', 'admin']}>
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <ProtectedRoute allowedRoles={['requester', 'admin']}>
              <CreateTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization"
          element={
            <ProtectedRoute allowedRoles={['requester', 'admin']}>
              <OrganizationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
