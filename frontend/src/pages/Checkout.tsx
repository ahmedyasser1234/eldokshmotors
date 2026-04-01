import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    CreditCard, Smartphone, Banknote, ShieldCheck,
    Upload, CheckCircle, ArrowRight, Loader2, Lock, XCircle
} from 'lucide-react';
import api from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';
import { useAuthStore } from '../store/authStore';

type PaymentMethod = 'stripe' | 'vodafone' | 'instapay' | 'fawry';

const CheckoutContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { user } = useAuthStore();
    const isRTL = i18n.language === 'ar' || document.documentElement.dir === 'rtl';

    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = React.useRef(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            if (user?.role === 'admin') { navigate('/admin/dashboard'); return; }
            try {
                const response = await api.get(`/vehicles/${id}`);
                setVehicle(response.data);
            } catch {
                navigate('/vehicles');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id, navigate]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setReceiptFile(file); setReceiptPreview(URL.createObjectURL(file)); }
    };

    const handleCheckout = async () => {
        if (!vehicle || submittingRef.current) return;
        try {
            submittingRef.current = true;
            setSubmitting(true);
            let receiptUrl = '';
            const finalPrice = vehicle.details?.reservation_fee
                ? Number(vehicle.details.reservation_fee)
                : Number(vehicle.sale_price);

            if (paymentMethod === 'stripe') {
                const { data: sessionData } = await api.post('/payments/create-session', {
                    amount: finalPrice, vehicleId: id,
                    vehicleName: isRTL ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar)
                });
                if (sessionData.url) { window.location.href = sessionData.url; return; }
                throw new Error('Failed to create Stripe session');
            }

            if (['vodafone', 'instapay', 'fawry'].includes(paymentMethod) && receiptFile) {
                const formData = new FormData();
                formData.append('file', receiptFile);
                try {
                    const uploadRes = await api.post('/media/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    receiptUrl = uploadRes.data.url;
                } catch {
                    setErrorMsg(isRTL ? 'فشل رفع الإيصال، الرجاء التأكد من حجم الملف (أقصى حد 5 ميجابايت) ونوعه.' : 'Receipt upload failed. Please check file size and format.');
                    setSubmitting(false);
                    return;
                }
            }

            await api.post('/sales', {
                vehicleId: vehicle.id, finalPrice,
                payment_method: paymentMethod, receipt_url: receiptUrl
            });
            setSuccess(true);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || err.message || (isRTL ? 'حدث خطأ أثناء تأكيد الدفع' : 'Payment error occurred'));
            submittingRef.current = false;
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] pt-24 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
            </div>
        );
    }
    if (!vehicle) return null;

    const amountToPay = vehicle.details?.reservation_fee
        ? Number(vehicle.details.reservation_fee)
        : Number(vehicle.sale_price);

    // Payment method options
    const paymentOptions = [
        {
            key: 'stripe' as PaymentMethod,
            icon: <CreditCard size={28} />,
            label: isRTL ? 'بطاقة ائتمانية' : 'Credit Card',
            activeClass: 'border-brand-primary bg-brand-primary/5 text-brand-primary',
            inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-brand-primary/40',
        },
        {
            key: 'vodafone' as PaymentMethod,
            icon: <Smartphone size={28} />,
            label: isRTL ? 'فودافون كاش' : 'Vodafone Cash',
            activeClass: 'border-red-500 bg-red-50 text-red-600',
            inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-red-300',
        },
        {
            key: 'fawry' as PaymentMethod,
            icon: <span className="font-black text-2xl tracking-tighter">F</span>,
            label: isRTL ? 'فوري' : 'Fawry Pay',
            activeClass: 'border-yellow-500 bg-yellow-50 text-yellow-600',
            inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-yellow-300',
        },
        {
            key: 'instapay' as PaymentMethod,
            icon: <Banknote size={28} />,
            label: isRTL ? 'إنستا باي' : 'Instapay',
            activeClass: 'border-purple-500 bg-purple-50 text-purple-600',
            inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-purple-300',
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 selection:bg-brand-primary selection:text-white">

            {/* Hero Section */}
            <div className="relative h-[40vh] flex items-center justify-center overflow-hidden mb-10">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 brightness-[0.4]"
                    style={{ backgroundImage: `url('${normalizeImageUrl(vehicle?.image_urls?.[0]) || '/car_bg_premium.png'}')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#f8fafc]"></div>
                </div>
                
                <div className="relative z-10 text-center space-y-4 px-6 mt-12 w-full">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                        {isRTL ? 'تأكيد عملية الشراء' : 'Confirm Purchase'}
                    </h1>
                </div>
            </div>            <AnimatePresence>
                {/* Error Modal */}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl"
                    >
                        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 rounded-t-3xl" />
                            <button onClick={() => setErrorMsg(null)} className="absolute top-5 right-5 text-slate-300 hover:text-slate-600 transition-colors">
                                <XCircle size={22} />
                            </button>
                            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                                <XCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">{isRTL ? 'عفواً، فشلت العملية!' : 'Oops, action failed!'}</h2>
                            <p className="text-slate-500 font-bold mb-7 leading-relaxed max-h-28 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>{errorMsg}</p>
                            <button onClick={() => setErrorMsg(null)} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all">
                                {isRTL ? 'حسناً، المحاولة مرة أخرى' : 'Okay, try again'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Success Modal */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl"
                    >
                        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 rounded-t-3xl" />
                            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 relative">
                                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-40" />
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">{isRTL ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed!'}</h2>
                            <p className="text-slate-500 font-bold mb-7 leading-relaxed">
                                {isRTL ? 'تم استلام وتأكيد الدفع الخاص بك وجاري إتمام المعاملة.' : "Your payment was successfully received and being processed."}
                            </p>
                            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black hover:bg-brand-dark transition-all flex items-center justify-center gap-2">
                                {isRTL ? 'متابعة الطلب في لوحة التحكم' : 'Track Order in Dashboard'}
                                <ArrowRight size={18} className="rtl:rotate-180" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20">

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isRTL ? 'الدفع الآمن' : 'Secure Checkout'}
                        </h1>
                        <p className="text-sm font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            {isRTL ? 'جميع معاملاتك مشفرة ومحمية بواسطة Stripe' : 'All transactions are fully encrypted by Stripe'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── LEFT: Payment Methods ── */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

                            {/* Step Label */}
                            <div className="flex items-center gap-3 mb-7">
                                <span className="w-8 h-8 rounded-full bg-brand-primary text-white font-black text-xs flex items-center justify-center shadow-md shadow-brand-primary/20">1</span>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                                </h3>
                            </div>

                            {/* Payment Method Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {paymentOptions.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setPaymentMethod(opt.key)}
                                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === opt.key ? opt.activeClass : opt.inactiveClass}`}
                                    >
                                        {opt.icon}
                                        <span className="font-bold text-sm">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <hr className="border-slate-100 mb-8" />

                            {/* Payment Method Detail Panels */}
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">

                                {paymentMethod === 'stripe' && (
                                    <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-8 text-center space-y-4">
                                        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-brand-primary/20">
                                            <CreditCard className="text-brand-primary" size={28} />
                                        </div>
                                        <h4 className="font-black text-xl text-slate-900">
                                            {isRTL ? 'سيتم تحويلك للدفع عبر Stripe' : 'Redirecting to Stripe'}
                                        </h4>
                                        <p className="text-slate-500 font-bold text-sm leading-relaxed">
                                            {isRTL
                                                ? 'سوف ننتقل الآن إلى بوابة الدفع الآمنة من Stripe لإتمام العملية ببطاقتك الائتمانية.'
                                                : "We'll redirect you to Stripe's secure payment gateway to complete your transaction."}
                                        </p>
                                    </div>
                                )}

                                {paymentMethod === 'vodafone' && (
                                    <div className="space-y-6">
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
                                            <h4 className="font-black text-lg text-red-700 flex items-center gap-2">
                                                <Smartphone size={20} /> {isRTL ? 'تعليمات التحويل' : 'Transfer Instructions'}
                                            </h4>
                                            <p className="text-red-600 font-bold text-sm">
                                                {isRTL ? 'برجاء تحويل المبلغ المطلوب إلى الرقم التالي عبر محفظة فودافون كاش:' : 'Please transfer the exact amount to the following Vodafone Cash number:'}
                                            </p>
                                            <div dir="ltr" className="text-3xl font-black tracking-widest text-red-600 bg-red-100 px-5 py-3 rounded-xl inline-block">
                                                0100 123 4567
                                            </div>
                                        </div>
                                        <ReceiptUploader receiptPreview={receiptPreview} handleFileUpload={handleFileUpload} isRTL={isRTL} />
                                    </div>
                                )}

                                {paymentMethod === 'instapay' && (
                                    <div className="space-y-6">
                                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-3">
                                            <h4 className="font-black text-lg text-purple-700 flex items-center gap-2">
                                                <Banknote size={20} /> {isRTL ? 'بيانات التحويل عبر إنستا باي' : 'Instapay Transfer Details'}
                                            </h4>
                                            <p className="text-purple-600 font-bold text-sm">
                                                {isRTL ? 'برجاء تحويل المبلغ إلى عنوان الدفع أو رقم الهاتف التالي:' : 'Please transfer the amount to:'}
                                            </p>
                                            <div dir="ltr" className="text-xl font-black tracking-widest text-purple-600 bg-purple-100 px-4 py-2 rounded-xl inline-block">
                                                eldoksh@instapay
                                            </div>
                                            <div className="text-purple-500 font-bold text-sm">{isRTL ? 'أو عبر رقم الهاتف:' : 'Or via phone:'}</div>
                                            <div dir="ltr" className="text-xl font-black text-purple-600 bg-purple-100 px-4 py-2 rounded-xl inline-block">
                                                0100 123 4567
                                            </div>
                                        </div>
                                        <ReceiptUploader receiptPreview={receiptPreview} handleFileUpload={handleFileUpload} isRTL={isRTL} />
                                    </div>
                                )}

                                {paymentMethod === 'fawry' && (
                                    <div className="space-y-6">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 space-y-3">
                                            <h4 className="font-black text-lg text-yellow-700 flex items-center gap-2">
                                                <span className="font-black text-xl">F</span> {isRTL ? 'الدفع عبر منافذ فوري' : 'Pay via Fawry Machines'}
                                            </h4>
                                            <p className="text-yellow-600 font-bold text-sm">
                                                {isRTL ? 'توجه إلى أي ماكينة فوري واطلب الدفع لصالح الرقم المرجعي التالي:' : 'Go to any Fawry machine and pay using the reference code:'}
                                            </p>
                                            <div dir="ltr" className="text-4xl font-black tracking-[0.25em] text-yellow-600 bg-yellow-100 px-5 py-3 rounded-xl inline-block">
                                                8201993
                                            </div>
                                        </div>
                                        <ReceiptUploader receiptPreview={receiptPreview} handleFileUpload={handleFileUpload} isRTL={isRTL} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Order Summary ── */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-slate-200 shadow-lg shadow-slate-100 rounded-3xl p-8 sticky top-24 space-y-7">

                            {/* Step Label */}
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-primary text-white font-black text-xs flex items-center justify-center shadow-md shadow-brand-primary/20">2</span>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                                </h3>
                            </div>

                            {/* Car Preview */}
                            <div className="flex gap-4 items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                    <img src={normalizeImageUrl(vehicle.image_urls?.[0])} alt="Car" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-black text-base text-slate-900 leading-tight">
                                        {isRTL ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar)}{' '}
                                        {isRTL ? (vehicle.model_ar || vehicle.model_en) : (vehicle.model_en || vehicle.model_ar)}
                                    </h4>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-lg uppercase tracking-widest mt-1 inline-block">
                                        {vehicle.year}
                                    </span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>{isRTL ? 'القيمة الإجمالية للسيارة' : 'Total Car Value'}</span>
                                    <span className="text-slate-700">{Number(vehicle.sale_price).toLocaleString()} EGP</span>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-black">
                                            {isRTL ? 'المطلوب سداده الآن' : 'Total Due Now'}
                                        </span>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                                            {vehicle.details?.reservation_fee
                                                ? (isRTL ? 'مبلغ تحويل جدية الحجز' : 'Reservation Down Payment')
                                                : (isRTL ? 'سعر البيع الكامل' : 'Full Sale Price')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-brand-primary tracking-tight">
                                            {amountToPay.toLocaleString()}
                                        </div>
                                        <span className="text-xs text-brand-primary/50 font-black tracking-widest">EGP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={submitting || (receiptFile === null && paymentMethod !== 'stripe')}
                                className="w-full py-5 rounded-2xl bg-brand-primary text-white font-black text-base hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25 active:scale-95 flex justify-center items-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                    <>
                                        {isRTL ? 'تأكيد وإرسال' : 'Confirm & Pay'}
                                        <ArrowRight size={18} className="rtl:rotate-180" />
                                    </>
                                )}
                            </button>

                            {receiptFile === null && paymentMethod !== 'stripe' && (
                                <p className="text-center text-[10px] text-red-500 font-bold -mt-3">
                                    {isRTL ? 'يجب إرفاق صورة إيصال التحويل لإرسال الطلب.' : 'You must attach a transfer receipt to submit.'}
                                </p>
                            )}

                            {/* Security Note */}
                            <div className="flex items-center justify-center gap-2 pt-2 text-slate-300">
                                <ShieldCheck size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure • Encrypted • Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Receipt Upload Component
const ReceiptUploader = ({
    receiptPreview, handleFileUpload, isRTL
}: { receiptPreview: string | null; handleFileUpload: any; isRTL: boolean }) => (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-7 hover:border-brand-primary/50 transition-colors bg-slate-50">
        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="receipt-upload" />
        {receiptPreview ? (
            <div className="space-y-4">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                    <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-contain bg-slate-100" />
                </div>
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-2">
                        <CheckCircle size={14} /> {isRTL ? 'تم قراءة وإرفاق الإيصال بنجاح' : 'Receipt attached successfully'}
                    </span>
                    <label htmlFor="receipt-upload" className="text-xs font-bold text-brand-primary cursor-pointer hover:underline">
                        {isRTL ? 'تغيير' : 'Change'}
                    </label>
                </div>
            </div>
        ) : (
            <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center gap-4 cursor-pointer text-slate-400 hover:text-brand-primary group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-primary/40 group-hover:bg-brand-primary/5 transition-all">
                    <Upload size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-sm text-slate-700">{isRTL ? 'اضغط هنا لرفع صورة إيصال الدفع' : 'Click here to upload transfer receipt'}</p>
                    <p className="text-xs mt-1 text-slate-400 font-bold uppercase tracking-widest">{isRTL ? 'PNG, JPG (الحد الأقصى 5MB)' : 'PNG, JPG · Max 5MB'}</p>
                </div>
            </label>
        )}
    </div>
);

const Checkout: React.FC = () => <CheckoutContent />;
export default Checkout;
