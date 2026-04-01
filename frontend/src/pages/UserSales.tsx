import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car, History, Clock, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

interface SaleRequest {
    id: string;
    make: string;
    make_ar?: string;
    model: string;
    model_ar?: string;
    year: number;
    expectedPrice: number;
    status: string;
    createdAt: string;
    images?: string[];
}

const UserSales: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [requests, setRequests] = useState<SaleRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/purchase-requests/my-requests');
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching sales requests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'reviewed': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <DashboardLayout role="customer" title={t('userDashboard.sales.title')}>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{t('userDashboard.sales.title')}</h1>
                    <p className="text-slate-500 font-medium mt-2">{t('userDashboard.sales.subtitle')}</p>
                </header>

                {loading ? (
                    <div className="grid place-items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid gap-6">
                        {requests.map((request) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={request.id}
                                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
                                    <Car size={32} />
                                </div>
                                <div className="flex-grow space-y-2">
                                    <h3 className="text-xl font-black text-slate-900">
                                        {isRtl ? (request.make_ar || request.make) : (request.make || request.make_ar)} {' '}
                                        {isRtl ? (request.model_ar || request.model) : (request.model || request.model_ar)} ({request.year})
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(request.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                        <span className="flex items-center gap-1"><FileText size={14} /> {request.expectedPrice.toLocaleString()} {t('common.currency')}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-6 py-2 rounded-xl border font-black text-xs uppercase tracking-widest ${getStatusColor(request.status)}`}>
                                        {t(`status.${request.status.toLowerCase()}`)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <History size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('userDashboard.sales.noRequests')}</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">{t('userDashboard.sales.description')}</p>
                        <button 
                            onClick={() => window.location.href = '/sell-car'}
                            className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest mt-6"
                        >
                            {t('userDashboard.sales.button')}
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserSales;
