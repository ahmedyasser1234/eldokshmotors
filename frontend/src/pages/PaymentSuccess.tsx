import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || document.documentElement.dir === 'rtl';

    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const confirmingRef = React.useRef(false);

    const vehicleId = searchParams.get('vehicleId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        const confirmOrder = async () => {
            if (!vehicleId || confirmingRef.current) {
                return;
            }

            try {
                confirmingRef.current = true;
                // Create Sale Request via API (Same as what Checkout.tsx does after payment)
                await api.post('/sales', {
                    vehicleId: vehicleId,
                    finalPrice: Number(amount),
                    payment_method: 'stripe',
                    receipt_url: '' // Not needed for stripe-hosted
                });
                
                setProcessing(false);
            } catch (err: any) {
                console.error('Error confirming order:', err);
                setError(err.response?.data?.message || 'Failed to confirm order in our system, but payment was successful.');
                setProcessing(false);
                confirmingRef.current = false; // Allow retry on error if needed
            }
        };

        confirmOrder();
    }, [vehicleId, amount]);

    if (processing) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
                <Loader2 className="w-16 h-16 text-brand-primary animate-spin mb-6" />
                <h1 className="text-2xl font-black text-slate-900 mb-2">{isRTL ? 'جاري تأكيد طلبك...' : 'Confirming your order...'}</h1>
                <p className="text-slate-400 font-bold">{isRTL ? 'برجاء عدم إغلاق الصفحة' : 'Please do not close this page'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
                <div className="bg-white border border-red-200 rounded-3xl p-12 max-w-lg w-full text-center shadow-sm">
                    <h2 className="text-3xl font-black mb-4 text-red-500">{isRTL ? 'عفواً، حدث خطأ' : 'Oops, something went wrong'}</h2>
                    <p className="text-slate-500 font-bold mb-8">{error}</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white rounded-2xl font-black transition-all"
                    >
                        {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-lg border border-emerald-100 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 rounded-t-3xl"></div>
                <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-30"></div>
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">{isRTL ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed!'}</h2>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed px-4">
                    {isRTL 
                        ? 'تم استلام وتأكيد الدفع الخاص بك وجاري إتمام المعاملة. يمكنك تتبع حالة الطلب من لوحة التحكم.'
                        : 'Your payment was successfully received and is being processed. You can track your order status in the dashboard.'}
                </p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-3"
                >
                    <span>{isRTL ? 'متابعة الطلب في لوحة التحكم' : 'Track Order in Dashboard'}</span>
                    <ArrowRight size={20} className="rtl:rotate-180" />
                </button>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
