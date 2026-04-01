import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { MoreVertical, Shield, User, Mail, Phone } from 'lucide-react';

const AdminUsers: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <DashboardLayout role="admin" title={t('sidebar.customers')}>
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-xl font-bold mb-1 text-slate-800">{t('admin.users.title')}</h3>
                    <p className="text-sm text-slate-500">{t('admin.users.subtitle')}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left ltr:text-left rtl:text-right table-auto border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                <th className="px-8 py-6">{t('admin.table.user')}</th>
                                <th className="px-8 py-6">{t('admin.table.contact')}</th>
                                <th className="px-8 py-6">{t('admin.table.role')}</th>
                                <th className="px-8 py-6">{t('admin.table.joined')}</th>
                                <th className="px-8 py-6">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold">
                                        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mr-2 inline-block" />
                                        {t('common.loading')}
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold">
                                        {t('common.noData')}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-primary">
                                                    <User size={20} />
                                                </div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <Mail size={12} className="text-slate-400" /> {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                        <Phone size={12} className="text-slate-400" /> {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Shield size={14} className={user.role === 'admin' ? 'text-brand-accent' : 'text-blue-500'} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-brand-accent' : 'text-blue-500'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsers;
