import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, MessageSquare, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const UserChat: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, token } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [participantConnected, setParticipantConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isRtl = i18n.language === 'ar';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                // 1. Get or start conversation
                const resp = await api.post('/chat/start', {});
                setConversation(resp.data);

                // 2. Load history
                const msgResp = await api.get(`/chat/messages/${resp.data.id}`);
                setMessages(msgResp.data);
                setLoading(false);

                // 3. Connect Socket
                const s = io(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat`, {
                    query: { userId: user?.id },
                    transports: ['websocket'],
                    auth: { token }
                });

                s.on('connect', () => {
                   console.log('Chat connected');
                   s.emit('joinConversation', resp.data.id);
                   
                   // Check admin status
                   if (resp.data.admin_id) {
                       s.emit('checkUserStatus', resp.data.admin_id, (res: any) => {
                           setParticipantConnected(res.status === 'online');
                       });
                   }
                });

                s.on('disconnect', () => {});

                s.on('userStatusChanged', (data: { userId: string, status: string }) => {
                    // Using functional update to access latest state without stale closure
                    setConversation((curr: any) => {
                        if (curr && data.userId === curr.admin_id) {
                            setParticipantConnected(data.status === 'online');
                        }
                        return curr;
                    });
                });

                s.on('receiveMessage', (msg: any) => {
                    if (msg.conversation_id === resp.data.id) {
                        // Update conversation info if provided (e.g. admin assigned)
                        if (msg.conversation) {
                            setConversation(msg.conversation);
                            // Verify status of the newly assigned admin
                            if (msg.conversation.admin_id) {
                                s.emit('checkUserStatus', msg.conversation.admin_id, (res: any) => {
                                    setParticipantConnected(res.status === 'online');
                                });
                            }
                        }

                        setMessages(prev => {
                            // If we have a tempId, replace the optimistic message
                            if (msg.tempId) {
                                const idx = prev.findIndex(m => m.id === msg.tempId);
                                if (idx > -1) {
                                    const updated = [...prev];
                                    updated[idx] = msg;
                                    return updated;
                                }
                            }
                            
                            if (prev.some(m => m.id === msg.id)) return prev;
                            const filtered = prev.filter(m => !String(m.id).startsWith('temp-'));
                            return [...filtered, msg];
                        });
                    }
                });

                s.on('error', (err: any) => {
                    console.error('Socket error:', err);
                });

                setSocket(s);
            } catch (err) {
                console.error('Failed to init chat:', err);
                setLoading(false);
            }
        };

        if (user) {
            initChat();
        }

        return () => {
            socket?.disconnect();
        };
    }, [user]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !socket) return;

        // Optimistic update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            conversation_id: conversation.id,
            sender_id: user?.id,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        const messageData = {
            conversationId: conversation.id,
            senderId: user?.id,
            receiverId: conversation.admin_id, // This might be null if no admin assigned yet
            content: newMessage.trim(),
            tempId: tempMsg.id,
        };

        socket.emit('sendMessage', messageData, (response: any) => {
            if (response?.error) {
                toast.error('Failed to send message: ' + response.error);
                // Remove temp message if failed
                setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            }
        });
    };

    return (
        <DashboardLayout title={t('chat.title')} subtitle={t('chat.withSupport')} role="customer">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-280px)] overflow-hidden">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{t('common.agency')}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${participantConnected ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {participantConnected ? t('chat.online') : t('chat.offline')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                             <Loader2 size={32} className="animate-spin mb-2" />
                             <p className="text-sm font-bold">Messaing center Loading...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-10">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <p className="font-bold">{t('chat.noConversations')}</p>
                            <p className="text-xs mt-1">{t('chat.startNew')}</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm font-medium
                                        ${isMe 
                                            ? 'bg-brand-primary text-white rounded-tr-none' 
                                            : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'}
                                    `}>
                                        {msg.content}
                                        <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chat.typeMessage')}
                            className="flex-grow bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-brand-primary text-white p-4 rounded-2xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                        >
                            <Send size={20} className={isRtl ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default UserChat;
