import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Home from './pages/Home.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import { SoundProvider } from './assets/context/SoundProvider.jsx'
import { useServerReady } from './hooks/useServerReady.js'
import ServerLoadingScreen from './components/ServerLoadingScreen.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/home" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    )
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: '/projects/:id',
    element: (
      <ProtectedRoute>
        <ProjectDetail />
      </ProtectedRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    )
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  }
])

const AppWithServerCheck = () => {
  const { isServerReady, error, retryCount } = useServerReady();

  if (!isServerReady) {
    return <ServerLoadingScreen retryCount={retryCount} error={error} />;
  }

  return (
    <SoundProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SoundProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "74602566955-2cdtn4dofqu5so4u58cm56tljed9ggi0.apps.googleusercontent.com"}>
      <AppWithServerCheck />
    </GoogleOAuthProvider>
  </StrictMode>
)
