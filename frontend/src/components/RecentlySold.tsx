import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star, Car } from 'lucide-react';
import api from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const RecentlySold: React.FC = () => {
    const { t } = useTranslation();
    const [soldSales, setSoldSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentSold = async () => {
            try {
                const response = await api.get('/sales/recent-sold');
                setSoldSales(response.data);
            } catch (error) {
                console.error("Error fetching recent sold:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentSold();
    }, []);

    if (!loading && soldSales.length === 0) return null;

    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 blur-[120px] rounded-full"></div>
            </div>
            {/* Decorative Background Car */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-50 text-[#00a8e8] pointer-events-none z-0 scale-x-[-1]">
                <Car className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px]" strokeWidth={0.5} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="rtl:text-right"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-12 h-1 bg-brand-accent rounded-full"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">{t('home.recently_sold.title')}</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase">
                            {t('home.recently_sold.subtitle').split(' ')[0]} <span className="text-brand-accent">{t('home.recently_sold.subtitle').split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <p className="mt-6 text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                            {t('home.recently_sold.desc')}
                        </p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <Link to="/vehicles" className="group flex items-center gap-4 px-10 py-5 bg-white border border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500 shadow-sm">
                            {t('home.recently_sold.view_fleet')}
                            <ChevronRight size={18} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-[450px] bg-slate-200 animate-pulse rounded-[3rem]"></div>
                        ))
                    ) : (
                        soldSales.map((sale, index) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col group">
                                    {/* Sold Tag */}
                                    <div className="absolute top-6 right-6 z-20">
                                        <div className="px-4 py-1.5 bg-brand-accent text-white rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg shadow-brand-accent/30 flex items-center gap-2">
                                            <Star size={10} fill="currentColor" />
                                            {t('home.recently_sold.sold_status')}
                                        </div>
                                    </div>

                                    {/* Image Section */}
                                    <div className="relative h-32 sm:h-56 md:h-64 overflow-hidden bg-slate-50">
                                        <img 
                                            src={normalizeImageUrl(sale.vehicle?.image_urls?.[0]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'} 
                                            alt={sale.vehicle?.model_en}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-3 md:p-8 flex flex-col rtl:text-right">
                                        <div className="mb-auto">
                                            <span className="text-[7px] md:text-[10px] font-bold text-brand-accent uppercase tracking-widest block mb-1 md:mb-2">{sale.vehicle?.year}</span>
                                            <h4 className="text-[10px] sm:text-base md:text-2xl font-black text-brand-dark tracking-tight uppercase leading-tight">
                                                {t('common.make_ar') === 'الماركة (بالعربي)' ? (sale.vehicle?.make_ar || sale.vehicle?.make_en) : (sale.vehicle?.make_en || sale.vehicle?.make_ar)}
                                                <span className="block text-sm text-slate-500 font-bold mt-1 uppercase">
                                                    {t('common.model_ar') === 'الموديل (بالعربي)' ? (sale.vehicle?.model_ar || sale.vehicle?.model_en) : (sale.vehicle?.model_en || sale.vehicle?.model_ar)}
                                                </span>
                                            </h4>
                                        </div>
                                        
                                        <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-slate-50 flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                                                    <ShoppingBag size={12} className="text-slate-400" />
                                                    <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('home.recently_sold.final_price')}</span>
                                                </div>
                                                <span className="text-xs sm:text-lg md:text-2xl font-black text-brand-dark font-mono">{Number(sale.final_price).toLocaleString()} EGP</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('home.recently_sold.sale_date')}</span>
                                                <span className="text-[10px] font-bold text-slate-500 italic">
                                                    {new Date(sale.updated_at || sale.sale_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default RecentlySold;
