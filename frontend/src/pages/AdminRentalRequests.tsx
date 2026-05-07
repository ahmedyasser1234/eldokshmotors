import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, Clock, XCircle, User, Phone, 
    Calendar, Hash, X, Eye, Trash2, ChevronLeft, 
    ChevronRight, Check, MapPin, Heart, Route,
    ExternalLink
} from 'lucide-react';
import AlertModal from '../components/AlertModal';

const AdminRentalRequests: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRental, setSelectedRental] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'error' | 'success' | 'warning' | 'info';
        title?: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'error', message: '' });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRentals = rentals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(rentals.length / itemsPerPage);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reservations');
            const sortedData = response.data.sort((a: any, b: any) => 
                new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
            );
            setRentals(sortedData);
        } catch (error) {
            console.error("Error fetching rentals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentals();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': 
            case 'completed': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'active': return <CheckCircle size={16} className="text-blue-500" />;
            case 'pending': return <Clock size={16} className="text-amber-500" />;
            case 'cancelled': 
            case 'rejected': return <XCircle size={16} className="text-rose-500" />;
            default: return <XCircle size={16} className="text-slate-500" />;
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'wedding': return <Heart size={14} className="text-rose-500" />;
            case 'trip': return <Route size={14} className="text-blue-500" />;
            case 'driver': return <User size={14} className="text-purple-500" />;
            default: return <User size={14} className="text-slate-500" />;
        }
    };

    const handleAction = async (id: string, status: string) => {
        try {
            await api.patch(`/reservations/${id}/status`, { status });
            fetchRentals();
            if (showModal) setShowModal(false);
        } catch (error) {
            console.error(`Error updating rental:`, error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: `Failed to update status.`
            });
        }
    };

    return (
        <DashboardLayout role="admin" title={t('sidebar.rentalRequests') || 'طلبات الإيجار'}>
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm relative">
                <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight text-slate-800">{t('sidebar.rentalRequests') || 'طلبات الإيجار'}</h3>
                        <p className="text-sm text-slate-500 font-medium">{t('admin.dashboard.activity.subtitle') || 'إدارة حجوزات وطلبات استئجار السيارات الخاصة بالعملاء.'}</p>
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
                            ) : rentals.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="text-slate-500 font-bold opacity-50 text-xl">{t('common.noData')}</div>
                                    </td>
                                </tr>
                            ) : (
                                currentRentals.map((rental) => (
                                    <tr key={rental.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="px-3 py-1 bg-slate-100 rounded-lg inline-block font-mono text-[10px] text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                                                #{rental.id.slice(0, 8).toUpperCase()}
                                            </div>
                                            {rental.mode && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    {getModeIcon(rental.mode)}
                                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">{t(`rental.modes.${rental.mode}`) || rental.mode}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="font-black text-slate-800">
                                                {t('common.make_ar') === 'الماركة (بالعربي)' ? (rental.vehicle?.make_ar || rental.vehicle?.make_en) : (rental.vehicle?.make_en || rental.vehicle?.make_ar)} {' '}
                                                {t('common.model_ar') === 'الموديل (بالعربي)' ? (rental.vehicle?.model_ar || rental.vehicle?.model_en) : (rental.vehicle?.model_en || rental.vehicle?.model_ar)}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-60">VIN: {rental.vehicle?.vin?.slice(0, 8) || 'VERIFIED'}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="font-bold text-slate-700">{rental.customer?.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{rental.customer?.email}</div>
                                        </td>
                                        <td className="px-10 py-8 text-sm text-slate-500 font-bold whitespace-nowrap">
                                            {new Date(rental.start_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} 
                                            {' - '}
                                            {new Date(rental.end_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-10 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-50" />
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(rental.status)}
                                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t(`status.${rental.status}`) || rental.status}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right whitespace-nowrap font-black text-brand-primary text-lg">
                                            {Number(rental.total_price).toLocaleString()} <span className="text-[10px] opacity-60">EGP</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRental(rental);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                                                    title={t('admin.actions.view')}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {rental.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAction(rental.id, 'confirmed')}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                                        title={t('admin.actions.approve') || 'تأكيد'}
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                )}
                                                {rental.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAction(rental.id, 'cancelled')}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title={t('admin.actions.reject')}
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
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
                            {t('fleet.showing')} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, rentals.length)} / {rentals.length}
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

            {/* Rental Details Modal */}
            <AnimatePresence>
                {showModal && selectedRental && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isArabic ? 'rtl' : 'ltr'}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="p-10 bg-brand-primary text-white flex justify-between items-start sticky top-0 z-10 shadow-lg">
                                <div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full inline-block font-mono text-[10px] text-white/80 mb-4 tracking-widest">
                                        REF: #{selectedRental.id.slice(0, 12).toUpperCase()}
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2">{t('sidebar.rentalRequests') || 'طلبات الإيجار'}</h2>
                                    {selectedRental.mode && (
                                        <div className="flex items-center gap-2 mt-2">
                                            {getModeIcon(selectedRental.mode)}
                                            <span className="text-xs font-black uppercase tracking-widest opacity-90">
                                                {t(`rental.modes.${selectedRental.mode}`) || selectedRental.mode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-50/50">
                                {/* Left Side: Customer & Vehicle */}
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.customer')}</p>
                                                <p className="font-bold text-slate-800">{selectedRental.customer?.name}</p>
                                                <p className="text-xs text-slate-500">{selectedRental.customer?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                                <Phone size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('sell.form.phone')}</p>
                                                <p className="font-bold text-slate-800">{selectedRental.customer?.phone || '+20 123 456 7890'}</p>
                                            </div>
                                        </div>
                                        <hr className="border-slate-50" />
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                                <Hash size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('admin.table.vehicle')}</p>
                                                <p className="font-bold text-slate-800">
                                                    {selectedRental.vehicle?.make_en} {selectedRental.vehicle?.model_en}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">VIN: {selectedRental.vehicle?.vin}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Info */}
                                    {(selectedRental.pickup_location || selectedRental.dropoff_location) && (
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                            {selectedRental.pickup_location && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                                <MapPin size={16} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('booking.labels.pickupLocation') || 'موقع الاستلام'}</span>
                                                        </div>
                                                        {selectedRental.pickup_location.latitude && (
                                                            <a 
                                                                href={`https://www.google.com/maps?q=${selectedRental.pickup_location.latitude},${selectedRental.pickup_location.longitude}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="text-brand-primary hover:underline flex items-center gap-1 text-[10px] font-black uppercase"
                                                            >
                                                                <ExternalLink size={12} /> {isArabic ? 'عرض الخريطة' : 'View Map'}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 pl-11">{selectedRental.pickup_location.address}</p>
                                                </div>
                                            )}
                                            
                                            {selectedRental.dropoff_location && (
                                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                                                <MapPin size={16} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('booking.labels.dropoffLocation') || 'موقع التسليم'}</span>
                                                        </div>
                                                        {selectedRental.dropoff_location.latitude && (
                                                            <a 
                                                                href={`https://www.google.com/maps?q=${selectedRental.dropoff_location.latitude},${selectedRental.dropoff_location.longitude}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="text-brand-primary hover:underline flex items-center gap-1 text-[10px] font-black uppercase"
                                                            >
                                                                <ExternalLink size={12} /> {isArabic ? 'عرض الخريطة' : 'View Map'}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 pl-11">{selectedRental.dropoff_location.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Dates & Billing */}
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    {t('booking.labels.pickupDate') || 'تاريخ الاستلام'}
                                                </p>
                                                <p className="font-bold text-slate-800">
                                                    {new Date(selectedRental.start_date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    {t('booking.labels.dropoffDate') || 'تاريخ الإرجاع'}
                                                </p>
                                                <p className="font-bold text-slate-800">
                                                    {new Date(selectedRental.end_date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('admin.table.status')}</span>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(selectedRental.status)}
                                                    <span className="text-xs font-black uppercase text-slate-700">{t(`status.${selectedRental.status}`) || selectedRental.status}</span>
                                                </div>
                                            </div>
                                            <div className="bg-brand-primary p-6 rounded-2xl text-white shadow-xl shadow-brand-primary/20">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/70">{t('admin.table.price')}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black">{Number(selectedRental.total_price).toLocaleString()}</span>
                                                    <span className="text-sm font-bold opacity-70 uppercase tracking-widest">EGP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-white border-t border-slate-100 flex justify-end gap-4 sticky bottom-0 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                                >
                                    {t('admin.actions.close')}
                                </button>
                                {selectedRental.status === 'pending' && (
                                    <>
                                    <button 
                                        onClick={() => handleAction(selectedRental.id, 'rejected')}
                                        className="px-8 py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all"
                                    >
                                        {t('admin.actions.reject')}
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedRental.id, 'confirmed')}
                                        className="px-8 py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2"
                                    >
                                        {t('admin.actions.approveSold') || 'تأكيد الحجز'}
                                        <CheckCircle size={18} />
                                    </button>
                                    </>
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

export default AdminRentalRequests;
