import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socketService';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../store/notificationStore';
import api from '../services/api';

const NotificationListener: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const { setUnreadCount, incrementUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch initial unread count
      const fetchCount = async () => {
        try {
          const res = await api.get('/notifications/unread-count');
          setUnreadCount(res.data.count);
        } catch (err) {
          // Fallback to full fetch if unread-count endpoint doesn't exist
          try {
            const res = await api.get('/notifications');
            const count = res.data.filter((n: any) => !n.is_read).length;
            setUnreadCount(count);
          } catch (e) {
            console.error('Failed to fetch initial count:', e);
          }
        }
      };
      
      fetchCount();
      socketService.connect(user.id);

      socketService.onNotification((notification) => {
        console.log('New notification received:', notification);
        incrementUnreadCount();
        
        // Show a premium toast notification
        toast.custom((toastItem) => (
          <div
            className={`${
              toastItem.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-brand-accent`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand-accent">
                    <Bell size={20} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    {t(notification.title, notification.data) as string}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">
                    {t(notification.message, notification.data) as string}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-100">
              <button
                onClick={() => toast.dismiss(toastItem.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-[10px] font-black text-brand-accent hover:text-brand-dark focus:outline-none uppercase tracking-widest whitespace-nowrap"
              >
                {t('notifications.close')}
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      });
    }

    return () => {
      socketService.offNotification();
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  return null; // This component doesn't render anything visible
};

export default NotificationListener;
