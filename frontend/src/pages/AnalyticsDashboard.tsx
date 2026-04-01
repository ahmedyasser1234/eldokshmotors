import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Car, DollarSign, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState({
    revenue: 0,
    bookings: 0,
    fleet: 0,
    customers: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<{name: string, value: number, height: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [vRes, uRes, sRes, pRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/users'),
          api.get('/sales'),
          api.get('/purchase-requests') // Added purchase requests 
        ]);

        const completedSales = sRes.data.filter((s: any) => s.status === 'completed');
        const vehicleList = Array.isArray(vRes.data.data) ? vRes.data.data : (Array.isArray(vRes.data) ? vRes.data : []);
        const soldVehicles = vehicleList.filter((v: any) => v.status === 'sold');

        const mergedSales = soldVehicles.map((v: any) => {
            const existingSale = completedSales.find((s: any) => s.vehicle?.id === v.id || s.vehicleId === v.id);
            if (existingSale) return existingSale;
            return {
                id: `manual-${v.id}`,
                final_price: v.sale_price,
                updated_at: v.updated_at || v.created_at,
                status: 'completed'
            };
        });

        completedSales.forEach((s: any) => {
            if (!mergedSales.find((m: any) => m.id === s.id)) {
                mergedSales.push(s);
            }
        });

        // Calculate revenue from all sold vehicles
        const totalRev = mergedSales.reduce((acc: number, r: any) => acc + Number(r.final_price || 0), 0);

        // Calculate monthly distribution for the last 6 months
        const last6Months = Array.from({length: 6}).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                monthStr: d.toLocaleString('en-US', { month: 'short' }),
                monthNum: d.getMonth(),
                yearNum: d.getFullYear(),
                value: 0
            };
        }).reverse();

        mergedSales.forEach((sale: any) => {
            const date = new Date(sale.updated_at || sale.sale_date || sale.created_at);
            const rMonth = date.getMonth();
            const rYear = date.getFullYear();
            const monthObj = last6Months.find(m => m.monthNum === rMonth && m.yearNum === rYear);
            if (monthObj) {
                monthObj.value += Number(sale.final_price || 0);
            }
        });

        const maxVal = Math.max(...last6Months.map(m => m.value), 1);
        setMonthlyRevenue(last6Months.map(m => ({ 
            name: m.monthStr, 
            value: m.value, 
            height: Math.max((m.value / maxVal) * 100, 5) // Give a minimum 5% height to show the bar
        })));

        setStatsData({
          revenue: totalRev,
          bookings: pRes.data.length, // This matches 'عروض الشراء'
          fleet: vRes.data.total !== undefined ? vRes.data.total : vehicleList.length,
          customers: uRes.data.length
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { label: t('admin.dashboard.stats.revenue'), value: `${statsData.revenue.toLocaleString()} EGP`, trend: '+0%', icon: DollarSign, color: 'text-green-500' },
    { label: t('sidebar.sellOffers') || t('sidebar.bookings'), value: statsData.bookings.toString(), trend: '+0%', icon: Calendar, color: 'text-amber-500' },
    { label: t('sidebar.fleet'), value: statsData.fleet.toString(), trend: '0%', icon: Car, color: 'text-blue-500' },
    { label: t('sidebar.customers'), value: statsData.customers.toString(), trend: '+0%', icon: Users, color: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Analytics & Insights">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="admin" 
      title={t('admin.analytics.title')} 
      subtitle={t('admin.analytics.subtitle')}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} className="text-slate-800" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white/50 border border-slate-100 shadow-sm ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-slate-500 font-bold">{stat.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-black bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">
                  <TrendingUp size={14} />
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="text-brand-primary" />
                {t('admin.analytics.monthlyRevenue')}
              </h3>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 mt-12 pb-8 border-b border-slate-100">
                {monthlyRevenue.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-4 group h-full relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] md:text-xs font-black px-3 py-2 rounded-xl whitespace-nowrap z-10 pointer-events-none shadow-xl shadow-slate-900/20">
                            {item.value.toLocaleString()} <span className="text-[8px] opacity-60">EGP</span>
                        </div>
                        
                        {/* Bar Segment */}
                        <div className="w-full relative flex justify-center h-full items-end">
                            <div 
                                style={{ height: `${item.height}%` }}
                                className="w-full max-w-[48px] bg-brand-primary/10 hover:bg-brand-primary transition-all duration-500 rounded-t-xl group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-brand-primary/20 to-transparent"></div>
                            </div>
                        </div>

                        {/* Label */}
                        <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest">{item.name}</p>
                    </div>
                ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm p-8 rounded-[32px]">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{t('admin.analytics.fleetDistribution')}</h3>
            <div className="space-y-6">
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                 <p className="text-slate-600 text-sm font-bold leading-relaxed relative z-10">
                   {t('admin.analytics.fleetSummary', { fleet: statsData.fleet, bookings: statsData.bookings })}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
