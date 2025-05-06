import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Theme
import theme from './theme';

// Layout Components
import Dashboard from './components/layout/Dashboard';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import DocumentList from './components/documents/DocumentList';
import DocumentDetail from './components/documents/DocumentDetail';
import DocumentUpload from './components/documents/DocumentUpload';
import WorkflowList from './components/workflows/WorkflowList';
import WorkflowDetail from './components/workflows/WorkflowDetail';
import WorkflowCreate from './components/workflows/WorkflowCreate';
import UserProfile from './components/users/UserProfile';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
    <Route index element={<Navigate to="/documents" replace />} />
    <Route path="documents" element={<DocumentList />} />
    <Route path="documents/upload" element={<DocumentUpload />} />
    <Route path="documents/:id" element={<DocumentDetail />} />
    <Route path="workflows" element={<WorkflowList />} />
    <Route path="workflows/create" element={<WorkflowCreate />} />
    <Route path="workflows/:id" element={<WorkflowDetail />} />
    <Route path="profile" element={<Navigate to="/profile/me" replace />} />
    <Route path="profile/:id" element={<UserProfile />} />
  </Route>
</Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
