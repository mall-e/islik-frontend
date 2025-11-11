import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import UnitManagement from './pages/UnitManagement';
import OrganizationChart from './pages/OrganizationChart';
import TimeTracking from './pages/TimeTracking';
import SalaryCalculation from './pages/SalaryCalculation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e293b',
    },
    secondary: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmployeeManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DepartmentManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/units"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UnitManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrganizationChart />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-tracking"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TimeTracking />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalaryCalculation />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;