import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import VehicleGrid from '../components/VehicleGrid';
import VehicleFilters from '../components/VehicleFilters';
import Pagination from '../components/Pagination';
import api from '../services/api';
import SEO from '../components/SEO';

const Vehicles: React.FC = () => {
    const { t } = useTranslation();
    const headerImg = "/vehicles_header.png";
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        status: 'available',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const offset = (filters.page - 1) * filters.limit;
                const response = await api.get('/vehicles', { 
                    params: { ...filters, offset } 
                });
                
                // Handle new response structure { data, total }
                if (response.data && response.data.data) {
                    setVehicles(response.data.data);
                    setTotal(response.data.total);
                } else {
                    // Fallback for old structure if needed (though we updated it)
                    setVehicles(Array.isArray(response.data) ? response.data : []);
                    setTotal(Array.isArray(response.data) ? response.data.length : 0);
                }
                setError(null);
            } catch (err: any) {
                console.error('Error fetching vehicles:', err);
                setError('Failed to load vehicles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [filters]);

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        // Reset to page 1 when modifying search/category/price, but not when changing page itself
        const updatedFilters = { ...filters, ...newFilters };
        if (!newFilters.page) {
            updatedFilters.page = 1;
        }
        setFilters(updatedFilters);
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const videoPlaylist = ['/147.mp4', '/148.mp4'];
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const handleVideoEnded = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Auto-play blocked:", e));
        }
    }, [currentVideoIndex]);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <SEO 
                title={t('seo.fleet.title')}
                description={t('seo.fleet.description')}
            />
            {/* Branded Hero Header */}
            <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        onEnded={handleVideoEnded}
                        playsInline
                        key={videoPlaylist[currentVideoIndex]}
                        className="w-full h-full object-cover object-center opacity-60"
                        poster={headerImg}
                    >
                        <source src={videoPlaylist[currentVideoIndex]} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-brand-dark/50 to-brand-dark z-10" />
                </div>
                
                <div className="relative z-20 text-center space-y-4 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-brand-accent text-[10px] md:text-sm font-black uppercase tracking-[0.3em] backdrop-blur-md"
                     >
                        {t('home.hero.brandTag')}
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white drop-shadow-2xl"
                    >
                        {t('fleet.title')}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/90 max-w-2xl mx-auto text-sm md:text-lg font-bold drop-shadow-lg"
                    >
                        {t('fleet.subtitle')}
                    </motion.p>
                </div>
            </section>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-32">
                            <VehicleFilters onFilterChange={handleFilterChange} />
                        </div>
                    </aside>

                        {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex justify-between items-end mb-12 border-b border-slate-100 pb-8">
                             <div>
                                <h2 className="text-sm font-bold text-brand-accent uppercase tracking-[0.4em] mb-2">{t('nav.vehicles')}</h2>
                                <p className="text-3xl font-black uppercase tracking-tight text-slate-900">{t('fleet.luxuryCollection')}</p>
                            </div>
                            {!loading && (
                                <div className="hidden sm:block text-right">
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('fleet.showing')}</span>
                                    <p className="text-4xl font-black text-brand-primary">{total}</p>
                                </div>
                            )}
                        </div>

                        {loading ? (
                             <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">{t('fleet.loading')}</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center">
                                <p className="text-red-500 font-bold mb-4">{error}</p>
                                 <button 
                                    onClick={() => setFilters({...filters})} 
                                    className="px-8 py-3 bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-xs"
                                 >
                                    {t('fleet.retry')}
                                </button>
                            </div>
                         ) : vehicles.length === 0 ? (
                            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100 px-6">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">{t('fleet.noVehicles')}</p>
                            </div>
                        ) : (
                            <>
                                <VehicleGrid vehicles={vehicles} />
                                <Pagination 
                                    currentPage={filters.page} 
                                    totalPages={Math.ceil(total / filters.limit)} 
                                    onPageChange={handlePageChange} 
                                />
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Vehicles;
