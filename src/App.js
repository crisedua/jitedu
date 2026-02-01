import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import GlobalChat from './pages/GlobalChat';
import AddTranscript from './pages/AddTranscript';
import Settings from './pages/Settings';
import Login from './pages/Login';

import KnowledgeSync from './pages/KnowledgeSync';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Public Home Route (Login required for interactions) */}
            <Route path="/" element={
              <Layout>
                <GlobalChat />
              </Layout>
            } />

            <Route path="/add" element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <AddTranscript />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/knowledge" element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <KnowledgeSync />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;