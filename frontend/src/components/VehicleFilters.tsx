import React from 'react';
import { useTranslation } from 'react-i18next';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

const VehicleFilters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-2xl shadow-brand-primary/5 border border-slate-100 p-8 rounded-3xl sticky top-32 transition-all">
      <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4 tracking-tight uppercase">{t('filters.title')}</h3>
      
      <div className="space-y-8">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">{t('filters.search')}</label>
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all rtl:text-right font-medium"
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">{t('filters.category')}</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all rtl:text-right font-bold appearance-none cursor-pointer"
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">{t('filters.allCategories')}</option>
            <option value="economy">{t('categories.economy')}</option>
            <option value="luxury">{t('categories.luxury')}</option>
            <option value="suv">{t('categories.suv')}</option>
            <option value="sport">{t('categories.sport')}</option>
            <option value="van">{t('categories.van')}</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">{t('filters.priceRange')}</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder={t('filters.min')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold placeholder:font-normal"
            />
            <span className="text-slate-300">/</span>
            <input
              type="number"
              placeholder={t('filters.max')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold placeholder:font-normal"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">{t('filters.availability')}</label>
          <div className="space-y-4">
            {['available', 'reserved'].map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 transition-all cursor-pointer" />
                <span className="text-slate-500 font-bold group-hover:text-brand-primary transition-colors text-sm">{t(`status.${status}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-xl transition-all shadow-xl shadow-brand-primary/20 active:scale-95 mt-4 uppercase tracking-[0.2em] text-xs"
        >
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;
