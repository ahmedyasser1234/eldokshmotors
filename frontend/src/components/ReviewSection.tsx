import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ChevronRight, ChevronLeft, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import ReviewModal from './ReviewModal';
import { Link } from 'react-router-dom';

const ReviewSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [userReview, setUserReview] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 1 : 5;
  const autoPlayInterval = isMobile ? 5000 : 20000;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const currentReviews = reviews.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/general');
      const data = response.data || [];
      setReviews(data);
      
      if (user) {
        setUserReview(data.find((r: any) => r.user?.id === user.id));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const nextReview = () => {
    if (reviews.length <= itemsPerPage) return;
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevReview = () => {
    if (reviews.length <= itemsPerPage) return;
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    if (reviews.length <= itemsPerPage) return;
    const interval = setInterval(nextReview, autoPlayInterval);
    return () => clearInterval(interval);
  }, [reviews.length, totalPages, autoPlayInterval, itemsPerPage]);

  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left rtl:md:text-right">
          <div className="space-y-4">
            <span className="text-brand-accent font-bold tracking-[0.4em] uppercase text-[10px] block border-l-4 border-brand-accent px-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-brand-accent" />
              {t('common.reviews.subtitle')}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter uppercase leading-none">
              {t('common.reviews.title')}
            </h2>
          </div>

          <div>
            {!user || user.role !== 'admin' ? (
              isAuthenticated ? (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-5 bg-brand-dark hover:bg-brand-accent text-white rounded-2xl font-black text-lg transition-all flex items-center gap-4 group shadow-xl hover:shadow-brand-accent/30 active:scale-95"
                >
                  <span>{userReview ? t('common.reviews.editReview') || 'Edit My Review' : t('common.reviews.addReview')}</span>
                  <Star size={20} className="group-hover:rotate-180 transition-transform" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-brand-dark rounded-2xl font-black text-lg transition-all flex items-center gap-4 group border border-slate-100"
                >
                  <span>{t('common.reviews.loginPrompt')}</span>
                  <ChevronRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
                </Link>
              )
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: isAr ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 100 : -100 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
              >
                {currentReviews.map((review, index) => {
                  const isDark = index % 2 === 0;

                  return (
                    <motion.div
                      key={review.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={`border p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group col-span-1 ${
                        isDark 
                          ? 'bg-brand-dark border-brand-dark text-white hover:bg-brand-primary'
                          : 'bg-slate-50/50 border-slate-100 text-slate-800 hover:bg-white'
                      }`}
                    >
                      <div className="space-y-6">
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={`${
                                i < review.rating
                                  ? isDark ? 'fill-brand-accent text-brand-accent' : 'fill-brand-primary text-brand-primary'
                                  : isDark ? 'text-white/20' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className={`text-lg md:text-xl font-bold leading-relaxed italic line-clamp-4 ${
                          isDark ? 'text-white/90' : 'text-slate-600'
                        }`}>
                          "{review.comment}"
                        </p>
                      </div>

                      <div className={`flex items-center gap-4 pt-8 mt-8 border-t ${
                        isDark ? 'border-white/10' : 'border-slate-100'
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center p-0.5 overflow-hidden border ${
                          isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-100'
                        }`}>
                          <UserIcon size={24} className={isDark ? 'text-brand-accent' : 'text-slate-300'} />
                        </div>
                        <div>
                          <h4 className={`font-black uppercase tracking-tight text-sm ${
                            isDark ? 'text-white' : 'text-brand-dark'
                          }`}>
                            {review.user?.name || 'Anonymous User'}
                          </h4>
                          <p className={`font-bold text-[10px] tracking-widest uppercase mt-0.5 ${
                            isDark ? 'text-white/50' : 'text-slate-400'
                          }`}>
                            ELDOKSH CUSTOMER
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  onClick={prevReview}
                  className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all active:scale-90"
                >
                  <ChevronLeft size={24} className="rtl:rotate-180" />
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`h-2 transition-all rounded-full ${
                        i === currentPage ? 'w-8 bg-brand-accent' : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextReview}
                  className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all active:scale-90"
                >
                  <ChevronRight size={24} className="rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
            <Star size={48} className="text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest leading-loose">
              {t('common.reviews.noReviews')}
            </h3>
          </div>
        )}
      </div>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchReviews}
        initialData={userReview}
      />
    </section>
  );
};

export default ReviewSection;
