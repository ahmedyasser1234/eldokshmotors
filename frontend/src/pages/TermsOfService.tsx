import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Gavel, ClipboardCheck, FileText } from 'lucide-react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

const TermsOfService: React.FC = () => {
    const { t } = useTranslation();

    const icons = [<Scale size={24} />, <Gavel size={24} />, <ClipboardCheck size={24} />];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-brand-primary selection:text-white">
            <SEO 
                title={t('seo.terms.title')}
                description={t('seo.terms.description')}
            />
            {/* Hero Section */}
            <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 brightness-[0.3]"
                    style={{ backgroundImage: `url('/car_bg_premium.png')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
                </div>
                
                <div className="relative z-10 text-center space-y-4 px-6 mt-12">
                    <div className="flex justify-center mb-6">
                        <Logo isWhite={true} className="h-20" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">
                        {t('legal.terms.title')}
                    </h1>
                    <p className="text-brand-accent font-black tracking-[0.3em] uppercase text-xs">
                        {t('legal.terms.lastUpdated')}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium border-l-4 border-brand-primary pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-6">
                        {t('legal.terms.introduction')}
                    </p>

                    <div className="grid gap-10">
                        {(t('legal.terms.sections', { returnObjects: true }) as any[]).map((section, index) => (
                            <div key={index} className="group space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                        {icons[index % icons.length]}
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
                                        {section.title}
                                    </h2>
                                </div>
                                <p className="text-slate-500 leading-relaxed text-base pl-16 rtl:pl-0 rtl:pr-16">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-100 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="p-4 rounded-full bg-brand-primary/5 border border-brand-primary/10">
                            <FileText className="text-brand-primary" size={28} />
                        </div>
                        <p className="text-slate-400 text-xs max-w-sm uppercase tracking-widest font-bold">
                            {t('legal.legalAgreement')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
