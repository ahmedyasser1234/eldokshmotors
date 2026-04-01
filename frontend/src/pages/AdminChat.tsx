import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, MessageSquare, Loader2, Search, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const AdminChat: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, token } = useAuthStore();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [participantConnected, setParticipantConnected] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isRtl = i18n.language === 'ar';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const resp = await api.get('/chat/conversations');
                setConversations(resp.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
                setLoading(false);
            }
        };

        const initSocket = () => {
            const s = io(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat`, {
                query: { userId: user?.id },
                transports: ['websocket', 'polling'],
                auth: { token },
                reconnectionAttempts: 5,
            });

            s.on('connect', () => {
                console.log('[Socket] Admin chat connected');
                if (activeConversation) {
                    s.emit('joinConversation', activeConversation.id);
                    
                    // Check customer status
                    s.emit('checkUserStatus', activeConversation.customer_id, (res: any) => {
                        setParticipantConnected(res.status === 'online');
                    });
                }
            });

            s.on('disconnect', () => {});

            s.on('userStatusChanged', (data: { userId: string, status: string }) => {
                if (activeConversation && data.userId === activeConversation.customer_id) {
                    setParticipantConnected(data.status === 'online');
                }
            });

            s.on('receiveMessage', (msg: any) => {
                // Update active conversation messages
                if (activeConversation && msg.conversation_id === activeConversation.id) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        const filtered = prev.filter(m => !String(m.id).startsWith('temp-'));
                        return [...filtered, msg];
                    });
                }
                
                // Update conversations list (move to top, update last message)
                setConversations(prev => {
                    const idx = prev.findIndex(c => c.id === msg.conversation_id);
                    if (idx > -1) {
                        const updated = [...prev];
                        updated[idx].last_message = msg.content;
                        updated[idx].last_message_at = msg.created_at;
                        // Move to top
                        const [item] = updated.splice(idx, 1);
                        return [item, ...updated];
                    }
                    return prev;
                });
            });

            s.on('messageSent', (msg: any) => {
                if (activeConversation && msg.conversation_id === activeConversation.id) {
                    setMessages(prev => [...prev, msg]);
                }
            });

            s.on('connect_error', (err) => {
                console.error('[Socket] Admin chat connection error:', err.message);
                if (err.message === 'xhr poll error') {
                    console.warn('[Socket] XHR Poll Error - This often means Mixed Content (HTTPS -> HTTP) or CORS issues.');
                }
            });

            s.on('error', (err: any) => {
                console.error('[Socket] Generic admin chat error:', err);
            });

            setSocket(s);
        };

        if (user) {
            fetchConversations();
            initSocket();
            // Mark chat notifications as read when visiting this page
            api.patch('/notifications/read-type/chat').catch(err => console.error(err));
        }

        return () => {
            socket?.disconnect();
        };
    }, [user, activeConversation?.id]);

    useEffect(scrollToBottom, [messages]);

    const selectConversation = async (conv: any) => {
        setActiveConversation(conv);
        setLoading(true);
        try {
            const resp = await api.get(`/chat/messages/${conv.id}`);
            setMessages(resp.data);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoading(false);
            if (socket) {
                socket.emit('joinConversation', conv.id);
                // Check status
                socket.emit('checkUserStatus', conv.customer_id, (res: any) => {
                    setParticipantConnected(res.status === 'online');
                });
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !socket) return;

        const messageData = {
            conversationId: activeConversation.id,
            senderId: user?.id,
            receiverId: activeConversation.customer_id,
            content: newMessage.trim(),
        };

        // Optimistic update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            conversation_id: activeConversation.id,
            sender_id: user?.id,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        socket.emit('sendMessage', messageData, (response: any) => {
            if (response?.error) {
                // Remove temp message if failed
                setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            }
        });
        
        // Update list
        setConversations(prev => {
            const idx = prev.findIndex(c => c.id === activeConversation.id);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx].last_message = newMessage;
                updated[idx].last_message_at = new Date().toISOString();
                return updated;
            }
            return prev;
        });
    };

    const filteredConversations = conversations.filter(c => 
        c.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title={t('chat.adminTitle')} subtitle={t('chat.adminSubtitle')} role="admin">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex h-[calc(100vh-280px)] overflow-hidden">
                {/* Conversations Sidebar */}
                <div className={`
                    w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/20
                    ${activeConversation ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={t('chat.searchCustomers')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <p className="text-sm font-bold">{t('chat.noChatsFound')}</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => selectConversation(conv)}
                                    className={`
                                        w-full p-4 flex items-center gap-3 border-b border-slate-100 transition-all text-left
                                        ${activeConversation?.id === conv.id ? 'bg-brand-primary/5 border-l-4 border-brand-primary' : 'bg-white hover:bg-slate-50'}
                                    `}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden shrink-0">
                                        {conv.customer?.name?.charAt(0) || <UserIcon size={20} />}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-slate-900 truncate">{conv.customer?.name}</h4>
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate font-medium">
                                            {conv.last_message || t('chat.newConversation')}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Center Area */}
                <div className={`
                    flex-grow flex flex-col bg-white
                    ${!activeConversation ? 'hidden md:flex' : 'flex'}
                `}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setActiveConversation(null)}
                                        className="md:hidden text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                        {activeConversation.customer?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{activeConversation.customer?.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${participantConnected ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activeConversation.customer?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 size={32} className="animate-spin text-brand-primary" />
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`
                                                    max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm font-medium
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
                                        placeholder={t('chat.typeReply')}
                                        className="flex-grow bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-brand-primary text-white p-4 rounded-2xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                                    >
                                        <Send size={20} className={isRtl ? 'rotate-180' : ''} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-10">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">{t('chat.adminWelcomeTitle')}</h3>
                            <p className="text-sm font-medium max-w-xs">{t('chat.adminWelcomeSub')}</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminChat;
