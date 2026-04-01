import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-black text-white">
            <SEO 
                title={t('seo.notFound.title')}
                description={t('seo.notFound.description')}
            />
            {/* Premium Car Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm brightness-[0.4]"
                style={{ 
                    backgroundImage: `url('/car_bg_premium.png')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
                <div className="flex justify-center mb-4">
                    <Logo className="h-32" isWhite={true} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-[120px] font-black tracking-tighter leading-none opacity-20 select-none">
                        {t('notFound.title')}
                    </h1>
                    <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] shadow-2xl relative -mt-20">
                        <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic text-brand-primary">
                            {t('notFound.subtitle')}
                        </h2>
                        <p className="text-gray-300 text-lg font-medium max-w-md mx-auto">
                            {t('notFound.description')}
                        </p>
                        
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/" 
                                className="inline-flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-5 px-10 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 group"
                            >
                                <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
                                <span>{t('notFound.backHome')}</span>
                            </Link>
                            <button 
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-5 px-10 rounded-2xl transition-all backdrop-blur-md"
                            >
                                <ArrowLeft size={20} className="rtl:rotate-180" />
                                <span>{t('auth.register.alreadyMember').split(' ')[0]}</span> {/* Reusing a bit of logic or just hardcoding if needed, but let's stick to Home mostly */}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
                    ELDOKSH PREMIUM SELECTION
                </p>
            </div>
        </div>
    );
};

export default NotFound;
