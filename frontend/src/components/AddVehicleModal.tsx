import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Loader2, Plus, Info, Settings, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { normalizeImageUrl } from '../utils/imageUtils';
import AlertModal from './AlertModal';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [isLoading, setIsLoading] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'gallery'>('basic');

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'error' | 'success' | 'warning' | 'info';
        message: string;
    }>({ isOpen: false, type: 'error', message: '' });

    const [formData, setFormData] = useState({
        make_ar: initialData?.make_ar || '',
        make_en: initialData?.make_en || '',
        model_ar: initialData?.model_ar || '',
        model_en: initialData?.model_en || '',
        year: initialData?.year || new Date().getFullYear(),
        category: initialData?.category || 'luxury',
        status: initialData?.status || 'available',
        sale_price: initialData?.sale_price || 0,
        description_ar: initialData?.description_ar || '',
        description_en: initialData?.description_en || '',
        image_urls: initialData?.image_urls?.length > 0 ? initialData.image_urls : [''],
        details: {
            engine: initialData?.details?.engine || '',
            horsepower: initialData?.details?.horsepower || '',
            acceleration: initialData?.details?.acceleration || '',
            driveType: initialData?.details?.driveType || '',
            transmission: initialData?.details?.transmission || '',
            fuel_type: initialData?.details?.fuel_type || '',
            mileage: initialData?.details?.mileage || '',
            condition: initialData?.details?.condition || '',
            exterior_color: initialData?.details?.exterior_color || '',
            interior_color: initialData?.details?.interior_color || '',
            features: initialData?.details?.features || '',
            reservation_fee: initialData?.details?.reservation_fee || '',
            warranty_title: initialData?.details?.warranty_title || '',
            warranty_text: initialData?.details?.warranty_text || '',
            inspection_title: initialData?.details?.inspection_title || '',
            inspection_text: initialData?.details?.inspection_text || '',
            is_installment_available: initialData?.details?.is_installment_available || false,
            min_down_payment_percentage: initialData?.details?.min_down_payment_percentage || 20,
            installment_interest_rate: initialData?.details?.installment_interest_rate || 15
        }
    });

    useEffect(() => {
        if (initialData) {
            const normalizedUrls = (initialData.image_urls || []).map((url: string) => normalizeImageUrl(url));
            setFormData({
                make_ar: initialData.make_ar || '',
                make_en: initialData.make_en || '',
                model_ar: initialData.model_ar || '',
                model_en: initialData.model_en || '',
                year: initialData.year,
                category: initialData.category,
                status: initialData.status,
                sale_price: initialData.sale_price,
                description_ar: initialData.description_ar || '',
                description_en: initialData.description_en || '',
                image_urls: normalizedUrls.length > 0 ? normalizedUrls : [''],
                details: {
                    engine: initialData.details?.engine || '',
                    horsepower: initialData.details?.horsepower || '',
                    acceleration: initialData.details?.acceleration || '',
                    driveType: initialData.details?.driveType || '',
                    transmission: initialData.details?.transmission || '',
                    fuel_type: initialData.details?.fuel_type || '',
                    mileage: initialData.details?.mileage || '',
                    condition: initialData.details?.condition || '',
                    exterior_color: initialData.details?.exterior_color || '',
                    interior_color: initialData.details?.interior_color || '',
                    features: initialData.details?.features || '',
                    reservation_fee: initialData.details?.reservation_fee || '',
                    warranty_title: initialData.details?.warranty_title || '',
                    warranty_text: initialData.details?.warranty_text || '',
                    inspection_title: initialData.details?.inspection_title || '',
                    inspection_text: initialData.details?.inspection_text || '',
                    is_installment_available: initialData.details?.is_installment_available || false,
                    min_down_payment_percentage: initialData.details?.min_down_payment_percentage || 20,
                    installment_interest_rate: initialData.details?.installment_interest_rate || 15
                }
            });
        }
    }, [initialData]);

    const categories = ['economy', 'luxury', 'suv', 'sport', 'van'];
    const statuses = ['available', 'reserved', 'sold'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'year' || name === 'sale_price' ? Number(value) : value }));
        }
    };

    const handleImageUrlChange = (index: number, value: string) => {
        const normalizedValue = normalizeImageUrl(value);
        const newUrls = [...formData.image_urls];
        newUrls[index] = normalizedValue;
        setFormData(prev => ({ ...prev, image_urls: newUrls }));
    };

    const addImageUrl = () => {
        setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, ''] }));
    };

    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

    const handleFileUpload = async (index: number, file: File) => {
        try {
            setUploadingIdx(index);
            const formDataData = new FormData();
            formDataData.append('file', file);
            
            const response = await api.post('/media/upload', formDataData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            handleImageUrlChange(index, response.data.url);
        } catch (error) {
            console.error("Upload failed:", error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: isRTL ? "فشل رفع الصورة" : "Failed to upload image"
            });
        } finally {
            setUploadingIdx(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const submitData = {
                ...formData,
                image_urls: formData.image_urls.filter((url: string) => url.trim() !== '')
            };
            
            if (initialData?.id) {
                await api.patch(`/vehicles/${initialData.id}`, submitData);
            } else {
                await api.post('/vehicles', submitData);
            }
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving vehicle:", error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                message: isRTL ? "فشل حفظ بيانات السيارة" : "Failed to save vehicle."
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'basic', label: isRTL ? 'البيانات الأساسية' : 'Basic Info', icon: Info },
        { id: 'specs', label: isRTL ? 'المواصفات الفنية' : 'Technical Specs', icon: Settings },
        { id: 'gallery', label: isRTL ? 'معرض الصور' : 'Gallery', icon: ImageIcon },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 relative">
                    <div className="mb-4 sm:mb-0 ltr:pr-14 rtl:pl-14">
                        <h2 className="text-2xl font-black tracking-tight text-slate-800">
                            {initialData ? (isRTL ? 'تعديل بيانات السيارة' : 'Edit Vehicle') : (isRTL ? 'إضافة سيارة جديدة' : 'Add New Vehicle')}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {initialData ? (formData.make_ar || formData.make_en) + ' ' + (formData.model_ar || formData.model_en) : (isRTL ? 'قم بملء جميع البيانات المطلوبة' : 'Fill all required information')}
                        </p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl ltr:mr-10 rtl:ml-10 sm:ltr:mr-0 sm:rtl:ml-0 ltr:pr-0 rtl:pl-12 sm:ltr:pr-12 sm:rtl:pl-12 shrink-0">
                        {tabs.map(tab => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-white text-brand-primary shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <tab.icon size={14} className="shrink-0" />
                                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <button type="button" onClick={onClose} className="absolute top-6 sm:top-8 ltr:right-6 rtl:left-6 sm:ltr:right-8 sm:rtl:left-8 p-2 bg-slate-200/50 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-all z-10">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    
                    {/* BASIC INFO TAB */}
                    {activeTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الماركة (بالعربي)' : 'Make (Arabic)'}</label>
                                    <input 
                                        name="make_ar" value={formData.make_ar} onChange={handleChange} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الماركة (بالإنجليزي)' : 'Make (English)'}</label>
                                    <input 
                                        name="make_en" value={formData.make_en} onChange={handleChange} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold font-sans ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الموديل (بالعربي)' : 'Model (Arabic)'}</label>
                                    <input 
                                        name="model_ar" value={formData.model_ar} onChange={handleChange} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الموديل (بالإنجليزي)' : 'Model (English)'}</label>
                                    <input 
                                        name="model_en" value={formData.model_en} onChange={handleChange} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold font-sans ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'سنة الصنع' : 'Year'}</label>
                                    <input 
                                        type="number" name="year" value={formData.year} onChange={handleChange} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الفئة' : 'Category'}</label>
                                    <select 
                                        name="category" value={formData.category} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</label>
                                    <select 
                                        name="status" value={formData.status} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{isRTL ? 'سعر البيع الإجمالي (جنيه مصري)' : 'Total Sale Price (EGP)'}</label>
                                    <input 
                                        type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} required
                                        className="w-full bg-brand-primary/5 border border-brand-primary/20 rounded-2xl px-5 py-4 text-brand-primary focus:border-brand-primary outline-none transition-all font-black text-2xl tracking-tight"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isRTL ? 'مبلغ جدية الحجز (جنيه مصري)' : 'Reservation Down Payment (EGP)'}</label>
                                    <input 
                                        type="number" name="details.reservation_fee" value={formData.details.reservation_fee} onChange={handleChange} required
                                        className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-600 focus:border-emerald-500 outline-none transition-all font-black text-2xl tracking-tight"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{isRTL ? 'نظام التقسيط والتمويل' : 'Financing & Installment'}</h3>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="isInstallmentAvailable"
                                        checked={formData.details.is_installment_available} 
                                        onChange={(e) => setFormData(prev => ({...prev, details: {...prev.details, is_installment_available: e.target.checked}}))}
                                        className="w-5 h-5 accent-brand-primary cursor-pointer rounded"
                                    />
                                    <label htmlFor="isInstallmentAvailable" className="text-sm font-bold text-slate-700 cursor-pointer">{isRTL ? 'السيارة متاحة للتقسيط' : 'Available for Installments'}</label>
                                </div>
                                {formData.details.is_installment_available && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'أقل نسبة مقدم (%)' : 'Min Down Payment (%)'}</label>
                                            <input type="number" name="details.min_down_payment_percentage" value={formData.details.min_down_payment_percentage} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'نسبة الفائدة السنوية (%)' : 'Annual Interest Rate (%)'}</label>
                                            <input type="number" name="details.installment_interest_rate" value={formData.details.installment_interest_rate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الوصف (بالعربي)' : 'Description (Arabic)'}</label>
                                    <textarea 
                                        name="description_ar" value={formData.description_ar} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold h-32 resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الوصف (بالإنجليزي)' : 'Description (English)'}</label>
                                    <textarea 
                                        name="description_en" value={formData.description_en} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold h-32 resize-none font-sans ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SPECS TAB */}
                    {activeTab === 'specs' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المحرك' : 'Engine'}</label>
                                    <input 
                                        name="details.engine" value={formData.details.engine} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'قوة الحصان' : 'Horsepower'}</label>
                                    <input 
                                        name="details.horsepower" value={formData.details.horsepower} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التسارع (0-100 كم)' : 'Acceleration (0-100 km/h)'}</label>
                                    <input 
                                        name="details.acceleration" value={formData.details.acceleration} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'نظام الدفع' : 'Drive Type'}</label>
                                    <input 
                                        name="details.driveType" value={formData.details.driveType} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'ناقل الحركة' : 'Transmission'}</label>
                                    <input 
                                        name="details.transmission" value={formData.details.transmission} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'نوع الوقود' : 'Fuel Type'}</label>
                                    <input 
                                        name="details.fuel_type" value={formData.details.fuel_type} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الممشى (كم)' : 'Mileage (km)'}</label>
                                    <input 
                                        type="number" name="details.mileage" value={formData.details.mileage} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'حالة السيارة' : 'Condition'}</label>
                                    <input 
                                        name="details.condition" value={formData.details.condition} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'اللون الخارجي' : 'Exterior Color'}</label>
                                    <input 
                                        name="details.exterior_color" value={formData.details.exterior_color} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'اللون الداخلي' : 'Interior Color'}</label>
                                    <input 
                                        name="details.interior_color" value={formData.details.interior_color} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-slate-100 pt-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'مميزات إضافية' : 'Extra Features'}</label>
                                <textarea 
                                    name="details.features" value={formData.details.features} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-brand-primary outline-none transition-all font-bold h-24 resize-none"
                                />
                            </div>

                            <div className="space-y-6 border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{isRTL ? 'الضمان والفحص' : 'Warranty & Inspection'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'عنوان الضمان' : 'Warranty Title'}</label>
                                            <input name="details.warranty_title" value={formData.details.warranty_title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'تفاصيل الضمان' : 'Warranty Details'}</label>
                                            <textarea name="details.warranty_text" value={formData.details.warranty_text} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold h-24 resize-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'عنوان الفحص' : 'Inspection Title'}</label>
                                            <input name="details.inspection_title" value={formData.details.inspection_title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'تفاصيل الفحص' : 'Inspection Details'}</label>
                                            <textarea name="details.inspection_text" value={formData.details.inspection_text} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:border-brand-primary outline-none transition-all font-bold h-24 resize-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GALLERY TAB */}
                    {activeTab === 'gallery' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    {isRTL ? 'صور السيارة' : 'Vehicle Images'}
                                </h3>
                                <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-[10px] font-black hover:bg-brand-primary/20 transition-colors uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14} /> {isRTL ? 'إضافة صورة' : 'Add Image'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.image_urls.map((url: string, idx: number) => (
                                    <div key={idx} className="relative group bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            {url ? (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 relative">
                                                    <img 
                                                        src={normalizeImageUrl(url)} 
                                                        alt="" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                            
                                            <input 
                                                value={url} onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-brand-primary outline-none transition-all font-mono ltr"
                                                placeholder={`Image URL #${idx + 1}`}
                                            />
                                            
                                            <label className="cursor-pointer flex-shrink-0">
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                                                />
                                                <div className={`w-10 h-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all ${uploadingIdx === idx ? 'animate-pulse' : ''}`}>
                                                    {uploadingIdx === idx ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] sm:text-xs shadow-sm">
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-[2] py-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isRTL ? 'حفظ السيارة' : 'Save Vehicle'}
                    </button>
                </div>

                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                    type={alertConfig.type}
                    message={alertConfig.message}
                />
            </div>
        </div>
    );
};

export default AddVehicleModal;
