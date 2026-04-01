import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, ThumbsUp, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

const About: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        { label: t('about.stats.cars'), icon: <Award size={24} /> },
        { label: t('about.stats.clients'), icon: <ThumbsUp size={24} /> },
        { label: t('about.stats.experience'), icon: <ShieldCheck size={24} /> },
        { label: t('about.stats.inspection'), icon: <MapPin size={24} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <SEO 
                title={t('seo.about.title')} 
                description={t('seo.about.description')} 
            />
            {/* Hero Section */}
            <div className="relative pt-32 pb-24 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[50vh]">
                <video 
                    src="/147.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/70" />
                
                <header className="relative z-10 text-center max-w-4xl mx-auto w-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white font-black text-sm mb-6 border border-white/20"
                    >
                        {t('about.subtitle').toUpperCase()}
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white"
                    >
                        {t('about.title')}
                    </motion.h1>
                </header>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-12">
                <div className="grid md:grid-cols-2 gap-12 bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-16 mb-20 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-black text-slate-800">{t('about.storyTitle')}</h2>
                        <p className="text-slate-500 leading-relaxed text-lg">{t('about.story1')}</p>
                        <p className="text-slate-500 leading-relaxed text-lg">{t('about.story2')}</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl overflow-hidden aspect-square md:aspect-auto"
                    >
                        <video 
                            src="/212.mp4" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {stats.map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-3xl text-center shadow-lg shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-4 group hover:-translate-y-2 transition-transform"
                        >
                            <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                {stat.icon}
                            </div>
                            <h4 className="font-black text-slate-800 text-lg">{stat.label}</h4>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-brand-primary text-white p-12 rounded-[40px]"
                    >
                        <h3 className="text-2xl font-black mb-4">{t('about.visionTitle')}</h3>
                        <p className="text-white/80 leading-relaxed">{t('about.visionDesc')}</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 text-white p-12 rounded-[40px]"
                    >
                        <h3 className="text-2xl font-black mb-4">{t('about.missionTitle')}</h3>
                        <p className="text-white/80 leading-relaxed">{t('about.missionDesc')}</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
