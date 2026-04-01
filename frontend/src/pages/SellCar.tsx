import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car, Camera, Send, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { normalizeImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';

const SellCar: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const isSubmittingRef = React.useRef(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: '',
        condition: '',
        expected_price: '',
        description: '',
        image_urls: [] as string[],
        client_name: '',
        client_phone: '',
        client_email: '',
        engine_size: '',
        transmission: 'automatic',
        fuel_type: 'gasoline',
        exterior_color: '',
        interior_color: '',
        vin: '',
        location: '',
        address: ''
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user) {
            setFormData(prev => ({
                ...prev,
                client_name: prev.client_name || user.name || '',
                client_phone: prev.client_phone || user.phone || '',
                client_email: prev.client_email || user.email || ''
            }));
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        
        try {
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const res = await api.post('/media/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data?.url) {
                    // Normalize: ensure leading slash, no trailing slash
                    let url = res.data.url.trim();
                    if (url.endsWith('/')) url = url.slice(0, -1);
                    if (!url.startsWith('http') && !url.startsWith('/')) url = '/' + url;
                    uploadedUrls.push(url);
                }
            }
            setFormData(prev => ({
                ...prev,
                image_urls: [...prev.image_urls, ...uploadedUrls]
            }));
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        
        isSubmittingRef.current = true;
        setStatus('submitting');
        try {
            await api.post('/purchase-requests', {
                ...formData,
                year: Number(formData.year),
                mileage: Number(formData.mileage),
                expected_price: Number(formData.expected_price)
            });
            setStatus('success');
        } catch (err) {
            console.error('Submission failed:', err);
            setStatus('error');
            isSubmittingRef.current = false;
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-500/20"
                >
                    <CheckCircle size={48} />
                </motion.div>
                <h1 className="text-4xl font-black mb-4 text-center">{t('sell.form.success')}</h1>
                <p className="text-slate-500 text-xl text-center max-w-lg mb-12">
                   {t('sell.subtitle')}
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all"
                >
                    {t('nav.vehicles')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <SEO 
                title={t('seo.sell.title')} 
                description={t('seo.sell.description')} 
            />
            {/* Hero Section with Video Background */}
            <div className="relative pt-32 pb-24 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[50vh]">
                <video 
                    src="/1236.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60" /> {/* Dark overlay */}
                
                <header className="relative z-10 text-center max-w-4xl mx-auto w-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white font-black text-sm mb-6 border border-white/20"
                    >
                        <Car size={16} />
                        {t('nav.sellCar').toUpperCase()}
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-white">{t('sell.title')}</h1>
                    <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">{t('sell.subtitle')}</p>
                </header>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-20 -mt-12">
                <motion.form 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
                >
                    <div className="p-8 md:p-12 space-y-10">
                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <span className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                                    <Info size={16} />
                                </span>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">{t('sell.form.contactInfo')}</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.name')}</label>
                                    <input 
                                        name="client_name" value={formData.client_name} onChange={handleChange} required
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.phone')}</label>
                                    <input 
                                        name="client_phone" value={formData.client_phone} onChange={handleChange} required
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.email')}</label>
                                    <input 
                                        type="email" name="client_email" value={formData.client_email} onChange={handleChange} required
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Car Basics */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.make')}</label>
                                <input 
                                    name="make" value={formData.make} onChange={handleChange} required
                                    placeholder={t('sell.form.makePlaceholder')}
                                    className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.model')}</label>
                                <input 
                                    name="model" value={formData.model} onChange={handleChange} required
                                    placeholder={t('sell.form.modelPlaceholder')}
                                    className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.year')}</label>
                                <input 
                                    type="number" name="year" value={formData.year} onChange={handleChange} required
                                    className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.mileage')}</label>
                                <input 
                                    type="number" name="mileage" value={formData.mileage} onChange={handleChange} required
                                    className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.expectedPrice')} (EGP)</label>
                                <input 
                                    type="number" name="expected_price" value={formData.expected_price} onChange={handleChange} required
                                    className="w-full h-16 bg-brand-primary/5 rounded-2xl px-6 font-black text-brand-primary text-xl border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Technical Specifications */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <span className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                                    <Car size={16} />
                                </span>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">{t('sell.form.technicalSpecs')}</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.engineSize')}</label>
                                    <input 
                                        name="engine_size" value={formData.engine_size} onChange={handleChange}
                                        placeholder="e.g. 2.0L / 2000 CC"
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.transmission')}</label>
                                    <select 
                                        name="transmission" value={formData.transmission} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="automatic">{t('sell.form.transmissions.automatic')}</option>
                                        <option value="manual">{t('sell.form.transmissions.manual')}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.fuelType')}</label>
                                    <select 
                                        name="fuel_type" value={formData.fuel_type} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="gasoline">{t('sell.form.fuelTypes.gasoline')}</option>
                                        <option value="diesel">{t('sell.form.fuelTypes.diesel')}</option>
                                        <option value="hybrid">{t('sell.form.fuelTypes.hybrid')}</option>
                                        <option value="electric">{t('sell.form.fuelTypes.electric')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.exteriorColor')}</label>
                                    <input 
                                        name="exterior_color" value={formData.exterior_color} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.interiorColor')}</label>
                                    <input 
                                        name="interior_color" value={formData.interior_color} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.vin')}</label>
                                    <input 
                                        name="vin" value={formData.vin} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <span className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                                    <Info size={16} />
                                </span>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">{t('sell.form.locationInfo')}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.location')}</label>
                                    <input 
                                        name="location" value={formData.location} onChange={handleChange}
                                        className="w-full h-14 bg-slate-50 rounded-xl px-5 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.address')}</label>
                                    <textarea 
                                        name="address" value={formData.address} onChange={handleChange}
                                        rows={2}
                                        className="w-full bg-slate-50 rounded-xl px-5 py-4 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.condition')}</label>
                            <select 
                                name="condition" value={formData.condition} onChange={handleChange} required
                                className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="">{t('sell.form.selectCondition')}</option>
                                <option value="excellent">{t('sell.form.conditions.excellent')}</option>
                                <option value="very_good">{t('sell.form.conditions.very_good')}</option>
                                <option value="good">{t('sell.form.conditions.good')}</option>
                                <option value="fair">{t('sell.form.conditions.fair')}</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.description')}</label>
                            <textarea 
                                name="description" value={formData.description} onChange={handleChange}
                                rows={4}
                                className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none resize-none"
                                placeholder={t('sell.form.descriptionPlaceholder')}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-6">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('sell.form.images')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {formData.image_urls.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm">
                                        <img 
                                            src={normalizeImageUrl(url)} 
                                            alt="Uploaded" 
                                            className="w-full h-full object-cover bg-slate-100" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, image_urls: p.image_urls.filter((_, idx) => idx !== i) }))}
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                        >
                                            {t('sell.form.remove')}
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-slate-400 hover:text-brand-primary">
                                    <Camera size={32} />
                                    <span className="text-xs font-black uppercase tracking-wider">{t('sell.form.addPhoto')}</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-start gap-4 max-w-md">
                            <div className="p-2 bg-yellow-400/20 text-yellow-600 rounded-lg shrink-0">
                                <Info size={20} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {t('sell.form.disclaimer')}
                            </p>
                        </div>
                        <button 
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full md:w-auto px-12 h-16 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-brand-primary/40 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {status === 'submitting' ? t('sell.form.submitting') : (
                                <>
                                    {t('sell.form.submit').toUpperCase()}
                                    <Send size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default SellCar;
