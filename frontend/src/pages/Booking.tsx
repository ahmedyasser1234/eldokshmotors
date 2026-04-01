import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Calendar, User, Shield, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Booking: React.FC = () => {
  useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    location: '',
    addons: [] as string[],
    needDriver: false,
  });

  const steps = [
    { id: 1, name: t('booking.steps.step1'), icon: Calendar },
    { id: 2, name: t('booking.steps.step2'), icon: Package },
    { id: 3, name: t('booking.steps.step3'), icon: User },
    { id: 4, name: t('booking.steps.step4'), icon: Shield },
  ];

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const toggleAddon = (addon: string) => {
    setBookingData(prev => ({
      ...prev,
      addons: prev.addons.includes(addon)
        ? prev.addons.filter(a => a !== addon)
        : [...prev.addons, addon]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 selection:bg-brand-primary selection:text-white">
      
      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden mb-10">
          <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 brightness-[0.4]"
              style={{ backgroundImage: `url('/car_bg_premium.png')` }}
          >
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#f8fafc]"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-4 px-6 mt-12 w-full">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                  {t('booking.title', { defaultValue: 'اكمل الحجز' })}
              </h1>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-10">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  currentStep > step.id
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                    : currentStep === step.id
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  currentStep >= step.id ? 'text-brand-primary' : 'text-slate-400'
                }`}>{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-6 mx-2 transition-all duration-500 rounded-full ${
                  currentStep > step.id ? 'bg-brand-primary' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="bg-white border border-slate-200 shadow-sm p-8 md:p-12 rounded-3xl min-h-[420px] flex flex-col">

          {/* Step 1: Dates & Location */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('booking.titles.step1')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {t('booking.labels.pickupDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-slate-800 rtl:text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {t('booking.labels.dropoffDate')}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-slate-800 rtl:text-right"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {t('booking.labels.pickupLocation')}
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all appearance-none font-bold text-slate-700 rtl:text-right cursor-pointer">
                    <option>{t('booking.labels.locationAirport')}</option>
                    <option>{t('booking.labels.locationDowntown')}</option>
                    <option>{t('booking.labels.locationHotel')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add-ons */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('booking.titles.step2')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'seat', key: 'seat', price: 15 },
                  { id: 'ins', key: 'ins', price: 45 },
                  { id: 'gps', key: 'gps', price: 10 },
                  { id: 'wifi', key: 'wifi', price: 20 },
                ].map(addon => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left rtl:text-right ${
                      bookingData.addons.includes(addon.id)
                        ? 'bg-brand-primary/5 border-brand-primary shadow-sm shadow-brand-primary/10'
                        : 'bg-slate-50 border-slate-200 hover:border-brand-primary/40'
                    }`}
                  >
                    <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      bookingData.addons.includes(addon.id) ? 'bg-brand-primary border-brand-primary' : 'border-slate-300'
                    }`}>
                      {bookingData.addons.includes(addon.id) && <Check size={13} className="text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{t(`booking.addons.${addon.key}.name`)}</h4>
                      <p className="text-xs text-slate-400 mb-2">{t(`booking.addons.${addon.key}.desc`)}</p>
                      <span className="text-brand-primary font-black">
                        ${addon.price}<span className="text-[10px] text-slate-400 font-medium lowercase ml-1">/{t('card.day')}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Driver */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('booking.titles.step3')}</h2>
                <p className="text-slate-400 mt-1">{t('booking.labels.driverDesc')}</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <button
                  onClick={() => setBookingData({ ...bookingData, needDriver: false })}
                  className={`py-12 rounded-3xl border-2 transition-all font-black tracking-tight ${
                    !bookingData.needDriver
                      ? 'bg-brand-primary/5 border-brand-primary text-brand-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-brand-primary/30'
                  }`}
                >
                  {t('booking.labels.iWillDrive')}
                </button>
                <button
                  onClick={() => setBookingData({ ...bookingData, needDriver: true })}
                  className={`py-12 rounded-3xl border-2 transition-all font-black tracking-tight ${
                    bookingData.needDriver
                      ? 'bg-brand-primary/5 border-brand-primary text-brand-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-brand-primary/30'
                  }`}
                >
                  {t('booking.labels.hireDriver')}
                  <p className="text-xs text-brand-primary/70 font-bold mt-1">
                    {t('booking.labels.startingAt')} 50 EGP/{t('card.day')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('booking.titles.step4')}</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
                <div className="flex justify-between items-center pb-5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">{t('booking.summary.dailyRate')}</span>
                  <span className="text-xl font-black text-slate-900">500.00 EGP</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{t('booking.summary.period')} (3 {t('booking.summary.days')})</span>
                    <span className="font-black text-slate-700">1,500.00 EGP</span>
                  </div>
                  {bookingData.addons.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('booking.summary.addons')}</span>
                      <span className="font-black text-slate-700">180.00 EGP</span>
                    </div>
                  )}
                  {bookingData.needDriver && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('booking.summary.driver')}</span>
                      <span className="font-black text-slate-700">150.00 EGP</span>
                    </div>
                  )}
                </div>
                <div className="pt-5 border-t border-slate-200 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{t('booking.summary.total')}</p>
                    <p className="text-4xl font-black text-brand-primary">1,830.00 <span className="text-lg">EGP</span></p>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right max-w-[180px] leading-relaxed">{t('booking.summary.taxNote')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-auto pt-10 flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-7 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all border border-slate-200 active:scale-95"
              >
                <ChevronLeft size={20} className="rtl:rotate-180" />
                {t('booking.buttons.back')}
              </button>
            )}
            <button
              onClick={currentStep === 4 ? () => navigate('/checkout') : handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
            >
              {currentStep === 4 ? t('booking.buttons.confirm') : t('booking.buttons.continue')}
              <ChevronRight size={20} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
