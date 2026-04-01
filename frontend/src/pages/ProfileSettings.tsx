import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Shield, Mail, Phone, CheckCircle2, AlertCircle, Save, Eye, EyeOff, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from '../components/DashboardLayout';

const ProfileSettings: React.FC = () => {
    const { t } = useTranslation();
    const { user, setUser } = useAuthStore();
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const response = await api.patch('/users/profile', profileData);
            setUser(response.data);
            setMessage({ type: 'success', text: t('settings.success') });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: t('settings.error') });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: t('settings.passwordsMismatch') });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await api.patch('/users/profile', { password: passwordData.newPassword });
            setMessage({ type: 'success', text: t('settings.success') });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ type: 'error', text: t('settings.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role={user?.role as 'admin' || 'customer'} title={t('settings.title')}>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <header className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{t('settings.title')}</h1>
                    <p className="text-slate-500 font-medium mt-2">{t('settings.subtitle')}</p>
                </header>

                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 font-bold border ${
                            message.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-red-50 border-red-100 text-red-600'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Profile Information */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-6">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-black uppercase text-slate-900">{t('settings.profileInfo')}</h2>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('settings.name')}</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold outline-none"
                                        placeholder={t('settings.name')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('settings.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        readOnly
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold outline-none cursor-not-allowed opacity-70"
                                        placeholder={t('settings.email')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('sidebar.profile')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold outline-none"
                                        placeholder={t('settings.phone')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('auth.register.address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold outline-none"
                                        placeholder={t('auth.register.address')}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-brand-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? '...' : t('settings.updateProfile')}
                            </button>
                        </form>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-6">
                            <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-xl font-black uppercase text-slate-900">{t('settings.security')}</h2>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('settings.newPassword')}</label>
                                <div className="relative">
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors z-10"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('settings.confirmPassword')}</label>
                                <div className="relative">
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors z-10"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="w-full ltr:pl-12 rtl:pr-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading || !passwordData.newPassword}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                >
                                    <Shield size={18} />
                                    {loading ? '...' : t('settings.changePassword')}
                                </button>
                            </div>

                            <div className="p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10">
                                <p className="text-[10px] text-brand-accent font-bold uppercase leading-relaxed">
                                    {t('auth.login.subtitle')}
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfileSettings;
