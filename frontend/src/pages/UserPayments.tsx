import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
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
        const fetchData = async () => {
            try {
                const [paymentsRes, salesRes] = await Promise.all([
                    api.get('/payments/my-payments'),
                    api.get('/sales/my-sales')
                ]);

                // Map existing payment records
                const existingPayments = paymentsRes.data.map((p: any) => ({
                    id: p.id,
                    amount: p.amount,
                    method: p.payment_method,
                    status: p.payment_status,
                    createdAt: p.created_at,
                    reference: p.transaction_id || p.reference_id,
                    saleId: p.reference_type === 'sale' ? p.reference_id : null
                }));

                // Map sales that might not have a payment record yet
                const salesAsPayments = salesRes.data
                    .filter((s: any) => {
                        // Only include sales that are NOT rejected
                        const status = (s.status || '').toLowerCase();
                        if (status === 'rejected' || status === 'cancelled') return false;
                        
                        // Check if this sale already has a payment record in existingPayments
                        return !existingPayments.find((p: any) => p.saleId === s.id);
                    })
                    .map((s: any) => ({
                        id: `s-${s.id}`,
                        amount: s.final_price,
                        method: s.payment_method || 'N/A',
                        status: s.status,
                        createdAt: s.sale_date,
                        reference: s.id.substring(0, 8),
                        saleId: s.id
                    }));

                // Merge and sort
                const combined = [...existingPayments, ...salesAsPayments].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setPayments(combined);
            } catch (error) {
                console.error('Error fetching payment data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <table className="w-full text-left ltr:text-left rtl:text-right border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/30">
                                    <th className="px-10 py-8">{t('admin.table.reference')}</th>
                                    <th className="px-10 py-8">{t('userDashboard.payments.method')}</th>
                                    <th className="px-10 py-8">{t('admin.table.date')}</th>
                                    <th className="px-10 py-8">{t('admin.table.price')}</th>
                                    <th className="px-10 py-8">{t('admin.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((payment) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={payment.id} 
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="px-3 py-1 bg-slate-100 rounded-lg inline-block font-mono text-[10px] text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                                                #{payment.reference || payment.id.substring(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 font-black text-slate-600 uppercase text-xs tracking-tight">{payment.method}</td>
                                        <td className="px-10 py-8 text-slate-400 font-bold text-sm tracking-tight">{new Date(payment.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                        <td className="px-10 py-8 font-black text-brand-primary text-lg tracking-tighter">
                                            {payment.amount.toLocaleString()} <span className="text-[10px] opacity-50">{t('common.currency')}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={`px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-[0.15em] inline-flex items-center gap-2 ${getStatusColor(payment.status)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${payment.status.toLowerCase() === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
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
