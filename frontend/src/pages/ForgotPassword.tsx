import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AlertModal from '../components/AlertModal';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
        isOpen: false,
        message: '',
        type: 'error'
    });

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep('otp');
            setAlertConfig({
                isOpen: true,
                message: t('auth.forgotPassword.otpSent', { defaultValue: 'Verification code sent to your email.' }),
                type: 'success'
            });
        } catch (error: any) {
            console.error("Forgot password error:", error);
            const backendMsg = error.response?.data?.message;
            const errorKey = backendMsg ? backendMsg.toLowerCase().replace(/\s+/g, '_') : 'error';
            setAlertConfig({
                isOpen: true,
                message: t(`auth.login.errors.${errorKey}`, { defaultValue: t('auth.forgotPassword.error') }),
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        if (element.nextSibling && element.value !== '') {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;

        setIsLoading(true);
        try {
            await api.get(`/auth/verify-code?token=${code}`);
            navigate(`/reset-password?token=${code}`);
        } catch (error: any) {
            setAlertConfig({
                isOpen: true,
                message: t('auth.resetPassword.invalidToken'),
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
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
                        {step === 'email' ? t('auth.forgotPassword.title') : t('auth.forgotPassword.otpTitle', { defaultValue: 'Verify Code' })}
                    </h1>
                    <p className="text-white/90 font-medium">
                        {step === 'email' ? t('auth.forgotPassword.subtitle') : t('auth.forgotPassword.otpSubtitle', { defaultValue: 'Enter the 6-digit code sent to your email' })}
                    </p>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-3xl border border-gray-800 p-10 rounded-[40px] shadow-2xl space-y-8">
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] rtl:mr-2 ltr:ml-2">
                                    {t('auth.login.emailLabel')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors" size={20} />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full bg-black/50 border border-gray-800 rounded-2xl ltr:pl-14 rtl:pr-14 py-5 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-gray-700 font-medium rtl:text-right text-white" 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:opacity-50 text-black font-black rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>{t('auth.forgotPassword.sendButton')} <ChevronRight size={20} className="rtl:rotate-180" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-8">
                            <div className="flex justify-between gap-2" dir="ltr">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        value={data}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-12 h-16 bg-black/50 border border-gray-800 rounded-xl text-center text-2xl font-black text-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="w-full py-5 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:opacity-50 text-black font-black rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>{t('auth.forgotPassword.verifyButton', { defaultValue: 'Verify Code' })} <ChevronRight size={20} className="rtl:rotate-180" /></>
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
                            >
                                {t('auth.forgotPassword.changeEmail', { defaultValue: 'Change Email' })}
                            </button>
                        </form>
                    )}

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
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default ForgotPassword;
