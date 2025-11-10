import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';

// Lazy load components for better performance
import { lazy } from 'react';

// Dashboard components
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/dashboard/UserDashboard'));

// Book components
const Books = lazy(() => import('./pages/Books'));
const BookDetails = lazy(() => import('./pages/BookDetails'));

// User management (Admin only)
const Users = lazy(() => import('./pages/Users'));

// Resources page
const Resources = lazy(() => import('./pages/Resources'));

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Layout>
                    <React.Suspense fallback={<LoadingFallback />}>
                      <DashboardRouter />
                    </React.Suspense>
                  </Layout>
                </AuthGuard>
              }
            />

            <Route
              path="/books"
              element={
                <AuthGuard>
                  <Layout>
                    <React.Suspense fallback={<LoadingFallback />}>
                      <Books />
                    </React.Suspense>
                  </Layout>
                </AuthGuard>
              }
            />

            <Route
              path="/books/:id"
              element={
                <AuthGuard>
                  <Layout>
                    <React.Suspense fallback={<LoadingFallback />}>
                      <BookDetails />
                    </React.Suspense>
                  </Layout>
                </AuthGuard>
              }
            />

            <Route
              path="/users"
              element={
                <AuthGuard requireAdmin={true}>
                  <Layout>
                    <React.Suspense fallback={<LoadingFallback />}>
                      <Users />
                    </React.Suspense>
                  </Layout>
                </AuthGuard>
              }
            />

            <Route
              path="/resources"
              element={
                <AuthGuard>
                  <Layout>
                    <React.Suspense fallback={<LoadingFallback />}>
                      <Resources />
                    </React.Suspense>
                  </Layout>
                </AuthGuard>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <AuthGuard>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                      <a
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Component to route to appropriate dashboard based on user role
const DashboardRouter = () => {
  const { user, isAdmin } = useAuth();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default App;
