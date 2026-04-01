import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Filter, Zap, Droplet, Trash2, Loader2, Eye, Edit3 } from 'lucide-react';
import api from '../services/api';
import AddVehicleModal from '../components/AddVehicleModal';
import { useTranslation } from 'react-i18next';
import { normalizeImageUrl } from '../utils/imageUtils';
import AlertModal from '../components/AlertModal';

const FleetManagement: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: ''
    });
    
    // Alert/Confirm State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'error' | 'success' | 'warning' | 'info';
        title?: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'error', message: '' });

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vehicles', { 
                params: { 
                    ...filters,
                    status: filters.status === 'all' ? '' : (filters.status || 'available')
                } 
            });
            setVehicles(response.data.data || response.data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVehicles();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters]);

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
            await api.delete(`/vehicles/${itemToDelete}`);
            fetchVehicles();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: t('admin.fleet.deleteFailed')
            });
        }
    };

    const handleEdit = (vehicle: any) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    return (
        <DashboardLayout role="admin" title={t('admin.fleet.title')}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 tracking-tighter uppercase whitespace-pre-wrap">{t('admin.fleet.title')}</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-brand-primary rounded-full"></span>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('admin.fleet.subtitle')}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm border ${isFilterVisible ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:text-brand-primary hover:border-brand-primary/20'}`}
                    >
                        <Filter size={16} />
                        {t('admin.fleet.filter')}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-brand-primary/20 text-[10px] uppercase tracking-widest"
                    >
                        <Plus size={18} />
                        {t('admin.fleet.addVehicle')}
                    </button>
                </div>
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 hide-scrollbar">
                {[
                    { id: 'available', label: t('status.available') || 'Available' },
                    { id: 'reserved', label: t('status.reserved') || 'Reserved' },
                    { id: 'sold', label: t('status.sold') || 'Sold' },
                    { id: 'all', label: t('filters.allSelected') || 'All Fleet' }
                ].map((st) => (
                    <button
                        key={st.id}
                        onClick={() => setFilters(prev => ({ ...prev, status: st.id }))}
                        className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                            (filters.status || 'available') === st.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {st.label}
                    </button>
                ))}
            </div>

            {/* Filter Panel */}
            {isFilterVisible && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden mb-12"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('filters.search')}</label>
                            <input 
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder={t('filters.searchPlaceholder')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('filters.category')}</label>
                            <select 
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="">{t('filters.allCategories')}</option>
                                <option value="economy">{t('categories.economy')}</option>
                                <option value="luxury">{t('categories.luxury')}</option>
                                <option value="suv">{t('categories.suv')}</option>
                                <option value="sport">{t('categories.sport')}</option>
                                <option value="van">{t('categories.van')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('filters.availability')}</label>
                            <select 
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="">{t('filters.allSelected') || 'All Status'}</option>
                                <option value="available">{t('status.available')}</option>
                                <option value="reserved">{t('status.reserved')}</option>
                                <option value="sold">{t('status.sold')}</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                        <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{t('admin.fleet.syncing')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {vehicles.map(pkg => (
                        <div key={pkg.id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col relative">
                            {/* Status Badge Over Image */}
                            <div className="absolute top-6 right-6 z-10">
                                <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-xl flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${pkg.status === 'available' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : pkg.status === 'sold' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`}></span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                                        {t(`status.${pkg.status}`)}
                                    </span>
                                </div>
                            </div>

                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={normalizeImageUrl(pkg.image_urls?.[0]) || 
                                        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                    alt={pkg.model}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            <div className="p-8 space-y-8 flex-grow flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                            {t('common.make_ar') === 'الماركة (بالعربي)' ? (pkg.make_ar || pkg.make_en) : (pkg.make_en || pkg.make_ar)} {' '}
                                            {t('common.model_ar') === 'الموديل (بالعربي)' ? (pkg.model_ar || pkg.model_en) : (pkg.model_en || pkg.model_ar)}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{pkg.year}</span>
                                            <span className="text-[9px] text-brand-primary font-black tracking-widest uppercase">{t(`categories.${pkg.category}`)}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => confirmDelete(pkg.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-100 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap size={12} className="text-brand-primary" />
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t('admin.fleet.price')}</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{Number(pkg.sale_price).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold uppercase ml-1">EGP</span></p>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Droplet size={12} className="text-brand-primary" />
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t('admin.fleet.engine')}</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 truncate">{pkg.details?.engine || 'V8 BITURBO'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex gap-3 mt-auto">
                                    <button 
                                        onClick={() => navigate(`/vehicles/${pkg.id}`)}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase hover:bg-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye size={14} />
                                        <span>{t('admin.fleet.viewDetails')}</span>
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(pkg)}
                                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase hover:border-brand-primary/30 hover:text-brand-primary hover:bg-slate-50 transition-all flex items-center justify-center"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddVehicleModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSuccess={fetchVehicles}
                initialData={editingVehicle}
            />

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

export default FleetManagement;
