import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating || 0);
      setComment(initialData?.comment || '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      if (initialData) {
        await api.patch(`/reviews/${initialData.id}`, { rating, comment });
      } else {
        await api.post('/reviews', { rating, comment });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف تقييمك؟' : 'Are you sure you want to delete your review?')) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/reviews/${initialData.id}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 text-slate-400 hover:text-brand-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-4 mb-10">
                <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight">
                  {initialData ? (t('common.reviews.editReview') || 'Edit Your Review') : t('common.reviews.addReview')}
                </h2>
                <p className="text-slate-500 font-medium">
                  {initialData ? (isAr ? 'قم بتحديث رأيك ونجوم التقييم' : 'Update your comment and stars') : t('common.reviews.success')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    {t('common.reviews.rating')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          size={40}
                          className={`${
                            star <= (hover || rating)
                              ? 'fill-brand-accent text-brand-accent'
                              : 'text-slate-200'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Area */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 block">
                    {t('common.reviews.comment')}
                  </label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isAr ? 'شاركنا تفاصيل تجربتك...' : 'Share details of your experience...'}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[150px] outline-none focus:border-brand-accent/30 focus:ring-4 focus:ring-brand-accent/5 transition-all text-brand-dark font-medium resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || isDeleting || rating === 0}
                    className="w-full py-5 bg-brand-dark hover:bg-brand-accent text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-brand-accent/30 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-brand-dark"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{initialData ? (isAr ? 'تحديث التقييم' : 'Update Review') : t('common.reviews.submit')}</span>
                        <Send size={20} className="rtl:rotate-180" />
                      </>
                    )}
                  </button>

                  {initialData && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting || isDeleting}
                      className="w-full py-4 text-red-500 hover:text-red-600 font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? '...' : (isAr ? 'حذف التقييم' : 'Delete Review')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
