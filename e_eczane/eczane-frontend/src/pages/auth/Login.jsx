import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { Package, Mail, Lock, User, Building2, Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [userType, setUserType] = useState('hasta');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const userTypes = [
    { id: 'hasta', label: 'Hasta Girişi', icon: User },
    { id: 'eczane', label: 'Eczane Girişi', icon: Building2 },
    { id: 'admin', label: 'Yönetici', icon: Shield },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ ...formData, userType }));
    if (login.fulfilled.match(result)) {
      navigate(`/${userType}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="header-official">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-lg p-2">
                <Package className="h-8 w-8 text-[#005f9e]" />
              </div>
              <div className="ml-3 text-white">
                <h1 className="text-xl font-bold">E-Eczane Sistemi</h1>
                <p className="text-sm text-blue-100">T.C. Sağlık Bakanlığı</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-white text-sm">
              <a href="#" className="hover:underline">Ana Sayfa</a>
              <a href="#" className="hover:underline">Hakkında</a>
              <a href="#" className="hover:underline">İletişim</a>
              <a href="#" className="hover:underline">Yardım</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Side - Info */}
          <div className="flex-1 hidden lg:block">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              E-Eczane Yönetim Sistemi
            </h2>
            <p className="text-gray-600 mb-6">
              E-Eczane sistemi ile reçetelerinizi sorgulayabilir, ilaçlarınızı
              en yakın eczaneden temin edebilir ve siparişlerinizi takip edebilirsiniz.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="icon-box icon-box-blue flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Hastalar İçin</h3>
                  <p className="text-sm text-gray-600">
                    E-reçete sorgulama, ilaç sipariş etme ve takip
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="icon-box icon-box-green flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Eczaneler İçin</h3>
                  <p className="text-sm text-gray-600">
                    Stok yönetimi, sipariş takibi ve raporlama
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="icon-box icon-box-purple flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Güvenli Erişim</h3>
                  <p className="text-sm text-gray-600">
                    Verileriniz güvenli bir şekilde korunmaktadır
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="alert-info mt-8">
              <p className="text-sm text-[#005f9e]">
                <strong>Bilgi:</strong> İlk kez mi kullanıyorsunuz? Hasta veya Eczane kaydı oluşturarak sisteme giriş yapabilirsiniz.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-[420px]">
            <div className="login-box">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Sisteme Giriş
              </h2>

              {/* User Type Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = userType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setUserType(type.id)}
                      className={`user-type-btn ${isSelected ? 'active' : ''}`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#005f9e]' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-[#005f9e]' : 'text-gray-600'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-mhrs pl-10"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-mhrs pl-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-mhrs btn-primary-mhrs w-full flex items-center justify-center"
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Hesabınız yok mu?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/register/hasta"
                    className="btn-mhrs btn-secondary-mhrs text-center text-sm"
                  >
                    Hasta Kaydı
                  </Link>
                  <Link
                    to="/register/eczane"
                    className="btn-mhrs btn-success-mhrs text-center text-sm"
                  >
                    Eczane Kaydı
                  </Link>
                </div>
              </div>
            </div>

            {/* Test Accounts */}
            <div className="card mt-4 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Demo Hesapları
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#005f9e] font-medium">Hasta:</span><br />
                  <span className="text-gray-600">hasta1@test.com</span><br />
                  <span className="text-gray-500">Test123!</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">Eczane:</span><br />
                  <span className="text-gray-600">merkez@eczane.com</span><br />
                  <span className="text-gray-500">Eczane123!</span>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Admin:</span><br />
                  <span className="text-gray-600">admin@eczane.com</span><br />
                  <span className="text-gray-500">Admin123!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2025 E-Eczane Sistemi. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#005f9e]">Gizlilik Politikası</a>
              <a href="#" className="hover:text-[#005f9e]">Kullanım Koşulları</a>
              <a href="#" className="hover:text-[#005f9e]">SSS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;