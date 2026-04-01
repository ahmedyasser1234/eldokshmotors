import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText,
    cancelText
}) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
                    >
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center rotate-3 relative hover:rotate-6 transition-transform">
                                <AlertTriangle size={32} className="relative z-10" strokeWidth={2.5} />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {title || (isRTL ? 'تأكيد الحذف' : 'Confirm Deletion')}
                               </h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-[280px] mx-auto opacity-80">
                                    {message}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full pt-4">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 ring-1 ring-slate-200/50 hover:ring-slate-300"
                                >
                                    {cancelText || (isRTL ? 'إلغاء' : 'Cancel')}
                                </button>
                                <button 
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 ring-1 ring-rose-500 hover:ring-rose-600"
                                >
                                    {confirmText || (isRTL ? 'تأكيد' : 'Confirm')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
