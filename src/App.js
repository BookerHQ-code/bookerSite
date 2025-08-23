import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './index.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

// Auth Pages
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Components
import RouteGuard, { AuthRedirect } from './components/auth/RouteGuard';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />

              {/* Auth routes - redirect if already authenticated */}
              <Route
                path="/login"
                element={
                  <AuthRedirect>
                    <LoginPage />
                  </AuthRedirect>
                }
              />

              <Route
                path="/signup"
                element={
                  <AuthRedirect>
                    <SignUpPage />
                  </AuthRedirect>
                }
              />

              {/* Email verification routes */}
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <RouteGuard requireAuth={true} requireVerified={true}>
                    <DashboardPage />
                  </RouteGuard>
                }
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Page Not Found
                      </h1>
                      <p className="text-gray-600">
                        The page you're looking for doesn't exist.
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
