import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car, ShoppingBag, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

interface Purchase {
    id: string;
    vehicleId: string;
    vehicle: {
        make: string;
        make_ar?: string;
        model: string;
        model_ar?: string;
        year: number;
        images: string[];
    };
    final_price: number;
    status: string;
    sale_date: string;
}

const UserPurchases: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await api.get('/sales/my-sales');
                setPurchases(response.data);
            } catch (error) {
                console.error('Error fetching purchases:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <DashboardLayout role="customer" title={t('userDashboard.purchases.title')}>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{t('userDashboard.purchases.title')}</h1>
                    <p className="text-slate-500 font-medium mt-2">{t('userDashboard.purchases.subtitle')}</p>
                </header>

                {loading ? (
                    <div className="grid place-items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                ) : purchases.length > 0 ? (
                    <div className="grid gap-6">
                        {purchases.map((purchase) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={purchase.id}
                                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100">
                                    {purchase.vehicle?.images?.[0] ? (
                                        <img src={purchase.vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Car size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow space-y-2">
                                    <h3 className="text-xl font-black text-slate-900">
                                        {isRtl ? (purchase.vehicle?.make_ar || purchase.vehicle?.make) : (purchase.vehicle?.make || purchase.vehicle?.make_ar)} {' '}
                                        {isRtl ? (purchase.vehicle?.model_ar || purchase.vehicle?.model) : (purchase.vehicle?.model || purchase.vehicle?.model_ar)}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(purchase.sale_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                        <span className="flex items-center gap-1"><ShoppingBag size={14} /> {Number(purchase.final_price).toLocaleString()} {t('common.currency')}</span>
                                    </div>
                                </div>
                                <div className={`px-6 py-2 rounded-xl border font-black text-xs uppercase tracking-widest ${getStatusColor(purchase.status)}`}>
                                    {t(`status.${purchase.status.toLowerCase()}`)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('userDashboard.noPurchases')}</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">{t('userDashboard.purchases.explore')}</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserPurchases;
