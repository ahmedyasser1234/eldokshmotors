import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Mail, Phone, MapPin, Send } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="relative">
            {/* Wave Divider */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[99%]">
                <svg 
                    data-name="Layer 1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 1200 120" 
                    preserveAspectRatio="none"
                    className="relative block w-full h-[60px] md:h-[100px] fill-slate-950"
                >
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>

            <footer className="bg-slate-950 text-slate-300 pt-20 pb-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center mb-4">
                            <Logo isWhite={true} className="h-16" />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            {t('home.hero.subTitle')}
                        </p>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-brand-primary shrink-0 mt-1" />
                                <span className="text-sm">{t('footer.address')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={20} className="text-brand-primary shrink-0" />
                                <span className="text-sm font-medium" dir="ltr">01211171888</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={20} className="text-brand-primary shrink-0" />
                                <span className="text-sm font-medium">support@eldoksh.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('nav.home')}</Link></li>
                            <li><Link to="/vehicles" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('nav.vehicles')}</Link></li>
                            <li><Link to="/sell-car" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('nav.sellCar')}</Link></li>
                            <li><Link to="/about" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('nav.about')}</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Our Collection */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">{t('footer.ourCollection')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/vehicles?category=luxury" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('categories.luxury')}</Link></li>
                            <li><Link to="/vehicles?category=sport" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('categories.sport')}</Link></li>
                            <li><Link to="/vehicles?category=suv" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('categories.suv')}</Link></li>
                            <li><Link to="/vehicles?category=economy" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('categories.economy')}</Link></li>
                            <li><Link to="/vehicles?category=van" className="text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {t('categories.van')}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter & Social */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">{t('footer.newsletter')}</h3>
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                            {t('footer.newsletterDesc')}
                        </p>
                        <form className="mb-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder={t('footer.newsletterPlaceholder')}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-600"
                                    required
                                />
                                <button 
                                    type="submit"
                                    className="absolute rtl:left-2 rtl:right-auto ltr:right-2 ltr:left-auto top-2 bottom-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
                style={{
                  [document.documentElement.dir === 'rtl' ? 'left' : 'right']: '0.5rem',
                  [document.documentElement.dir === 'rtl' ? 'right' : 'left']: 'auto'
                }}
                                >
                                    <Send size={16} className={document.documentElement.dir === 'rtl' ? 'rotate-180' : ''} />
                                </button>
                            </div>
                        </form>
                        
                        <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-widest">{t('footer.connectWithUs')}</h4>
                        <div className="flex items-center gap-3">
                            <a href="https://www.facebook.com/Eldosksh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.tiktok.com/@eldoksh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white hover:border-black transition-all">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path>
                                </svg>
                            </a>
                            <a href="https://linktr.ee/EldokshGroup" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#43E05D] hover:text-white hover:border-[#43E05D] transition-all">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg" className="text-inherit">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </a>
                            <a href="https://wa.me/201211171888" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l113.1-29.6c32.6 17.4 69.4 26.5 107.3 26.5 122.4 0 222-99.6 222-222.1 0-59.3-23.1-115.1-65-157.1zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs font-medium tracking-widest uppercase text-center md:text-left">
                        {t('common.allRightsReserved')}
                    </p>
                    <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                        <Link to="/privacy" className="hover:text-brand-primary transition-colors">{t('footer.privacy')}</Link>
                        <Link to="/terms" className="hover:text-brand-primary transition-colors">{t('footer.terms')}</Link>
                        <Link to="/sitemap" className="hover:text-brand-primary transition-colors">{t('footer.sitemap')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    </div>
    );
};

export default Footer;
