import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';
import * as userApi from '../api/userApi';
import type { Notification } from '../types';
import { UserIcon, CogIcon, BellIcon, HomePlatterLogoIcon, ShoppingBagIcon, SunIcon, MoonIcon, AnimatedSantaIcon, DiyaIcon, MarigoldIcon, DurgaEyeIcon, OnamFlowerIcon, ModakIcon, CrescentMoonAndStarIcon, LanternIcon, Bars3Icon, XMarkIcon } from '../constants';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
    onCartClick: () => void;
    navigate: (path: string, params?: Record<string, any>) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, navigate }) => {
  const { isAuthenticated, user, logout, isLoading, token } = useAuth();
  const { cartCount } = useCart();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  useEffect(() => {
    if (isAuthenticated && token) {
      userApi.getNotifications(token)
        .then(setNotifications)
        .catch(console.error);
    } else {
        setNotifications([]);
    }
  }, [isAuthenticated, token]);
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);


  const handleToggleNotifications = async () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen && unreadCount > 0 && token) {
      try {
        await userApi.markNotificationsAsRead(token);
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };
  
  const handleThemeToggle = () => {
    const isDark = theme.name.includes('Dark');
    setTheme(isDark ? 'Glassmorphism Light' : 'Glassmorphism Dark');
  };

  const FestiveIcon = () => {
    const iconName = theme.decorations?.headerIcon;
    if (!iconName) return null;
    switch (iconName) {
      case 'animated-santa': return <AnimatedSantaIcon className="w-10 h-10 -ml-1" />;
      case 'diya': return <DiyaIcon className="w-5 h-5 text-yellow-500" />;
      case 'marigold': return <MarigoldIcon className="w-5 h-5 text-orange-500" />;
      case 'durga-eye': return <DurgaEyeIcon className="w-10 h-4 text-brand-dark" />;
      case 'onam-flower': return <OnamFlowerIcon className="w-5 h-5 text-pink-500" />;
      case 'sun': return <SunIcon className="w-5 h-5 text-yellow-400" />;
      case 'modak': return <ModakIcon className="w-5 h-5 text-yellow-600" />;
      case 'crescent-moon-star': return <CrescentMoonAndStarIcon className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />;
      case 'lantern': return <LanternIcon className="w-6 h-6 text-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />;
      default: return null;
    }
  };
  
  const isDark = theme.name.includes('Dark');
  const headerClasses = `sticky top-0 z-40 transition-all duration-300 ${isDark ? 'bg-slate-900/60' : 'bg-brand-light/60'} backdrop-blur-lg shadow-lg`;
  
  const NavLink: React.FC<{path: string; params?: Record<string, any>; children: React.ReactNode; className?: string}> = ({path, params, children, className}) => (
      <button onClick={() => { navigate(path, params); setIsMobileMenuOpen(false); }} className={className}>{children}</button>
  );

  const renderNavLinks = (isMobile: boolean) => {
    const baseClasses = "font-semibold text-text hover:text-brand-primary transition whitespace-nowrap";
    const mobileClasses = "text-xl w-full text-left p-4 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg";

    if (isAuthenticated) {
      return (
        <>
          {user?.role === 'PROVIDER' ? (
              <NavLink path="/dashboard" className={`${baseClasses} ${isMobile ? mobileClasses : ''}`}>Dashboard</NavLink>
          ) : user?.role === 'SUPER_ADMIN' ? (
              <NavLink path="/super-admin" className={`${baseClasses} ${isMobile ? mobileClasses : 'flex items-center gap-2'}`}>
                  <CogIcon className="w-6 h-6"/> Super Admin
              </NavLink>
          ) : (
              <NavLink path="/profile" className={`${baseClasses} ${isMobile ? mobileClasses : 'p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 flex items-center space-x-2'}`}>
                  <UserIcon className="w-6 h-6" />
                  <span>Hello, {user?.name.split(' ')[0]}!</span>
              </NavLink>
          )}
          <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} disabled={isLoading} className={`font-semibold text-brand-primary hover:text-text/80 transition ${isMobile ? mobileClasses : ''}`}>
              Logout
          </button>
        </>
      );
    }
    return (
        <>
            <NavLink path="/auth" params={{ mode: 'login' }} className={`${baseClasses} ${isMobile ? mobileClasses : 'px-2 sm:px-4 py-2 rounded-md'}`}>Login</NavLink>
            <NavLink path="/auth" params={{ mode: 'signup' }} className={`${isMobile ? `w-full text-left text-xl font-semibold p-4 rounded-lg bg-brand-primary text-white` : `bg-brand-primary text-white font-semibold py-2 px-3 sm:px-5 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 animate-press`}`}>
                Sign Up
            </NavLink>
        </>
    );
  };


  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Side: Logo & Hamburger */}
            <div className="flex items-center gap-2">
               <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-text" aria-label="Open menu">
                    <Bars3Icon className="w-6 h-6"/>
               </button>
               <NavLink path="/" className="flex items-center space-x-2 text-left">
                <HomePlatterLogoIcon className="w-10 h-10" />
                <h1 className="text-xl sm:text-2xl font-bold text-text font-serif">
                  Home Platter
                </h1>
                <FestiveIcon />
              </NavLink>
            </div>

            {/* Right Side: Icons & Desktop Nav */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* --- Common Icons --- */}
              <button onClick={handleThemeToggle} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                {isDark ? <SunIcon className="w-6 h-6 text-yellow-300" /> : <MoonIcon className="w-6 h-6 text-text" />}
              </button>
              <button onClick={onCartClick} aria-label={`View shopping cart with ${cartCount} items`} className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <ShoppingBagIcon className="w-7 h-7 text-text"/>
                  {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-brand-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                      </span>
                  )}
              </button>
              {isAuthenticated && (
                <div className="relative" ref={notificationRef}>
                  <button onClick={handleToggleNotifications} aria-label={`View notifications, ${unreadCount} unread`} className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <BellIcon className="w-7 h-7 text-text"/>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <NotificationPanel notifications={notifications} navigate={navigate} onClose={() => setIsNotificationsOpen(false)} />
                  )}
                </div>
              )}
              
              {/* --- Desktop Nav Links --- */}
              <div className="hidden md:flex items-center space-x-2">
                  {renderNavLinks(false)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay */}
        <div onClick={() => setIsMobileMenuOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Drawer */}
        <div className={`absolute top-0 left-0 h-full w-4/5 max-w-xs p-6 shadow-2xl transition-transform ${isDark ? 'bg-slate-900' : 'bg-brand-light'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-text font-serif">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-text" aria-label="Close menu">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
           </div>
           <nav className="flex flex-col space-y-2">
                {renderNavLinks(true)}
           </nav>
        </div>
      </div>
    </>
  );
};

export default Header;