import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, Car, User, Route, ChevronRight, Star, Shield, Clock, CheckCircle, Heart, MapPin } from 'lucide-react';
import api from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';
import MapPicker from '../components/MapPicker';

type RentalMode = 'self' | 'driver' | 'trip' | 'wedding';

interface LocationData {
    address: string;
    lat: number;
    lng: number;
}

const Rental: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    // Search state
    const [location, setLocation] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [rentalMode, setRentalMode] = useState<RentalMode>('self');
    
    // Map states
    const [tripStartPos, setTripStartPos] = useState<LocationData | null>(null);
    const [tripEndPos, setTripEndPos] = useState<LocationData | null>(null);
    const [showMapPicker, setShowMapPicker] = useState<'start' | 'end' | null>(null);

    const [pickupDateTime, setPickupDateTime] = useState('');

    // Vehicles state
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);



    useEffect(() => {
        const fetchRentals = async () => {
            try {
                setLoading(true);
                const res = await api.get('/vehicles', { params: { status: 'available', limit: 50 } });
                const all = res.data.data || res.data;
                const rentals = all.filter((v: any) => v.is_for_rent === true);
                setVehicles(rentals);
                setFilteredVehicles(rentals);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRentals();
    }, []);



    const handleSearch = () => {
        setSearched(true);
        let result = [...vehicles];
        
        // Filter by specific car if selected in the dropdown
        if (location) {
            result = result.filter(v => v.id === location);
        }

        // Filter by selected rental mode
        result = result.filter(v => {
            // Default to 'self' if allowed_rental_modes is empty or null
            const allowed = v.allowed_rental_modes || ['self'];
            return allowed.includes(rentalMode);
        });

        setFilteredVehicles(result);
        const el = document.getElementById('rental-results');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getDayDiff = () => {
        if (!pickupDate || !returnDate) return 1;
        const d1 = new Date(pickupDate);
        const d2 = new Date(returnDate);
        const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };


    const modeOptions: { id: RentalMode; icon: React.FC<any>; labelAr: string; labelEn: string; descAr: string; descEn: string }[] = [
        { id: 'self', icon: Car, labelAr: 'قيادة ذاتية', labelEn: 'Self Drive', descAr: 'قيادة ذاتية — أنت تقود بنفسك', descEn: 'Drive yourself with full freedom' },
        { id: 'trip', icon: Route, labelAr: 'رحلة بسائق', labelEn: 'Trip with Driver', descAr: 'تأجير لرحلة أو مشوار خاص مع سائق محترف', descEn: 'Book for a private trip or outing with a driver' },
        { id: 'wedding', icon: Heart, labelAr: 'زفاف', labelEn: 'Wedding', descAr: 'خدمة سيارات الزفاف الفاخرة مع سائق', descEn: 'Luxury wedding car service with driver' },
    ];

    const features = [
        { icon: Shield, titleAr: 'تأمين شامل', titleEn: 'Full Insurance', descAr: 'تغطية كاملة ضد الحوادث', descEn: 'Comprehensive accident coverage' },
        { icon: Clock, titleAr: 'تسليم في 30 دقيقة', titleEn: '30-Min Delivery', descAr: 'توصيل السيارة لموقعك', descEn: 'Car delivered to your location' },
        { icon: CheckCircle, titleAr: 'لا رسوم خفية', titleEn: 'No Hidden Fees', descAr: 'أسعار واضحة وشفافة', descEn: 'Transparent and clear pricing' },
        { icon: Star, titleAr: 'سيارات مميزة', titleEn: 'Premium Fleet', descAr: 'أحدث السيارات وأرقاها', descEn: 'Latest and most premium cars' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title={isRTL ? 'إيجار السيارات | كوبراماتورز' : 'Car Rental | Cobramotors'}
                description={isRTL ? 'استأجر أرقى السيارات بسهولة — مع سائق أو بدونه أو لمشوار' : 'Rent the finest cars easily — with or without a driver, or book a trip'}
            />

            {/* ── HERO ── */}
            <section className="relative flex flex-col items-center overflow-visible bg-slate-950 pb-32 z-20">
                {/* Image BG */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2600" 
                        alt="Luxury Fleet"
                        className="w-full h-full object-cover object-center opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/90" />
                </div>

                {/* Text — padded top for navbar */}
                <div className="relative z-10 text-center space-y-5 px-4 w-full max-w-4xl mx-auto pt-36 pb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-5 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-md"
                    >
                        {isRTL ? 'خدمة إيجار السيارات' : 'Car Rental Service'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl"
                    >
                        {isRTL ? 'استأجر سيارة أحلامك' : 'Rent Your Dream Car'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 max-w-xl mx-auto text-sm md:text-base font-semibold"
                    >
                        {isRTL
                            ? 'سعر الإيجار اليومي، الأسبوعي، والشهري — قيادة ذاتية أو رحلة بسائق'
                            : 'Daily, weekly & monthly rates — Self drive or trip with driver'
                        }
                    </motion.p>
                </div>

                {/* ── SEARCH BAR — overlapping bottom ── */}
                <div className="absolute z-30 bottom-0 left-0 right-0 translate-y-1/2 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-6xl mx-auto px-4"
                    >
                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 border border-slate-100 p-5 md:p-7">
                        {/* Mode Switcher */}
                        <div className="flex flex-wrap gap-2 mb-5 bg-slate-100 p-1.5 rounded-2xl">
                            {modeOptions.map(mode => {
                                const Icon = mode.icon;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setRentalMode(mode.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all min-w-[120px] ${
                                            rentalMode === mode.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                                        }`}
                                    >
                                        <Icon size={14} />
                                        <span>{isRTL ? mode.labelAr : mode.labelEn}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Fields Row */}
                        <div className={`grid ${(rentalMode === 'trip' || rentalMode === 'wedding') ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'} gap-0 divide-x divide-slate-100 rtl:divide-x-reverse`}>
                            {/* Select Car */}
                            <div className="flex flex-col gap-1.5 px-4 py-3 relative">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Car size={10} className="text-blue-500" />
                                    {t('rental.search.selectCar')}
                                </label>
                                <div className="flex items-center gap-2">
                                    {location && vehicles.find(v => v.id === location)?.image_urls?.[0] && (
                                        <img 
                                            src={normalizeImageUrl(vehicles.find(v => v.id === location).image_urls[0])} 
                                            alt="car"
                                            className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm bg-white"
                                        />
                                    )}
                                    <select
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="bg-transparent outline-none text-sm font-bold text-slate-800 w-full cursor-pointer truncate flex-1 focus:ring-0 appearance-none"
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        <option value="" className="text-slate-400">
                                            {t('rental.search.allCars')}
                                        </option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id} className="text-slate-800 font-semibold">
                                                {isRTL ? `${v.make_ar || v.make_en} ${v.model_ar || v.model_en}` : `${v.make_en || v.make_ar} ${v.model_en || v.model_ar}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date Fields (Conditional) */}
                            {rentalMode !== 'trip' && rentalMode !== 'wedding' ? (
                                <>
                                    <div className="flex flex-col gap-1.5 px-4 py-3 border-x border-slate-100">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar size={10} className="text-blue-500" />
                                            {t('rental.search.pickupDate')}
                                        </label>
                                        <input
                                            type="date"
                                            value={pickupDate}
                                            onChange={e => setPickupDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="bg-transparent outline-none text-sm font-bold text-slate-800 cursor-pointer w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 px-4 py-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar size={10} className="text-blue-500" />
                                            {t('rental.search.returnDate')}
                                        </label>
                                        <input
                                            type="date"
                                            value={returnDate}
                                            onChange={e => setReturnDate(e.target.value)}
                                            min={pickupDate || new Date().toISOString().split('T')[0]}
                                            className="bg-transparent outline-none text-sm font-bold text-slate-800 cursor-pointer w-full"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1.5 px-4 py-3 border-x border-slate-100">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={10} className="text-blue-500" />
                                        {t('rental.search.departureTime')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={pickupDateTime}
                                        onChange={e => setPickupDateTime(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="bg-transparent outline-none text-sm font-bold text-slate-800 cursor-pointer w-full"
                                    />
                                </div>
                            )}

                            {/* Trip specific fields */}
                            {(rentalMode === 'trip' || rentalMode === 'wedding') && (
                                <>
                                    <div className="flex flex-col gap-1.5 px-4 py-3 relative group">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={10} className="text-blue-500" />
                                            {t('rental.search.startPoint')}
                                        </label>
                                        <button 
                                            onClick={() => setShowMapPicker('start')}
                                            className="text-start outline-none text-sm font-bold text-slate-800 placeholder-slate-300 w-full truncate flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                                        >
                                            {tripStartPos ? tripStartPos.address : t('rental.search.selectOnMap')}
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-1.5 px-4 py-3 relative group border-r border-slate-100">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={10} className="text-blue-500" />
                                            {t('rental.search.endPoint')}
                                        </label>
                                        <button 
                                            onClick={() => setShowMapPicker('end')}
                                            className="text-start outline-none text-sm font-bold text-slate-800 placeholder-slate-300 w-full truncate flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                                        >
                                            {tripEndPos ? tripEndPos.address : t('rental.search.selectOnMap')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Search Button */}
                            <div className="flex items-center px-4 py-3">
                                <button
                                    onClick={handleSearch}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                >
                                    <Search size={16} />
                                    {t('rental.search.button')}
                                </button>
                            </div>
                        </div>

                        {/* Days summary */}
                        {pickupDate && returnDate && rentalMode !== 'trip' && rentalMode !== 'wedding' && (
                            <div className="mt-3 text-center text-xs text-slate-400 font-bold">
                                {t('rental.search.duration', { count: getDayDiff() })}
                            </div>
                        )}
                    </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES STRIP — pushed down to give space for overlapping search bar ── */}
            <section className="relative z-10 bg-slate-50 border-b border-slate-100 pt-44 pb-16">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center text-center gap-2"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-1">
                                    <Icon size={28} className="text-blue-600" />
                                </div>
                                <p className="text-base font-black text-slate-800">{isRTL ? f.titleAr : f.titleEn}</p>
                                <p className="text-xs text-slate-400 font-medium">{isRTL ? f.descAr : f.descEn}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ── VEHICLE RESULTS ── */}
            <section id="rental-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">
                            {t('rental.results.badge')}
                        </p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {t(`common.rent.${rentalMode === 'self' ? 'selfDrive' : rentalMode === 'trip' ? 'withDriver' : 'wedding'}`)}
                        </h2>
                    </div>
                    {!loading && (
                        <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t('rental.results.available')}</span>
                            <p className="text-4xl font-black text-blue-600">{filteredVehicles.length}</p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
                            {isRTL ? 'جاري تحميل السيارات...' : 'Loading vehicles...'}
                        </p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <p className="text-6xl mb-4">🚗</p>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                            {isRTL ? 'لا توجد سيارات متاحة للإيجار حالياً' : 'No rental vehicles available'}
                        </p>
                        {searched && (
                            <button
                                onClick={() => { setFilteredVehicles(vehicles); setSearched(false); setLocation(''); }}
                                className="mt-6 px-8 py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest"
                            >
                                {isRTL ? 'عرض الكل' : 'Show All'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVehicles.map((v, i) => {
                            const makeName = isRTL ? (v.make_ar || v.make_en) : (v.make_en || v.make_ar);
                            const modelName = isRTL ? (v.model_ar || v.model_en) : (v.model_en || v.model_ar);
                            return (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 flex flex-col"
                                >
                                    {/* Badge */}
                                    <div className="relative">
                                        <div className="absolute top-4 end-4 z-10 flex gap-2">
                                            <div className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                                                {isRTL ? 'للإيجار' : 'For Rent'}
                                            </div>
                                        </div>
                                        {(rentalMode === 'driver' || rentalMode === 'wedding') && (
                                            <div className="absolute top-4 start-4 z-10">
                                                <div className={`px-3 py-1.5 ${rentalMode === 'wedding' ? 'bg-rose-500/90' : 'bg-purple-600/90'} backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1`}>
                                                    {rentalMode === 'wedding' ? <Heart size={9} /> : <User size={9} />}
                                                    {rentalMode === 'wedding' ? (isRTL ? 'زفاف' : 'Wedding') : (isRTL ? 'مع سائق' : 'Driver')}
                                                </div>
                                            </div>
                                        )}
                                        {rentalMode === 'trip' && (
                                            <div className="absolute top-4 start-4 z-10">
                                                <div className="px-3 py-1.5 bg-emerald-600/90 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                    <Route size={9} />
                                                    {isRTL ? 'مشوار' : 'Trip'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={normalizeImageUrl(v.image_urls?.[0]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                alt={`${makeName} ${modelName}`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-grow flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{makeName} {modelName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{v.year}</span>
                                                <span className="text-[9px] text-blue-600 font-black tracking-widest uppercase">{t(`categories.${v.category}`)}</span>
                                            </div>
                                        </div>

                                        {/* Pricing Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {v.rent_price_per_day > 0 && (
                                                <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                                                    <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">{isRTL ? 'يوم' : 'Day'}</p>
                                                    <p className="text-sm font-black text-blue-700">{Number(v.rent_price_per_day).toLocaleString()}</p>
                                                    <p className="text-[8px] text-blue-400 font-bold">EGP</p>
                                                </div>
                                            )}
                                            {v.rent_price_per_week > 0 && (
                                                <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                                                    <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">{isRTL ? 'أسبوع' : 'Week'}</p>
                                                    <p className="text-sm font-black text-blue-700">{Number(v.rent_price_per_week).toLocaleString()}</p>
                                                    <p className="text-[8px] text-blue-400 font-bold">EGP</p>
                                                </div>
                                            )}
                                            {v.rent_price_per_month > 0 && (
                                                <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                                                    <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">{isRTL ? 'شهر' : 'Month'}</p>
                                                    <p className="text-sm font-black text-blue-700">{Number(v.rent_price_per_month).toLocaleString()}</p>
                                                    <p className="text-[8px] text-blue-400 font-bold">EGP</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rental Mode Summary */}
                                        {rentalMode !== 'self' && (
                                            <div className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold ${rentalMode === 'wedding' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                {rentalMode === 'trip' && <><Route size={12} /> {isRTL ? 'يشمل سائق محترف ورحلة خاصة' : 'Includes professional driver and private trip'}</>}
                                                {rentalMode === 'wedding' && <><Heart size={12} /> {isRTL ? 'باقة الزفاف الفاخرة' : 'Luxury wedding package'}</>}
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams();
                                                params.append('mode', rentalMode);
                                                if (pickupDate) params.append('pickup', pickupDate);
                                                if (returnDate) params.append('return', returnDate);
                                                if (pickupDateTime) params.append('departure', pickupDateTime);
                                                if (tripStartPos) {
                                                    params.append('start_addr', tripStartPos.address);
                                                    params.append('start_lat', tripStartPos.lat.toString());
                                                    params.append('start_lng', tripStartPos.lng.toString());
                                                }
                                                if (tripEndPos) {
                                                    params.append('end_addr', tripEndPos.address);
                                                    params.append('end_lat', tripEndPos.lat.toString());
                                                    params.append('end_lng', tripEndPos.lng.toString());
                                                }
                                                navigate(`/vehicles/${v.id}?${params.toString()}`);
                                            }}
                                            className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                        >
                                            {isRTL ? 'احجز الآن' : 'Book Now'}
                                            <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Map Picker Modal */}
            <MapPicker 
                isOpen={!!showMapPicker}
                onClose={() => setShowMapPicker(null)}
                title={showMapPicker === 'start' ? t('booking.map.pickupPoint') : t('booking.map.dropoffPoint')}
                onSelect={(loc) => {
                    if (showMapPicker === 'start') setTripStartPos(loc);
                    else setTripEndPos(loc);
                    setShowMapPicker(null);
                }}
                initialLocation={showMapPicker === 'start' ? (tripStartPos || undefined) : (tripEndPos || undefined)}
            />
        </div>
    );
};

export default Rental;
