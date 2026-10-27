import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import Leaves from './pages/Leaves';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import Training from './pages/Training';

// Layout wrapper for authenticated pages
function DashboardLayout({ children }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/employees/')) return 'Employee Profile';
    if (pathname.includes('/employees')) return 'Directory & Staff';
    if (pathname.includes('/leaves')) return 'Leave Management';
    if (pathname.includes('/attendance')) return 'Daily Attendance';
    if (pathname.includes('/announcements')) return 'Announcements';
    if (pathname.includes('/training')) return 'Training & Skills';
    if (pathname.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };

  return (
    <div className="app-container">
      <Sidebar
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />
      <div className="main-content">
        <Navbar
          pageTitle={getPageTitle(location.pathname)}
          onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        />
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/employees"
            element={
              <DashboardLayout>
                <Employees />
              </DashboardLayout>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <DashboardLayout>
                <EmployeeProfile />
              </DashboardLayout>
            }
          />
          <Route
            path="/leaves"
            element={
              <DashboardLayout>
                <Leaves />
              </DashboardLayout>
            }
          />
          <Route
            path="/attendance"
            element={
              <DashboardLayout>
                <Attendance />
              </DashboardLayout>
            }
          />
          <Route
            path="/announcements"
            element={
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            }
          />
          <Route
            path="/training"
            element={
              <DashboardLayout>
                <Training />
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <EmployeeProfile />
              </DashboardLayout>
            }
          />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
