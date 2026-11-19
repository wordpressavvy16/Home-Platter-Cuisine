import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useTheme } from './hooks/useTheme';
import CartModal from './components/CartModal';
import SupportChatbotWidget from './components/SupportChatbotWidget';
import { staticPageMap } from './content';
import BackgroundDecorator from './components/BackgroundDecorator';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineBanner from './components/OfflineBanner';
import Footer from './components/Footer';
import Loader from './components/Loader';
import * as analyticsService from './services/analyticsService';
import * as userApi from './api/userApi';
import * as orderApi from './api/orderApi';

// Lazy load all page-level components for code splitting
const HomePage = lazy(() => import('./components/HomePage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./components/OrderSuccessPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const ManageMenuPage = lazy(() => import('./components/ManageMenuPage'));
const CrmPage = lazy(() => import('./components/CrmPage'));
const CustomerProfilePage = lazy(() => import('./components/CustomerProfilePage'));
const EditProfilePage = lazy(() => import('./components/EditProfilePage'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const SuperAdminUserProfilePage = lazy(() => import('./components/SuperAdminUserProfilePage')); // New
const OrderTrackingPage = lazy(() => import('./components/OrderTrackingPage'));
const HelpPage = lazy(() => import('./components/HelpPage'));
const CollectionDetailsPage = lazy(() => import('./components/CollectionDetailsPage'));
const CateringPage = lazy(() => import('./components/CateringPage'));
const ProviderDetailsPage = lazy(() => import('./components/ProviderDetailsPage'));
const VisualSearchResultsPage = lazy(() => import('./components/VisualSearchResultsPage'));
const StaticPageRenderer = lazy(() => import('./components/pages/StaticPageRenderer'));
const WelcomeMat = lazy(() => import('./components/WelcomeMat'));
const WelcomePage = lazy(() => import('./components/WelcomePage'));
const LocationPage = lazy(() => import('./components/LocationPage'));


const App: React.FC = () => {
  const [location, setLocation] = useState({
      path: window.location.hash.slice(1).split('?')[0] || '/',
      params: new URLSearchParams(window.location.hash.slice(1).split('?')[1] || '')
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user, isProviderSetupComplete, justLoggedIn, token, isInitializing } = useAuth();
  const { cart } = useCart();
  const [appKey, setAppKey] = useState(0); // Key to force re-animation on navigate
  const { theme } = useTheme();
  const isOnline = useOnlineStatus();
  const [locationSet, setLocationSet] = useState(() => !!localStorage.getItem('homeplatter_location_set'));
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      window.scrollTo(0, 0);
      
      const hash = window.location.hash.slice(1) || '/';
      const [path, query] = hash.split('?');
      setLocation({
        path: path || '/',
        params: new URLSearchParams(query || '')
      });
      setAppKey(prev => prev + 1);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  useEffect(() => {
    analyticsService.trackPageView(location.path);
  }, [location.path]);

  // --- Background Task Effects ---
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const timers: number[] = [];
    
    // Cart Abandonment Check
    timers.push(window.setTimeout(() => {
      try {
        const storedCartData = localStorage.getItem('homeplatter-cart');
        if (storedCartData) {
          const cartData = JSON.parse(storedCartData);
          if (cartData.items?.length > 0 && !cartData.reminderSent && (new Date().getTime() - new Date(cartData.lastUpdated).getTime() > 3600 * 1000)) {
            userApi.sendCartReminder(token).then(() => {
              localStorage.setItem('homeplatter-cart', JSON.stringify({ ...cartData, reminderSent: true }));
            }).catch(console.error);
          }
        }
      } catch (error) { console.error("Failed to check for abandoned cart:", error); }
    }, 10000));

    if (user?.role === 'CUSTOMER') {
      // Review Reminders Check
      timers.push(window.setTimeout(async () => {
          try {
              const orders = await orderApi.getOrdersForUser(user.id, token);
              const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
              const ordersToRemind = orders.filter(o => o.status === 'DELIVERED' && !o.reviewSubmitted && !o.reviewReminderSent && new Date(o.orderDate).getTime() < twentyFourHoursAgo);
              for (const order of ordersToRemind) {
                  await orderApi.sendAutomatedReviewReminder(order.id, token);
              }
          } catch (error) { console.error("Failed to check for review reminders:", error); }
      }, 15000));

      // Re-engagement Check
      timers.push(window.setTimeout(async () => {
        try {
          const [fullUser, orders] = await Promise.all([userApi.getUserProfile(user.id, token), orderApi.getOrdersForUser(user.id, token)]);
          if (orders.length === 0) return;
          const providersOrderedFrom = [...new Set(orders.map(o => o.providerId))];
          const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
          const ninetyDaysAgo = new Date().getTime() - (90 * 24 * 60 * 60 * 1000);
          for (const providerId of providersOrderedFrom) {
            const lastReEngagement = fullUser.reEngagementStatus?.[providerId] ? new Date(fullUser.reEngagementStatus[providerId]).getTime() : 0;
            if (lastReEngagement > ninetyDaysAgo) continue;
            const mostRecentOrder = orders.filter(o => o.providerId === providerId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];
            if (mostRecentOrder && new Date(mostRecentOrder.orderDate).getTime() < thirtyDaysAgo) {
              await userApi.sendReEngagementReward(providerId, token);
            }
          }
        } catch (error) { console.error("Failed to check for re-engagement opportunities:", error); }
      }, 20000));
    }

    return () => timers.forEach(clearTimeout);
  }, [isAuthenticated, user, token]);

  const navigate = (path: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${path}?${query}` : path;
  };

  const handleLocationSet = (locationData: { lat?: number; lng?: number; address?: string }) => {
    // An empty object signifies a skip
    if (Object.keys(locationData).length > 0) {
        localStorage.setItem('homeplatter_location', JSON.stringify(locationData));
    }
    localStorage.setItem('homeplatter_location_set', 'true');
    setLocationSet(true);
    navigate('/');
  };
  
  const routeParams = useMemo(() => Object.fromEntries(location.params.entries()), [location.params]);

  const FullScreenLoader = () => (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <Loader text="Initializing..." />
    </div>
  );
  
  if (isInitializing) {
    return <FullScreenLoader />;
  }
  
  // --- Render Full-Screen Pages that don't use the main layout ---
  if (location.path === '/auth') {
    if (isAuthenticated) { navigate('/'); return <FullScreenLoader />; }
    return <Suspense fallback={<FullScreenLoader />}><AuthPage navigate={navigate} routeParams={routeParams} /></Suspense>;
  }
  
  // --- Onboarding Flow for Mobile ---
  if (location.path === '/') {
    // On desktop, we always bypass the onboarding flow to allow browsing.
    // On mobile, we show the welcome/location pages if needed.
    if (!isDesktop) {
        if (!isAuthenticated) {
            return <Suspense fallback={<FullScreenLoader />}><WelcomePage navigate={navigate} /></Suspense>;
        }
        if (!locationSet) {
            return <Suspense fallback={<FullScreenLoader />}><LocationPage onLocationSet={handleLocationSet} navigate={navigate} /></Suspense>;
        }
    }
    // If desktop, or mobile & authenticated & location set, fall through to main layout below.
  }


  const renderPageContent = () => {
    const path = location.path;

    // Static pages
    if (staticPageMap[path]) {
      const { slug, title } = staticPageMap[path];
      return <StaticPageRenderer slug={slug} title={title} navigate={navigate} onCartClick={() => setIsCartOpen(true)} />;
    }

    // Dynamic routes
    if (path.startsWith('/provider/')) { return <ProviderDetailsPage providerId={path.substring('/provider/'.length)} navigate={navigate} />; }
    if (path.startsWith('/dashboard/crm/customer/')) { return <CustomerProfilePage customerId={path.substring('/dashboard/crm/customer/'.length)} navigate={navigate} />; }
    if (path.startsWith('/track-order/')) { return <OrderTrackingPage orderId={path.substring('/track-order/'.length)} navigate={navigate} />; }
    if (path.startsWith('/collections/')) { return <CollectionDetailsPage collectionId={path.substring('/collections/'.length)} navigate={navigate} />; }
    if (path.startsWith('/super-admin/user/')) { return <SuperAdminUserProfilePage userId={path.substring('/super-admin/user/'.length)} navigate={navigate} />; }

    // Standard routes
    switch (path) {
      case '/checkout':
        if (!isAuthenticated) { navigate('/auth'); return null; }
        if (cart.length === 0 && !routeParams.inquiryId) { navigate('/'); return null; }
        return <CheckoutPage navigate={navigate} routeParams={routeParams} />;
      case '/order-success':
        if (!isAuthenticated) { navigate('/'); return null; }
        return <OrderSuccessPage navigate={navigate} />;
      case '/profile':
        if (!isAuthenticated) { navigate('/auth'); return null; }
        return <ProfilePage navigate={navigate} routeParams={routeParams} />;
      case '/dashboard':
        if (!isAuthenticated || user?.role !== 'PROVIDER') { navigate('/'); return null; }
        if (isProviderSetupComplete === false) { navigate('/dashboard/profile/edit'); return null; }
        return <DashboardPage navigate={navigate} />;
      case '/dashboard/menu':
        if (!isAuthenticated || user?.role !== 'PROVIDER') { navigate('/'); return null; }
        return <ManageMenuPage navigate={navigate} />;
      case '/dashboard/crm':
        if (!isAuthenticated || user?.role !== 'PROVIDER') { navigate('/'); return null; }
        return <CrmPage navigate={navigate} />;
      case '/dashboard/profile/edit':
        if (!isAuthenticated || user?.role !== 'PROVIDER') { navigate('/'); return null; }
        return <EditProfilePage navigate={navigate} />;
      case '/dashboard/analytics':
        if (!isAuthenticated || user?.role !== 'PROVIDER') { navigate('/'); return null; }
        return <AnalyticsPage navigate={navigate} />;
      case '/super-admin':
        if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') { navigate('/'); return null; }
        return <SuperAdminDashboard navigate={navigate} />;
      case '/help':
        if (!isAuthenticated) { navigate('/auth'); return null; }
        return <HelpPage navigate={navigate} />;
      case '/catering':
        return <CateringPage navigate={navigate} />;
      case '/visual-search':
        return <VisualSearchResultsPage navigate={navigate} routeParams={routeParams} />;
      case '/':
        // This is now the final fallback for authenticated, location-set users on mobile,
        // and all users on desktop.
        return <HomePage navigate={navigate} onCartClick={() => setIsCartOpen(true)} />;
      default:
        // For any unknown routes, redirect to the appropriate starting page.
        if (isDesktop) return <HomePage navigate={navigate} onCartClick={() => setIsCartOpen(true)} />;
        if (!isAuthenticated) return <WelcomePage navigate={navigate} />;
        if (!locationSet) return <LocationPage onLocationSet={handleLocationSet} navigate={navigate} />;
        return <HomePage navigate={navigate} onCartClick={() => setIsCartOpen(true)} />;
    }
  };
  
  return (
    <div key={appKey} className="animate-fade-in-very-fast relative min-h-screen flex flex-col"> 
        {!isOnline && <OfflineBanner />}
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800"></div>
        <BackgroundDecorator />
        <Header onCartClick={() => setIsCartOpen(true)} navigate={navigate} />
        <main className="pt-8 sm:pt-12 flex-grow">
            <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader text="Loading page..." /></div>}>
                {renderPageContent()}
            </Suspense>
        </main>
        <Footer navigate={navigate} />
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => navigate('/checkout')} />
        {justLoggedIn && (
          <Suspense fallback={null}>
            <WelcomeMat navigate={navigate} />
          </Suspense>
        )}
        <SupportChatbotWidget />
    </div>
  );
};

export default App;