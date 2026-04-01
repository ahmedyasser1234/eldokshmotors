import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { 
    Users, 
    Car, 
    Calendar, 
    TrendingUp, 
    MoreVertical
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [statsData, setStatsData] = useState({
        fleet: 0,
        users: 0,
        reservations: 0,
        revenue: 0
    });
    const [recentReservations, setRecentReservations] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [vRes, uRes, sRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/users'),
                    api.get('/sales')
                ]);

                const totalRev = sRes.data.reduce((acc: number, r: any) => acc + Number(r.final_price || 0), 0);
                
                setStatsData({
                    fleet: vRes.data.total || (Array.isArray(vRes.data) ? vRes.data.length : 0),
                    users: uRes.data.length,
                    reservations: sRes.data.length,
                    revenue: totalRev
                });

                // Sort by date newest first
                const sortedSales = sRes.data.sort((a: any, b: any) => 
                    new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
                );
                setRecentReservations(sortedSales.slice(0, 5));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchDashboardData();
    }, []);

    const stats = [
        { label: t('admin.dashboard.stats.revenue'), value: `${statsData.revenue.toLocaleString()} EGP`, change: '+0%', icon: TrendingUp, color: 'emerald' },
        { label: t('admin.dashboard.stats.users'), value: statsData.users.toString(), change: `+${statsData.users}`, icon: Users, color: 'blue' },
        { label: t('admin.dashboard.stats.fleet'), value: statsData.fleet.toString(), change: `+${statsData.fleet}`, icon: Car, color: 'purple' },
        { label: t('admin.dashboard.stats.sold'), value: statsData.reservations.toString(), change: `+${statsData.reservations}`, icon: Calendar, color: 'orange' },
    ];

    return (
        <DashboardLayout role="admin" title={t('admin.dashboard.title')}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white shadow-sm border border-slate-100 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'text-green-600 bg-green-500/10' : 'text-slate-500 bg-slate-100/50'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Fleet Activity / Table */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-slate-800">{t('admin.dashboard.activity.title')}</h3>
                        <p className="text-sm text-slate-500">{t('admin.dashboard.activity.subtitle')}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left ltr:text-left rtl:text-right table-auto border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                <th className="px-8 py-6">{t('sidebar.fleet')}</th>
                                <th className="px-8 py-6">{t('admin.dashboard.activity.status')}</th>
                                <th className="px-8 py-6">{t('sidebar.customers')}</th>
                                <th className="px-8 py-6">{t('sidebar.revenue')}</th>
                                <th className="px-8 py-6">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentReservations.map((res, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Car size={24} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 whitespace-nowrap">{t('common.make_ar') === 'الماركة (بالعربي)' ? (res.vehicle?.make_ar || res.vehicle?.make_en) : (res.vehicle?.make_en || res.vehicle?.make_ar)} {t('common.model_ar') === 'الموديل (بالعربي)' ? (res.vehicle?.model_ar || res.vehicle?.model_en) : (res.vehicle?.model_en || res.vehicle?.model_ar)}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap">VIN: {res.vehicle?.vin?.slice(0, 8) || 'VERIFIED'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap ${
                                            res.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                            res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {t(`status.${res.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-medium text-slate-700 whitespace-nowrap">{res.customer?.name || res.user?.name || 'Anonymous'}</td>
                                    <td className="px-8 py-6 font-black text-brand-primary whitespace-nowrap">{Number(res.final_price).toLocaleString()} EGP</td>

                                    <td className="px-8 py-6">
                                        <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {recentReservations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold">
                                        {t('common.noData')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
