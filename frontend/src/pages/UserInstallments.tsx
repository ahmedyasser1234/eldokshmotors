import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Printer, 
  ChevronDown, 
  ChevronUp,
  X,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserInstallments: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAgreement, setExpandedAgreement] = useState<string | null>(null);
  
  // Selected payment for receipt upload
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);

  // Contract print modal
  const [printContract, setPrintContract] = useState<any>(null);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/installments/agreements/my');
      setAgreements(res.data);
      if (res.data.length > 0) {
        setExpandedAgreement(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load user installments', err);
      toast.error(isArabic ? 'حدث خطأ أثناء تحميل أقساطك.' : 'Failed to load installment agreements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // Aggregate stats across active agreements
  const stats = useMemo(() => {
    const active = agreements.filter(a => a.status === 'active' || a.status === 'defaulted');
    const totalRemaining = active.reduce((sum, a) => sum + Number(a.remaining_balance), 0);
    
    let paidCount = 0;
    let lateCount = 0;
    let nextDueAmount = 0;
    let nextDueDate: string | null = null;

    active.forEach(a => {
      if (a.payments) {
        a.payments.forEach((p: any) => {
          if (p.status === 'paid') paidCount++;
          if (p.status === 'late') lateCount++;
          if (p.status === 'unpaid' || p.status === 'late') {
            if (!nextDueDate || new Date(p.due_date) < new Date(nextDueDate)) {
              nextDueDate = p.due_date;
              nextDueAmount = Number(p.amount) + Number(p.penalty_fee);
            }
          }
        });
      }
    });

    return {
      activeCount: active.length,
      totalRemaining,
      paidCount,
      lateCount,
      nextDueAmount,
      nextDueDate,
    };
  }, [agreements]);

  const handleReceiptUpload = async () => {
    if (!receiptFile || !selectedPayment) return;
    try {
      setReceiptUploading(true);
      const formData = new FormData();
      formData.append('file', receiptFile);

      // Upload file
      const uploadRes = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Submit receipt to agreement payment
      await api.post(`/installments/payments/${selectedPayment.id}/pay`, {
        receiptUrl: uploadRes.data.url
      });

      toast.success(isArabic ? 'تم رفع إيصال الدفع بنجاح وقيد المراجعة!' : 'Payment receipt uploaded successfully and is pending audit!');
      setSelectedPayment(null);
      setReceiptFile(null);
      fetchAgreements();
    } catch (err) {
      console.error('Failed to submit receipt', err);
      toast.error(isArabic ? 'فشل رفع الإيصال.' : 'Failed to upload receipt.');
    } finally {
      setReceiptUploading(false);
    }
  };

  const triggerPrint = (agreement: any) => {
    setPrintContract(agreement);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'pending_review':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'defaulted':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'rejected':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'late':
        return 'bg-red-100 text-red-800 animate-pulse';
      case 'pending_verification':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <DashboardLayout 
      role="customer" 
      title={t('installments.dashboard.title')} 
      subtitle={t('installments.dashboard.subtitle')}
    >
      <div className="space-y-10 print:hidden" dir={isArabic ? 'rtl' : 'ltr'}>
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('installments.dashboard.activeAgreements')}</p>
              <h4 className="text-xl font-black text-slate-800 mt-1">{stats.activeCount}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('installments.dashboard.totalRemaining')}</p>
              <h4 className="text-xl font-black text-slate-800 mt-1">{Math.round(stats.totalRemaining).toLocaleString()} ج.م</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('installments.dashboard.paidInstallments')}</p>
              <h4 className="text-xl font-black text-slate-800 mt-1">{stats.paidCount}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('installments.dashboard.nextPayment')}</p>
              {stats.nextDueDate ? (
                <h4 className="text-sm font-black text-slate-800 mt-1 leading-tight">
                  {Math.round(stats.nextDueAmount).toLocaleString()} ج.م <span className="block text-[9px] text-slate-400 font-bold font-sans">{stats.nextDueDate}</span>
                </h4>
              ) : (
                <h4 className="text-sm font-black text-slate-400 mt-1">—</h4>
              )}
            </div>
          </div>
        </div>

        {/* AGREEMENTS SECTION */}
        {loading ? (
          <div className="h-64 bg-white border border-slate-200/60 rounded-3xl flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agreements.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-[35px] p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6">
              <CreditCard size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{isArabic ? 'لا توجد تمويلات' : 'No Financing Active'}</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-6">
              {t('installments.dashboard.noAgreements')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {agreements.map((agreement) => {
              const isExpanded = expandedAgreement === agreement.id;
              const v = agreement.vehicle;
              const makeName = isArabic ? (v.make_ar || v.make_en) : (v.make_en || v.make_ar);
              const modelName = isArabic ? (v.model_ar || v.model_en) : (v.model_en || v.model_ar);

              return (
                <div key={agreement.id} className="bg-white border border-slate-200/60 rounded-[30px] shadow-sm overflow-hidden transition-all duration-300">
                  {/* Agreement Header Row */}
                  <div 
                    onClick={() => setExpandedAgreement(isExpanded ? null : agreement.id)}
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-all select-none"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={v.image_urls?.[0]} 
                        alt={v.model_en} 
                        className="w-20 h-14 object-cover rounded-xl border border-slate-150 shrink-0" 
                      />
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{makeName} {modelName}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {agreement.months} {t('common.months')} • {agreement.interest_rate}% {agreement.calculation_method === 'reducing' ? 'Reducing' : 'Flat'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadgeClass(agreement.status)}`}>
                        {t(`status.${agreement.status}`) || agreement.status}
                      </span>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Agreement Body */}
                  {isExpanded && (
                    <div className="px-6 pb-8 md:px-8 border-t border-slate-100 bg-slate-50/20 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Breakdown Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-sm">
                        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isArabic ? 'سعر السيارة ومقدم التمويل' : 'Price & Down Payment'}</p>
                          <p className="font-black text-slate-800">{Number(agreement.total_price).toLocaleString()} ج.م</p>
                          <p className="text-xs text-slate-400 font-bold mt-1">{isArabic ? 'المقدم:' : 'Down:'} {Number(agreement.down_payment).toLocaleString()} ج.م</p>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isArabic ? 'المبلغ الممول والفوائد' : 'Financed & Interest'}</p>
                          <p className="font-black text-slate-800">{Number(agreement.financed_amount).toLocaleString()} ج.m</p>
                          <p className="text-xs text-brand-primary font-bold mt-1">+{Number(agreement.total_interest).toLocaleString()} ج.م {isArabic ? 'فوائد' : 'Interest'}</p>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isArabic ? 'الرسوم الإدارية المضافة' : 'Administrative Fees'}</p>
                          <p className="font-black text-slate-800">{Number(agreement.admin_fee).toLocaleString()} ج.م</p>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl relative">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('installments.calculator.monthlyPayment')}</p>
                          <p className="font-black text-brand-primary text-xl">{Number(agreement.monthly_payment).toLocaleString()} ج.م</p>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">{isArabic ? 'المتبقي:' : 'Remaining:'} {Number(agreement.remaining_balance).toLocaleString()} ج.م</p>
                        </div>
                      </div>

                      {/* Download Contract Action */}
                      {agreement.status === 'active' && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => triggerPrint(agreement)}
                            className="flex items-center gap-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs transition-all shadow-md active:scale-95"
                          >
                            <Printer size={16} />
                            {t('installments.dashboard.contractDownload')}
                          </button>
                        </div>
                      )}

                      {/* Amortization Table */}
                      <div className="space-y-4">
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          <Calendar size={18} className="text-brand-primary" />
                          {t('installments.dashboard.schedule')}
                        </h4>

                        {agreement.status === 'pending_review' ? (
                          <div className="p-6 bg-amber-50/60 border border-amber-200/50 rounded-2xl text-center">
                            <p className="text-sm font-bold text-amber-700">
                              {isArabic 
                                ? 'سيتم توليد جدول السداد تلقائياً فور اعتماد الطلب من لجنة الائتمان.' 
                                : 'Repayment schedule will be generated automatically once your application is approved.'}
                            </p>
                          </div>
                        ) : (
                          <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                            <table className="w-full text-left rtl:text-right border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  <th className="p-4 text-center">#</th>
                                  <th className="p-4">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                                  <th className="p-4">{isArabic ? 'القسط المستحق' : 'Amount Due'}</th>
                                  <th className="p-4">{isArabic ? 'غرامات' : 'Penalties'}</th>
                                  <th className="p-4">{isArabic ? 'الحالة' : 'Status'}</th>
                                  <th className="p-4 text-center">{isArabic ? 'الإجراء' : 'Actions'}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                                {agreement.payments && agreement.payments.map((p: any) => (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-center text-slate-400 font-mono">#{p.installment_number}</td>
                                    <td className="p-4">{p.due_date}</td>
                                    <td className="p-4">{Number(p.amount).toLocaleString()} ج.م</td>
                                    <td className="p-4 text-red-500">
                                      {Number(p.penalty_fee) > 0 ? `+${Number(p.penalty_fee).toLocaleString()} ج.م` : '—'}
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getPaymentStatusBadgeClass(p.status)}`}>
                                        {isArabic 
                                          ? (p.status === 'paid' ? 'تم الدفع' : p.status === 'late' ? 'متأخر' : p.status === 'pending_verification' ? 'قيد المراجعة' : 'غير مدفوع')
                                          : p.status.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      {p.status === 'unpaid' || p.status === 'late' ? (
                                        <button
                                          onClick={() => setSelectedPayment(p)}
                                          className="py-1.5 px-4 bg-brand-primary text-white font-black hover:bg-brand-dark rounded-xl text-[10px] transition-all active:scale-95"
                                        >
                                          {t('installments.dashboard.payInstallment')}
                                        </button>
                                      ) : p.status === 'pending_verification' ? (
                                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                                          {t('installments.dashboard.pendingVerification')}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                                          {isArabic ? 'سدد بالكامل' : 'Paid'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* RECEIPT UPLOAD MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md print:hidden">
          <div className="bg-white rounded-[35px] border border-slate-200/60 p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setSelectedPayment(null);
                setReceiptFile(null);
              }}
              className="absolute top-6 ltr:right-6 rtl:left-6 p-2 bg-slate-50 border border-slate-250 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6">
              {t('installments.dashboard.uploadReceipt')}
            </h3>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 text-xs font-bold text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>{isArabic ? 'رقم القسط:' : 'Installment Number:'}</span>
                  <span className="text-slate-800">#{selectedPayment.installment_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                  <span className="text-slate-800">{selectedPayment.due_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isArabic ? 'مبلغ القسط:' : 'Amount Due:'}</span>
                  <span className="text-slate-800">{Number(selectedPayment.amount).toLocaleString()} ج.م</span>
                </div>
                {Number(selectedPayment.penalty_fee) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{isArabic ? 'غرامة تأخير مستحقة:' : 'Overdue Penalty:'}</span>
                    <span>+{Number(selectedPayment.penalty_fee).toLocaleString()} ج.م</span>
                  </div>
                )}
              </div>

              {/* Upload Drag & Drop */}
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-primary/50 transition-colors rounded-2xl p-6 text-center relative bg-slate-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setReceiptFile(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {receiptFile ? receiptFile.name : t('installments.dashboard.receiptSelect')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">{t('installments.dashboard.receiptHelp')}</p>
                </div>
              </div>

              <button
                onClick={handleReceiptUpload}
                disabled={!receiptFile || receiptUploading}
                className="w-full py-4 bg-brand-primary text-white hover:bg-brand-dark disabled:opacity-50 font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 text-sm active:scale-95"
              >
                {receiptUploading ? t('common.loading') : t('installments.dashboard.submitReceipt')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-FRIENDLY HIDDEN CONTRACT OVERLAY */}
      {printContract && (
        <div className="hidden print:block bg-white text-slate-900 p-12 min-h-screen text-sm leading-relaxed" dir="rtl">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">مؤسسة كوبراماتورز لتجارة السيارات</h1>
            <p className="text-sm font-bold text-slate-500">عقد تمويل وتقسيط سيارة بنظام الاستحواذ والامتلاك</p>
            <p className="text-xs text-slate-400 font-mono">معرف الاتفاقية: {printContract.id}</p>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <h2 className="text-base font-black border-b border-slate-300 pb-2">أولاً: أطراف التعاقد</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold"><span className="text-slate-500">الطرف الأول (الممول):</span> مؤسسة كوبراماتورز للتجارة</p>
                <p className="font-bold"><span className="text-slate-500">العنوان:</span> الدقهلية - منية النصر</p>
              </div>
              <div>
                <p className="font-bold"><span className="text-slate-500">الطرف الثاني (المشتري):</span> {printContract.client_name}</p>
                <p className="font-bold"><span className="text-slate-500">الهاتف:</span> {printContract.client_phone}</p>
                <p className="font-bold"><span className="text-slate-500">البريد الإلكتروني:</span> {printContract.client_email}</p>
              </div>
            </div>

            <h2 className="text-base font-black border-b border-slate-300 pb-2">ثانياً: بيانات السيارة الممولة</h2>
            <div className="grid grid-cols-3 gap-4">
              <p className="font-bold"><span className="text-slate-500">ماركة السيارة:</span> {printContract.vehicle.make_ar || printContract.vehicle.make_en}</p>
              <p className="font-bold"><span className="text-slate-500">الموديل:</span> {printContract.vehicle.model_ar || printContract.vehicle.model_en}</p>
              <p className="font-bold"><span className="text-slate-500">سنة الصنع:</span> {printContract.vehicle.details?.year || '—'}</p>
            </div>

            <h2 className="text-base font-black border-b border-slate-300 pb-2">ثالثاً: البنود المالية والشروط</h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <p className="font-bold"><span className="text-slate-500">سعر السيارة الكلي:</span> {Number(printContract.total_price).toLocaleString()} ج.م</p>
              <p className="font-bold"><span className="text-slate-500">قيمة الدفعة المقدمة:</span> {Number(printContract.down_payment).toLocaleString()} ج.م</p>
              <p className="font-bold"><span className="text-slate-500">المبلغ الإجمالي للتمويل:</span> {Number(printContract.financed_amount).toLocaleString()} ج.م</p>
              <p className="font-bold"><span className="text-slate-500">فترة السداد بالشهور:</span> {printContract.months} شهراً</p>
              <p className="font-bold"><span className="text-slate-500">سعر الفائدة السنوي:</span> {printContract.interest_rate}% ({printContract.calculation_method === 'reducing' ? 'متناقصة' : 'ثابتة'})</p>
              <p className="font-bold"><span className="text-slate-500">الرسوم الإدارية المستحقة:</span> {Number(printContract.admin_fee).toLocaleString()} ج.م</p>
              <p className="font-bold border-t border-slate-200 pt-2"><span className="text-slate-500">إجمالي الفوائد المستحقة:</span> {Number(printContract.total_interest).toLocaleString()} ج.م</p>
              <p className="font-bold border-t border-slate-200 pt-2 text-brand-primary"><span className="text-slate-500">القسط الشهري الثابت:</span> {Number(printContract.monthly_payment).toLocaleString()} ج.م</p>
            </div>

            {/* Repayment Schedule details */}
            <h2 className="text-base font-black border-b border-slate-300 pb-2 mt-8 page-break-before">رابعاً: جدول مواعيد سداد الأقساط</h2>
            <table className="w-full text-right border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-xs">
                  <th className="p-2 border border-slate-300 text-center">رقم القسط</th>
                  <th className="p-2 border border-slate-300">تاريخ الاستحقاق</th>
                  <th className="p-2 border border-slate-300">قيمة القسط الشهري</th>
                  <th className="p-2 border border-slate-300 text-center">التوقيع عند الاستلام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {printContract.payments && printContract.payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="p-2 border border-slate-300 text-center font-mono">#{p.installment_number}</td>
                    <td className="p-2 border border-slate-300">{p.due_date}</td>
                    <td className="p-2 border border-slate-300">{Number(p.amount).toLocaleString()} ج.م</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">...................................</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-12 mt-16 pt-12 border-t border-slate-200">
              <div className="text-center space-y-8">
                <p className="font-black text-slate-800">الطرف الأول (الممول)</p>
                <p className="text-xs text-slate-400 font-medium">مؤسسة كوبراماتورز لتجارة السيارات</p>
                <p className="text-xs text-slate-400">التوقيع والختم: .......................................</p>
              </div>
              <div className="text-center space-y-8">
                <p className="font-black text-slate-800">الطرف الثاني (المشتري)</p>
                <p className="text-xs text-slate-400 font-medium">{printContract.client_name}</p>
                <p className="text-xs text-slate-400">التوقيع والختم: .......................................</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default UserInstallments;
