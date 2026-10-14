import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Package, Lock, ArrowLeft, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authApi } from '../../api/authApi';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenEmail, setTokenEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await authApi.verifyResetToken(token);
                setTokenEmail(response.email);
                setTokenValid(true);
            } catch (err) {
                setError(err.response?.data?.detail || 'Geçersiz veya süresi dolmuş token');
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validatePassword = () => {
        if (formData.newPassword.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır');
            return false;
        }
        if (!/[A-Z]/.test(formData.newPassword)) {
            setError('Şifre en az bir büyük harf içermelidir');
            return false;
        }
        if (!/[a-z]/.test(formData.newPassword)) {
            setError('Şifre en az bir küçük harf içermelidir');
            return false;
        }
        if (!/[0-9]/.test(formData.newPassword)) {
            setError('Şifre en az bir rakam içermelidir');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        setLoading(true);
        setError('');

        try {
            await authApi.resetPassword(token, formData.newPassword, formData.confirmPassword);
            // Başarılı olduğunda doğrudan login sayfasına yönlendir
            // URL'e success parametresi ekleyerek başarı mesajı gösterelim
            navigate('/login?reset=success', { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Şifre sıfırlamada bir hata oluştu');
            setLoading(false);
        }
    };

    // Loading state
    if (verifying) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Token doğrulanıyor...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-200/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-orange-200/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="w-full max-w-md space-y-8 p-6 z-10">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-100 p-4 rounded-full">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Geçersiz Link</h2>
                        <p className="text-slate-500 mt-4 leading-relaxed">
                            Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
                            Lütfen yeni bir şifre sıfırlama talebinde bulunun.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link to="/forgot-password" className="block">
                            <Button variant="primary" className="w-full">
                                Yeni Link Talep Et
                            </Button>
                        </Link>

                        <Link to="/login" className="block">
                            <Button variant="secondary" className="w-full">
                                Giriş Sayfasına Dön
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Form state (only shown when token is valid)
    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary-200/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-secondary-200/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 opacity-90 z-0"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20 z-0"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80')" }}
                ></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                            <Package className="w-8 h-8 text-primary-300" />
                        </div>
                        <span className="text-2xl font-bold font-display tracking-tight">E-Eczane</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Yeni Şifrenizi <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
                            Belirleyin
                        </span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                        Güvenli bir şifre seçin. En az 8 karakter, büyük-küçük harf ve rakam içermelidir.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    © 2025 E-Eczane Sistemi. T.C. Sağlık Bakanlığı Standartlarına Uygundur.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Giriş sayfasına dön
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Yeni Şifre Belirle</h2>
                        <p className="text-slate-500 mt-2">
                            <span className="font-medium text-slate-700">{tokenEmail}</span> için yeni şifre oluşturun.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Yeni Şifre"
                                icon={Lock}
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />

                            <Input
                                label="Yeni Şifre Tekrar"
                                icon={Lock}
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-2">Şifre gereksinimleri:</p>
                            <ul className="text-sm text-slate-500 space-y-1">
                                <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                                    {formData.newPassword.length >= 8 ? '✓' : '○'} En az 8 karakter
                                </li>
                                <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                    {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'} En az bir büyük harf
                                </li>
                                <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                    {/[a-z]/.test(formData.newPassword) ? '✓' : '○'} En az bir küçük harf
                                </li>
                                <li className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                    {/[0-9]/.test(formData.newPassword) ? '✓' : '○'} En az bir rakam
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full py-3.5 text-base"
                            variant="primary"
                        >
                            Şifreyi Değiştir
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
