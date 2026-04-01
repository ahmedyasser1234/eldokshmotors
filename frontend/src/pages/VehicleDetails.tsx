import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  CreditCard,
  Clock,
  CheckCircle,
  Settings2,
  Droplets,
  Palette,
  GaugeCircle,
  Activity,
  Box
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { normalizeImageUrl } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import AlertModal from '../components/AlertModal';
import SEO from '../components/SEO';

const VehicleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState(0);
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [installmentMonths, setInstallmentMonths] = useState(60);

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'error' | 'success' | 'warning' | 'info';
        message: string;
    }>({ isOpen: false, type: 'error', message: '' });

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/vehicles/${id}`);
                setVehicle(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching vehicle details:', err);
                setError('Failed to load vehicle details.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchVehicle();
    }, [id]);

    useEffect(() => {
        if (vehicle?.details?.min_down_payment_percentage) {
            setDownPaymentPercent(Number(vehicle.details.min_down_payment_percentage));
        }
    }, [vehicle]);

    const handleBuy = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('admin-token');
        if (!token) {
            navigate(`/login?redirect=/vehicles/${id}`);
            return;
        }
        if (useAuthStore.getState().user?.role === 'admin') {
            setAlertConfig({ isOpen: true, type: 'error', message: t('error.adminNotAllowed') });
            return;
        }
        navigate(`/checkout/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] pt-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-[#f8fafc] pt-24 flex flex-col items-center justify-center gap-6">
                <p className="text-red-500 font-bold text-xl">{error || 'Vehicle not found'}</p>
                <button onClick={() => navigate('/vehicles')} className="btn-primary">Back to Vehicles</button>
            </div>
        );
    }

    const salePrice = Number(vehicle?.sale_price || 0);
    const downPaymentAmount = (salePrice * downPaymentPercent) / 100;
    const loanAmount = salePrice - downPaymentAmount;
    const annualInterestRate = Number(vehicle?.details?.installment_interest_rate || 15);
    const totalInterest = loanAmount * (annualInterestRate / 100) * (installmentMonths / 12);
    const totalToPay = loanAmount + totalInterest;
    const monthlyPayment = totalToPay / installmentMonths;
    const formattedDownPayment = Math.round(downPaymentAmount).toLocaleString();
    const formattedMonthlyPayment = Math.round(monthlyPayment).toLocaleString();

    const isArabic = t('common.make_ar') === 'الماركة (بالعربي)';
    const makeName = isArabic ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar);
    const modelName = isArabic ? (vehicle.model_ar || vehicle.model_en) : (vehicle.model_en || vehicle.model_ar);
    const description = isArabic ? (vehicle.description_ar || vehicle.description_en) : (vehicle.description_en || vehicle.description_ar);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 selection:bg-brand-primary selection:text-white">
            <SEO 
                title={`${makeName} ${modelName}`}
                description={description?.slice(0, 160) || `${makeName} ${modelName} - ${t('seo.default.description')}`}
                ogImage={vehicle.image_urls?.[0]}
                ogType="product"
            />
            {/* Hero Section */}
            <div className="relative h-[40vh] flex items-center justify-center overflow-hidden mb-10">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 brightness-[0.4]"
                    style={{ backgroundImage: `url('${normalizeImageUrl(vehicle?.image_urls?.[0]) || '/car_bg_premium.png'}')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#f8fafc]"></div>
                </div>
                
                <div className="relative z-10 text-center space-y-4 px-6 mt-12 w-full">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                        {makeName} {modelName}
                    </h1>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {bookingStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    >
                        <div className="bg-white rounded-[40px] p-12 max-w-xl w-full text-center shadow-2xl">
                            <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-brand-primary/20">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                                {t('details.buySuccessTitle')}
                            </h2>
                            <p className="text-slate-500 text-lg font-bold leading-relaxed mb-10">
                                {t('details.buySuccessDesc', { make: makeName, model: modelName })}
                            </p>
                            <button
                                onClick={() => navigate('/vehicles')}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
                            >
                                {t('fleet.title')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/vehicles')}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-primary mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t('nav.vehicles')}</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── LEFT: Media & Details (8 cols) ── */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Image Gallery */}
                        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200 group shadow-xl shadow-slate-200">
                            <img
                                src={normalizeImageUrl(vehicle.image_urls[selectedImage]) ||
                                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'}
                                alt={vehicle.model}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 to-transparent pointer-events-none" />

                            {/* Dot Indicators */}
                            {vehicle.image_urls.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                                    {vehicle.image_urls.map((_: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-brand-primary w-10' : 'bg-slate-300 w-6 hover:bg-brand-primary/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile: Name & Price */}
                        <div className="lg:hidden space-y-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                {makeName} {modelName}
                            </h1>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-brand-primary">{Number(vehicle.sale_price).toLocaleString()}</span>
                                <span className="text-sm font-bold text-slate-400">EGP</span>
                            </div>
                        </div>

                        {/* Specifications Grid */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                                    <Zap size={20} className="text-brand-primary" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('details.specs.title')}</h2>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[
                                    { icon: Gauge,       label: t('details.specs.engine'),        value: vehicle.details?.engine },
                                    { icon: Zap,         label: t('details.specs.power'),         value: vehicle.details?.horsepower },
                                    { icon: Clock,       label: t('details.specs.acceleration'),  value: vehicle.details?.acceleration },
                                    { icon: MapPin,      label: t('details.specs.driveType'),     value: vehicle.details?.driveType },
                                    { icon: Settings2,   label: t('details.specs.transmission'),  value: vehicle.details?.transmission },
                                    { icon: Droplets,    label: t('details.specs.fuel'),          value: vehicle.details?.fuel_type },
                                    { icon: GaugeCircle, label: t('details.specs.mileage'),       value: vehicle.details?.mileage ? `${vehicle.details.mileage} km` : undefined },
                                    { icon: Activity,    label: t('details.specs.condition'),     value: vehicle.details?.condition },
                                    { icon: Palette,     label: t('details.specs.exteriorColor'), value: vehicle.details?.exterior_color },
                                    { icon: Box,         label: t('details.specs.interiorColor'), value: vehicle.details?.interior_color },
                                ].filter(s => s.value && String(s.value).trim() !== '').map((spec, i) => (
                                    <div
                                        key={i}
                                        className="bg-slate-50 border border-slate-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 p-4 rounded-2xl transition-all flex flex-col gap-2 min-h-[90px] overflow-hidden group"
                                    >
                                        <spec.icon size={16} className="text-brand-primary shrink-0" />
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-tight break-words line-clamp-2 group-hover:text-brand-primary transition-colors">
                                            {spec.label}
                                        </p>
                                        <p className="font-bold text-sm text-slate-800 break-words leading-snug mt-auto">
                                            {spec.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            {vehicle.details?.features && (
                                <div className="mt-2 bg-brand-primary/5 border border-brand-primary/15 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Star size={18} className="text-brand-primary" />
                                        <h3 className="text-sm font-black tracking-tight uppercase text-slate-800">{t('details.specs.features')}</h3>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                        {vehicle.details.features}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('details.description')}</h2>
                            <p className="text-slate-500 leading-relaxed text-base border-r-4 border-brand-primary pr-4">
                                {description || '—'}
                            </p>
                        </div>


                    </div>

                    {/* ── RIGHT: Sidebar (4 cols) ── */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-200 shadow-lg shadow-slate-100 p-8 rounded-3xl sticky top-24 space-y-6">

                            {/* Desktop: Name & Price */}
                            <div className="hidden lg:block space-y-4 pb-6 border-b border-slate-100">
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                                    {makeName} {modelName}
                                </h1>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.25em]">
                                        {t('details.salePrice')}
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-4xl font-black text-brand-primary tracking-tight">
                                            {Number(vehicle.sale_price).toLocaleString()}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400">EGP</span>
                                    </div>
                                </div>

                                {vehicle.details?.reservation_fee && (
                                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                                        <span className="text-[10px] text-emerald-600 uppercase font-black tracking-[0.2em]">مبلغ جدية الحجز</span>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-3xl font-black text-emerald-600">
                                                {Number(vehicle.details.reservation_fee).toLocaleString()}
                                            </span>
                                            <span className="text-sm font-bold text-emerald-400">EGP</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            {useAuthStore.getState().user?.role !== 'admin' && (
                                <button
                                    onClick={handleBuy}
                                    disabled={bookingStatus === 'submitting'}
                                    className="w-full py-5 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/25 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                                >
                                    <span>
                                        {bookingStatus === 'submitting'
                                            ? t('sell.form.submitting')
                                            : (vehicle.details?.reservation_fee ? 'دفع مبلغ الحجز' : t('details.buyCar'))
                                        }
                                    </span>
                                    <ArrowRight size={20} className="rtl:rotate-180" />
                                </button>
                            )}

                            {useAuthStore.getState().user?.role === 'admin' && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
                                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{t('error.adminNotAllowed')}</p>
                                </div>
                            )}

                            {/* Installment Calculator */}
                            {vehicle?.details?.is_installment_available && (
                                <div className="pt-6 border-t border-slate-100 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={16} className="text-brand-primary" />
                                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">
                                            {t('details.financing.calcTitle')}
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Down Payment Slider */}
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                                <span className="uppercase tracking-tight">{t('details.financing.downPayment')}</span>
                                                <span className="text-brand-primary">{formattedDownPayment} EGP ({downPaymentPercent}%)</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={vehicle.details.min_down_payment_percentage || 20}
                                                max={90}
                                                step={5}
                                                value={downPaymentPercent}
                                                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                            />
                                        </div>

                                        {/* Duration Selector */}
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                                <span className="uppercase tracking-tight">{t('details.financing.months')}</span>
                                                <span className="text-brand-primary">{installmentMonths} {t('common.months')}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[36, 48, 60].map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setInstallmentMonths(m)}
                                                        className={`py-2 text-[11px] font-black rounded-xl transition-all border ${m === installmentMonths
                                                            ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-primary/40 hover:text-brand-primary'
                                                        }`}
                                                    >
                                                        {m}M
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Monthly Payment Result */}
                                        <div className="bg-brand-primary p-5 rounded-2xl text-center space-y-1 shadow-lg shadow-brand-primary/20">
                                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                                {t('details.financing.monthlyPayment')}
                                            </p>
                                            <p className="text-3xl font-black text-white">
                                                {formattedMonthlyPayment} <span className="text-sm font-bold text-white/70">EGP</span>
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleBuy}
                                            className="w-full py-3 text-xs font-black text-brand-primary hover:bg-brand-primary/5 border border-brand-primary/20 hover:border-brand-primary/40 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                        >
                                            {t('details.financing.applyNow')}
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Trust Footer */}
                            <div className="pt-5 border-t border-slate-100 flex justify-around">
                                {[
                                    { icon: ShieldCheck, label: 'SSL Secure' },
                                    { icon: Star,        label: '5 Star' },
                                    { icon: CheckCircle2, label: 'Verified' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex flex-col items-center gap-1 text-slate-300 hover:text-brand-primary transition-colors">
                                        <Icon size={22} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                type={alertConfig.type}
                message={alertConfig.message}
            />
        </div>
    );
};

export default VehicleDetails;
