import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalizeImageUrl } from '../utils/imageUtils';

interface VehicleCardProps {
  vehicle: {
    id: string;
    make_ar: string;
    make_en: string;
    model_ar: string;
    model_en: string;
    year: number;
    category: string;
    rent_price_per_day?: number;
    sale_price?: number;
    image_urls: string[];
    status: string;
  };
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div 
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
      className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 group flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={normalizeImageUrl(vehicle.image_urls?.[0]) || 
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'}
          alt={`${t('common.make_ar') === 'الماركة (بالعربي)' ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar)} ${t('common.model_ar') === 'الموديل (بالعربي)' ? (vehicle.model_ar || vehicle.model_en) : (vehicle.model_en || vehicle.model_ar)}`}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-2 left-2 md:top-6 md:left-6 bg-brand-primary text-white text-[8px] md:text-[10px] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-brand-primary/20 z-10">
          {t(`categories.${vehicle.category}`)}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content */}
      <div className="p-4 md:p-10 flex flex-col flex-1">
        <div className="mb-4 md:mb-8">
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <span className="text-[8px] md:text-xs font-black text-brand-accent uppercase tracking-[0.2em] md:tracking-[0.3em]">{vehicle.year}</span>
            <div className="h-px flex-1 bg-slate-100 mx-3 md:mx-6 hidden sm:block" />
          </div>
          <h3 className="text-lg md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] group-hover:text-brand-primary transition-colors">
            {t('common.make_ar') === 'الماركة (بالعربي)' ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar)}
            <span className="block text-slate-400 text-sm md:text-xl font-bold mt-0.5 md:mt-1">
                {t('common.model_ar') === 'الموديل (بالعربي)' ? (vehicle.model_ar || vehicle.model_en) : (vehicle.model_en || vehicle.model_ar)}
            </span>
          </h3>
        </div>
        
        <div className="mt-auto space-y-4 md:space-y-6">
            <div className="pt-4 md:pt-6 border-t border-slate-50">
                {vehicle.sale_price && (
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">{t('card.buy')}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-3xl font-black text-slate-900">{Number(vehicle.sale_price).toLocaleString()} <span className="text-sm font-bold opacity-70">EGP</span></span>
                        </div>
                    </div>
                )}
            </div>

            <button 
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              className="w-full py-2.5 md:py-4 bg-slate-50 hover:bg-brand-primary text-slate-900 hover:text-white font-black rounded-xl md:rounded-2xl transition-all active:scale-[0.98] border border-slate-100 hover:border-brand-primary uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]"
            >
              {t('card.viewDetails')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
