import React from 'react';
import { User, Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    relative text-sm font-bold transition-all duration-300
    ${isActive(path) 
      ? 'text-brand-accent' 
      : isScrolled ? 'text-slate-600 hover:text-brand-accent' : 'text-white hover:text-brand-accent'}
    after:content-[''] after:absolute after:-bottom-1 after:left-0 
    after:w-full after:h-[2px] after:bg-brand-accent 
    after:transition-transform after:duration-300
    ${isActive(path) ? 'after:scale-x-100' : 'after:scale-x-0 group-hover:after:scale-x-100'}
  `;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-4' 
        : 'bg-transparent backdrop-blur-[2px] py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-auto items-center">
          <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 group">
                <Logo 
                  isWhite={!isScrolled}
                  className="h-10 sm:h-16 transition-transform duration-300 group-hover:scale-105" 
                />
              </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass('/')}>{t('nav.home')}</Link>
            <Link to="/vehicles" className={navLinkClass('/vehicles')}>{t('nav.vehicles')}</Link>
            <Link to="/about" className={navLinkClass('/about')}>{t('nav.about')}</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>{t('nav.contact')}</Link>
            {user?.role !== 'admin' && <Link to="/sell-car" className={navLinkClass('/sell-car')}>{t('nav.sellCar')}</Link>}
            
            <button 
              onClick={toggleLanguage}
              className={`px-3 py-1 text-xs font-black border-2 rounded-lg transition-all shadow-sm ${
                isScrolled 
                  ? 'border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white' 
                  : 'border-white/20 text-white hover:bg-white hover:text-brand-primary'
              }`}
            >
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>
            
            <div className={`h-6 w-px mx-2 transition-colors duration-500 ${isScrolled ? 'bg-slate-200' : 'bg-white/20'}`}></div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-full transition-all relative ${isScrolled ? 'text-slate-400 hover:bg-brand-primary/5' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white ltr:right-2 rtl:left-2"></span>
                </button>
                {isNotificationsOpen && <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />}
                <Link to={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all font-bold ${
                  isScrolled 
                    ? 'bg-brand-primary/5 border-brand-primary/10 text-brand-primary hover:border-brand-primary/30' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}>
                  <User size={18} />
                  <span className="text-sm">{user?.name}</span>
                </Link>
                <button onClick={logout} className={`p-2 transition-colors ${isScrolled ? 'text-slate-400 hover:text-red-500' : 'text-white/70 hover:text-red-400'}`}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className={`text-sm font-bold transition-colors ${
                  isActive('/login') 
                    ? 'text-brand-accent' 
                    : isScrolled ? 'text-slate-700 hover:text-brand-primary' : 'text-white hover:text-brand-accent'
                }`}>{t('nav.signIn')}</Link>
                <Link to="/register" className={isScrolled ? 'btn-primary' : 'px-6 py-2.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-brand-accent hover:text-white transition-all shadow-xl shadow-black/10'}>{t('nav.getStarted')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 transition-colors ${isScrolled ? 'text-brand-primary' : 'text-white'}`}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 py-6 px-6 space-y-4 shadow-2xl">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-lg font-bold text-slate-700 hover:bg-brand-primary/5 rounded-2xl">{t('nav.home')}</Link>
          <Link to="/vehicles" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-lg font-bold text-slate-700 hover:bg-brand-primary/5 rounded-2xl">{t('nav.vehicles')}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-lg font-bold text-slate-700 hover:bg-brand-primary/5 rounded-2xl">{t('nav.about')}</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-lg font-bold text-slate-700 hover:bg-brand-primary/5 rounded-2xl">{t('nav.contact')}</Link>
          {user?.role !== 'admin' && <Link to="/sell-car" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-lg font-bold text-slate-700 hover:bg-brand-primary/5 rounded-2xl">{t('nav.sellCar')}</Link>}
          
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-4 text-base font-bold text-slate-700 bg-slate-50 rounded-2xl">{t('nav.signIn')}</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-4 text-base font-bold text-white bg-brand-primary rounded-2xl">{t('nav.getStarted')}</Link>
            </div>
          ) : (
            <div className="pt-6 border-t border-slate-100">
               <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-4 text-lg font-bold text-red-500 hover:bg-red-50 rounded-2xl">
                  <LogOut size={20} />
                  <span>{t('sidebar.signOut')}</span>
               </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
