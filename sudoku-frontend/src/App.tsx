import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PuzzleEditor from './pages/PuzzleEditor';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import CreatePuzzle from './pages/CreatePuzzle';
import './App.css';

// Custom theme configuration
const customTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4f46e5', // Indigo primary color
    colorSuccess: '#10b981', // Emerald success color
    colorWarning: '#f59e0b', // Amber warning color
    colorError: '#ef4444', // Red error color
    colorInfo: '#3b82f6', // Blue info color
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={customTheme}>
      <AntApp>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes with layout */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="browse" element={<Browse />} />
                    <Route path="create" element={<CreatePuzzle />} />
                    <Route path="puzzle/:id" element={<PuzzleEditor />} />
                    <Route path="profile/:userId?" element={<Profile />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
