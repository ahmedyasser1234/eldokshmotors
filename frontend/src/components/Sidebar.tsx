import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Car, 
    Calendar, 
    User, 
    LogOut, 
    Users, 
    BarChart3, 
    CreditCard,
    Truck,
    History,
    X,
    MessageSquare
} from 'lucide-react';
import api from '../services/api';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    role: 'admin' | 'customer' | 'driver';
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuthStore();
    const isRtl = i18n.language === 'ar';

    const adminLinks = [
        { name: t('sidebar.overview'), path: '/admin/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.fleet'), path: '/admin/fleet', icon: Car },
        { name: t('sidebar.manualPayments'), path: '/admin/manual-payments', icon: CreditCard },
        { name: t('sidebar.bookings'), path: '/admin/bookings', icon: Calendar },
        { name: t('sidebar.soldVehicles'), path: '/admin/sold-vehicles', icon: CreditCard },
        { name: t('sidebar.sellOffers'), path: '/admin/sell-offers', icon: History },
        { name: t('sidebar.messages'), path: '/admin/messages', icon: MessageSquare },
        { name: t('sidebar.customers'), path: '/admin/users', icon: Users },
        { name: t('sidebar.revenue'), path: '/admin/analytics', icon: BarChart3 },
        { name: t('sidebar.settings'), path: '/admin/settings', icon: User },
    ];

    const customerLinks = [
        { name: t('sidebar.overview'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.myPurchases'), path: '/dashboard/purchases', icon: Car },
        { name: t('sidebar.mySales'), path: '/dashboard/sales', icon: History },
        { name: t('sidebar.payments'), path: '/dashboard/payments', icon: CreditCard },
        { name: t('sidebar.messages'), path: '/dashboard/messages', icon: MessageSquare },
        { name: t('sidebar.profile'), path: '/dashboard/profile', icon: User },
    ];

    const driverLinks = [
        { name: t('sidebar.missions'), path: '/driver/dashboard', icon: Truck },
        { name: t('sidebar.schedule'), path: '/driver/schedule', icon: Calendar },
        { name: t('sidebar.profile'), path: '/driver/profile', icon: User },
    ];

    const [unreadCounts, setUnreadCounts] = React.useState<any>({});

    const fetchUnread = React.useCallback(async () => {
        if (role !== 'admin') return;
        try {
            const { data } = await api.get('/notifications/unread-counts');
            setUnreadCounts(data);
        } catch (err) {
            console.error("Failed to fetch unread counts", err);
        }
    }, [role]);

    React.useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // Polling as a fallback
        return () => clearInterval(interval);
    }, [fetchUnread]);

    const getLinks = () => {
        switch (role) {
            case 'admin': return adminLinks;
            case 'driver': return driverLinks;
            default: return customerLinks;
        }
    };

    const links = getLinks();

    const getBadgeType = (path: string) => {
        if (path === '/admin/bookings') return unreadCounts.sale;
        if (path === '/admin/sell-offers') return unreadCounts.purchase_request;
        if (path === '/admin/messages') return unreadCounts.chat;
        if (path === '/admin/manual-payments') return unreadCounts.manual_payment;
        return 0;
    };

    const sidebarContent = (
        <aside className={`
            fixed top-0 h-screen w-72 bg-brand-primary text-white z-50 flex flex-col pt-4 pb-10 px-6 
            overflow-y-auto border-x border-white/10 transition-transform duration-300 ease-in-out
            ${isRtl ? 'right-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]' : 'left-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]'}
            ${!isOpen ? (isRtl ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0'}
            md:translate-x-0 md:flex md:shadow-none
        `}>
            {/* Mobile Close Button */}
            <button 
                onClick={onClose}
                className="md:hidden absolute top-6 ltr:right-6 rtl:left-6 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-white"
            >
                <X size={20} />
            </button>

            <div className="pt-2 pb-1 mb-4 border-b border-white/5 flex justify-center">
                <NavLink to="/" className="transition-transform hover:scale-105 active:scale-95">
                    <Logo className="h-16" isWhite />
                </NavLink>
            </div>

            <div className="space-y-1 flex-grow">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-4">{t('sidebar.nav')}</p>
                {links.map(link => {
                    const badgeCount = getBadgeType(link.path);
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => onClose?.()}
                            end={link.path === '/dashboard' || link.path === '/admin/dashboard' || link.path === '/driver/dashboard'}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold group relative
                                ${isActive 
                                    ? 'bg-white text-brand-primary shadow-xl shadow-brand-primary/20' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <link.icon size={20} className="transition-transform group-hover:scale-110" />
                            <span className="text-sm flex-grow">{link.name}</span>
                            {badgeCount > 0 && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-sm shadow-red-900/50"></span>
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={logout}
                  className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-white/60 hover:text-red-400 hover:bg-red-400/5 transition-all font-bold group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
                    <span>{t('sidebar.signOut')}</span>
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>
            {sidebarContent}
        </>
    );
};

export default Sidebar;
