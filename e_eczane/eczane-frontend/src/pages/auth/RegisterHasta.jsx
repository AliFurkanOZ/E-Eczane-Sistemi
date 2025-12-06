import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerHasta } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Stethoscope, ArrowLeft } from 'lucide-react';

const RegisterHasta = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    tc_no: '',
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    adres: '',
    password: '',
    passwordConfirm: '',
  });
  
  const [errors, setErrors] = useState({});

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
    
    // TC No validation
    if (!formData.tc_no) {
      newErrors.tc_no = 'TC Kimlik No zorunludur';
    } else if (!/^\d{11}$/.test(formData.tc_no)) {
      newErrors.tc_no = 'TC Kimlik No 11 haneli olmalıdır';
    }
    
    // Name validation
    if (!formData.ad.trim()) {
      newErrors.ad = 'Ad zorunludur';
    } else if (formData.ad.trim().length < 2) {
      newErrors.ad = 'Ad en az 2 karakter olmalıdır';
    }
    
    if (!formData.soyad.trim()) {
      newErrors.soyad = 'Soyad zorunludur';
    } else if (formData.soyad.trim().length < 2) {
      newErrors.soyad = 'Soyad en az 2 karakter olmalıdır';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    // Phone validation
    if (!formData.telefon) {
      newErrors.telefon = 'Telefon zorunludur';
    } else if (!/^0\d{10}$/.test(formData.telefon.replace(/\s/g, ''))) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz (05XXXXXXXXX)';
    }
    
    // Address validation
    if (!formData.adres.trim()) {
      newErrors.adres = 'Adres zorunludur';
    } else if (formData.adres.trim().length < 10) {
      newErrors.adres = 'Adres en az 10 karakter olmalıdır';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    // Password confirm validation
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifre tekrarı zorunludur';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await dispatch(registerHasta({
        tc_no: formData.tc_no,
        ad: formData.ad,
        soyad: formData.soyad,
        email: formData.email,
        telefon: formData.telefon,
        adres: formData.adres,
        password: formData.password,
      })).unwrap();
      
      // Başarılı kayıt sonrası login sayfasına yönlendir
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Giriş sayfasına dön
        </Link>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Hasta Kaydı
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Reçeteli ve reçetesiz ilaçlarınızı kolayla temin edin
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="TC Kimlik No"
                name="tc_no"
                type="text"
                placeholder="12345678901"
                value={formData.tc_no}
                onChange={handleChange}
                error={errors.tc_no}
                maxLength={11}
                required
              />
              
              <Input
                label="E-posta"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ad"
                name="ad"
                type="text"
                placeholder="Adınız"
                value={formData.ad}
                onChange={handleChange}
                error={errors.ad}
                required
              />
              
              <Input
                label="Soyad"
                name="soyad"
                type="text"
                placeholder="Soyadınız"
                value={formData.soyad}
                onChange={handleChange}
                error={errors.soyad}
                required
              />
            </div>

            <Input
              label="Telefon"
              name="telefon"
              type="tel"
              placeholder="05XXXXXXXXX"
              value={formData.telefon}
              onChange={handleChange}
              error={errors.telefon}
              required
            />

            <Input
              label="Adres"
              name="adres"
              type="text"
              placeholder="Mahalle, Sokak, No, İl/İlçe"
              value={formData.adres}
              onChange={handleChange}
              error={errors.adres}
              required
            />

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Şifre"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              
              <Input
                label="Şifre Tekrar"
                name="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={formData.passwordConfirm}
                onChange={handleChange}
                error={errors.passwordConfirm}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Kayıt Ol
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHasta;

