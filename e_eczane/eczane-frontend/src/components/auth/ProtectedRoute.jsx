import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../redux/slices/authSlice';
import Loading from '../common/Loading';

const ProtectedRoute = ({ allowedRoles }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Yükleniyor..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600 mb-8">Bu sayfaya erişim yetkiniz yok</p>
          <Navigate to={`/${userType}/dashboard`} replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

