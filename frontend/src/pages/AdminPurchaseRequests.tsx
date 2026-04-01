import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Eye, CheckCircle, XCircle, Clock,
  Phone, Mail, Car, Trash2, X, ChevronLeft, ChevronRight,
  ShoppingCart, Plus, ToggleLeft, ToggleRight, AlertCircle, Package
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

interface PurchaseRequest {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  expected_price: number;
  description: string;
  image_urls: string[];
  status: string;
  created_at: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  engine_size?: string;
  transmission?: string;
  fuel_type?: string;
  exterior_color?: string;
  interior_color?: string;
  vin?: string;
  location?: string;
  address?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface ConfirmFleetForm {
  sale_price: string;
  reservation_price: string;
  has_installments: boolean;
  down_payment: string;
  months: string;
  monthly_payment: string;
  // Possibly missing fields
  make_ar: string;
  make_en: string;
  model_ar: string;
  model_en: string;
  category: string;
  year: string;
  mileage: string;
  engine_size: string;
  transmission: string;
  fuel_type: string;
  exterior_color: string;
  interior_color: string;
  vin: string;
  description_ar: string;
  description_en: string;
}

const CATEGORIES = ['economy', 'luxury', 'suv', 'sport', 'van'];

const AdminPurchaseRequests: React.FC = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fleet confirmation modal state
  const [confirmFleetOpen, setConfirmFleetOpen] = useState(false);
  const [confirmFleetRequest, setConfirmFleetRequest] = useState<PurchaseRequest | null>(null);
  const [confirmFleetForm, setConfirmFleetForm] = useState<ConfirmFleetForm | null>(null);
  const [confirmFleetLoading, setConfirmFleetLoading] = useState(false);
  const [confirmFleetError, setConfirmFleetError] = useState<string | null>(null);
  const [confirmFleetSuccess, setConfirmFleetSuccess] = useState(false);

  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  useEffect(() => {
    fetchRequests();
    // Mark sell offer notifications as read when visiting this page
    api.patch('/notifications/read-type/purchase_request').catch(err => console.error(err));
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/purchase-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/purchase-requests/${id}/status`, { status });
      fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openConfirmFleet = (req: PurchaseRequest) => {
    setConfirmFleetRequest(req);
    setConfirmFleetError(null);
    setConfirmFleetSuccess(false);
    setConfirmFleetForm({
      sale_price: '',
      reservation_price: '',
      has_installments: false,
      down_payment: '',
      months: '',
      monthly_payment: '',
      make_ar: '',
      make_en: req.make || '',
      model_ar: '',
      model_en: req.model || '',
      category: '',
      year: req.year ? String(req.year) : '',
      mileage: req.mileage ? String(req.mileage) : '',
      engine_size: req.engine_size || '',
      transmission: req.transmission || '',
      fuel_type: req.fuel_type || '',
      exterior_color: req.exterior_color || '',
      interior_color: req.interior_color || '',
      vin: req.vin || '',
      description_ar: req.description || '',
      description_en: req.description || '',
    });
    setConfirmFleetOpen(true);
  };

  const handleConfirmFleetSubmit = async () => {
    if (!confirmFleetRequest || !confirmFleetForm) return;
    setConfirmFleetLoading(true);
    setConfirmFleetError(null);

    try {
      const payload: any = {
        sale_price: Number(confirmFleetForm.sale_price),
        reservation_price: Number(confirmFleetForm.reservation_price) || undefined,
        has_installments: confirmFleetForm.has_installments,
        make_ar: confirmFleetForm.make_ar,
        make_en: confirmFleetForm.make_en,
        model_ar: confirmFleetForm.model_ar,
        model_en: confirmFleetForm.model_en,
        category: confirmFleetForm.category,
        year: Number(confirmFleetForm.year),
        mileage: Number(confirmFleetForm.mileage),
        engine_size: confirmFleetForm.engine_size || undefined,
        transmission: confirmFleetForm.transmission || undefined,
        fuel_type: confirmFleetForm.fuel_type || undefined,
        exterior_color: confirmFleetForm.exterior_color || undefined,
        interior_color: confirmFleetForm.interior_color || undefined,
        vin: confirmFleetForm.vin || undefined,
        description_ar: confirmFleetForm.description_ar || undefined,
        description_en: confirmFleetForm.description_en || undefined,
      };

      if (confirmFleetForm.has_installments) {
        payload.installment_info = {
          down_payment: Number(confirmFleetForm.down_payment),
          months: Number(confirmFleetForm.months),
          monthly_payment: Number(confirmFleetForm.monthly_payment),
        };
      }

      await api.post(`/purchase-requests/${confirmFleetRequest.id}/confirm-purchase`, payload);
      setConfirmFleetSuccess(true);
      fetchRequests();
      // If the details modal for this request is open, update its status
      if (selectedRequest?.id === confirmFleetRequest.id) {
        setSelectedRequest(prev => prev ? { ...prev, status: 'purchased' } : null);
      }
    } catch (err: any) {
      setConfirmFleetError(
        err?.response?.data?.message || t('confirmFleet.errorGeneric')
      );
    } finally {
      setConfirmFleetLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/purchase-requests/${itemToDelete}`);
      fetchRequests();
      if (currentRequests.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      if (selectedRequest?.id === itemToDelete) setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'reviewed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'purchased': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2";

  return (
    <DashboardLayout title={t('sidebar.sellOffers')} role="admin">
      <div className="space-y-8">
        {/* Table/List */}
        <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.table.vehicle')}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.table.customer')}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.purchase.priceLabel')}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.table.status')}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                <AnimatePresence>
                  {currentRequests.map((req) => (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-8 py-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            {req.image_urls?.[0] ? (
                              <img src={req.image_urls[0]} alt="Car" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Car size={20} />
                              </div>
                            )}
                          </div>
                          <div className="text-right rtl:text-right ltr:text-left whitespace-nowrap">
                            <p className="font-black text-slate-800 uppercase leading-none mb-1">{req.make} {req.model}</p>
                            <p className="text-xs font-bold text-slate-400 tracking-tight">{req.year} • {req.mileage?.toLocaleString()} KM</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-700">{req.client_name || req.user?.name || 'Guest'}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{req.client_phone || req.user?.phone || 'No Phone'}</div>
                      </td>
                      <td className="px-8 py-6 text-center whitespace-nowrap">
                        <div className="text-lg font-black text-brand-primary">{Number(req.expected_price).toLocaleString()} <span className="text-[10px] uppercase">EGP</span></div>
                      </td>
                      <td className="px-8 py-6 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusColor(req.status.toLowerCase())}`}>
                          {t(`status.${req.status.toLowerCase()}`, req.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                            title={t('admin.actions.view')}
                          >
                            <Eye size={20} />
                          </button>
                          {req.status !== 'purchased' && (
                            <button
                              onClick={() => openConfirmFleet(req)}
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all"
                              title={t('confirmFleet.buttonLabel')}
                            >
                              <ShoppingCart size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(req.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {requests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <History size={64} strokeWidth={1} />
                        <p className="text-sm font-black uppercase tracking-widest">{t('admin.purchase.noOffers')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-sm font-bold relative z-10">
              <span className="text-slate-500 order-2 sm:order-1">
                {t('fleet.showing')} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, requests.length)} / {requests.length}
              </span>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all ltr"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 bg-brand-primary/5 text-brand-primary rounded-xl font-black">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all ltr"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Details Modal ─── */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="overflow-y-auto p-8 md:p-12 space-y-10">
                <header className="flex justify-between items-start border-b border-slate-100 pb-8">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-2">
                      {selectedRequest.make} {selectedRequest.model}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(selectedRequest.status)}`}>
                        {t(`status.${selectedRequest.status}`, selectedRequest.status)}
                      </span>
                      <span className="text-slate-400 font-bold text-sm">{t('admin.purchase.submittedOn')} {new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={24} className="text-slate-500" />
                  </button>
                </header>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('admin.purchase.year')}</p>
                        <p className="text-xl font-black text-slate-800">{selectedRequest.year}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('admin.purchase.mileage')}</p>
                        <p className="text-xl font-black text-slate-800">{selectedRequest.mileage?.toLocaleString()} KM</p>
                      </div>
                    </div>

                    <div className="p-8 bg-brand-primary/5 rounded-[32px] border border-brand-primary/10">
                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">{t('admin.purchase.customerInfo')}</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-700 font-bold">
                          <Eye size={18} className="text-brand-primary shrink-0" />
                          <span>{selectedRequest.client_name || selectedRequest.user?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold">
                          <Phone size={18} className="text-brand-primary shrink-0" />
                          <span>{selectedRequest.client_phone || selectedRequest.user?.phone || 'No Phone'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold">
                          <Mail size={18} className="text-brand-primary shrink-0" />
                          <span>{selectedRequest.client_email || selectedRequest.user?.email || 'No Email'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('admin.purchase.location')}</p>
                      <div className="space-y-4">
                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          {selectedRequest.location || 'No location provided'}
                        </div>
                        <p className="text-xs text-slate-500 font-bold italic leading-relaxed">
                          {selectedRequest.address || 'No specific address provided'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('admin.purchase.pricingTerms')}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-brand-primary">{Number(selectedRequest.expected_price).toLocaleString()}</span>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">EGP</span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-4 bg-slate-50 py-3 pr-4 rounded-r-2xl">
                        "{selectedRequest.description || 'No additional description provided'}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.purchase.technicalSpecs')}</p>
                      <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.engine')}</p>
                          <p className="text-sm font-bold text-slate-800">{selectedRequest.engine_size || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.transmission')}</p>
                          <p className="text-sm font-bold text-slate-800 uppercase">{selectedRequest.transmission || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.fuelType')}</p>
                          <p className="text-sm font-bold text-slate-800 uppercase">{selectedRequest.fuel_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.vin')}</p>
                          <p className="text-sm font-bold text-slate-800 uppercase">{selectedRequest.vin || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.extColor')}</p>
                          <p className="text-sm font-bold text-slate-800">{selectedRequest.exterior_color || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('admin.purchase.intColor')}</p>
                          <p className="text-sm font-bold text-slate-800">{selectedRequest.interior_color || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Car Photos</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedRequest.image_urls?.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-video rounded-2xl overflow-hidden hover:opacity-90 transition-opacity ring-1 ring-slate-100">
                            <img src={url} alt={`Car ${i}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Status Management + Purchase Confirmation */}
                    <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                      <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">{t('admin.purchase.manageStatus')}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => updateStatus(selectedRequest.id, 'reviewed')}
                          className="flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                        >
                          <Clock size={16} /> {t('admin.actions.reviewed')}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedRequest.id, 'accepted')}
                          className="flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                        >
                          <CheckCircle size={16} /> {t('admin.actions.accept')}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                          className="flex items-center justify-center gap-2 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                        >
                          <XCircle size={16} /> {t('admin.actions.reject')}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedRequest.id, 'pending')}
                          className="flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border border-white/10"
                        >
                          <History size={16} /> {t('admin.actions.reset')}
                        </button>
                      </div>

                      {/* "تم الشراء" Button */}
                      {selectedRequest.status !== 'purchased' && (
                        <button
                          onClick={() => {
                            openConfirmFleet(selectedRequest);
                            setSelectedRequest(null);
                          }}
                          className="mt-4 w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-900/30"
                        >
                          <ShoppingCart size={20} />
                          {t('confirmFleet.confirmPurchaseBtn')}
                        </button>
                      )}

                      {selectedRequest.status === 'purchased' && (
                        <div className="mt-4 w-full flex items-center justify-center gap-3 py-4 bg-purple-500/20 rounded-2xl font-black text-[10px] uppercase tracking-wider text-purple-300 border border-purple-500/30">
                          <Package size={16} />
                          {t('confirmFleet.alreadyInFleet')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Fleet Confirmation Modal ─── */}
      <AnimatePresence>
        {confirmFleetOpen && confirmFleetRequest && confirmFleetForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !confirmFleetLoading && setConfirmFleetOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-8 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
                        <Package size={20} className="text-purple-300" />
                      </div>
                      <span className="text-xs font-black text-purple-300 uppercase tracking-widest">{t('confirmFleet.modalTag')}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                      {confirmFleetRequest.make} {confirmFleetRequest.model} — {confirmFleetRequest.year}
                    </h2>
                    <p className="text-sm font-bold text-white/50">
                      {t('confirmFleet.modalSubtitle')} · {t('admin.purchase.priceLabel')}: {Number(confirmFleetRequest.expected_price).toLocaleString()} EGP
                    </p>
                  </div>
                  <button
                    onClick={() => !confirmFleetLoading && setConfirmFleetOpen(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-8 space-y-8">

                {/* Success state */}
                {confirmFleetSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 py-12 text-center"
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">{t('confirmFleet.successTitle')}</h3>
                      <p className="text-slate-500 font-bold">{t('confirmFleet.successDesc')}</p>
                    </div>
                    <button
                      onClick={() => setConfirmFleetOpen(false)}
                      className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                    >
                      {t('confirmFleet.successClose')}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Error Banner */}
                    {confirmFleetError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-sm font-bold">{confirmFleetError}</p>
                      </div>
                    )}

                    {/* Section 1: Pricing */}
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brand-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">1</span>
                        {t('confirmFleet.sectionPricing')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{t('confirmFleet.salePrice')} *</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={confirmFleetForm.sale_price}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, sale_price: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('confirmFleet.reservationPrice')}</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={confirmFleetForm.reservation_price}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, reservation_price: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Installments */}
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brand-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">2</span>
                        {t('confirmFleet.sectionInstallments')}
                      </h3>
                      <div
                        onClick={() => setConfirmFleetForm(f => f ? { ...f, has_installments: !f.has_installments } : f)}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${confirmFleetForm.has_installments ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div>
                          <p className={`font-black text-sm ${confirmFleetForm.has_installments ? 'text-purple-700' : 'text-slate-600'}`}>
                            {t('confirmFleet.installmentsToggle')}
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">{t('confirmFleet.installmentsToggleDesc')}</p>
                        </div>
                        {confirmFleetForm.has_installments
                          ? <ToggleRight size={36} className="text-purple-600 shrink-0" />
                          : <ToggleLeft size={36} className="text-slate-400 shrink-0" />
                        }
                      </div>

                      <AnimatePresence>
                        {confirmFleetForm.has_installments && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <label className={labelClass}>{t('confirmFleet.downPayment')} *</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={confirmFleetForm.down_payment}
                                  onChange={e => setConfirmFleetForm(f => f ? { ...f, down_payment: e.target.value } : f)}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>{t('confirmFleet.months')} *</label>
                                <input
                                  type="number"
                                  placeholder="12"
                                  value={confirmFleetForm.months}
                                  onChange={e => setConfirmFleetForm(f => f ? { ...f, months: e.target.value } : f)}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>{t('confirmFleet.monthlyPayment')} *</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={confirmFleetForm.monthly_payment}
                                  onChange={e => setConfirmFleetForm(f => f ? { ...f, monthly_payment: e.target.value } : f)}
                                  className={inputClass}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 3: Vehicle Identity */}
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brand-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">3</span>
                        {t('confirmFleet.sectionVehicleData')}
                        {(!confirmFleetForm.make_ar || !confirmFleetForm.model_ar || !confirmFleetForm.category) && (
                          <span className="ms-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full border border-amber-200 uppercase tracking-wider">
                            {t('confirmFleet.missingDataBadge')}
                          </span>
                        )}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{t('common.make_ar')} *</label>
                          <input
                            type="text"
                            placeholder="مرسيدس بنز"
                            value={confirmFleetForm.make_ar}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, make_ar: e.target.value } : f)}
                            className={`${inputClass} ${!confirmFleetForm.make_ar ? 'border-amber-300 bg-amber-50/50' : ''}`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('common.make_en')} *</label>
                          <input
                            type="text"
                            placeholder="Mercedes-Benz"
                            value={confirmFleetForm.make_en}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, make_en: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('common.model_ar')} *</label>
                          <input
                            type="text"
                            placeholder="إس كلاس"
                            value={confirmFleetForm.model_ar}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, model_ar: e.target.value } : f)}
                            className={`${inputClass} ${!confirmFleetForm.model_ar ? 'border-amber-300 bg-amber-50/50' : ''}`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('common.model_en')} *</label>
                          <input
                            type="text"
                            placeholder="S-Class"
                            value={confirmFleetForm.model_en}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, model_en: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('confirmFleet.category')} *</label>
                          <select
                            value={confirmFleetForm.category}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, category: e.target.value } : f)}
                            className={`${inputClass} ${!confirmFleetForm.category ? 'border-amber-300 bg-amber-50/50' : ''}`}
                          >
                            <option value="">{t('filters.allCategories')}</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{t(`categories.${c}`)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.year')}</label>
                          <input
                            type="number"
                            value={confirmFleetForm.year}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, year: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.mileage')}</label>
                          <input
                            type="number"
                            value={confirmFleetForm.mileage}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, mileage: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Technical Details */}
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brand-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">4</span>
                        {t('confirmFleet.sectionTechnical')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{t('admin.purchase.engine')}</label>
                          <input
                            type="text"
                            placeholder="2000 CC"
                            value={confirmFleetForm.engine_size}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, engine_size: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.transmission')}</label>
                          <select
                            value={confirmFleetForm.transmission}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, transmission: e.target.value } : f)}
                            className={inputClass}
                          >
                            <option value="">—</option>
                            <option value="automatic">{t('sell.form.transmissions.automatic')}</option>
                            <option value="manual">{t('sell.form.transmissions.manual')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.fuelType')}</label>
                          <select
                            value={confirmFleetForm.fuel_type}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, fuel_type: e.target.value } : f)}
                            className={inputClass}
                          >
                            <option value="">—</option>
                            <option value="gasoline">{t('sell.form.fuelTypes.gasoline')}</option>
                            <option value="diesel">{t('sell.form.fuelTypes.diesel')}</option>
                            <option value="hybrid">{t('sell.form.fuelTypes.hybrid')}</option>
                            <option value="electric">{t('sell.form.fuelTypes.electric')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.vin')}</label>
                          <input
                            type="text"
                            placeholder="VIN"
                            value={confirmFleetForm.vin}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, vin: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.extColor')}</label>
                          <input
                            type="text"
                            value={confirmFleetForm.exterior_color}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, exterior_color: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('admin.purchase.intColor')}</label>
                          <input
                            type="text"
                            value={confirmFleetForm.interior_color}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, interior_color: e.target.value } : f)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Descriptions */}
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brand-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">5</span>
                        {t('confirmFleet.sectionDescriptions')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>{t('details.description_ar')}</label>
                          <textarea
                            rows={3}
                            value={confirmFleetForm.description_ar}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, description_ar: e.target.value } : f)}
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('details.description_en')}</label>
                          <textarea
                            rows={3}
                            value={confirmFleetForm.description_en}
                            onChange={e => setConfirmFleetForm(f => f ? { ...f, description_en: e.target.value } : f)}
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer CTA */}
              {!confirmFleetSuccess && (
                <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                  <button
                    onClick={handleConfirmFleetSubmit}
                    disabled={
                      confirmFleetLoading ||
                      !confirmFleetForm.sale_price ||
                      !confirmFleetForm.make_ar ||
                      !confirmFleetForm.make_en ||
                      !confirmFleetForm.model_ar ||
                      !confirmFleetForm.model_en ||
                      !confirmFleetForm.category
                    }
                    className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-900/20"
                  >
                    {confirmFleetLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t('confirmFleet.adding')}
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        {t('confirmFleet.addToFleetBtn')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={executeDelete}
        message={t('admin.fleet.deleteConfirm')}
      />
    </DashboardLayout>
  );
};

export default AdminPurchaseRequests;
