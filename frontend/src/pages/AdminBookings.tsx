import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, XCircle, User, Mail, Phone, Calendar, Hash, X, Eye, Trash2, ChevronLeft, ChevronRight, CreditCard, FileText } from 'lucide-react';
import AlertModal from '../components/AlertModal';

const AdminBookings: React.FC = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Alert/Confirm State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'error' | 'success' | 'warning' | 'info';
        title?: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'error', message: '' });

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bookings.length / itemsPerPage);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sales');
            const sortedData = response.data.sort((a: any, b: any) => 
                new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
            );
            setBookings(sortedData);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        api.patch('/notifications/read-type/sale').catch(err => console.error(err));
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'pending': return <Clock size={16} className="text-amber-500" />;
            case 'rejected': return <XCircle size={16} className="text-rose-500" />;
            default: return <XCircle size={16} className="text-slate-500" />;
        }
    };

    const handleAction = async (id: string, action: 'complete' | 'reject') => {
        try {
            await api.patch(`/sales/${id}/${action}`);
            fetchBookings();
        } catch (error) {
            console.error(`Error ${action}ing sale:`, error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: `Failed to ${action} the request.`
            });
        }
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setAlertConfig({
            isOpen: true,
            type: 'warning',
            title: t('common.confirm'),
            message: t('admin.fleet.deleteConfirm'),
            onConfirm: executeDelete
        });
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        try {
            await api.delete(`/sales/${itemToDelete}`);
            fetchBookings();
            if (currentBookings.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Error deleting sale:', error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: t('admin.fleet.deleteFailed')
            });
        }
    };

    return (
        <DashboardLayout role="admin" title={t('sidebar.bookings')}>
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm relative">
                <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight text-slate-800">{t('sidebar.bookings')}</h3>
                        <p className="text-sm text-slate-500 font-medium">{t('admin.dashboard.activity.subtitle')}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left ltr:text-left rtl:text-right table-auto border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100 bg-slate-50/30">
                                <th className="px-10 py-8">{t('admin.table.reference')}</th>
                                <th className="px-10 py-8">{t('admin.table.vehicle')}</th>
                                <th className="px-10 py-8">{t('admin.table.customer')}</th>
                                <th className="px-10 py-8">{t('admin.table.date')}</th>
                                <th className="px-10 py-8">{t('admin.table.status')}</th>
                                <th className="px-10 py-8 text-right">{t('admin.table.price')}</th>
                                <th className="px-10 py-8 text-center">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="text-slate-500 font-black uppercase tracking-widest text-xs">{t('common.loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="text-slate-500 font-bold opacity-50 text-xl">{t('common.noData')}</div>
                                    </td>
                                </tr>
                            ) : (
                                currentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="px-3 py-1 bg-slate-100 rounded-lg inline-block font-mono text-[10px] text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                                                #{booking.id.slice(0, 8).toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="font-black text-slate-800">
                                                {t('common.make_ar') === 'الماركة (بالعربي)' ? (booking.vehicle?.make_ar || booking.vehicle?.make_en) : (booking.vehicle?.make_en || booking.vehicle?.make_ar)} {' '}
                                                {t('common.model_ar') === 'الموديل (بالعربي)' ? (booking.vehicle?.model_ar || booking.vehicle?.model_en) : (booking.vehicle?.model_en || booking.vehicle?.model_ar)}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-60">VIN: {booking.vehicle?.vin?.slice(0, 8) || 'VERIFIED'}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="font-bold text-slate-700">{booking.customer?.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{booking.customer?.email}</div>
                                        </td>
                                        <td className="px-10 py-8 text-sm text-slate-500 font-bold">
                                            {new Date(booking.sale_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-50" />
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(booking.status)}
                                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t(`status.${booking.status}`)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right whitespace-nowrap font-black text-brand-primary text-lg">
                                            {Number(booking.final_price).toLocaleString()} <span className="text-[10px] opacity-60">EGP</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                                                    title={t('admin.actions.view')}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(booking.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    title={t('admin.actions.reject')}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-sm font-bold shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10 w-full">
                        <span className="text-slate-500 order-2 sm:order-1">
                            {t('fleet.showing')} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, bookings.length)} / {bookings.length}
                        </span>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all ltr"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-4 py-2 bg-brand-primary/5 text-brand-primary rounded-xl font-black">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all ltr"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            <AnimatePresence>
                {showModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 bg-brand-primary text-white flex justify-between items-start">
                                <div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full inline-block font-mono text-[10px] text-white/80 mb-4 tracking-widest">
                                        REF: #{selectedBooking.id.slice(0, 12).toUpperCase()}
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2">{t('sidebar.bookings')}</h2>
                                    <p className="text-white/60 font-medium">{t('admin.dashboard.activity.subtitle')}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 bg-slate-50/50">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.customer')}</p>
                                            <p className="font-bold text-slate-800">{selectedBooking.customer?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                            <Mail size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.contact')}</p>
                                            <p className="font-bold text-slate-800 truncate">{selectedBooking.customer?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('sell.form.phone')}</p>
                                            <p className="font-bold text-slate-800">{selectedBooking.customer?.phone || '+20 123 456 7890'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 border-l border-slate-200 pl-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <Hash size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.vehicle')}</p>
                                            <p className="font-bold text-slate-800">
                                                {selectedBooking.vehicle?.make_en} {selectedBooking.vehicle?.model_en}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.date')}</p>
                                            <p className="font-bold text-slate-800">
                                                {new Date(selectedBooking.sale_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.status')}</p>
                                            <p className="font-black uppercase tracking-tighter text-emerald-600">{t(`status.${selectedBooking.status}`)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('checkout.paymentMethod') || 'طريقة الدفع'}</p>
                                            <p className="font-bold text-slate-800 capitalize">{selectedBooking.payment_method || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-10 pt-10 md:pt-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> {t('checkout.receipt') || 'إيصال التحويل'}</p>
                                    {selectedBooking.receipt_url ? (
                                        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
                                            <a href={selectedBooking.receipt_url} target="_blank" rel="noopener noreferrer">
                                                <img 
                                                    src={selectedBooking.receipt_url} 
                                                    alt="Payment Receipt" 
                                                    className="w-full h-auto max-h-64 object-contain"
                                                />
                                            </a>
                                            <p className="text-[10px] text-center p-2 text-brand-primary font-bold">{t('admin.clickToViewFull') || 'اضغط لعرض الصورة بالكامل'}</p>
                                        </div>
                                    ) : (
                                        <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                                            <FileText size={24} className="mb-2 opacity-50" />
                                            <p className="text-xs font-bold">{t('admin.noReceipt') || 'لا يوجد إيصال مرفق'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-10 bg-white border-t border-slate-100 flex justify-end gap-4">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    {t('admin.actions.close')}
                                </button>
                                {selectedBooking.status === 'pending' && (
                                    <button 
                                        onClick={() => handleAction(selectedBooking.id, 'complete').then(() => setShowModal(false))}
                                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                    >
                                        {t('admin.actions.approveSold')}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <AlertModal 
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={alertConfig.onConfirm}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
            />
        </DashboardLayout>
    );
};

export default AdminBookings;
