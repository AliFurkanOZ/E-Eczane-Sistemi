import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterHasta from './pages/auth/RegisterHasta';
import RegisterEczane from './pages/auth/RegisterEczane';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard Pages
import HastaDashboard from './pages/hasta/Dashboard';
import EczaneDashboard from './pages/eczane/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Hasta Pages
import PrescriptionList from './pages/hasta/prescriptions/List';
import OrderList from './pages/hasta/orders/List';
import Cart from './pages/hasta/cart/Cart';
import MedicineSearch from './pages/hasta/medicines/Search';
import Profile from './pages/hasta/profile/Profile';

import { USER_TYPES } from './utils/constants';

function App() {
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userType}/dashboard`} replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route path="/register/hasta" element={<RegisterHasta />} />
        <Route path="/register/eczane" element={<RegisterEczane />} />
        
        {/* Protected routes - Hasta */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.HASTA]} />}>
          <Route path="/hasta/dashboard" element={<HastaDashboard />} />
          <Route path="/hasta/profil" element={<Profile />} />
          <Route path="/hasta/receteler" element={<PrescriptionList />} />
          <Route path="/hasta/siparisler" element={<OrderList />} />
          <Route path="/hasta/sepet" element={<Cart />} />
          <Route path="/hasta/ilaclar" element={<MedicineSearch />} />
        </Route>
        
        {/* Protected routes - Eczane */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.ECZANE]} />}>
          <Route path="/eczane/dashboard" element={<EczaneDashboard />} />
        </Route>
        
        {/* Protected routes - Admin */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Redirect root to appropriate dashboard or login */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userType}/dashboard`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600">Sayfa Bulunamadı</p>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;