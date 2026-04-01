import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, User, ShieldCheck, Car } from 'lucide-react';
import Logo from '../components/Logo';

const Sitemap: React.FC = () => {
    const { t } = useTranslation();

    const sections = [
        {
            title: t('sitemapPage.sections.main'),
            icon: <Compass className="text-brand-primary" />,
            links: [
                { label: t('nav.home'), path: '/' },
                { label: t('nav.vehicles'), path: '/vehicles' },
                { label: t('nav.sellCar'), path: '/sell-car' },
                { label: t('nav.about'), path: '/about' },
                { label: t('nav.contact'), path: '/contact' }
            ]
        },
        {
            title: t('sitemapPage.sections.categories'),
            icon: <Car className="text-brand-primary" />,
            links: [
                { label: t('categories.luxury'), path: '/vehicles?category=luxury' },
                { label: t('categories.sport'), path: '/vehicles?category=sport' },
                { label: t('categories.suv'), path: '/vehicles?category=suv' },
                { label: t('categories.economy'), path: '/vehicles?category=economy' },
                { label: t('categories.van'), path: '/vehicles?category=van' }
            ]
        },
        {
            title: t('sitemapPage.sections.account'),
            icon: <User className="text-brand-primary" />,
            links: [
                { label: t('auth.login.title'), path: '/login' },
                { label: t('auth.register.title'), path: '/register' },
                { label: t('sidebar.overview'), path: '/dashboard' },
                { label: t('sidebar.profile'), path: '/dashboard/profile' }
            ]
        },
        {
            title: t('sitemapPage.sections.legal'),
            icon: <ShieldCheck className="text-brand-primary" />,
            links: [
                { label: t('footer.privacy'), path: '/privacy' },
                { label: t('footer.terms'), path: '/terms' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-brand-primary selection:text-white">
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
                        {t('sitemapPage.title')}
                    </h1>
                    <p className="text-brand-accent font-black tracking-[0.3em] uppercase text-xs">
                        {t('sitemapPage.subtitle')}
                    </p>
                </div>
            </div>

            {/* Sitemap Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-7 rounded-3xl shadow-sm space-y-5 hover:border-brand-primary/40 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 group-hover:bg-brand-primary/10 transition-all">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
                                    {section.title}
                                </h3>
                            </div>
                            <ul className="space-y-3 pl-4 rtl:pl-0 rtl:pr-4 border-l-2 border-brand-primary/10 rtl:border-l-0 rtl:border-r-2">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link 
                                            to={link.path}
                                            className="text-slate-500 hover:text-brand-primary transition-colors text-sm font-medium flex items-center gap-2 group/link"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/30 group-hover/link:bg-brand-primary transition-all"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col items-center gap-4 text-center">
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">
                        {t('legal.sitemapFooter')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
