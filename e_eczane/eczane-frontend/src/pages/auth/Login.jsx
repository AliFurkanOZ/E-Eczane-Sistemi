import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Stethoscope, Building2, Shield, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { USER_TYPES } from '../../utils/constants';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, userType } = useSelector((state) => state.auth);
  
  const [selectedType, setSelectedType] = useState(USER_TYPES.HASTA);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Eğer zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (isAuthenticated && userType) {
      navigate(`/${userType}/dashboard`);
    }
  }, [isAuthenticated, userType, navigate]);

  const userTypeOptions = [
    {
      type: USER_TYPES.HASTA,
      title: 'Hasta',
      description: 'Reçeteli/reçetesiz ilaç alın',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      type: USER_TYPES.ECZANE,
      title: 'Eczane',
      description: 'Sipariş ve stok yönetimi',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      gradient: 'from-green-500 to-green-600',
    },
    {
      type: USER_TYPES.ADMIN,
      title: 'Admin',
      description: 'Sistem yönetimi',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Bu alan zorunludur';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await dispatch(login({
        identifier: formData.identifier,
        password: formData.password,
        userType: selectedType,
      })).unwrap();
      
      // Navigation will happen via useEffect
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const getPlaceholder = () => {
    switch (selectedType) {
      case USER_TYPES.HASTA:
        return 'TC Kimlik No veya E-posta';
      case USER_TYPES.ECZANE:
        return 'Sicil No veya E-posta';
      case USER_TYPES.ADMIN:
        return 'E-posta';
      default:
        return 'Kullanıcı adı';
    }
  };

  const getTypeSpecificIcon = () => {
    switch (selectedType) {
      case USER_TYPES.HASTA:
        return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case USER_TYPES.ECZANE:
        return <Building2 className="w-5 h-5 text-green-500" />;
      case USER_TYPES.ADMIN:
        return <Shield className="w-5 h-5 text-purple-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Eczane Yönetim Sistemi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza güvenli giriş yapın
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kullanıcı Tipi</h3>
            <div className="grid grid-cols-3 gap-3">
              {userTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;
                
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                      ${isSelected 
                        ? `border-${option.type === USER_TYPES.HASTA ? 'blue' : option.type === USER_TYPES.ECZANE ? 'green' : 'purple'}-500 ${option.bgColor} shadow-md` 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      isSelected 
                        ? `bg-gradient-to-r ${option.gradient} text-white` 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-xs font-semibold ${
                      isSelected 
                        ? option.type === USER_TYPES.HASTA ? 'text-blue-700' : option.type === USER_TYPES.ECZANE ? 'text-green-700' : 'text-purple-700'
                        : 'text-gray-600'
                    }`}>
                      {option.title}
                    </p>
                    {isSelected && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${option.gradient} flex items-center justify-center`}>
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getTypeSpecificIcon()}
                </div>
                <input
                  name="identifier"
                  type="text"
                  placeholder={getPlaceholder()}
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.identifier ? 'border-red-300' : 'border-gray-300'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${
                    selectedType === USER_TYPES.HASTA ? 'ring-blue-500 border-blue-500' : 
                    selectedType === USER_TYPES.ECZANE ? 'ring-green-500 border-green-500' : 
                    'ring-purple-500 border-purple-500'
                  } transition-colors`}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm">{errors.identifier}</p>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifreniz"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${
                    selectedType === USER_TYPES.HASTA ? 'ring-blue-500 border-blue-500' : 
                    selectedType === USER_TYPES.ECZANE ? 'ring-green-500 border-green-500' : 
                    'ring-purple-500 border-purple-500'
                  } transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className={`w-full py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${
                selectedType === USER_TYPES.HASTA ? 'focus:ring-blue-500' : 
                selectedType === USER_TYPES.ECZANE ? 'focus:ring-green-500' : 
                'focus:ring-purple-500'
              } ${
                selectedType === USER_TYPES.HASTA ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 
                selectedType === USER_TYPES.ECZANE ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 
                'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              }`}
              loading={loading}
            >
              <span className="text-base font-semibold">Giriş Yap</span>
            </Button>
          </form>

          {/* Register Links */}
          {selectedType !== USER_TYPES.ADMIN && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link
                  to={`/register/${selectedType}`}
                  className={`font-medium ${
                    selectedType === USER_TYPES.HASTA ? 'text-blue-600 hover:text-blue-500' : 
                    selectedType === USER_TYPES.ECZANE ? 'text-green-600 hover:text-green-500' : 
                    'text-purple-600 hover:text-purple-500'
                  } transition-colors`}
                >
                  Kayıt Ol
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Test Credentials Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Test Hesapları</h3>
              <div className="mt-2 text-sm text-blue-700 space-y-1">
                <p>• <strong>Hasta:</strong> test@hasta.com / Test123!</p>
                <p>• <strong>Eczane:</strong> test@eczane.com / Test123!</p>
                <p>• <strong>Admin:</strong> admin@eczane.com / Admin123!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;