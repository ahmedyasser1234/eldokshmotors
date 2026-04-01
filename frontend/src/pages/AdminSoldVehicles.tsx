import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Loader2, Eye, ShoppingBag, Calendar, User, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { normalizeImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const AdminSoldVehicles: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSoldVehicles = async () => {
        try {
            setLoading(true);
            const [salesRes, vehiclesRes] = await Promise.all([
                api.get('/sales'),
                api.get('/vehicles')
            ]);
            
            const completedSales = salesRes.data.filter((s: any) => s.status === 'completed');
            const vehicleList = Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data : (Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
            const soldVehicles = vehicleList.filter((v: any) => v.status === 'sold');

            // Merge manual sold vehicles with platform sales
            const mergedSales = soldVehicles.map((v: any) => {
                const existingSale = completedSales.find((s: any) => s.vehicle?.id === v.id || s.vehicleId === v.id);
                if (existingSale) return existingSale;
                
                return {
                    id: `manual-${v.id}`,
                    vehicle: v,
                    customer: { name: t('admin.sold.offline') || 'تم البيع داخلياً (بالمعرض)' },
                    final_price: v.sale_price,
                    updated_at: v.updated_at || v.created_at,
                    status: 'completed'
                };
            });

            // Add any completed sales whose vehicles might have been soft-deleted
            completedSales.forEach((s: any) => {
                if (!mergedSales.find((m: any) => m.id === s.id)) {
                    mergedSales.push(s);
                }
            });

            // Sort newest first
            mergedSales.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

            setSales(mergedSales);
        } catch (error) {
            console.error("Error fetching sold vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoldVehicles();
    }, []);

    return (
        <DashboardLayout role="admin" title={t('sidebar.soldVehicles')}>
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{t('admin.sold.title')}</h1>
                <div className="flex items-center gap-3">
                    <span className="w-12 h-1 bg-emerald-500 rounded-full"></span>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('admin.sold.subtitle')}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{t('admin.sold.archive')}</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[3rem] p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('common.noData')}</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">{t('admin.sold.noData')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sales.map(sale => (
                        <motion.div 
                            key={sale.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col relative"
                        >
                            {/* Sold Badge */}
                            <div className="absolute top-6 right-6 z-10">
                                <div className="px-5 py-2 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                                    <ShoppingBag size={12} />
                                    {t('status.completed')}
                                </div>
                            </div>

                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={normalizeImageUrl(sale.vehicle?.image_urls?.[0]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'} 
                                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" 
                                    alt={sale.vehicle?.model_en}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                            </div>

                            <div className="p-8 space-y-6 flex-grow flex flex-col">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                        {t('common.make_ar') === 'الماركة (بالعربي)' ? (sale.vehicle?.make_ar || sale.vehicle?.make_en) : (sale.vehicle?.make_en || sale.vehicle?.make_ar)} {' '}
                                        {t('common.model_ar') === 'الموديل (بالعربي)' ? (sale.vehicle?.model_ar || sale.vehicle?.model_en) : (sale.vehicle?.model_en || sale.vehicle?.model_ar)}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{sale.vehicle?.year}</span>
                                        <span className="text-[9px] text-emerald-600 font-black tracking-widest uppercase">VIN: {sale.vehicle?.vin?.slice(0, 8) || 'VERIFIED'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 py-6 border-y border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.sold.buyer')}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{sale.customer?.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.sold.soldOn')}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">
                                            {new Date(sale.updated_at || sale.sale_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('admin.sold.price')}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{Number(sale.final_price).toLocaleString()} <span className="text-[9px] text-slate-400">EGP</span></span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/vehicles/${sale.vehicle?.id}`)}
                                    className="w-full py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                                >
                                    <Eye size={14} />
                                    <span>{t('admin.fleet.viewDetails')}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSoldVehicles;
