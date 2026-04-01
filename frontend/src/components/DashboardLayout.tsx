import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'admin' | 'customer' | 'driver';
    title: string;
    subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, title, subtitle }) => {
    const { i18n } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isRtl = i18n.language === 'ar';

    return (
        <div className="flex bg-[#f8fafc] text-slate-900 font-sans h-full min-h-screen">
            <Sidebar 
                role={role} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <div className="md:ltr:ml-72 md:rtl:mr-72 min-h-screen flex flex-col">
                {/* Header */}
                <header className="h-24 glass-morphism border-b border-slate-200/60 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-slate-600 shadow-sm"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-brand-primary uppercase truncate max-w-[150px] md:max-w-none">{title}</h2>
                            {subtitle && <p className="text-sm text-slate-500 font-bold tracking-tight hidden md:block">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <button 
                            onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-all shadow-sm"
                        >
                            {isRtl ? 'EN' : 'AR'}
                        </button>

                        <div className="flex items-center gap-4 ltr:pl-4 rtl:pr-4 ltr:md:pl-6 rtl:md:pr-6 ltr:border-l rtl:border-r border-slate-200">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-black text-slate-900">{useAuthStore().user?.name || 'User'}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-primary flex items-center justify-center text-white font-black shadow-xl shadow-brand-primary/20 text-base md:text-lg uppercase">
                                {(useAuthStore().user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 md:p-10 flex-grow">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
