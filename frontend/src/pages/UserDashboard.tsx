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
        pending: 0,
        saved: 0
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
                    pending: pendingCount,
                    saved: 5 // Mock for now
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
        { label: t('userDashboard.stats.savedCars'), value: stats.saved.toString(), icon: Car, color: 'purple' },
    ];

    return (
        <DashboardLayout 
            role="customer" 
            title={t('userDashboard.title')} 
            subtitle={t('userDashboard.subtitle')}
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {dashboardStats.map((stat, i) => (
                    <div key={i} className="bg-white shadow-sm border border-slate-100 p-8 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl ${stat.color === 'brand' ? 'bg-brand-primary/10 text-brand-primary' : `bg-${stat.color}-500/10 text-${stat.color}-500`} flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={14} className="text-slate-400" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        
                        {/* Decorative background element */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${stat.color === 'brand' ? 'bg-brand-primary' : `bg-${stat.color}-500`}`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-slate-800">{t('userDashboard.recentActivity')}</h3>
                        <button 
                            onClick={() => navigate('/dashboard/purchases')}
                            className="text-sm text-brand-primary font-black flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                        >
                            {t('userDashboard.viewAll')} <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white shadow-sm border border-slate-100 rounded-[40px] overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse text-slate-400 font-bold">
                                {t('fleet.loading')}
                            </div>
                        ) : sales.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package size={32} className="text-slate-200" />
                                </div>
                                <p className="text-slate-500 font-bold">{t('userDashboard.noPurchases')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left ltr:text-left rtl:text-right table-fixed border-collapse">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                            <th className="px-8 py-6">{t('admin.table.vehicle')}</th>
                                            <th className="px-8 py-6">{t('admin.table.price')}</th>
                                            <th className="px-8 py-6">{t('admin.table.status')}</th>
                                            <th className="px-8 py-6">{t('admin.table.date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sales.map((sale, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                                            {sale.vehicle?.images?.[0] ? (
                                                                <img src={sale.vehicle.images[0]} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Car size={20} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">
                                                                {isRtl ? (sale.vehicle?.make_ar || sale.vehicle?.make_en) : (sale.vehicle?.make_en || sale.vehicle?.make_ar)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black">
                                                                {isRtl ? (sale.vehicle?.model_ar || sale.vehicle?.model_en) : (sale.vehicle?.model_en || sale.vehicle?.model_ar)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-brand-primary">
                                                    {Number(sale.final_price).toLocaleString()} {t('common.currency')}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                                        sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                        sale.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                        {t(`status.${sale.status}`)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 text-sm font-medium">
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

                {/* Account Summary / Verification */}
                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-slate-800 px-2">{t('sidebar.profile')}</h3>
                    
                    <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-[40px] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-[0.03] blur-3xl rounded-full -mr-16 -mt-16"></div>
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 rounded-[32px] bg-brand-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-brand-primary/20 mb-6 group hover:scale-105 transition-transform">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-1">{user?.name}</h4>
                            <p className="text-sm text-slate-400 font-medium">{user?.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-5 group hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer">
                                <div className="ltr:text-left rtl:text-right flex-grow">
                                    <p className="text-base font-black text-slate-900 uppercase">{t('userDashboard.profile.verified')}</p>
                                    <p className="text-sm text-slate-400 font-bold">{t('userDashboard.profile.premium')}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-primary hover:shadow-xl hover:shadow-brand-primary/20 transition-all">
                            {t('sidebar.settings')}
                        </button>
                    </div>

                    {/* Support Card */}
                    <div className="bg-brand-primary p-8 rounded-[40px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 blur-3xl rounded-full -ml-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-lg font-black mb-2 relative z-10">{t('about.visionTitle')}</h4>
                        <p className="text-white/70 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                            {t('about.visionDesc')}
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/messages')}
                            className="px-6 py-3 bg-white text-brand-primary text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all relative z-10"
                        >
                            {t('userDashboard.profile.support')}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;
