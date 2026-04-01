import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { User } from 'lucide-react';

const AdminLogs: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/admin/logs');
                setLogs(response.data);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <DashboardLayout role="admin" title={t('sidebar.logs')}>
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-xl font-bold mb-1 text-slate-800">{t('admin.logs.title')}</h3>
                    <p className="text-sm text-slate-500">{t('admin.logs.subtitle')}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left ltr:text-left rtl:text-right table-fixed border-collapse">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                <th className="px-8 py-6">{t('admin.logs.timestamp')}</th>
                                <th className="px-8 py-6">{t('admin.logs.user')}</th>
                                <th className="px-8 py-6">{t('admin.logs.action')}</th>
                                <th className="px-8 py-6">{t('admin.logs.details')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-bold">
                                        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mr-2 inline-block" />
                                        {t('common.loading')}
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-bold">
                                        {t('admin.logs.noLogs')}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 text-xs text-slate-400 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="font-bold text-sm text-slate-800">{log.user?.name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-lg border border-brand-primary/10">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500">
                                            {log.details}
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

export default AdminLogs;
