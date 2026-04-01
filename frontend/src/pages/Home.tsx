import React, { useEffect, useRef, useState } from 'react';
import {
  CreditCard,
  ArrowRight,
  Star,
  CheckCircle2,
  Repeat,
  Car,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useScroll, useTransform, motion } from 'framer-motion';
import api from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';
import RecentlySold from '../components/RecentlySold';
import Logo from '../components/Logo';
import ReviewSection from '../components/ReviewSection';
import SEO from '../components/SEO';


const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  const { scrollYProgress } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [recentVehicles, setRecentVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Video Playlist Logic
  const videoPlaylist = ['/12.mp4', '/212.mp4'];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const yRange = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const recentLimit = 3;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await api.get('/vehicles', { params: { limit: 6, sort: 'sale_price:DESC', status: 'available' } });
        setFeaturedVehicles(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching featured vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoadingRecent(true);
        const response = await api.get('/vehicles', {
          params: { limit: recentLimit, sort: 'created_at:DESC', status: 'available' }
        });

        if (response.data && response.data.data) {
          setRecentVehicles(response.data.data);
        } else {
          setRecentVehicles(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching recent vehicles:', error);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecent();
  }, []);



  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
      // Ensure the video plays immediately if it was paused during index change
      videoRef.current.play().catch(e => console.log("Auto-play blocked:", e));
    }
  }, [currentVideoIndex]);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <SEO 
        title={t('seo.home.title')}
        description={t('seo.home.description')}
      />
      {/* Hero Section with Sequential Cinematic Video Background */}
      <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center text-white overflow-hidden bg-brand-dark">
        <motion.div
          style={{ y: yRange, opacity: opacityRange }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-brand-dark/50 to-brand-dark z-10" />

          {/* Sequential Playlist Video */}
          <video
            key={videoPlaylist[currentVideoIndex]}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover object-center opacity-60"
            poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2600"
          >
            <source src={videoPlaylist[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-32 pb-20 md:pt-0 md:pb-0">
          <div className="max-w-3xl space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent border border-white/20 rounded-full text-white font-bold uppercase tracking-widest text-[9px] md:text-xs backdrop-blur-xl shadow-2xl shadow-brand-accent/40"
            >
              <Star size={12} className="fill-white animate-pulse" />
              {t('common.agency')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase"
            >
              <span className="block drop-shadow-2xl">{t('home.hero.mainTitle').split(' ')[0]}</span>
              <span className="text-brand-accent block mt-2 drop-shadow-2xl">{t('home.hero.mainTitle').split(' ').slice(1).join(' ')}</span>
            </motion.h1>

            <p className="text-sm md:text-xl text-slate-100 font-medium max-w-xl leading-relaxed drop-shadow-md">
              {t('home.hero.subTitle')}
            </p>

            <div className="pt-6 md:pt-10 flex flex-wrap gap-4">
              <Link to="/vehicles" className="w-full sm:w-auto bg-brand-accent hover:bg-white text-white hover:text-brand-dark px-8 md:px-12 py-4 md:py-6 rounded-2xl font-black text-sm md:text-xl transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-brand-accent/50 hover:scale-105 active:scale-95">
                <span>{t('home.hero.explore')}</span>
                <ArrowRight className="rtl:rotate-180 group-hover:translate-x-2 transition-transform h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <Link to="/sell-car" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-black text-sm md:text-xl transition-all flex items-center justify-center gap-4 group backdrop-blur-xl border border-white/10 hover:scale-105 active:scale-95">
                <span>{t('nav.sellCar')}</span>
                <Car className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <div className="hidden md:flex items-center gap-4 text-white/60 font-black tracking-[0.3em] uppercase text-xs">
                <span className="w-12 h-[2px] bg-brand-accent" />
                {t('home.hero.brandTag')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white text-brand-dark relative overflow-hidden scroll-mt-24">
        {/* Decorative Background Car */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-50 text-[#00a8e8] pointer-events-none z-0 scale-x-[-1]">
          <Car className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px]" strokeWidth={0.5} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20 space-y-4">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase">{t('home.services.subtitle')}</h2>
            <p className="text-slate-500 text-base md:text-lg font-medium">{t('home.services.title')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { id: 'inspection_center', icon: (props: any) => <Logo {...props} isWhite={true} /> },
              { id: 'finance_solutions', icon: CreditCard },
              { id: 'trade_in', icon: Repeat },
              { id: 'insurance', icon: ShieldCheck }
            ].map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 md:p-10 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-brand-dark transition-all duration-300 shadow-sm"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-accent group-hover:bg-brand-accent rounded-xl flex items-center justify-center mb-6 md:mb-8 transition-colors">
                  <service.icon className="text-white h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 uppercase tracking-tight group-hover:text-white">{t(`home.services.${service.id}.title`)}</h3>
                <p className="text-slate-500 group-hover:text-white/80 text-xs md:text-sm leading-relaxed">
                  {t(`home.services.${service.id}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sales Section */}
      <section id="featured-sales" className="py-16 md:py-24 bg-white relative overflow-hidden scroll-mt-24">
        {/* Decorative Background Car */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-50 text-[#00a8e8] pointer-events-none z-0">
          <Car className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px]" strokeWidth={0.5} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3 md:space-y-4"
            >
              <span className="text-brand-accent font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px] block border-l-4 border-brand-accent pl-4">{t('home.featured_sales.title')}</span>
              <h2 className="text-3xl md:text-6xl font-black text-brand-dark tracking-tighter leading-none uppercase">{t('home.featured_sales.subtitle')}</h2>
            </motion.div>
            <div className="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <CheckCircle2 className="text-brand-accent w-5 h-5 md:w-6 md:h-6" />
              <div className="flex flex-col">
                <span className="text-brand-dark font-bold uppercase text-sm md:text-base">{t('home.why_us.inspection_verified')}</span>
                <span className="text-slate-400 font-bold text-[8px] md:text-[10px] tracking-widest uppercase">ELDOKSH CERTIFIED</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
            {loading ? (
              // Skeleton or Loading Spinner
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="h-96 md:h-[500px] bg-slate-50 rounded-3xl animate-pulse" />
              ))
            ) : featuredVehicles.length > 0 ? (
              featuredVehicles.map((car: any, idx) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  <div className="relative h-32 sm:h-56 md:h-64 overflow-hidden bg-slate-50">
                    <img
                      src={normalizeImageUrl(car.image_urls?.[0]) ||
                        (car.img || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000')}
                      alt={car.name || `${isAr ? (car.make_ar || car.make_en) : (car.make_en || car.make_ar)} ${isAr ? (car.model_ar || car.model_en) : (car.model_en || car.model_ar)}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000';
                      }}
                    />
                  </div>

                  <div className="flex-1 p-3 md:p-8 flex flex-col">
                    <div className="mb-auto">
                      <span className="text-[7px] md:text-[10px] font-bold text-brand-accent uppercase tracking-widest block mb-1 md:mb-2">{t(`categories.${car.category?.toLowerCase() || 'luxury'}`)}</span>
                      <h3 className="text-[10px] sm:text-base md:text-2xl font-black text-brand-dark tracking-tight uppercase leading-tight">
                        {isAr ? (car.make_ar || car.make_en) : (car.make_en || car.make_ar)} {' '}
                        {isAr ? (car.model_ar || car.model_en) : (car.model_en || car.model_ar)}
                      </h3>
                    </div>

                    <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                      <div className="space-y-0.5 md:space-y-1">
                        <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('details.salePrice')}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs sm:text-lg md:text-2xl font-black text-brand-dark font-mono">{Number(car.sale_price).toLocaleString()} <span className="text-sm font-bold opacity-70">EGP</span></span>
                        </div>
                      </div>
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-accent rounded-xl md:rounded-2xl text-white flex items-center justify-center group-hover:bg-brand-dark transition-all shadow-lg shadow-brand-accent/10">
                        <ArrowRight className="rtl:rotate-180 h-3.5 w-3.5 md:h-5 md:w-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest">{isAr ? 'لا توجد سيارات معروضة حالياً' : 'No featured vehicles available'}</div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <Link
              to="/vehicles"
              className="px-12 py-5 bg-brand-dark hover:bg-brand-accent text-white rounded-2xl font-black text-lg transition-all flex items-center gap-4 group shadow-xl hover:shadow-brand-accent/30"
            >
              <span>{isAr ? 'شاهد المزيد' : 'See More'}</span>
              <ArrowRight className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recently Added Section Block */}
      <div className="relative">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[99%] z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-slate-950">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <section id="recent-additions" className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <span className="text-brand-accent font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px] block border-l-4 border-brand-accent pl-4">
                  {t('home.recent_additions.title')}
                </span>
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                  {t('home.recent_additions.subtitle')}
                </h2>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[400px]">
              {loadingRecent ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl h-96 rounded-[2.5rem] animate-pulse" />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {recentVehicles.map((car, idx) => (
                      <motion.div
                        key={car.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group"
                      >
                        <Link to={`/vehicles/${car.id}`} className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/20">
                          <div className="relative h-64 md:h-72 overflow-hidden">
                            <img
                              src={normalizeImageUrl(car.image_urls?.[0]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'}
                              alt={isAr ? car.model_ar : car.model_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute top-6 left-6">
                              <span className="px-4 py-1.5 bg-brand-accent/90 text-white rounded-full font-black text-[9px] uppercase tracking-widest backdrop-blur-md">
                                {car.year}
                              </span>
                            </div>
                          </div>
                          <div className="p-8">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                              {isAr ? (car.make_ar || car.make_en) : (car.make_en || car.make_ar)}
                              <span className="block text-sm text-slate-400 font-bold mt-1 uppercase">
                                {isAr ? (car.model_ar || car.model_en) : (car.model_en || car.model_ar)}
                              </span>
                            </h3>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-[99%] z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-slate-950">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      <RecentlySold />


      {/* How it Works / The Track */}
      <section id="how-it-works" className="py-16 md:py-20 bg-slate-50 relative overflow-hidden scroll-mt-24">
        {/* Decorative Background Car */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-50 text-[#00a8e8] pointer-events-none z-0">
          <Car className="w-[600px] h-[600px] md:w-[800px] md:h-[800px]" strokeWidth={0.5} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
            <div className="space-y-8 md:space-y-10">
              <div className="space-y-3 md:space-y-4">
                <span className="text-brand-accent font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px] flex items-center gap-3 md:gap-4">
                  <span className="w-6 md:w-8 h-[2px] bg-brand-accent" />
                  {t('home.how_it_works.title')}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-brand-dark tracking-tighter uppercase leading-tight">{t('home.how_it_works.subtitle')}</h2>
              </div>

              <div className="grid gap-4 md:gap-6">
                {[1, 2, 3, 4].map(num => (
                  <div
                    key={num}
                    className="flex gap-4 md:gap-6 p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-brand-accent/20 transition-all"
                  >
                    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-brand-dark font-bold text-base md:text-lg">
                      {num}
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-brand-dark mb-1 uppercase tracking-tight">{t(`home.how_it_works.step${num}.title`)}</h4>
                      <p className="text-slate-500 text-[10px] md:text-xs font-medium leading-relaxed">{t(`home.how_it_works.step${num}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-32 mt-12 lg:mt-0">
              <div className="bg-brand-dark p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent animate-pulse opacity-10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <Star className="text-brand-accent fill-brand-accent mb-4 md:mb-6 h-7 w-7 md:h-8 md:w-8" />
                <p className="text-lg md:text-2xl font-bold leading-snug mb-8 md:mb-10">
                  "{t('home.why_us.title')}"
                </p>
                <div className="flex items-center gap-4 md:gap-5 border-t border-white/10 pt-6 md:pt-8">
                  <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                    <Logo isWhite={true} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base md:text-lg tracking-wide uppercase">{t('common.brandName')}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
                      <p className="text-brand-accent font-bold tracking-[0.2em] text-[8px] uppercase">{t('details.verified')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Block */}
      <div className="relative">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[99%] z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-slate-950">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <section className="relative py-20 md:py-32 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-brand-accent/5 opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-8 md:space-y-10">
                <span className="text-brand-accent font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px] border-l-4 border-brand-accent pl-4">{t('home.cta.subtitle')}</span>
                <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase leading-tight">
                  {t('home.cta.title')}
                </h2>
                <div className="space-y-6 md:space-y-8">
                  <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-lg">
                    {t('home.cta.desc')}
                  </p>
                  <Link to="/sell-car" className="w-full sm:w-fit bg-white hover:bg-brand-accent text-brand-dark hover:text-white px-8 md:px-10 py-4 md:py-6 rounded-2xl font-black text-sm md:text-xl transition-all flex items-center justify-center gap-3 shadow-2xl">
                    <span>{t('home.cta.button')}</span>
                    <Car className="h-5 w-5 md:h-6 md:w-6" />
                  </Link>
                </div>
              </div>
              <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl skew-y-1 mt-10 md:mt-0 border border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&q=80&w=1200"
                  className="w-full h-[300px] md:h-[600px] object-cover"
                  alt="Showroom"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-[99%] z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-slate-950">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      <ReviewSection />

      {/* Footer Branding - Static High Contrast */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-100 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 md:gap-24">
            <div className="h-8 sm:h-28 md:h-36 flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="text-2xl sm:text-7xl md:text-9xl font-black uppercase bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary bg-clip-text text-transparent py-2">
              ELDOKSH
            </span>
            <div className="h-8 sm:h-28 md:h-36 flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
