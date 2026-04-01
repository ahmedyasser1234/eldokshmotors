import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { socketService } from '../services/socketService';
import { useNotificationStore } from '../store/notificationStore';

interface Notification {
    id: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount, decrementUnreadCount } = useNotificationStore();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            const count = res.data.filter((n: Notification) => !n.is_read).length;
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time updates to refresh the list
        socketService.onNotification((newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            // Increment is handled in NotificationListener, but we ensure list is updated
        });

        return () => {
            socketService.offNotification();
        };
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            decrementUnreadCount();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="absolute top-16 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">{t('notifications.title') || 'Notifications'}</h3>
                    {unreadCount > 0 && (
                        <span className="bg-brand-primary text-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-black">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>
                <button 
                    onClick={markAllAsRead} 
                    className="text-slate-400 hover:text-brand-primary transition-colors hover:bg-brand-primary/10 p-1.5 rounded-full"
                    title={t('notifications.markAllAsRead') || 'Mark all as read'}
                >
                    <CheckCircle size={18} />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-10 text-center text-slate-400 font-bold italic text-sm">
                        {t('notifications.loading') || 'Loading...'}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Bell size={24} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm italic">{t('notifications.empty') || 'No notifications yet'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-4 hover:bg-slate-50 transition-all group relative ${!n.is_read ? 'bg-brand-primary/5' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
                                        <Bell size={18} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none pt-1">
                                                {t(n.title, n.data) as string}
                                            </h4>
                                            {!n.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="w-2 h-2 bg-brand-primary rounded-full shrink-0 mt-1"
                                                    title="Mark as read"
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                            {t(n.message, n.data) as string}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock size={10} />
                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link 
                    to="/dashboard/notifications" 
                    onClick={onClose}
                    className="text-xs font-black text-brand-primary hover:text-brand-dark uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {t('notifications.viewAll') || 'View All Notifications'}
                    <ExternalLink size={12} />
                </Link>
            </div>
        </div>
    );
};

export default NotificationDropdown;
