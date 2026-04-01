import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSumbit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    const contactInfo = [
        {
            icon: <MapPin className="text-brand-primary" size={24} />,
            title: t('contact.address'),
            value: t('footer.address'),
            delay: 0.1
        },
        {
            icon: <Phone className="text-brand-primary" size={24} />,
            title: t('contact.phone'),
            value: "01011171888 - 01211171888",
            delay: 0.2
        },
        {
            icon: <Mail className="text-brand-primary" size={24} />,
            title: t('contact.email'),
            value: "support@eldoksh.com",
            delay: 0.3
        },
        {
            icon: <Clock className="text-brand-primary" size={24} />,
            title: t('contact.hours'),
            value: t('contact.workingHours'),
            delay: 0.4
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <SEO 
                title={t('seo.contact.title')} 
                description={t('seo.contact.description')} 
            />
            {/* Header Section with Image Background */}
            <div className="relative pt-32 pb-24 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[40vh]">
                <img 
                    src="/123456.jpeg" 
                    alt="Eldoksh Contact"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/70" /> {/* Dark overlay */}
                
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6"
                    >
                        {t('contact.title')}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-100/80 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        {t('contact.subtitle')}
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactInfo.map((info, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: info.delay }}
                                className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-start gap-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                    {info.icon}
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{info.title}</h3>
                                    <p className="text-slate-800 font-bold text-lg leading-relaxed">{info.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden h-full"
                        >
                            {status === 'success' ? (
                                <div className="p-12 md:p-20 text-center flex flex-col items-center justify-center h-full">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-8">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-4">{t('contact.form.success')}</h2>
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        className="text-brand-primary font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSumbit} className="p-8 md:p-12 space-y-8">
                                    <h2 className="text-3xl font-black text-slate-800 mb-2">{t('contact.formTitle')}</h2>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.name')}</label>
                                            <input required className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.email')}</label>
                                            <input type="email" required className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.phone')}</label>
                                            <input required className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.subject')}</label>
                                            <input required className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.message')}</label>
                                        <textarea required rows={5} className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-800 border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none resize-none" />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'sending'}
                                        className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-brand-primary/40 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                                        <Send size={20} className={document.documentElement.dir === 'rtl' ? 'rotate-180' : ''} />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Map Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 h-[450px]"
                >
                    <iframe 
                        title="ELDOKSH Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3415.632039230197!2d31.636633776338925!3d31.119957574399734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f9d7004f5fba91%3A0x23b235417b4b3468!2z2YXYpNiz2LPYqSDYp9mE2K_ZiNmD2LQg2YTZhNiq2KzYp9ix2Kk!5e0!3m2!1sen!2seg!4v1774709543926!5m2!1sen!2seg" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
