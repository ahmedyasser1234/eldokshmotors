import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  User, 
  Briefcase, 
  DollarSign, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const InstallmentApply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { user } = useAuthStore();

  const requestedDownPayment = Number(searchParams.get('downPayment') || 0);
  const requestedMonths = Number(searchParams.get('months') || 12);

  const [vehicle, setVehicle] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientJob, setClientJob] = useState('');
  const [clientMonthlyIncome, setClientMonthlyIncome] = useState('');

  // File Upload states
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdUrl, setNationalIdUrl] = useState('');
  const [nationalIdUploading, setNationalIdUploading] = useState(false);

  const [incomeProofFile, setIncomeProofFile] = useState<File | null>(null);
  const [incomeProofUrl, setIncomeProofUrl] = useState('');
  const [incomeProofUploading, setIncomeProofUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehRes, planRes] = await Promise.all([
          api.get(`/vehicles/${id}`),
          api.get(`/installments/plans/vehicle/${id}`)
        ]);
        setVehicle(vehRes.data);
        setPlan(planRes.data);
      } catch (err) {
        console.error('Failed to load installment details', err);
        toast.error('Failed to load transaction data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Calculations breakdown
  const terms = useMemo(() => {
    if (!vehicle || !plan) return null;
    const price = vehicle.sale_price;
    const financed = price - requestedDownPayment;
    
    let rate = plan.interest_rate;
    if (plan.interest_rate_type === 'variable' && plan.variable_rates) {
      const match = plan.variable_rates.find((v: any) => Number(v.months) === Number(requestedMonths));
      if (match) rate = match.rate;
    }

    const adminFee = (price * (plan.admin_fee_percentage / 100)) + Number(plan.admin_fee_flat || 0);

    let monthlyPayment = 0;
    let totalInterest = 0;

    if (plan.calculation_method === 'reducing') {
      const monthlyRate = (rate / 100) / 12;
      if (monthlyRate === 0) {
        monthlyPayment = financed / requestedMonths;
      } else {
        monthlyPayment = financed * (monthlyRate * Math.pow(1 + monthlyRate, requestedMonths)) / (Math.pow(1 + monthlyRate, requestedMonths) - 1);
      }
      monthlyPayment = Math.round((monthlyPayment + Number.EPSILON) * 100) / 100;
      totalInterest = (monthlyPayment * requestedMonths) - financed;
      totalInterest = Math.round((totalInterest + Number.EPSILON) * 100) / 100;
    } else {
      totalInterest = financed * (rate / 100) * (requestedMonths / 12);
      totalInterest = Math.round((totalInterest + Number.EPSILON) * 100) / 100;
      monthlyPayment = Math.round(((financed + totalInterest) / requestedMonths + Number.EPSILON) * 100) / 100;
    }

    return {
      price,
      financed,
      rate,
      adminFee,
      monthlyPayment,
      totalInterest,
      totalRepayment: financed + totalInterest,
      totalAgreementAmount: requestedDownPayment + financed + totalInterest + adminFee,
    };
  }, [vehicle, plan, requestedDownPayment, requestedMonths]);

  // Upload file helper
  const handleFileUpload = async (file: File, type: 'id' | 'income') => {
    const setUploading = type === 'id' ? setNationalIdUploading : setIncomeProofUploading;
    const setUrl = type === 'id' ? setNationalIdUrl : setIncomeProofUrl;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUrl(response.data.url);
      toast.success(isArabic ? 'تم رفع المستند بنجاح!' : 'Document uploaded successfully!');
    } catch (err) {
      console.error('File upload failed', err);
      toast.error(isArabic ? 'فشل رفع الملف. يرجى المحاولة مرة أخرى.' : 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) return;
    
    if (!clientName || !clientPhone || !clientEmail || !clientJob || !clientMonthlyIncome) {
      toast.error(isArabic ? 'يرجى ملء جميع البيانات الشخصية.' : 'Please fill all personal fields.');
      return;
    }

    if (!nationalIdUrl || !incomeProofUrl) {
      toast.error(isArabic ? 'يرجى رفع المستندات المطلوبة أولاً.' : 'Please upload the required documents first.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vehicleId: id,
        downPayment: requestedDownPayment,
        months: requestedMonths,
        clientName,
        clientPhone,
        clientEmail,
        clientJob,
        clientMonthlyIncome: parseFloat(clientMonthlyIncome),
        nationalIdUrl,
        incomeProofUrl,
      };

      const response = await api.post('/installments/agreements', payload);
      setSuccessId(response.data.id);
      toast.success(isArabic ? 'تم تقديم طلبك بنجاح!' : 'Application submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit agreement application', err);
      toast.error(err.response?.data?.message || (isArabic ? 'حدث خطأ أثناء تقديم الطلب.' : 'Application submission failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vehicle || !terms) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-32 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">{isArabic ? 'عفواً، لم نجد بيانات السيارة' : 'Vehicle details not found'}</h2>
        <button onClick={() => navigate('/vehicles')} className="btn-primary px-6 py-2.5">
          {t('installments.apply.backToFleet')}
        </button>
      </div>
    );
  }

  const makeName = isArabic ? (vehicle.make_ar || vehicle.make_en) : (vehicle.make_en || vehicle.make_ar);
  const modelName = isArabic ? (vehicle.model_ar || vehicle.model_en) : (vehicle.model_en || vehicle.model_ar);

  if (successId) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-24 flex items-center justify-center px-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-[40px] border border-slate-200/60 p-8 md:p-12 max-w-2xl w-full text-center shadow-xl shadow-slate-100">
          <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-brand-primary/20">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">
            {t('installments.apply.successTitle')}
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-10 text-sm md:text-base">
            {t('installments.apply.successDesc', { id: successId })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/vehicles')}
              className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all text-sm active:scale-95"
            >
              {t('installments.apply.backToFleet')}
            </button>
            <button
              onClick={() => navigate('/dashboard/installments')}
              className="py-4 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 text-sm active:scale-95 animate-pulse"
            >
              {t('installments.apply.viewDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-28 selection:bg-brand-primary selection:text-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <SEO title={t('installments.apply.title')} />
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-brand-primary mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className={`group-hover:-translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
          <span className="text-xs font-black uppercase tracking-widest">{isArabic ? 'العودة للخلف' : 'Back'}</span>
        </button>

        <div className="mb-10 text-center md:text-left md:rtl:text-right space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {t('installments.apply.title')}
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            {t('installments.apply.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM inputs (7 cols) */}
          <form onSubmit={onSubmit} className="lg:col-span-7 space-y-8 bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-sm">
            
            {/* Personal Credit Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <User size={18} className="text-brand-primary" />
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{t('installments.apply.personalInfo')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('installments.apply.fullName')}</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-brand-primary focus:outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('sell.form.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-brand-primary focus:outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{t('sell.form.email')}</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-brand-primary focus:outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('installments.apply.job')}</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? 'مثال: مهندس برمجيات' : 'e.g. Accountant'}
                      value={clientJob}
                      onChange={(e) => setClientJob(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-brand-primary focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{t('installments.apply.monthlyIncome')}</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={clientMonthlyIncome}
                      onChange={(e) => setClientMonthlyIncome(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-brand-primary focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <FileText size={18} className="text-brand-primary" />
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{t('installments.apply.documents')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* National ID Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">{t('installments.apply.nationalId')}</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-brand-primary/50 transition-colors rounded-2xl p-5 text-center relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNationalIdFile(file);
                          handleFileUpload(file, 'id');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                        {nationalIdUploading ? (
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        ) : nationalIdUrl ? (
                          <Check size={18} className="text-emerald-500" />
                        ) : (
                          <Upload size={18} />
                        )}
                      </div>
                      <p className="text-xs font-black text-slate-800">
                        {nationalIdFile ? nationalIdFile.name : (isArabic ? 'اختر صورة الهوية' : 'Choose National ID Image')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">{t('installments.apply.nationalIdHelp')}</p>
                    </div>
                  </div>
                </div>

                {/* Salary Slip Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">{t('installments.apply.incomeProof')}</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-brand-primary/50 transition-colors rounded-2xl p-5 text-center relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIncomeProofFile(file);
                          handleFileUpload(file, 'income');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                        {incomeProofUploading ? (
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        ) : incomeProofUrl ? (
                          <Check size={18} className="text-emerald-500" />
                        ) : (
                          <Upload size={18} />
                        )}
                      </div>
                      <p className="text-xs font-black text-slate-800">
                        {incomeProofFile ? incomeProofFile.name : (isArabic ? 'اختر مستند الدخل' : 'Choose Income Proof')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">{t('installments.apply.incomeProofHelp')}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Terms Consent and Submit */}
            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                <span className="text-xs font-bold text-slate-500">{t('installments.apply.termsConfirm')}</span>
              </div>
              <button
                type="submit"
                disabled={submitting || nationalIdUploading || incomeProofUploading}
                className="py-4 px-8 bg-brand-primary hover:bg-brand-dark disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 text-sm active:scale-95 text-center shrink-0"
              >
                {submitting ? t('common.loading') : t('installments.apply.submitBtn')}
              </button>
            </div>

          </form>

          {/* RIGHT: DEAL DETAILS SUMMARY (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 sticky top-28">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4 uppercase tracking-tight">
                {isArabic ? 'تفاصيل اتفاقية التمويل' : 'Finance Terms Summary'}
              </h3>

              {/* Mini Car Info */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                <img
                  src={vehicle.image_urls?.[0]}
                  alt={vehicle.model}
                  className="w-20 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-black text-sm text-slate-800">{makeName} {modelName}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{vehicle.details?.year} — {vehicle.details?.fuel_type}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3.5 text-xs font-bold text-slate-500">
                <div className="flex justify-between">
                  <span>{isArabic ? 'سعر السيارة النقدي' : 'Cash Price'}</span>
                  <span className="text-slate-800">{terms.price.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.downPayment')}</span>
                  <span className="text-brand-primary font-black">{requestedDownPayment.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.financedAmount')}</span>
                  <span className="text-slate-800">{terms.financed.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.months')}</span>
                  <span className="text-slate-800">{requestedMonths} {t('common.months')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.interestRate')}</span>
                  <span className="text-slate-800">{terms.rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.adminFee')}</span>
                  <span className="text-slate-800">{terms.adminFee.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('installments.calculator.totalInterest')}</span>
                  <span className="text-slate-800">{terms.totalInterest.toLocaleString()} EGP</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t('installments.calculator.totalRepayment')}</span>
                  <span className="text-brand-primary font-black">{terms.totalRepayment.toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Monthly Payment Hero Box */}
              <div className="bg-brand-primary p-5 rounded-2xl text-center space-y-1 shadow-lg shadow-brand-primary/20">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                  {t('installments.calculator.monthlyPayment')}
                </p>
                <p className="text-3xl font-black text-white">
                  {Math.round(terms.monthlyPayment).toLocaleString()} <span className="text-sm font-bold text-white/70">EGP</span>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InstallmentApply;
