import React from 'react';
//import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageReports from './pages/admin/ManageReports';
import UserManagement from './pages/admin/UserManagement';
import ExportData from './pages/admin/ExportData';
import ReportDetails from './pages/ReportDetails';
import EditReport from './pages/EditReport';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route
              path="/reports/:id/edit"
              element={
                <ProtectedRoute>
                  <EditReport />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
        </SocketProvider> 
      </AuthProvider>
    </Router>
  );
}

export default App;