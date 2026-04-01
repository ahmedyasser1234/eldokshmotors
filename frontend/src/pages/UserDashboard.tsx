import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { 
    Car, CreditCard, ChevronRight, 
    Clock, CheckCircle2, Package, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const UserDashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl';
    const { user } = useAuthStore();

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        purchases: 0,
        spent: 0,
        pending: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/sales/my-sales');
                const mySales = response.data;
                setSales(mySales);

                // Calculate stats
                const totalSpent = mySales.reduce((acc: number, s: any) => acc + Number(s.final_price || 0), 0);
                const pendingCount = mySales.filter((s: any) => s.status === 'pending').length;

                setStats({
                    purchases: mySales.length,
                    spent: totalSpent,
                    pending: pendingCount
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dashboardStats = [
        { label: t('userDashboard.stats.totalSpent'), value: `${stats.spent.toLocaleString()} ${t('common.currency')}`, icon: CreditCard, color: 'brand' },
        { label: t('userDashboard.stats.totalPurchases'), value: stats.purchases.toString(), icon: Package, color: 'blue' },
        { label: t('userDashboard.stats.pendingRequests'), value: stats.pending.toString(), icon: Clock, color: 'orange' },
    ];

    return (
        <DashboardLayout 
            role="customer" 
            title={t('userDashboard.title')} 
            subtitle={t('userDashboard.subtitle')}
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dashboardStats.map((stat, i) => (
                    <div key={i} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,168,232,0.1)] transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${stat.color === 'brand' ? 'bg-brand-primary/10 text-brand-primary' : `bg-${stat.color}-500/10 text-${stat.color}-500`} flex items-center justify-center`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={14} className="text-slate-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">{stat.value}</p>
                        
                        {/* Decorative background element */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700 ${stat.color === 'brand' ? 'bg-brand-primary' : `bg-${stat.color}-500`}`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('userDashboard.recentActivity')}</h3>
                        <button 
                            onClick={() => navigate('/dashboard/purchases')}
                            className="px-6 py-2 bg-slate-50 hover:bg-brand-primary/5 text-[10px] text-brand-primary font-black flex items-center gap-2 transition-all uppercase tracking-widest rounded-xl"
                        >
                            {t('userDashboard.viewAll')} <ChevronRight size={14} className="rtl:rotate-180" />
                        </button>
                    </div>

                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[3rem] overflow-hidden">
                        {loading ? (
                            <div className="p-24 text-center animate-pulse">
                                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4"></div>
                                <div className="h-4 bg-slate-100 w-32 mx-auto rounded"></div>
                            </div>
                        ) : sales.length === 0 ? (
                            <div className="p-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Package size={40} className="text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t('userDashboard.noPurchases')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left ltr:text-left rtl:text-right border-collapse">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/30">
                                            <th className="px-10 py-8">{t('admin.table.vehicle')}</th>
                                            <th className="px-10 py-8">{t('admin.table.price')}</th>
                                            <th className="px-10 py-8">{t('admin.table.status')}</th>
                                            <th className="px-10 py-8 text-right rtl:text-left">{t('admin.table.date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sales.map((sale, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                                                            {sale.vehicle?.images?.[0] ? (
                                                                <img src={sale.vehicle.images[0]} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Car size={24} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                                                                {isRtl ? (sale.vehicle?.make_ar || sale.vehicle?.make_en) : (sale.vehicle?.make_en || sale.vehicle?.make_ar)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                                                                {isRtl ? (sale.vehicle?.model_ar || sale.vehicle?.model_en) : (sale.vehicle?.model_en || sale.vehicle?.model_ar)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 font-black text-brand-primary text-lg">
                                                    {Number(sale.final_price).toLocaleString()} <span className="text-[10px] opacity-50">{t('common.currency')}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl flex items-center gap-2 w-fit ${
                                                        sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                        sale.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                            sale.status === 'completed' ? 'bg-emerald-500' : 
                                                            sale.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`} />
                                                        {t(`status.${sale.status}`)}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-slate-400 text-xs font-bold text-right rtl:text-left">
                                                    {new Date(sale.sale_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Summary / Profile */}
                <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase px-4">{t('sidebar.profile')}</h3>
                    
                    <div className="bg-white shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-slate-50 rounded-[3rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary opacity-[0.03] blur-3xl rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
                        
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="relative mb-6">
                                <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-slate-900/20 group-hover:rotate-6 transition-transform duration-500">
                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-1">{user?.name}</h4>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{user?.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50/50 rounded-3xl flex items-center gap-5 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default">
                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/5">
                                    <Clock size={22} />
                                </div>
                                <div className="ltr:text-left rtl:text-right flex-grow">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('userDashboard.profile.verified')}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase italic">{t('userDashboard.profile.premium')}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard/settings')}
                            className="w-full mt-8 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] hover:bg-brand-primary hover:shadow-[0_15px_40px_rgba(0,168,232,0.3)] transition-all duration-500"
                        >
                            {t('sidebar.settings')}
                        </button>
                    </div>

                    {/* Quick Action / Support */}
                    <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-brand-primary opacity-10 blur-3xl rounded-full -ml-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="text-xl font-black mb-4 relative z-10 leading-tight uppercase tracking-tight">{t('about.visionTitle')}</h4>
                        <p className="text-slate-400 text-xs font-bold mb-8 relative z-10 leading-relaxed uppercase tracking-tighter">
                            {t('about.visionDesc')}
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/messages')}
                            className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300 relative z-10 flex items-center justify-center gap-3"
                        >
                            <span className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
                            {t('userDashboard.profile.support')}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;
