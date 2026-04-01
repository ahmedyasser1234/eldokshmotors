import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void; // If provided, shows "Confirm" and "Cancel" buttons
    confirmText?: string;
    cancelText?: string;
    title?: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    isConfirming?: boolean; // For loading state during confirmation
}

const AlertModal: React.FC<AlertModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    confirmText,
    cancelText,
    title, 
    message,
    type = 'error',
    isConfirming = false
}) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const iconColors = {
        error: 'bg-red-500 text-white shadow-red-500/40',
        success: 'bg-emerald-500 text-white shadow-emerald-500/40',
        warning: 'bg-amber-500 text-white shadow-amber-500/40',
        info: 'bg-brand-primary text-white shadow-brand-primary/40'
    };

    const isConfirmation = !!onConfirm;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[400px] bg-[#0c0c0e] border border-white/10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden p-10 text-center"
                    >
                        {/* Glow effect */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] opacity-20 pointer-events-none rounded-full ${type === 'error' ? 'bg-red-500' : 'bg-brand-primary'}`} />

                        <div className="relative space-y-8">
                            <div className="flex justify-center">
                                <motion.div 
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl ${iconColors[type]}`}
                                >
                                    {type === 'error' ? <XCircle size={40} strokeWidth={2.5} /> : <AlertCircle size={40} strokeWidth={2.5} />}
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white tracking-tight uppercase ltr:tracking-tighter">
                                    {title || (
                                        type === 'error' ? (isRTL ? 'خطأ' : 'Error') : 
                                        type === 'success' ? (isRTL ? 'نجاح' : 'Success') :
                                        (isRTL ? 'تأكيد' : 'Confirm')
                                    )}
                                </h3>
                                <p className="text-gray-400 font-bold leading-relaxed text-sm max-w-[280px] mx-auto border-t border-white/5 pt-4">
                                    {message}
                                </p>
                            </div>

                            <div className={`flex ${isConfirmation ? 'flex-row' : 'flex-col'} gap-4`}>
                                {isConfirmation && (
                                    <button 
                                        onClick={onClose}
                                        disabled={isConfirming}
                                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest border border-white/10 disabled:opacity-50"
                                    >
                                        {cancelText || (isRTL ? 'إلغاء' : 'Cancel')}
                                    </button>
                                )}
                                <button 
                                    onClick={onConfirm || onClose}
                                    disabled={isConfirming}
                                    className={`flex-1 py-5 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                                        type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 
                                        'bg-white text-black hover:bg-gray-200'
                                    } disabled:opacity-50`}
                                >
                                    {isConfirming ? (
                                        <div className="w-4 h-4 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
                                    ) : (
                                        confirmText || (isRTL ? 'موافق' : 'OK')
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AlertModal;
