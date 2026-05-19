import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { 
  BarChart3, 
  Settings, 
  FileCheck, 
  ShieldCheck, 
  FolderLock,
  X, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

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

const AdminInstallments: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState<'analytics' | 'plans' | 'requests' | 'agreements' | 'auditor'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [auditorPayments, setAuditorPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded active contract state
  const [expandedAgreement, setExpandedAgreement] = useState<string | null>(null);

  // Manual payment popup state
  const [manualPaymentPayment, setManualPaymentPayment] = useState<any>(null);
  const [manualPaymentNotes, setManualPaymentNotes] = useState('');
  const [manualPaymentPenalty, setManualPaymentPenalty] = useState(0);

  // Add/Edit Plan form state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    vehicleId: '',
    interest_rate_type: 'fixed',
    interest_rate: 10,
    min_down_payment_percentage: 20,
    admin_fee_percentage: 1.5,
    admin_fee_flat: 0,
    available_months_str: '12, 24, 36, 48, 60',
    calculation_method: 'flat',
    is_active: true,
    variable_rates_str: '[]'
  });

  // Modal view for receipt audit
  const [zoomReceiptUrl, setZoomReceiptUrl] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/installments/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/installments/plans');
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to load plans', err);
    }
  };

  const fetchAgreements = async () => {
    try {
      const res = await api.get('/installments/agreements');
      setAgreements(res.data);
      
      // Extract payments pending verification for auditor tab
      const pending: any[] = [];
      res.data.forEach((a: any) => {
        if (a.payments) {
          a.payments.forEach((p: any) => {
            if (p.status === 'pending_verification') {
              pending.push({ ...p, agreement: a });
            }
          });
        }
      });
      setAuditorPayments(pending);
    } catch (err) {
      console.error('Failed to load agreements', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchPlans(), fetchAgreements()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCronTrigger = async () => {
    try {
      toast.loading(isArabic ? 'جاري فحص الاستحقاقات...' : 'Running checks...', { id: 'cron' });
      const res = await api.post('/installments/cron-trigger');
      toast.success(
        isArabic 
          ? `اكتمل الفحص! تم تحديث ${res.data.lateCount} أقساط متأخرة وإرسال ${res.data.notificationsSent} تنبيهاً.`
          : `Checks finished! Updated ${res.data.lateCount} late installments and sent ${res.data.notificationsSent} alerts.`,
        { id: 'cron' }
      );
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to trigger background checks.', { id: 'cron' });
    }
  };

  // Agreements approval workflows
  const handleAgreementReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/installments/agreements/${id}/status`, { status });
      toast.success(status === 'approved' ? 'Approved & Signed Contract' : 'Rejected Agreement');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  // Receipt verification
  const handleReceiptAudit = async (paymentId: string, status: 'paid' | 'unpaid') => {
    try {
      await api.post(`/installments/payments/${paymentId}/verify`, {
        status,
        notes: status === 'paid' ? 'Receipt audited and approved by Admin' : 'Receipt rejected: Invalid transfer screenshot.',
        penalty: 0
      });
      toast.success(status === 'paid' ? 'Payment Approved' : 'Payment Rejected');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Auditing operation failed.');
    }
  };

  // Record manual cash payment
  const handleManualPayment = async () => {
    if (!manualPaymentPayment) return;
    try {
      await api.post(`/installments/payments/${manualPaymentPayment.id}/verify`, {
        status: 'paid',
        notes: manualPaymentNotes || 'Cash receipt registered manually',
        penalty: Number(manualPaymentPenalty || 0)
      });
      toast.success('Manual payment registered!');
      setManualPaymentPayment(null);
      setManualPaymentNotes('');
      setManualPaymentPenalty(0);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Manual registry failed.');
    }
  };

  // Plans saving
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        vehicleId: planForm.vehicleId ? planForm.vehicleId : null,
        interest_rate_type: planForm.interest_rate_type,
        interest_rate: Number(planForm.interest_rate),
        min_down_payment_percentage: Number(planForm.min_down_payment_percentage),
        admin_fee_percentage: Number(planForm.admin_fee_percentage),
        admin_fee_flat: Number(planForm.admin_fee_flat),
        calculation_method: planForm.calculation_method,
        is_active: planForm.is_active,
        available_months: planForm.available_months_str.split(',').map(s => Number(s.trim())),
        variable_rates: JSON.parse(planForm.variable_rates_str || '[]')
      };

      if (editingPlan) {
        payload.id = editingPlan.id;
      }

      await api.post('/installments/plans', payload);
      toast.success(isArabic ? 'تم حفظ خطة التمويل بنجاح!' : 'Installment plan saved successfully!');
      setShowPlanForm(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save plan. Check JSON formatting.');
    }
  };

  const handleEditPlanClick = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      vehicleId: plan.vehicleId || '',
      interest_rate_type: plan.interest_rate_type,
      interest_rate: plan.interest_rate,
      min_down_payment_percentage: plan.min_down_payment_percentage,
      admin_fee_percentage: plan.admin_fee_percentage,
      admin_fee_flat: plan.admin_fee_flat,
      available_months_str: plan.available_months ? plan.available_months.join(', ') : '12, 24, 36, 48, 60',
      calculation_method: plan.calculation_method,
      is_active: plan.is_active,
      variable_rates_str: plan.variable_rates ? JSON.stringify(plan.variable_rates) : '[]'
    });
    setShowPlanForm(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(`/installments/plans/${id}`);
      toast.success('Plan deleted.');
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete plan.');
    }
  };

  return (
    <DashboardLayout 
      role="admin" 
      title={t('installments.admin.title')} 
      subtitle={t('installments.admin.subtitle')}
    >
      <div className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
        
        {/* TABS SELECTOR */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'analytics', label: t('installments.admin.tabs.analytics'), icon: BarChart3 },
            { id: 'plans', label: t('installments.admin.tabs.plans'), icon: Settings },
            { id: 'requests', label: t('installments.admin.tabs.requests'), icon: FileCheck },
            { id: 'agreements', label: t('installments.admin.tabs.agreements'), icon: ShieldCheck },
            { id: 'auditor', label: `${t('installments.admin.tabs.auditor')} (${auditorPayments.length})`, icon: FolderLock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-6 font-black text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap -mb-px
                ${activeTab === tab.id 
                  ? 'border-brand-primary text-brand-primary font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-96 bg-white border border-slate-200/60 rounded-[35px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">

            {/* 1. ANALYTICS VIEW */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                {/* Analytics statistics row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('installments.admin.stats.financed')}</p>
                    <h4 className="text-2xl font-black text-slate-800 mt-2">{Math.round(analytics.totalFinanced).toLocaleString()} EGP</h4>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('installments.admin.stats.profits')}</p>
                    <h4 className="text-2xl font-black text-emerald-600 mt-2">+{Math.round(analytics.totalProfits).toLocaleString()} EGP</h4>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('installments.admin.stats.collections')}</p>
                    <h4 className="text-2xl font-black text-indigo-600 mt-2">{Math.round(analytics.totalPaid).toLocaleString()} EGP</h4>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('installments.admin.stats.outstanding')}</p>
                    <h4 className="text-2xl font-black text-slate-800 mt-2">{Math.round(analytics.outstandingBalance).toLocaleString()} EGP</h4>
                  </div>
                </div>

                {/* Substats and cron run controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[35px] shadow-sm space-y-6">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'أداء محفظة التمويل' : 'Portfolio Quality'}</h3>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 border border-slate-200/30 p-5 rounded-2xl">
                        <span className="text-2xl font-black text-slate-800">{analytics.activeAgreementsCount}</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{t('installments.admin.stats.active')}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200/30 p-5 rounded-2xl">
                        <span className="text-2xl font-black text-orange-600">{analytics.lateCount}</span>
                        <p className="text-[9px] font-black text-orange-400 uppercase mt-1">{t('installments.admin.stats.late')}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200/30 p-5 rounded-2xl">
                        <span className="text-2xl font-black text-red-600">{analytics.defaultedClients}</span>
                        <p className="text-[9px] font-black text-red-400 uppercase mt-1">{isArabic ? 'عملاء متعثرون' : 'Defaulted Clients'}</p>
                      </div>
                    </div>

                    {/* Progress tracking display */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{isArabic ? 'نسبة التحصيل الفعلية من الممول' : 'Collection Rate'}</span>
                        <span className="text-brand-primary">
                          {analytics.totalFinanced > 0 
                            ? Math.round((analytics.totalPaid / (analytics.totalFinanced + analytics.totalProfits)) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary transition-all duration-1000"
                          style={{ 
                            width: `${analytics.totalFinanced > 0 
                              ? Math.min(100, Math.round((analytics.totalPaid / (analytics.totalFinanced + analytics.totalProfits)) * 100)) 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[35px] shadow-sm space-y-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'محرك التنبيهات والتحصيل' : 'Automation Services'}</h3>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed">
                        {isArabic 
                          ? 'يقوم النظام تلقائياً كل ليلة بفحص استحقاق الأقساط وتصنيف المتأخرات وإرسال التنبيهات للعملاء عبر الرسائل. يمكنك تشغيل الفحص يدوياً الآن لتحديث الحسابات فورياً.'
                          : 'The engine automatically runs nightly to calculate late schedules, add penalties, and trigger SMS/socket alerts. Force run now to sync instantly.'}
                      </p>
                    </div>

                    <button
                      onClick={handleCronTrigger}
                      className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-6"
                    >
                      <RefreshCw size={14} className="animate-spin-slow" />
                      {isArabic ? 'تشغيل فحص الاستحقاقات يدوياً' : 'Force Run Checks Engine'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PLANS CONFIGURATION */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'خطط التقسيط النشطة' : 'Installment Schemes'}</h3>
                  <button
                    onClick={() => {
                      setEditingPlan(null);
                      setPlanForm({
                        vehicleId: '',
                        interest_rate_type: 'fixed',
                        interest_rate: 10,
                        min_down_payment_percentage: 20,
                        admin_fee_percentage: 1.5,
                        admin_fee_flat: 0,
                        available_months_str: '12, 24, 36, 48, 60',
                        calculation_method: 'flat',
                        is_active: true,
                        variable_rates_str: '[]'
                      });
                      setShowPlanForm(true);
                    }}
                    className="flex items-center gap-1.5 py-2.5 px-5 bg-brand-primary text-white hover:bg-brand-dark rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                  >
                    <Plus size={14} />
                    {t('installments.admin.plans.createPlan')}
                  </button>
                </div>

                {/* Plan Form Modal/Panel */}
                {showPlanForm && (
                  <form onSubmit={handleSavePlan} className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <h4 className="font-black text-slate-900">{editingPlan ? t('installments.admin.plans.editPlan') : t('installments.admin.plans.createPlan')}</h4>
                      <button type="button" onClick={() => setShowPlanForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{isArabic ? 'كود السيارة الخاص (اتركه فارغاً للعقد العام)' : 'Vehicle ID (Blank for Global)'}</label>
                        <input
                          type="text"
                          value={planForm.vehicleId}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                          placeholder="e.g. 550e-89b-..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.minDownPayment')}</label>
                        <input
                          type="number"
                          required
                          value={planForm.min_down_payment_percentage}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, min_down_payment_percentage: Number(e.target.value) }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.calcMethod')}</label>
                        <select
                          value={planForm.calculation_method}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, calculation_method: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        >
                          <option value="flat">Flat Rate Finance (فوائد ثابتة)</option>
                          <option value="reducing">Reducing Balance Finance (فوائد متناقصة)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.interestRate')}</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={planForm.interest_rate}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, interest_rate: Number(e.target.value) }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{isArabic ? 'نوع الفائدة' : 'Rate Type'}</label>
                        <select
                          value={planForm.interest_rate_type}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, interest_rate_type: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        >
                          <option value="fixed">{t('installments.admin.plans.fixed')}</option>
                          <option value="variable">{t('installments.admin.plans.variable')}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.durationOptions')}</label>
                        <input
                          type="text"
                          required
                          value={planForm.available_months_str}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, available_months_str: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.adminFeePct')}</label>
                        <input
                          type="number"
                          step="0.05"
                          required
                          value={planForm.admin_fee_percentage}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, admin_fee_percentage: Number(e.target.value) }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.adminFeeFlat')}</label>
                        <input
                          type="number"
                          required
                          value={planForm.admin_fee_flat}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, admin_fee_flat: Number(e.target.value) }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">{isArabic ? 'خطة النشاط' : 'Plan Status'}</label>
                        <select
                          value={planForm.is_active ? 'true' : 'false'}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                        >
                          <option value="true">Active (نشط)</option>
                          <option value="false">Inactive (غير نشط)</option>
                        </select>
                      </div>

                      {planForm.interest_rate_type === 'variable' && (
                        <div className="space-y-1.5 md:col-span-3">
                          <label className="text-xs font-bold text-slate-500">{t('installments.admin.plans.ratesJson')}</label>
                          <input
                            type="text"
                            required
                            value={planForm.variable_rates_str}
                            onChange={(e) => setPlanForm(prev => ({ ...prev, variable_rates_str: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                            placeholder='[{"months": 12, "rate": 8}, {"months": 24, "rate": 9.5}]'
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPlanForm(false)}
                        className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-xl text-xs shadow-md shadow-brand-primary/10"
                      >
                        {t('installments.admin.plans.saveBtn')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Plans List Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left rtl:text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="p-4">{isArabic ? 'الهدف / السيارة' : 'Target'}</th>
                        <th className="p-4">{isArabic ? 'طريقة الاحتساب' : 'Method'}</th>
                        <th className="p-4">{isArabic ? 'الفائدة الافتراضية' : 'Interest Rate'}</th>
                        <th className="p-4">{isArabic ? 'أقل مقدم (%)' : 'Min Down %'}</th>
                        <th className="p-4">{isArabic ? 'الرسوم الإدارية' : 'Admin Fee'}</th>
                        <th className="p-4">{isArabic ? 'النشاط' : 'Active'}</th>
                        <th className="p-4 text-center">{isArabic ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs font-bold text-slate-700">
                      {plans.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-mono text-[11px]">
                            {p.vehicleId ? `Vehicle: ${p.vehicleId.slice(0,8)}...` : t('installments.admin.plans.globalTitle')}
                          </td>
                          <td className="p-4 uppercase">{p.calculation_method}</td>
                          <td className="p-4">
                            {p.interest_rate}% ({p.interest_rate_type})
                          </td>
                          <td className="p-4">{p.min_down_payment_percentage}%</td>
                          <td className="p-4">{p.admin_fee_percentage}% + {p.admin_fee_flat} EGP</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {p.is_active ? 'ON' : 'OFF'}
                            </span>
                          </td>
                          <td className="p-4 text-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEditPlanClick(p)}
                              className="py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px]"
                            >
                              {isArabic ? 'تعديل' : 'Edit'}
                            </button>
                            {p.vehicleId && (
                              <button
                                onClick={() => handleDeletePlan(p.id)}
                                className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px]"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. REVIEW REQUESTS */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'طلبات التمويل المعلقة' : 'Pending Applications'}</h3>

                {agreements.filter(a => a.status === 'pending_review').length === 0 ? (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
                    <p className="text-slate-400 font-bold">{isArabic ? 'لا توجد طلبات تمويل معلقة حالياً.' : 'No pending application requests found.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {agreements.filter(a => a.status === 'pending_review').map(agreement => {
                      const v = agreement.vehicle;
                      const makeName = isArabic ? (v.make_ar || v.make_en) : (v.make_en || v.make_ar);
                      const modelName = isArabic ? (v.model_ar || v.model_en) : (v.model_en || v.model_ar);

                      return (
                        <div key={agreement.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* Dossier info */}
                          <div className="lg:col-span-8 space-y-5">
                            <div className="flex items-center gap-4">
                              <img src={v.image_urls?.[0]} alt="" className="w-20 h-14 object-cover rounded-xl border border-slate-200" />
                              <div>
                                <h4 className="font-black text-base text-slate-900">{makeName} {modelName}</h4>
                                <p className="text-xs text-slate-400 font-bold">
                                  {isArabic ? 'سعر السيارة:' : 'Car price:'} {Number(agreement.total_price).toLocaleString()} EGP • {agreement.months}M
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                              <div>
                                <p className="font-bold text-slate-400">{t('installments.apply.fullName')}</p>
                                <p className="font-black text-slate-800 text-sm mt-0.5">{agreement.client_name}</p>
                              </div>
                              <div>
                                <p className="font-bold text-slate-400">{t('sell.form.phone')}</p>
                                <p className="font-black text-slate-800 text-sm mt-0.5">{agreement.client_phone}</p>
                              </div>
                              <div className="mt-2">
                                <p className="font-bold text-slate-400">{t('installments.admin.requests.job')}</p>
                                <p className="font-black text-slate-800 text-sm mt-0.5">{agreement.client_job}</p>
                              </div>
                              <div className="mt-2">
                                <p className="font-bold text-slate-400">{t('installments.admin.requests.income')}</p>
                                <p className="font-black text-slate-800 text-sm mt-0.5">{Number(agreement.client_monthly_income).toLocaleString()} EGP / M</p>
                              </div>
                            </div>

                            {/* Dossier file downloads */}
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('installments.admin.requests.docs')}</p>
                              <div className="flex flex-wrap gap-3">
                                {agreement.national_id_url && (
                                  <a 
                                    href={agreement.national_id_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-700 transition-colors"
                                  >
                                    <FolderLock size={14} className="text-slate-500" />
                                    {t('installments.admin.requests.nationalId')}
                                  </a>
                                )}
                                {agreement.income_proof_url && (
                                  <a 
                                    href={agreement.income_proof_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-700 transition-colors"
                                  >
                                    <FolderLock size={14} className="text-slate-500" />
                                    {t('installments.admin.requests.incomeProof')}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Term Details & Approval Buttons */}
                          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50">
                            <div className="space-y-2 text-xs font-bold text-slate-600">
                              <div className="flex justify-between">
                                <span>{isArabic ? 'المقدم المرفق:' : 'Down Payment:'}</span>
                                <span className="text-brand-primary">{Number(agreement.down_payment).toLocaleString()} EGP</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{isArabic ? 'المبلغ الممول:' : 'Financed:'}</span>
                                <span>{Number(agreement.financed_amount).toLocaleString()} EGP</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{isArabic ? 'الفوائد المترتبة:' : 'Interest:'}</span>
                                <span>{Number(agreement.total_interest).toLocaleString()} EGP ({agreement.interest_rate}%)</span>
                              </div>
                              <div className="h-px bg-slate-200 my-1" />
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('installments.calculator.monthlyPayment')}:</span>
                                <span className="font-black text-brand-primary">{Number(agreement.monthly_payment).toLocaleString()} EGP</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-6">
                              <button
                                onClick={() => handleAgreementReview(agreement.id, 'rejected')}
                                className="py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs active:scale-95 transition-all"
                              >
                                {t('installments.admin.requests.rejectBtn')}
                              </button>
                              <button
                                onClick={() => handleAgreementReview(agreement.id, 'approved')}
                                className="py-3 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-brand-primary/10"
                              >
                                {t('installments.admin.requests.approveBtn')}
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. ACTIVE AGREEMENTS */}
            {activeTab === 'agreements' && (
              <div className="space-y-6">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'عقود التمويل النشطة' : 'Active Installment Portfolios'}</h3>

                {agreements.filter(a => a.status === 'active' || a.status === 'defaulted' || a.status === 'completed').length === 0 ? (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
                    <p className="text-slate-400 font-bold">{isArabic ? 'لا توجد عقود تمويل حالياً.' : 'No active portfolio contracts found.'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agreements.filter(a => a.status === 'active' || a.status === 'defaulted' || a.status === 'completed').map(agreement => {
                      const isExpanded = expandedAgreement === agreement.id;
                      const v = agreement.vehicle;
                      const makeName = isArabic ? (v.make_ar || v.make_en) : (v.make_en || v.make_ar);
                      const modelName = isArabic ? (v.model_ar || v.model_en) : (v.model_en || v.model_ar);

                      return (
                        <div key={agreement.id} className="bg-white border border-slate-200 rounded-[25px] overflow-hidden shadow-sm transition-all duration-300">
                          
                          {/* Card Header clickable */}
                          <div 
                            onClick={() => setExpandedAgreement(isExpanded ? null : agreement.id)}
                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <img src={v.image_urls?.[0]} alt="" className="w-16 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
                              <div>
                                <h4 className="font-black text-sm text-slate-900">{makeName} {modelName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  {agreement.client_name} • {agreement.months}M • Remaining: {Number(agreement.remaining_balance).toLocaleString()} EGP
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadgeClass(agreement.status)}`}>
                                {agreement.status}
                              </span>
                              {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </div>
                          </div>

                          {/* Expanded payments schedule table with manual cash registry */}
                          {isExpanded && (
                            <div className="px-5 pb-6 border-t border-slate-100 bg-slate-50/20 animate-in fade-in duration-200">
                              <div className="pt-4 space-y-3">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest">{isArabic ? 'جدول الدفعات والمحاسبة اليدوية' : 'Contract Schedule & Payments Registry'}</h5>
                                
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
                                  <table className="w-full text-left rtl:text-right border-collapse text-xs font-bold">
                                    <thead>
                                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                        <th className="p-3 text-center">#</th>
                                        <th className="p-3">Due Date</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Penalty</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                      {agreement.payments && agreement.payments.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50/20">
                                          <td className="p-3 text-center font-mono text-slate-400">#{p.installment_number}</td>
                                          <td className="p-3">{p.due_date}</td>
                                          <td className="p-3">{Number(p.amount).toLocaleString()} EGP</td>
                                          <td className="p-3 text-red-500">{Number(p.penalty_fee) > 0 ? `+${p.penalty_fee} EGP` : '—'}</td>
                                          <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : p.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                                              {p.status}
                                            </span>
                                          </td>
                                          <td className="p-3 text-center">
                                            {p.status !== 'paid' ? (
                                              <button
                                                onClick={() => setManualPaymentPayment(p)}
                                                className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px]"
                                              >
                                                {t('installments.admin.auditor.recordManual')}
                                              </button>
                                            ) : (
                                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                                Paid
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. PAYMENT AUDITOR */}
            {activeTab === 'auditor' && (
              <div className="space-y-6">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{isArabic ? 'تدقيق مستندات الدفع البنكي' : 'Audit Transfer Receipts'}</h3>

                {auditorPayments.length === 0 ? (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
                    <p className="text-slate-400 font-bold">{isArabic ? 'لا توجد إيصالات دفع معلقة حالياً.' : 'No uploaded receipts waiting audit.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {auditorPayments.map(p => {
                      const v = p.agreement.vehicle;
                      const makeName = isArabic ? (v.make_ar || v.make_en) : (v.make_en || v.make_ar);
                      const modelName = isArabic ? (v.model_ar || v.model_en) : (v.model_en || v.model_ar);

                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
                          
                          {/* Receipt Info */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                              <div>
                                <h4 className="font-black text-sm text-slate-800">{makeName} {modelName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Agreement User: {p.agreement.client_name}</p>
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">Installment #{p.installment_number}</span>
                            </div>

                            <div className="text-xs font-bold text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl">
                              <div className="flex justify-between">
                                <span>{isArabic ? 'قيمة القسط المطلوبة:' : 'Installment Due:'}</span>
                                <span className="text-slate-800">{Number(p.amount).toLocaleString()} EGP</span>
                              </div>
                              {Number(p.penalty_fee) > 0 && (
                                <div className="flex justify-between text-red-500">
                                  <span>{isArabic ? 'غرامات تأخير:' : 'Penalty Fee:'}</span>
                                  <span>+{p.penalty_fee} EGP</span>
                                </div>
                              )}
                              <div className="flex justify-between text-brand-primary font-black border-t border-slate-200/60 pt-2">
                                <span>{isArabic ? 'المبلغ الكلي للاعتماد:' : 'Total Approved Payment:'}</span>
                                <span>{Math.round(Number(p.amount) + Number(p.penalty_fee)).toLocaleString()} EGP</span>
                              </div>
                            </div>

                            {/* Clickable zoom receipt image uploader */}
                            {p.receipt_url && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{isArabic ? 'صورة الإيصال المرفقة' : 'Receipt Document'}</label>
                                <div 
                                  onClick={() => setZoomReceiptUrl(p.receipt_url)}
                                  className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden cursor-zoom-in group shadow-sm"
                                >
                                  <img src={p.receipt_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                                    {isArabic ? 'اضغط لتكبير الصورة' : 'Click to zoom'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Verify/Audit Decisions */}
                          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                            <button
                              onClick={() => handleReceiptAudit(p.id, 'unpaid')}
                              className="py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs active:scale-95 transition-all"
                            >
                              {t('installments.admin.auditor.rejectReceipt')}
                            </button>
                            <button
                              onClick={() => handleReceiptAudit(p.id, 'paid')}
                              className="py-3 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-brand-primary/10"
                            >
                              {t('installments.admin.auditor.approveReceipt')}
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* POPUP: MANUAL PAYMENT RECORD */}
      {manualPaymentPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[35px] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-250">
            <button 
              onClick={() => setManualPaymentPayment(null)}
              className="absolute top-6 ltr:right-6 rtl:left-6 p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6">{t('installments.admin.auditor.recordManual')}</h3>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 text-xs font-bold text-slate-600">
                <p>Installment Number: #{manualPaymentPayment.installment_number}</p>
                <p>Amount Due: {Number(manualPaymentPayment.amount).toLocaleString()} EGP</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('installments.admin.auditor.penalty')}</label>
                <input
                  type="number"
                  value={manualPaymentPenalty}
                  onChange={(e) => setManualPaymentPenalty(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{t('installments.admin.auditor.notes')}</label>
                <textarea
                  value={manualPaymentNotes}
                  onChange={(e) => setManualPaymentNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm h-24"
                  placeholder="e.g. Paid in office cash register"
                />
              </div>

              <button
                onClick={handleManualPayment}
                className="w-full py-4 bg-brand-primary text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 text-sm active:scale-95"
              >
                {t('installments.admin.plans.saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: RECEIPT ZOOM MAGNIFIER */}
      {zoomReceiptUrl && (
        <div 
          onClick={() => setZoomReceiptUrl(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md cursor-zoom-out"
        >
          <div className="max-w-4xl w-full max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
            <img src={zoomReceiptUrl} alt="Receipt Document Zoom" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminInstallments;
