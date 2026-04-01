import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, ShieldCheck, ChevronRight, MapPin, Chrome, Facebook, Instagram } from 'lucide-react';
import api from '../services/api';
import AlertModal from '../components/AlertModal';
import Logo from '../components/Logo';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const redirectUrl = searchParams.get('redirect');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });

    const handleSocialLogin = (provider: string) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        window.location.href = `${baseUrl}/auth/${provider}`;
    };

    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
        isOpen: false,
        message: '',
        type: 'error'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Only allow digits
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', { ...formData, role: 'customer' });
            setAlertConfig({
                isOpen: true,
                message: t('auth.register.success') || "Registration successful!",
                type: 'success'
            });
            setTimeout(() => navigate(`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`), 2000);
        } catch (error: any) {
            console.error("Registration error:", error);
            const backendMsg = error.response?.data?.message;
            const errorKey = backendMsg ? backendMsg.toLowerCase().replace(/\s+/g, '_') : 'default';
            const message = t(`auth.login.errors.${errorKey}`, { defaultValue: backendMsg || t('auth.register.error') });

            setAlertConfig({
                isOpen: true,
                message: message,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 pt-32 pb-20 overflow-hidden bg-black">
            {/* Premium Car Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm opacity-60"
                style={{ 
                    backgroundImage: `url('/car_bg_premium.png')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/40 to-black/90"></div>
            </div>
            <div className="w-full max-w-[500px] space-y-12">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <Logo className="h-28" isWhite={true} />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">{t('auth.register.title')}</h1>
                    <p className="text-white/80 font-medium">{t('auth.register.subtitle')}</p>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-3xl border border-gray-800 p-10 rounded-[40px] shadow-2xl space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">{t('auth.register.fullName')}</label>
                                <div className="relative group">
                                    <User className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        name="name"
                                        required 
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Carter"
                                        className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-12 rtl:pr-12 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-500 text-white font-medium text-sm rtl:text-right" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">{t('auth.register.phone')}</label>
                                 <input 
                                    type="tel" 
                                    name="phone"
                                    required 
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-500 text-white font-medium text-sm rtl:text-right" 
                                 />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-white uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">{t('auth.register.address')}</label>
                            <div className="relative group">
                                <MapPin className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    name="address"
                                    required 
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Cairo, Egypt"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-500 text-white font-medium rtl:text-right" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-white uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">{t('auth.login.emailLabel')}</label>
                            <div className="relative group">
                                <Mail className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    name="email"
                                    required 
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-500 text-white font-medium rtl:text-right" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-white uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">{t('auth.register.securePassword')}</label>
                            <div className="relative group">
                                <Lock className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    name="password"
                                    required 
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-500 text-white font-mono rtl:text-right" 
                                />
                            </div>
                        </div>

                        <div 
                            onClick={() => setAcceptedTerms(!acceptedTerms)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                                acceptedTerms 
                                ? 'bg-brand-primary/10 border-brand-primary/30 shadow-lg shadow-brand-primary/5' 
                                : 'bg-gray-800/20 border-gray-800 hover:border-gray-700'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                acceptedTerms 
                                ? 'bg-brand-primary border-brand-primary scale-110 shadow-lg shadow-brand-primary/20' 
                                : 'border-gray-600'
                            }`}>
                                {acceptedTerms && <ShieldCheck size={14} className="text-white" />}
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                {t('auth.register.termsPrefix')} <span className="text-brand-primary font-bold">{t('auth.register.termsLink')}</span> {t('auth.login.orContinueWith').split(' ')[0]} <span className="text-brand-primary font-bold">{t('auth.register.privacyLink')}</span>.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading || !acceptedTerms}
                            className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-800 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>{t('auth.register.createAccountButton')} <ChevronRight size={20} className="rtl:rotate-180" /></>
                            )}
                        </button>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-white/50"><span className="bg-[#0c0c0c] px-4">{t('auth.login.orContinueWith')}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            <Chrome size={20} className="text-white" />
                            <span className="text-sm font-bold text-white">Google</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            <Facebook size={20} className="text-[#1877F2]" />
                            <span className="text-sm font-bold text-white">Facebook</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('instagram')}
                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            <Instagram size={20} className="text-[#E4405F]" />
                            <span className="text-sm font-bold text-white">Instagram</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('tiktok')}
                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path>
                            </svg>
                            <span className="text-sm font-bold text-white">TikTok</span>
                        </button>
                    </div>
                </div>

                <p className="text-center text-white/60 font-medium relative z-10">
                    {t('auth.register.alreadyMember')} <Link to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-white font-black hover:text-brand-primary transition-colors underline underline-offset-8 pointer-events-auto">{t('auth.register.signInLink')}</Link>
                </p>
            </div>

            <AlertModal 
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default Register;
