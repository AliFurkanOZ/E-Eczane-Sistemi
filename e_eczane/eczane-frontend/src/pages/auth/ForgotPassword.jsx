import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authApi } from '../../api/authApi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageState, setPageState] = useState('form'); // 'form', 'success'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setPageState('success');
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary-200/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-secondary-200/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Success State */}
            {pageState === 'success' && (
                <div className="w-full flex items-center justify-center p-6 lg:p-12 z-10">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">E-posta Gönderildi!</h2>
                            <p className="text-slate-500 mt-4 leading-relaxed">
                                Eğer <span className="font-medium text-slate-700">{email}</span> adresi sistemimizde kayıtlıysa,
                                şifre sıfırlama linki içeren bir e-posta gönderdik.
                            </p>
                            <p className="text-slate-400 text-sm mt-4">
                                E-posta birkaç dakika içinde gelmezse, spam klasörünüzü kontrol edin.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link to="/login" className="block">
                                <Button variant="primary" className="w-full">
                                    Giriş Sayfasına Dön
                                </Button>
                            </Link>

                            <button
                                type="button"
                                onClick={() => {
                                    setPageState('form');
                                    setEmail('');
                                }}
                                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Farklı bir e-posta adresi dene
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form State */}
            {pageState === 'form' && (
                <div className="w-full flex z-10">
                    {/* Left Panel - Branding */}
                    <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 opacity-90 z-0"></div>
                        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20 z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80')" }}></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <Package className="w-8 h-8 text-primary-300" />
                                </div>
                                <span className="text-2xl font-bold font-display tracking-tight">E-Eczane</span>
                            </div>

                            <h1 className="text-5xl font-bold leading-tight mb-6">
                                Şifrenizi mi <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
                                    Unuttunuz?
                                </span>
                            </h1>
                            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                                Endişelenmeyin! E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                            </p>
                        </div>

                        <div className="relative z-10 text-sm text-slate-500">
                            © 2025 E-Eczane Sistemi. T.C. Sağlık Bakanlığı Standartlarına Uygundur.
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                        <div className="w-full max-w-md space-y-8">
                            <div className="text-center lg:text-left">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Giriş sayfasına dön
                                </Link>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Şifremi Unuttum</h2>
                                <p className="text-slate-500 mt-2">
                                    Kayıtlı e-posta adresinizi girin, şifre sıfırlama linki gönderelim.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="E-posta Adresi"
                                    icon={Mail}
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="ornek@email.com"
                                    required
                                />

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
                                    Şifre Sıfırlama Linki Gönder
                                </Button>
                            </form>

                            <div className="text-center">
                                <p className="text-sm text-slate-500">
                                    Şifrenizi hatırladınız mı?{' '}
                                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                                        Giriş Yap
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
