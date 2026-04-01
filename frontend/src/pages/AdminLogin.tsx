import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import Logo from '../components/Logo';

const AdminLogin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.user.role !== 'admin') {
        setError(t('admin.dashboard.login.errors.unauthorized'));
        setLoading(false);
        return;
      }

      setAuth(response.data.user, response.data.access_token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      const backendMsg = err.response?.data?.message;
      const errorKey = backendMsg ? backendMsg.toLowerCase().replace(/\s+/g, '_') : 'failed';
      setError(t(`admin.dashboard.login.errors.${errorKey}`, { defaultValue: backendMsg || t('admin.dashboard.login.errors.failed') }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-black">
      {/* Premium Car Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
        style={{ 
          backgroundImage: `url('/car_bg_premium.png')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/40 to-black/90"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="mb-12 text-center relative">
          <div className="absolute -top-16 ltr:right-0 rtl:left-0">
             <button 
                  type="button"
                  onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                  className="px-4 py-2 text-[10px] font-black bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-md uppercase tracking-widest"
              >
                  {i18n.language === 'ar' ? 'EN' : 'عربي'}
              </button>
          </div>
          
          <div className="inline-flex items-center gap-3 mb-8">
            <Logo className="h-16" isWhite={true} />
            <div className="h-6 w-px bg-white/20 mx-2"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md">
              <Shield size={14} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('admin.dashboard.login.control')}</span>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-2 uppercase">{t('admin.dashboard.login.title')}</h1>
          <p className="text-gray-300 text-sm tracking-tight">{t('admin.dashboard.login.subtitle')}</p>
        </div>

        <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 rtl:text-right rtl:block">{t('admin.dashboard.login.emailLabel')}</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors rtl:right-6 rtl:left-auto" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-14 text-white focus:outline-none focus:border-brand-primary/50 transition-all rtl:text-right"
                  placeholder="admin@eldoksh.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 rtl:text-right rtl:block">{t('admin.dashboard.login.passwordLabel')}</label>
              <div className="relative group">
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary transition-colors z-10 rtl:right-6 rtl:left-auto"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-14 text-white focus:outline-none focus:border-brand-primary/50 transition-all rtl:text-right"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={18} />
                  <span>{t('admin.dashboard.login.submitButton')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                <ArrowLeft size={16} className="rtl:rotate-180" />
                <span>{t('admin.dashboard.login.backToShowroom')}</span>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
