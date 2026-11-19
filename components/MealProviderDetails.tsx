import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import type { MealProvider, Meal, User, Collection, TiffinPlan } from '../types';
import { StarIcon, BackArrowIcon, SparklesIcon, MegaphoneIcon, HeartIcon, CameraIcon, ShareIcon, QuestionMarkCircleIcon, BookmarkSquareIcon, CATERING_EVENT_TYPES, UsersIcon, FlagIcon, TrophyIcon, PROVIDER_BADGES } from '../constants';
import MealCard from './MealCard';
import ReviewCard from './ReviewCard';
import AiReviewSummary from './AiReviewSummary';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../hooks/useCart';
import * as userApi from '../api/userApi';
import * as collectionApi from '../api/collectionApi';
import * as providerApi from '../api/providerApi';
import ConversationModal from './ConversationModal';
import BulkInquiryModal from './BulkInquiryModal';
import SampleMenuModal from './SampleMenuModal';

type AvailableSlot = {
    name: string;
    isPreOrder: boolean;
};

type KitchenAvailability = {
    status: 'OPEN' | 'PRE_ORDER' | 'CLOSED';
    message: string;
    availableSlots: AvailableSlot[];
};

const getKitchenAvailability = (provider: MealProvider): KitchenAvailability => {
    if (provider.isAcceptingOrders === false) {
        return { status: 'CLOSED', message: "This kitchen is currently not accepting any orders.", availableSlots: [] };
    }

    const now = new Date();
    const currentTimeInMins = now.getHours() * 60 + now.getMinutes();
    
    // Generate a list of all possible slots for the next 3 days
    const allAvailableSlots: AvailableSlot[] = [];
    for (let i = 0; i < 3; i++) { // Check today, tomorrow, and the day after
        const checkDate = new Date(now);
        checkDate.setHours(0, 0, 0, 0);
        checkDate.setDate(now.getDate() + i);
        const dayStr = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        const schedule = provider.weeklySchedule?.[dayStr] || [];
        const isToday = i === 0;

        schedule.forEach(window => {
            const [cutoffH, cutoffM] = window.orderCutoffTime.split(':').map(Number);
            const cutoffTimeInMins = cutoffH * 60 + cutoffM;
            
            if (!isToday || currentTimeInMins < cutoffTimeInMins) {
                let dayLabel = '';
                if (i === 0) dayLabel = 'Today\'s ';
                else if (i === 1) dayLabel = 'Tomorrow\'s ';
                else dayLabel = `${checkDate.toLocaleDateString('en-US', { weekday: 'short' })} `;
                
                allAvailableSlots.push({
                    name: `${dayLabel}${window.mealType}`,
                    isPreOrder: !isToday || (isToday && i > 0)
                });
            }
        });
    }

    // Determine Status and Message based on slots
    if (allAvailableSlots.length === 0) {
        return { status: 'CLOSED', message: "All ordering windows are closed. Please check back later!", availableSlots: [] };
    }
    
    // Check if any of today's windows are still open
    const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todaySchedule = provider.weeklySchedule?.[todayStr] || [];
    const currentlyOpenWindow = todaySchedule.find(window => {
        const [cutoffH, cutoffM] = window.orderCutoffTime.split(':').map(Number);
        const cutoffTimeInMins = cutoffH * 60 + cutoffM;
        return currentTimeInMins < cutoffTimeInMins;
    });

    if (currentlyOpenWindow) {
        return {
            status: 'OPEN',
            message: `Taking orders for ${currentlyOpenWindow.mealType} until ${currentlyOpenWindow.orderCutoffTime}.`,
            availableSlots: allAvailableSlots,
        };
    }
    
    // If we're here, no window is currently open, so it's pre-order or closed.
    // Find the name of the window that just closed to create a better message.
    let lastMissedWindowName: string | null = null;
    const sortedTodaySchedule = [...todaySchedule].sort((a,b) => (a.orderCutoffTime < b.orderCutoffTime ? -1 : 1));
    for (const window of sortedTodaySchedule) {
         const [cutoffH, cutoffM] = window.orderCutoffTime.split(':').map(Number);
         const cutoffTimeInMins = cutoffH * 60 + cutoffM;
         if (currentTimeInMins > cutoffTimeInMins) {
             lastMissedWindowName = window.mealType;
         }
    }

    const nextSlot = allAvailableSlots[0];
    let message = '';
    if (lastMissedWindowName && nextSlot.name.toLowerCase().includes('today')) {
        message = `Orders for ${lastMissedWindowName} are now closed. You can pre-order for ${nextSlot.name.replace("Today's ", "")}!`;
    } else {
        message = `Today's orders are closed. You can pre-order for ${nextSlot.name}!`;
    }

    return {
        status: 'PRE_ORDER',
        message,
        availableSlots: allAvailableSlots,
    };
};

