import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerEczane } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';

// Error Boundary Component
class RegisterEczaneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RegisterEczane Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bir Hata Oluştu
              </h2>
              <p className="text-gray-600 mb-6">
                Eczane kayıt formu yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RegisterEczane = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    sicil_no: '',
    eczane_adi: '',
    email: '',
    telefon: '',
    adres: '',
    mahalle: '',
    eczaci_adi: '',
    eczaci_soyadi: '',
    eczaci_diploma_no: '',
    banka_hesap_no: '',
    iban: '',
    password: '',
    passwordConfirm: '',
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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
    
    // Sicil No validation
    if (!formData.sicil_no.trim()) {
      newErrors.sicil_no = 'Sicil numarası zorunludur';
    }
    
    // Eczane Adı validation
    if (!formData.eczane_adi.trim()) {
      newErrors.eczane_adi = 'Eczane adı zorunludur';
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
    }
    
    // Address validation
    if (!formData.adres.trim()) {
      newErrors.adres = 'Adres zorunludur';
    } else if (formData.adres.trim().length < 10) {
      newErrors.adres = 'Adres en az 10 karakter olmalıdır';
    }
    
    // Mahalle validation
    if (!formData.mahalle.trim()) {
      newErrors.mahalle = 'Mahalle zorunludur';
    }
    
    // Eczacı Adı validation
    if (!formData.eczaci_adi.trim()) {
      newErrors.eczaci_adi = 'Eczacı adı zorunludur';
    }
    
    // Eczacı Soyadı validation
    if (!formData.eczaci_soyadi.trim()) {
      newErrors.eczaci_soyadi = 'Eczacı soyadı zorunludur';
    }
    
    // Diploma No validation
    if (!formData.eczaci_diploma_no.trim()) {
      newErrors.eczaci_diploma_no = 'Diploma numarası zorunludur';
    }
    
    // Banka Hesap No validation
    if (!formData.banka_hesap_no.trim()) {
      newErrors.banka_hesap_no = 'Banka hesap numarası zorunludur';
    }
    
    // IBAN validation
    if (!formData.iban.trim()) {
      newErrors.iban = 'IBAN zorunludur';
    } else {
      const iban = formData.iban.replace(/\s/g, '').toUpperCase();
      if (!iban.startsWith('TR') || iban.length !== 26) {
        newErrors.iban = 'Geçerli bir TR IBAN giriniz (TR + 24 hane)';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    // Password confirm validation
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!validate()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      console.log('Starting registration process');
      // Format IBAN (remove spaces, uppercase)
      const formattedIban = formData.iban.replace(/\s/g, '').toUpperCase();
      console.log('Formatted IBAN:', formattedIban);
      
      console.log('Dispatching registerEczane action');
      const result = await dispatch(registerEczane({
        sicil_no: formData.sicil_no,
        eczane_adi: formData.eczane_adi,
        email: formData.email,
        telefon: formData.telefon,
        adres: formData.adres,
        mahalle: formData.mahalle,
        eczaci_adi: formData.eczaci_adi,
        eczaci_soyadi: formData.eczaci_soyadi,
        eczaci_diploma_no: formData.eczaci_diploma_no,
        banka_hesap_no: formData.banka_hesap_no,
        iban: formattedIban,
        password: formData.password,
      })).unwrap();
      
      console.log('Registration successful, result:', result);
      
      // Show success screen
      console.log('Setting success state to true');
      setSuccess(true);
      console.log('Success state set');
    } catch (error) {
      console.error('Registration error:', error);
      // Set a general error message for the user
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.'
      }));
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kayıt Başarılı!
            </h2>
            <p className="text-gray-600 mb-6">
              Eczane kaydınız oluşturuldu. Admin onayı bekleniyor. 
              Onaylandıktan sonra sisteme giriş yapabileceksiniz.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Eczane Kaydı
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Eczanenizi kaydedin ve siparişleri yönetin
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Eczane Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eczane Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sicil Numarası"
                  name="sicil_no"
                  placeholder="ANK123456"
                  value={formData.sicil_no}
                  onChange={handleChange}
                  error={errors.sicil_no}
                  required
                />
                <Input
                  label="Eczane Adı"
                  name="eczane_adi"
                  placeholder="Şifa Eczanesi"
                  value={formData.eczane_adi}
                  onChange={handleChange}
                  error={errors.eczane_adi}
                  required
                />
                <Input
                  label="E-posta"
                  name="email"
                  type="email"
                  placeholder="eczane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Input
                  label="Telefon"
                  name="telefon"
                  type="tel"
                  placeholder="03121234567"
                  value={formData.telefon}
                  onChange={handleChange}
                  error={errors.telefon}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Adres"
                  name="adres"
                  placeholder="Sokak, No, İl/İlçe"
                  value={formData.adres}
                  onChange={handleChange}
                  error={errors.adres}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Mahalle"
                  name="mahalle"
                  placeholder="Kızılay"
                  value={formData.mahalle}
                  onChange={handleChange}
                  error={errors.mahalle}
                  required
                />
              </div>
            </div>

            {/* Eczacı Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eczacı Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Eczacı Adı"
                  name="eczaci_adi"
                  placeholder="Mehmet"
                  value={formData.eczaci_adi}
                  onChange={handleChange}
                  error={errors.eczaci_adi}
                  required
                />
                <Input
                  label="Eczacı Soyadı"
                  name="eczaci_soyadi"
                  placeholder="Demir"
                  value={formData.eczaci_soyadi}
                  onChange={handleChange}
                  error={errors.eczaci_soyadi}
                  required
                />
                <Input
                  label="Diploma Numarası"
                  name="eczaci_diploma_no"
                  placeholder="ECZ123456"
                  value={formData.eczaci_diploma_no}
                  onChange={handleChange}
                  error={errors.eczaci_diploma_no}
                  required
                />
              </div>
            </div>

            {/* Banka Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Banka Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Banka Hesap No"
                  name="banka_hesap_no"
                  placeholder="1234567890"
                  value={formData.banka_hesap_no}
                  onChange={handleChange}
                  error={errors.banka_hesap_no}
                  required
                />
                <Input
                  label="IBAN"
                  name="iban"
                  placeholder="TR33 0006 1005 1978 6457 8413 26"
                  value={formData.iban}
                  onChange={handleChange}
                  error={errors.iban}
                  maxLength={34}
                  required
                />
              </div>
            </div>

            {/* Güvenlik */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Güvenlik
              </h3>
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
            </div>

            {/* Display general error if exists */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="success"
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

// Wrap the component with error boundary
const RegisterEczaneWithBoundary = () => {
  return (
    <RegisterEczaneErrorBoundary>
      <RegisterEczane />
    </RegisterEczaneErrorBoundary>
  );
};

export default RegisterEczaneWithBoundary;

