import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AlertModal from '../components/AlertModal';
import Logo from '../components/Logo';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const token = searchParams.get('token');
    
    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
        isOpen: false,
        message: '',
        type: 'error'
    });

    useEffect(() => {
        if (!token) {
            setAlertConfig({
                isOpen: true,
                message: t('auth.resetPassword.invalidToken'),
                type: 'error'
            });
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [token, navigate, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setAlertConfig({
                isOpen: true,
                message: t('auth.resetPassword.mismatch'),
                type: 'error'
            });
            return;
        }
        
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: password });
            setAlertConfig({
                isOpen: true,
                message: t('auth.resetPassword.success'),
                type: 'success'
            });
        } catch (error: any) {
            console.error("Reset password error:", error);
            setAlertConfig({
                isOpen: true,
                message: error.response?.data?.message || t('auth.resetPassword.error'),
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 pt-32 pb-20 overflow-hidden bg-black">
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm opacity-60"
                style={{ backgroundImage: `url('/car_bg_premium.png')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/40 to-black/90"></div>
            </div>

            <div className="w-full max-w-[450px] space-y-12 relative z-10">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <Logo className="h-28" isWhite={true} />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase">{t('auth.resetPassword.title')}</h1>
                    <p className="text-white/90 font-medium">{t('auth.resetPassword.subtitle')}</p>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-3xl border border-gray-800 p-10 rounded-[40px] shadow-2xl space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">
                                {t('auth.login.passwordLabel')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 ltr:pr-12 rtl:pl-12 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-700 font-mono rtl:text-right text-white" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand-primary transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">
                                {t('auth.register.confirmPasswordLabel')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-700 font-mono rtl:text-right text-white" 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full py-5 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:opacity-50 text-black font-black rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>{t('auth.resetPassword.submitButton')} <ChevronRight size={20} className="rtl:rotate-180" /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                            <ArrowLeft size={14} className="rtl:rotate-180" />
                            {t('auth.forgotPassword.backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>

            <AlertModal 
                isOpen={alertConfig.isOpen}
                onClose={() => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    if (alertConfig.type === 'success') navigate('/login');
                }}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default ResetPassword;
