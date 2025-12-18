import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterHasta from './pages/auth/RegisterHasta';
import RegisterEczane from './pages/auth/RegisterEczane';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard Pages
import HastaDashboard from './pages/hasta/Dashboard';
import EczaneDashboard from './pages/eczane/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import DoktorDashboard from './pages/doktor/Dashboard';

// Hasta Pages
import PrescriptionList from './pages/hasta/prescriptions/List';
import PharmacySelect from './pages/hasta/prescriptions/PharmacySelect';
import OrderList from './pages/hasta/orders/List';
import Cart from './pages/hasta/cart/Cart';
import MedicineSearch from './pages/hasta/medicines/Search';
import Profile from './pages/hasta/profile/Profile';
import Payment from './pages/hasta/payment/Payment';

// Eczane Pages
import EczaneOrderList from './pages/eczane/orders/List';
import EczaneOrderDetail from './pages/eczane/orders/Detail';
import StockList from './pages/eczane/stock/StockList';
import AddProduct from './pages/eczane/stock/AddProduct';
import EczaneProfile from './pages/eczane/profile/Profile';

// Admin Pages
import PendingPharmacies from './pages/admin/pharmacies/PendingPharmacies';
import AllPharmacies from './pages/admin/pharmacies/AllPharmacies';
import AllPatients from './pages/admin/patients/AllPatients';
import AllOrders from './pages/admin/orders/AllOrders';
import AllDoctors from './pages/admin/doctors/AllDoctors';

// Doktor Pages
import DoktorCreatePrescription from './pages/doktor/prescriptions/Create';
import DoktorPrescriptionList from './pages/doktor/prescriptions/List';
import DoktorProfile from './pages/doktor/profile/Profile';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes - Hasta */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.HASTA]} />}>
          <Route path="/hasta/dashboard" element={<HastaDashboard />} />
          <Route path="/hasta/profil" element={<Profile />} />
          <Route path="/hasta/receteler" element={<PrescriptionList />} />
          <Route path="/hasta/eczane-sec" element={<PharmacySelect />} />
          <Route path="/hasta/odeme" element={<Payment />} />
          <Route path="/hasta/siparisler" element={<OrderList />} />
          <Route path="/hasta/sepet" element={<Cart />} />
          <Route path="/hasta/ilaclar" element={<MedicineSearch />} />
        </Route>

        {/* Protected routes - Eczane */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.ECZANE]} />}>
          <Route path="/eczane/dashboard" element={<EczaneDashboard />} />
          <Route path="/eczane/siparisler" element={<EczaneOrderList />} />
          <Route path="/eczane/siparisler/:orderId" element={<EczaneOrderDetail />} />
          <Route path="/eczane/stoklar" element={<StockList />} />
          <Route path="/eczane/urun-ekle" element={<AddProduct />} />
          <Route path="/eczane/profil" element={<EczaneProfile />} />
        </Route>

        {/* Protected routes - Admin */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/eczaneler/bekleyenler" element={<PendingPharmacies />} />
          <Route path="/admin/eczaneler" element={<AllPharmacies />} />
          <Route path="/admin/hastalar" element={<AllPatients />} />
          <Route path="/admin/doktorlar" element={<AllDoctors />} />
          <Route path="/admin/siparisler" element={<AllOrders />} />
        </Route>

        {/* Protected routes - Doktor */}
        <Route element={<ProtectedRoute allowedRoles={[USER_TYPES.DOKTOR]} />}>
          <Route path="/doktor/dashboard" element={<DoktorDashboard />} />
          <Route path="/doktor/recete-yaz" element={<DoktorCreatePrescription />} />
          <Route path="/doktor/recetelerim" element={<DoktorPrescriptionList />} />
          <Route path="/doktor/profil" element={<DoktorProfile />} />
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