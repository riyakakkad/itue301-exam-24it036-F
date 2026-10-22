import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Standard Pages
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';

// Task 2: Lazy-loaded route for OrganizerPanel using React.lazy + Suspense
const OrganizerPanel = lazy(() => import('./pages/OrganizerPanel'));

const LoadingFallback = () => (
  <div className="lazy-loading-container">
    <div className="spinner"></div>
    <p>Lazy loading Organizer Panel module...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Route: / -> LoginPage */}
              <Route path="/" element={<LoginPage />} />

              {/* Route: /events -> EventsPage (protected) */}
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /my-tickets -> MyTicketsPage (protected) */}
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /organizer -> OrganizerPanel (lazy-loaded, role 'organizer' required) */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <Suspense fallback={<LoadingFallback />}>
                      <OrganizerPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>
              ITUE301 Advanced Web Development Frameworks Practical Exam • SET F: EventHub
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