// FIX: Added `navigate` to the props interface to receive the navigation function.
interface MealProviderDetailsProps {
  provider: MealProvider;
  onBack: () => void;
  navigate: (path: string, params?: Record<string, any>) => void;
}

export const MealProviderDetails: React.FC<MealProviderDetailsProps> = ({ provider, onBack, navigate }) => {
  const { isAuthenticated, user, token } = useAuth();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [providerCollections, setProviderCollections] = useState<Collection[]>([]);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isBulkInquiryModalOpen, setIsBulkInquiryModalOpen] = useState(false);
  const [providerState, setProviderState] = useState(provider);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedPlanForMenu, setSelectedPlanForMenu] = useState<TiffinPlan | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const categoryRefs = useRef<Map<string, HTMLHeadingElement>>(new Map());
  
  const isDark = theme.name.includes('Dark');

  useEffect(() => {
    setProviderState(provider);
  }, [provider]);

  const fetchUserData = useCallback(async () => {
    if (isAuthenticated && user && token) {
      try {
        const [profile, collections] = await Promise.all([userApi.getUserProfile(user.id, token), collectionApi.getCollectionsForUser(token)]);
        setFullUser(profile);
        setUserCollections(collections);
      } catch (error) { console.error("Failed to fetch user data:", error); }
    } else { setFullUser(null); setUserCollections([]); }
  }, [isAuthenticated, user, token]);

  const fetchProviderCollections = useCallback(async () => {
    if (provider?.id && token) {
        try { const data = await collectionApi.getCollectionsForProvider(provider.id, token); setProviderCollections(data); }
        catch (error) { console.error("Failed to fetch provider collections", error); }
    }
  }, [provider?.id, token]);

  useEffect(() => { fetchUserData(); fetchProviderCollections(); }, [fetchUserData, fetchProviderCollections]);

  const isFollowing = fullUser?.followedProviderIds?.includes(provider.id) ?? false;
  const kitchenAvailability = useMemo(() => getKitchenAvailability(providerState), [providerState]);

  const handleToggleFollow = async () => {
      if (!fullUser || !token) return;
      const newFollows = isFollowing ? (fullUser.followedProviderIds || []).filter(id => id !== provider.id) : [...(fullUser.followedProviderIds || []), provider.id];
      setFullUser(prev => prev ? { ...prev, followedProviderIds: newFollows } : null);
      try { await userApi.updateUserFollows(fullUser.id, newFollows, token); } 
      catch (error) { console.error("Failed to update follows", error); setFullUser(prev => prev ? { ...prev, followedProviderIds: (fullUser.followedProviderIds || []) } : null); }
  };
  
  const handleShare = async () => {
    const shareData = { title: provider.name, text: `Check out ${provider.name} on Home Platter! ${provider.shortDescription}`, url: window.location.href };
    try {
      await (navigator.share ? navigator.share(shareData) : navigator.clipboard.writeText(window.location.href));
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (error) { console.error('Error sharing:', error); }
  };

  const handleToggleWishlist = useCallback(async (mealId: string) => {
    if (!fullUser || !token) return;
    const newWishlist = (fullUser.wishlistMealIds || []).includes(mealId) ? (fullUser.wishlistMealIds || []).filter(id => id !== mealId) : [...(fullUser.wishlistMealIds || []), mealId];
    setFullUser(prev => prev ? { ...prev, wishlistMealIds: newWishlist } : null);
    try { await userApi.updateUserWishlist(fullUser.id, newWishlist, token); } 
    catch (error) { console.error("Failed to update wishlist:", error); setFullUser(prev => prev ? { ...prev, wishlistMealIds: (fullUser.wishlistMealIds || []) } : null); }
  }, [fullUser, token]);

  const handleFlagReview = async (reviewId: string) => {
    if (!token || !user) return;
    setProviderState(prev => {
        if (!prev) return prev;
        return { ...prev, reviews: prev.reviews.map(r => r.id === reviewId ? { ...r, isFlagged: true } : r) };
    });
    try { await providerApi.flagReview(providerState.id, reviewId, token); } 
    catch (error) {
        console.error("Failed to flag review:", error);
        setProviderState(provider);
        alert("Failed to flag review. Please try again.");
    }
  };

  const handleViewMenu = (plan: TiffinPlan) => {
    setSelectedPlanForMenu(plan);
    setIsMenuModalOpen(true);
  };
  
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    const element = document.getElementById(categoryId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const { featuredMeals, regularMenu } = useMemo(() => {
    const featured = providerState.menu.filter(m => m.isFeatured && m.isVisible !== false).sort((a, b) => new Date(b.featuredAt!).getTime() - new Date(a.featuredAt!).getTime());
    const regular = providerState.menu.filter(meal => !meal.isFeatured);
    return { featuredMeals: featured, regularMenu: regular };
  }, [providerState.menu]);

  const groupedMenu = useMemo(() => {
    const visibleMenu = regularMenu.filter(meal => meal.isVisible !== false);
    return visibleMenu.reduce((acc, meal) => {
      const category = meal.category || 'Other';
      (acc[category] = acc[category] || []).push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
  }, [regularMenu]);

  const categoryOrder = Object.keys(groupedMenu).sort((a, b) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b));

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -75% 0px', // Trigger when a category is in the top 25% of the viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    }, observerOptions);

    const currentRefs = categoryRefs.current;
    currentRefs.forEach(ref => observer.observe(ref));
    
    // Set initial active category
    if (categoryOrder.length > 0 && !activeCategory) {
        setActiveCategory(`category-${categoryOrder[0].replace(/\s+/g, '-')}`);
    }

    return () => {
      currentRefs.forEach(ref => observer.unobserve(ref));
    };
  }, [categoryOrder, activeCategory]);

  const getVideoEmbedUrl = (url: string): string | null => {
    let videoId: string | null = null;
    let embedUrl: string | null = null;

    const youtubeShortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (youtubeShortsMatch) {
        videoId = youtubeShortsMatch[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    if (!videoId) {
        const youtubeWatchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (youtubeWatchMatch) {
            videoId = youtubeWatchMatch[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }
    
    if (!videoId) {
        const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
         if (youtuBeMatch) {
            videoId = youtuBeMatch[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    if (!videoId) {
        const instagramReelMatch = url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/);
        if (instagramReelMatch) {
            videoId = instagramReelMatch[1];
            embedUrl = `https://www.instagram.com/reel/${videoId}/embed/`;
        }
    }

    return embedUrl;
  };

  const videoEmbedUrl = providerState.promoVideoUrl ? getVideoEmbedUrl(providerState.promoVideoUrl) : null;

  const panelClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg rounded-xl border ${isDark ? 'border-white/10' : 'border-white/40'}`;
  const statusBannerClasses = kitchenAvailability.status === 'OPEN'
    ? (isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800')
    : kitchenAvailability.status === 'PRE_ORDER'
    ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800')
    : (isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800');

  return (
    <>
      <div className="animate-fade-in text-text">
        <div className="relative rounded-b-xl overflow-hidden">
          <img src={providerState.bannerImageUrl} alt={`${providerState.name} banner`} className="w-full h-56 sm:h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute inset-0 container mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={onBack} aria-label="Go back" className="absolute top-4 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors shadow-md z-20 backdrop-blur-sm">
              <BackArrowIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pb-8">
            <div className={`p-6 rounded-lg -mt-16 sm:-mt-20 relative z-10 ${panelClasses}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 pb-4 border-b border-black/10 dark:border-white/10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-text font-serif">{providerState.name}</h1>
                        <p className="text-base sm:text-lg text-text/80">by {providerState.chefName}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button onClick={handleShare} className={`bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/20 dark:hover:bg-white/20 transition-colors relative`} aria-label="Share">
                            <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6 text-text" />
                        </button>
                        {isLinkCopied && <span className="absolute bottom-full mb-2 right-4 text-xs bg-gray-800 text-white px-2 py-1 rounded-md animate-fade-in">Link Copied!</span>}
                        {isAuthenticated && (
                            <>
                            <button onClick={() => setIsConversationModalOpen(true)} className={`bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/20 dark:hover:bg-white/20 transition-colors`} aria-label="Ask a question">
                                <QuestionMarkCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-text" />
                            </button>
                            <button onClick={handleToggleFollow} className={`bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/20 dark:hover:bg-white/20 transition-colors`} aria-label="Follow">
                                <HeartIcon className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${isFollowing ? 'text-red-500' : 'text-text'}`} isFilled={isFollowing} />
                            </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-grow">
                        <h2 className="text-xl font-bold text-text">{providerState.cuisine} Cuisine</h2>
                        <p className="text-text/80 mt-1">{providerState.longDescription}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-4 md:mt-0 ${isDark ? 'bg-yellow-400/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} font-bold py-2 px-4 rounded-full text-lg whitespace-nowrap flex-shrink-0`}>
                        <StarIcon className="w-6 h-6" />
                        <span>{providerState.rating.toFixed(1)} ({providerState.reviews.length} reviews)</span>
                    </div>
                </div>
            </div>
            <div className={`mt-8 p-4 rounded-lg text-center font-semibold text-lg ${statusBannerClasses}`}>
                <p>{kitchenAvailability.message}</p>
            </div>
            
            {videoEmbedUrl && (
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <CameraIcon className="w-8 h-8 text-brand-primary" />
                        <h2 className="text-3xl font-bold text-text font-serif">See Our Kitchen in Action!</h2>
                    </div>
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg border">
                        <iframe
                            src={videoEmbedUrl}
                            title="Promotional Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            )}
            
             <div className="sticky top-16 sm:top-20 z-30 my-8">
                <div className={`p-2 rounded-lg shadow-lg overflow-x-auto whitespace-nowrap scrollbar-hide ${panelClasses}`}>
                    {categoryOrder.map(category => {
                        const categoryId = `category-${category.replace(/\s+/g, '-')}`;
                        const isActive = activeCategory === categoryId;
                        return (
                            <a 
                                key={category} 
                                href={`#${categoryId}`}
                                onClick={(e) => handleCategoryClick(e, categoryId)}
                                className={`inline-block font-semibold py-2 px-4 rounded-md transition-colors duration-300 ${isActive ? 'bg-brand-primary text-white' : 'text-text/80 hover:bg-black/10 dark:hover:bg-white/10'}`}
                            >
                                {category} ({groupedMenu[category].length})
                            </a>
                        );
                    })}
                </div>
            </div>


            {providerState.earnedBadgeIds && providerState.earnedBadgeIds.length > 0 && (
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6"><TrophyIcon className="w-8 h-8 text-yellow-500" /><h2 className="text-3xl font-bold text-text font-serif">Achievements</h2></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROVIDER_BADGES.filter(b => providerState.earnedBadgeIds!.includes(b.id)).map(badge => (
                            <div key={badge.id} className={`p-4 rounded-lg flex items-center gap-4 ${panelClasses}`}>
                                <div className="flex-shrink-0 bg-yellow-400/20 p-3 rounded-full">
                                    <badge.icon className="w-8 h-8 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text">{badge.name}</h4>
                                    <p className="text-sm text-text/80">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {providerState.tiffinPlans && providerState.tiffinPlans.length > 0 && (
                <div className="mt-12">
                <div className="flex items-center gap-3 mb-6"><BookmarkSquareIcon className="w-8 h-8 text-green-500" /><h2 className="text-3xl font-bold text-text font-serif">Tiffin Plans</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {providerState.tiffinPlans.map(plan => (
                    <div key={plan.id} className={`p-6 rounded-lg flex flex-col ${panelClasses}`}>
                        <h3 className="text-xl font-bold font-serif">{plan.name}</h3>
                        <p className="text-sm text-text/80">{plan.duration.charAt(0) + plan.duration.slice(1).toLowerCase()} Plan</p>
                        <p className="text-2xl font-bold text-brand-secondary my-2">₹{plan.price}</p>
                        <p className="text-text/80 text-sm flex-grow">{plan.description}</p>
                        <div className="flex gap-2 mt-4">
                        <button onClick={() => handleViewMenu(plan)} className="flex-1 bg-transparent border border-brand-primary/50 text-brand-primary font-semibold py-2 px-4 rounded-lg hover:bg-brand-primary/10 transition-colors duration-300 animate-press">View Sample Menu</button>
                        <button onClick={() => addToCart(plan, providerState.id, providerState.name)} className="flex-1 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 animate-press">Add to Cart</button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {providerState.cateringEnabled && (
                <div className={`mt-8 p-6 rounded-lg ${panelClasses}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3"><UsersIcon className="w-8 h-8 text-brand-primary"/><h3 className="text-2xl font-bold font-serif text-text">Catering Services</h3></div>
                        <button onClick={() => setIsBulkInquiryModalOpen(true)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 animate-press">
                            Inquire for Catering
                        </button>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        <div><p className="font-semibold text-text">Guest Capacity</p><p className="text-text/80">Can cater for events with <span className="font-bold">{providerState.cateringGuestCapacity?.min} to {providerState.cateringGuestCapacity?.max}</span> guests.</p></div>
                        <div><p className="font-semibold text-text">Suitable for Events</p><div className="flex flex-wrap gap-2 mt-1">{providerState.cateringEventTypes?.map(typeId => { const eventType = CATERING_EVENT_TYPES.find(e => e.id === typeId); return eventType ? <span key={typeId} className={`text-xs font-semibold px-2 py-1 rounded-full ${isDark ? 'bg-brand-primary/30 text-brand-primary' : 'bg-brand-primary/20 text-brand-dark'}`}>{eventType.label}</span> : null; })}</div></div>
                    </div>
                </div>
            )}

            {providerState.announcements?.length > 0 && (
                <div className="mt-12">
                <div className="flex items-center gap-3 mb-6"><MegaphoneIcon className="w-8 h-8 text-brand-primary" /><h2 className="text-3xl font-bold text-text font-serif">Recent Updates</h2></div>
                <div className="space-y-4">
                    {providerState.announcements.slice().reverse().slice(0, 3).map((ann) => (
                    <div key={ann.id} className={`border-l-4 border-brand-primary p-4 rounded-r-lg ${panelClasses}`}>
                        <p className="text-text">{ann.message}</p>
                        <p className="text-xs text-text/70 mt-2 text-right">{new Date(ann.timestamp).toLocaleDateString()}</p>
                    </div>
                    ))}
                </div>
                </div>
            )}

            <div className="mt-12">
                {providerCollections.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6"><BookmarkSquareIcon className="w-8 h-8 text-teal-400"/><h2 className="text-3xl font-bold text-text font-serif">Chef's Collections</h2></div>
                    <div className="space-y-6">
                    {providerCollections.map(collection => (
                        <details key={collection.id} className={`rounded-lg overflow-hidden ${panelClasses}`}>
                        <summary className="p-4 cursor-pointer flex justify-between items-center">
                            <div>
                            <h3 className="font-bold text-lg text-text">{collection.name}</h3>
                            <p className="text-sm text-text/80">{collection.description}</p>
                            </div>
                            <span className="text-xs font-semibold text-text/70">{collection.mealIds.length} items</span>
                        </summary>
                        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                            <div className="grid grid-cols-1 gap-4">
                            {collection.mealIds.map(mealId => { 
                                const meal = providerState.menu.find(m => m.id === mealId); 
                                if (!meal) return null; 
                                return <MealCard key={mealId} meal={meal} providerId={providerState.id} providerName={providerState.name} kitchenAvailability={kitchenAvailability} isAuthenticated={isAuthenticated} wishlistMealIds={fullUser?.wishlistMealIds} collections={userCollections} onToggleWishlist={handleToggleWishlist} onUpdateCollections={() => { fetchUserData(); fetchProviderCollections(); }}/>; 
                            })}
                            </div>
                        </div>
                        </details>
                    ))}
                    </div>
                </div>
                )}

                {featuredMeals.length > 0 && (
                    <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6"><SparklesIcon className="w-8 h-8 text-yellow-400"/><h2 className="text-3xl font-bold text-text font-serif">Chef's Specials</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredMeals.map(meal => (
                        <MealCard key={meal.id} meal={meal} providerId={providerState.id} providerName={providerState.name} kitchenAvailability={kitchenAvailability} isAuthenticated={isAuthenticated} wishlistMealIds={fullUser?.wishlistMealIds} collections={userCollections} onToggleWishlist={handleToggleWishlist} onUpdateCollections={() => { fetchUserData(); fetchProviderCollections(); }}/>
                        ))}
                    </div>
                    </div>
                )}

                <div className="mt-12">
                <h2 className="text-3xl font-bold text-text font-serif mb-6">Full Menu</h2>
                <div className="space-y-8">
                    {categoryOrder.map(category => (
                        <div key={category}>
                        <h3 
                           id={`category-${category.replace(/\s+/g, '-')}`}
                           ref={el => { if (el) categoryRefs.current.set(`category-${category.replace(/\s+/g, '-')}`, el); }}
                           className="text-2xl font-bold font-serif text-text mb-4 pb-2 border-b-2 scroll-mt-24"
                        >
                            {category} <span className="text-lg font-sans font-semibold text-text/70">({groupedMenu[category].length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupedMenu[category].map(meal => (
                            <MealCard key={meal.id} meal={meal} providerId={providerState.id} providerName={providerState.name} kitchenAvailability={kitchenAvailability} isAuthenticated={isAuthenticated} wishlistMealIds={fullUser?.wishlistMealIds} collections={userCollections} onToggleWishlist={handleToggleWishlist} onUpdateCollections={() => { fetchUserData(); fetchProviderCollections(); }}/>
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
                <div className="mt-12">
                <h2 className="text-3xl font-bold text-text font-serif mb-6">What Customers Are Saying</h2>
                <div className="space-y-6">
                    <AiReviewSummary reviews={providerState.reviews} />
                    {providerState.reviews.slice().reverse().map(review => (
                    <div key={review.id} className="relative group">
                        <ReviewCard review={review}/>
                        {isAuthenticated && (
                            <button 
                                onClick={() => handleFlagReview(review.id)}
                                disabled={review.isFlagged}
                                className={`absolute top-4 right-4 p-1.5 rounded-full transition disabled:opacity-100 ${ review.isFlagged ? 'text-red-500' : 'text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10'}`}
                                title={review.isFlagged ? "Flagged for review" : "Flag this review"}
                            >
                                <FlagIcon className="w-5 h-5" isFilled={review.isFlagged} />
                            </button>
                        )}
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </div>
        </div>
      </div>
      {isConversationModalOpen && user && (
        <ConversationModal 
          isOpen={isConversationModalOpen} 
          onClose={() => setIsConversationModalOpen(false)} 
          onUpdate={() => {}} 
          providerForNewInquiry={provider}
          navigate={navigate}
        />
      )}
      {isBulkInquiryModalOpen && user && (
        <BulkInquiryModal 
          isOpen={isBulkInquiryModalOpen} 
          onClose={() => setIsBulkInquiryModalOpen(false)} 
          provider={provider}
        />
      )}
      {selectedPlanForMenu && (
        <SampleMenuModal
            isOpen={isMenuModalOpen}
            onClose={() => setIsMenuModalOpen(false)}
            planName={selectedPlanForMenu.name}
            sampleMenu={selectedPlanForMenu.sampleMenu}
        />
      )}
    </>
  );
};