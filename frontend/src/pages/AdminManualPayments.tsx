import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import AlertModal from '../components/AlertModal';
import { 
    Search, Filter, ExternalLink, CheckCircle2, XCircle, 
    Smartphone, Banknote, CreditCard, Loader2
} from 'lucide-react';

const AdminManualPayments: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'vodafone' | 'instapay' | 'fawry'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: string;
        action: 'complete' | 'reject';
    }>({ isOpen: false, id: '', action: 'complete' });

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sales');
            const manualSales = response.data.filter((s: any) => 
                ['vodafone', 'instapay', 'fawry'].includes(s.payment_method)
            );
            setSales(manualSales);
        } catch (error) {
            console.error("Error fetching manual payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
        api.patch('/notifications/read-type/manual_payment').catch(err => console.error(err));
    }, []);

    const handleAction = async () => {
        const { id, action } = confirmModal;
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        
        try {
            setProcessingId(id);
            await api.patch(`/sales/${id}/${action}`);
            await fetchSales();
        } catch (error) {
            console.error(`Error ${action}ing sale:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredSales = sales.filter(s => {
        const matchesFilter = filter === 'all' || s.payment_method === filter;
        const customerName = (s.customer?.name || '').toLowerCase();
        const vehicleInfo = `${s.vehicle?.make_en} ${s.vehicle?.model_en} ${s.vehicle?.make_ar} ${s.vehicle?.model_ar}`.toLowerCase();
        const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || vehicleInfo.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'vodafone': return <Smartphone className="text-red-500" size={16} />;
            case 'instapay': return <Banknote className="text-purple-500" size={16} />;
            case 'fawry': return <CreditCard className="text-yellow-600" size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    return (
        <DashboardLayout role="admin" title={t('admin.manualPayments.title')} subtitle={t('admin.manualPayments.subtitle')}>
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {(['all', 'vodafone', 'instapay', 'fawry'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border ${
                                filter === f 
                                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-brand-primary hover:text-brand-primary'
                            }`}
                        >
                            {t(`admin.manualPayments.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                        </button>
                    ))}
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('filters.searchPlaceholder')}
                        className="w-full bg-white border border-slate-100 ltr:pl-12 rtl:pr-12 pr-4 py-4 rounded-2xl outline-none focus:border-brand-primary shadow-sm transition-all font-bold text-slate-700"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white shadow-sm border border-slate-100 rounded-[40px] overflow-hidden">
                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                        <p className="text-slate-400 font-bold">{t('admin.fleet.syncing')}</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('common.noData')}</h3>
                        <p className="text-slate-400 font-medium">{t('admin.sold.noData')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left ltr:text-left rtl:text-right table-auto border-collapse min-w-[900px]">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                    <th className="px-8 py-6">{t('admin.table.customer')}</th>
                                    <th className="px-8 py-6">{t('admin.table.vehicle')}</th>
                                    <th className="px-8 py-6">{t('admin.table.price')}</th>
                                    <th className="px-8 py-6">{t('admin.manualPayments.filter' + filter.charAt(0).toUpperCase() + filter.slice(1))}</th>
                                    <th className="px-8 py-6">{t('admin.table.status')}</th>
                                    <th className="px-8 py-6 text-center">{t('admin.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                                                    {(sale.customer?.name || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{sale.customer?.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{sale.customer?.phone || 'No Phone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {isRtl ? (sale.vehicle?.make_ar || sale.vehicle?.make_en) : (sale.vehicle?.make_en || sale.vehicle?.make_ar)}
                                                </p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                                    {isRtl ? (sale.vehicle?.model_ar || sale.vehicle?.model_en) : (sale.vehicle?.model_en || sale.vehicle?.model_ar)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-brand-primary whitespace-nowrap">
                                            {Number(sale.final_price).toLocaleString()} EGP
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-fit">
                                                {getMethodIcon(sale.payment_method)}
                                                <span className="text-xs font-bold text-slate-600 capitalize">
                                                    {t(`admin.manualPayments.filter${sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}`)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                                sale.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                                sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                                {t(`status.${sale.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {sale.receipt_url ? (
                                                    <a 
                                                        href={sale.receipt_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all flex items-center gap-2"
                                                        title={t('admin.manualPayments.viewReceipt')}
                                                    >
                                                        <ExternalLink size={18} />
                                                        <span className="text-[10px] font-black uppercase hidden lg:block">{t('admin.manualPayments.viewReceipt')}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 italic">{t('admin.manualPayments.noReceipt')}</span>
                                                )}

                                                {sale.status === 'pending' && (
                                                    <div className="flex items-center gap-2 ml-4 ltr:border-l rtl:border-r border-slate-100 ltr:pl-4 rtl:pr-4">
                                                        <button 
                                                            onClick={() => setConfirmModal({ isOpen: true, id: sale.id, action: 'complete' })}
                                                            disabled={processingId === sale.id}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50"
                                                            title={t('admin.manualPayments.approve')}
                                                        >
                                                            {processingId === sale.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => setConfirmModal({ isOpen: true, id: sale.id, action: 'reject' })}
                                                            disabled={processingId === sale.id}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                                            title={t('admin.manualPayments.reject')}
                                                        >
                                                            {processingId === sale.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AlertModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleAction}
                type={confirmModal.action === 'complete' ? 'success' : 'error'}
                title={t('common.confirm')}
                message={t(`admin.manualPayments.confirm${confirmModal.action === 'complete' ? 'Approve' : 'Reject'}`)}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
            />
        </DashboardLayout>
    );
};

export default AdminManualPayments;
