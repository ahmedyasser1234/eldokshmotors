import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

interface Payment {
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    reference?: string;
}

const UserPayments: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await api.get('/payments/my-payments'); 
                const mappedPayments = response.data.map((p: any) => ({
                    id: p.id,
                    amount: p.amount,
                    method: p.payment_method,
                    status: p.payment_status,
                    createdAt: p.created_at,
                    reference: p.transaction_id || p.reference_id,
                }));
                setPayments(mappedPayments);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <DashboardLayout role="customer" title={t('userDashboard.payments.title')}>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{t('userDashboard.payments.title')}</h1>
                    <p className="text-slate-500 font-medium mt-2">{t('userDashboard.payments.subtitle')}</p>
                </header>

                {loading ? (
                    <div className="grid place-items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                ) : payments.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.table.reference')}</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('userDashboard.payments.method')}</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.table.date')}</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.table.price')}</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((payment) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={payment.id} 
                                        className="hover:bg-slate-50/30 transition-colors"
                                    >
                                        <td className="px-8 py-6 font-black text-slate-900">#{payment.reference || payment.id.substring(0, 8)}</td>
                                        <td className="px-8 py-6 font-bold text-slate-600 uppercase text-xs tracking-tight">{payment.method}</td>
                                        <td className="px-8 py-6 text-slate-500 font-bold text-sm tracking-tight">{new Date(payment.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                        <td className="px-8 py-6 font-black text-brand-primary tracking-tighter">{payment.amount.toLocaleString()} {t('common.currency')}</td>
                                        <td className="px-8 py-6">
                                            <div className={`px-4 py-1.5 rounded-lg border font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 ${getStatusColor(payment.status)}`}>
                                                {payment.status.toLowerCase() === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {t(`status.${payment.status.toLowerCase()}`)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Wallet size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('userDashboard.payments.noTransactions')}</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">{t('userDashboard.payments.historyMsg')}</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserPayments;
