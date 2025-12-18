import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { Package, Mail, Lock, User, Building2, Shield, AlertCircle, ArrowRight, Stethoscope, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setShowResetSuccess(true);
      // URL'den parametreyi temizle
      window.history.replaceState({}, document.title, '/login');
    }
  }, [searchParams]);

  const [userType, setUserType] = useState('hasta');
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const userTypes = [
    { id: 'hasta', label: 'Hasta', icon: User, desc: 'Reçete ve ilaç takibi için' },
    { id: 'eczane', label: 'Eczane', icon: Building2, desc: 'Stok ve sipariş yönetimi' },
    { id: 'doktor', label: 'Doktor', icon: Stethoscope, desc: 'Reçete yazma sistemi' },
    { id: 'admin', label: 'Yönetici', icon: Shield, desc: 'Sistem yönetimi' },
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
    <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-secondary-200/20 rounded-full blur-[120px]" />
      </div>

      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 opacity-90 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 z-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Package className="w-8 h-8 text-primary-300" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">E-Eczane</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Sağlık Hizmetlerine <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
              Modern Erişim
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            E-Eczane sistemi ile reçetelerinizi sorgulayın, ilaçlarınızı en yakın eczaneden temin edin ve siparişlerinizi anlık takip edin.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-primary-300" />
            </div>
            <h3 className="font-bold text-lg mb-1">Güvenli Altyapı</h3>
            <p className="text-sm text-slate-400">Verileriniz uçtan uca şifreleme ile korunur.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-secondary-300" />
            </div>
            <h3 className="font-bold text-lg mb-1">Hızlı Erişim</h3>
            <p className="text-sm text-slate-400">7/24 kesintisiz hizmet ve anlık bildirimler.</p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2025 E-Eczane Sistemi. T.C. Sağlık Bakanlığı Standartlarına Uygundur.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Hoş Geldiniz</h2>
            <p className="text-slate-500 mt-2">Lütfen devam etmek için kullanıcı tipini seçin ve giriş yapın.</p>
          </div>

          {/* User Type Selector */}
          <div className="grid grid-cols-4 gap-3">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = userType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`
                                    relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                                    ${isSelected
                      ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm ring-1 ring-primary-500'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }
                                `}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold">{type.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="E-posta veya TC Kimlik No"
                icon={Mail}
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="ornek@email.com veya TC Kimlik No"
                required
              />

              <div className="space-y-1">
                <Input
                  label="Şifre"
                  icon={Lock}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Şifremi Unuttum?
                  </Link>
                </div>
              </div>
            </div>

            {showResetSuccess && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {typeof error === 'string' ? error : (error?.detail || 'Bir hata oluştu')}
                </p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 text-base"
              variant="primary"
            >
              Giriş Yap
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-500">Hesabınız yok mu?</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/register/hasta" className="w-full">
              <Button variant="secondary" className="w-full" icon={User}>
                Hasta Kaydı
              </Button>
            </Link>
            <Link to="/register/eczane" className="w-full">
              <Button variant="secondary" className="w-full" icon={Building2}>
                Eczane Kaydı
              </Button>
            </Link>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-400 mb-3">Demo Giriş Bilgileri</p>
            <div className="flex justify-center gap-2 text-[10px] text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
              <div><span className="font-bold text-primary-600">Hasta:</span> hasta1@test.com / Test123!</div>
              <div className="w-px bg-slate-200 mx-1"></div>
              <div><span className="font-bold text-secondary-600">Eczane:</span> merkez@eczane.com / Eczane123!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Clock Icon component for presentation
const Clock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default Login;