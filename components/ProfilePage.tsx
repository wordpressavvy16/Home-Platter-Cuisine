import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import * as orderApi from '../api/orderApi';
import * as providerApi from '../api/providerApi';
import * as userApi from '../api/userApi'; // New import
import type { Order, CartItem, MealProvider, Review, User, Address, Meal, Collection, DisputeReason } from '../types';
import Loader from './Loader';
import { UserIcon, PencilIcon, HomeIcon, HeartIcon, ChatBubbleIcon, ArrowPathIcon, BookmarkIcon, TruckIcon, LifebuoyIcon, GiftIcon, BellIcon, ExclamationTriangleIcon, ShieldCheckIcon, CalendarDaysIcon, TrophyIcon, LOYALTY_POINT_VALUE, BookmarkSquareIcon } from '../constants';
import ReviewFormModal from './ReviewFormModal';
import AddressManager from './AddressManager'; // New import
import MealProviderCard from './MealProviderCard';
import ConversationModal from './ConversationModal';
import CollectionsPanel from './CollectionsPanel'; // New import
import NotificationSettingsPanel from './NotificationSettingsPanel'; // New Import
import ReportIssueModal from './ReportIssueModal'; // New Import
import SecuritySettingsPanel from './SecuritySettingsPanel'; // New Import
import SubscriptionManagementPanel from './SubscriptionManagementPanel'; // New import
import AchievementsPanel from './AchievementsPanel'; // New import
import { useTheme } from '../hooks/useTheme';

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const statusStyles: { [key in Order['status']]: { text: string; bg: string; text_color: string } } = {
  PENDING: { text: 'Pending Confirmation', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
  CONFIRMED: { text: 'Your order is confirmed', bg: 'bg-blue-100', text_color: 'text-blue-800' },
  PREPARING: { text: 'Preparing your meal', bg: 'bg-cyan-100', text_color: 'text-cyan-800' },
  OUT_FOR_DELIVERY: { text: 'On its way!', bg: 'bg-teal-100', text_color: 'text-teal-800' },
  DELIVERED: { text: 'Delivered', bg: 'bg-green-100', text_color: 'text-green-800' },
  CANCELLED: { text: 'Cancelled', bg: 'bg-red-100', text_color: 'text-red-800' },
};

// --- Helper function copied from MealProviderDetails ---
const getKitchenStatus = (provider: MealProvider) => {
    if (provider.isAcceptingOrders === false) { // Explicitly check for false
        return { isOpen: false, message: "This kitchen is currently closed and not accepting orders." };
    }

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes from midnight

    const schedule = provider.weeklySchedule?.[today] || [];
    if (schedule.length === 0) {
        return { isOpen: false, message: "Closed today. Please check back another day!" };
    }

    for (const window of schedule) {
        const [cutoffH, cutoffM] = window.orderCutoffTime.split(':').map(Number);
        const cutoffTime = cutoffH * 60 + cutoffM;
        if (currentTime < cutoffTime) {
            return {
                isOpen: true,
                message: `Taking orders for ${window.mealType} until ${window.orderCutoffTime}.`
            };
        }
    }
    
    return { isOpen: false, message: "All ordering windows for today are closed." };
};

interface OrderHistoryCardProps {
    order: Order;
    provider?: MealProvider;
    onWriteReview: (order: Order) => void;
    onContactProvider: (order: Order) => void;
    onReportIssue: (order: Order) => void; // New prop
    navigate: (path: string, params?: Record<string, any>) => void;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, provider, onWriteReview, onContactProvider, onReportIssue, navigate }) => {
    const statusStyle = statusStyles[order.status];
    const isActionableForMessaging = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status);
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
            <div className="flex justify-between items-start border-b pb-3 mb-3">
                <div>
                    <p className="font-bold text-lg text-gray-800">
                        {provider?.name || 'Unknown Kitchen'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Order ID: {order.id.split('_')[1]}
                    </p>
                </div>
                <div className="text-right">
                     <p className="font-bold text-lg text-brand-secondary">₹{order.totalAmount.toFixed(2)}</p>
                     <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mb-3">
                {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                        <span className="text-gray-700">{item.name} (x{item.quantity})</span>
                        <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                {order.addOns && order.addOns.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-dashed">
                        <p className="text-sm font-semibold text-gray-600">Extras:</p>
                        {order.addOns.map(addon => (
                            <div key={addon.id} className="flex justify-between text-sm py-1">
                                <span className="text-gray-700">{addon.name}</span>
                                <span className="text-gray-600">₹{addon.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                 )}
                 {order.pointsEarned && order.pointsEarned > 0 && (
                    <div className="pt-2 mt-2 border-t text-sm text-green-600 font-semibold">
                        <span>+ {order.pointsEarned} points earned</span>
                    </div>
                 )}
                 {order.pointsRedeemed && order.pointsRedeemed > 0 && (
                     <div className="pt-2 mt-2 border-t text-sm text-yellow-700 font-semibold">
                        <span>- {order.pointsRedeemed} points redeemed</span>
                    </div>
                 )}
                {order.deliveryMethod && (
                    <div className="pt-2 mt-2 border-t">
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-700 font-semibold">Delivery Method:</span>
                            <span className="text-gray-600 capitalize">{order.deliveryMethod.toLowerCase()}{order.deliveryFeeApplied ? ` (+₹${order.deliveryFeeApplied.toFixed(2)})` : ''}</span>
                        </div>
                    </div>
                )}
            </div>
            
             <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className={`text-sm font-bold py-1 px-3 rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
                  {statusStyle.text}
                </span>
                <div className="flex gap-2 flex-wrap justify-end">
                    {order.status === 'OUT_FOR_DELIVERY' && (
                        <button onClick={() => navigate(`/track-order/${order.id}`)} className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-1.5 py-2 px-3 rounded-md">
                            <TruckIcon className="w-4 h-4" />
                            Track Order
                        </button>
                    )}
                    {isActionableForMessaging && (
                        <button onClick={() => onContactProvider(order)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5">
                            <ChatBubbleIcon className="w-4 h-4" />
                            Contact Provider
                        </button>
                    )}
                    {order.status === 'DELIVERED' && !order.reviewSubmitted && (
                        <button onClick={() => onWriteReview(order)} className="text-sm font-semibold bg-brand-primary text-white py-2 px-3 rounded-md hover:bg-brand-dark transition">
                            Write a Review
                        </button>
                    )}
                    {order.status === 'DELIVERED' && !order.dispute && (
                         <button onClick={() => onReportIssue(order)} className="text-sm font-semibold text-yellow-700 hover:text-yellow-900 transition flex items-center gap-1.5">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Report an Issue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const ProfilePage: React.FC<{ navigate: (path: string, params?: Record<string, any>) => void; routeParams: Record<string, any> | null; }> = ({ navigate, routeParams }) => {
    const { user, token, logout } = useAuth();
    const { addToCart } = useCart();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [fullUser, setFullUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [providers, setProviders] = useState<MealProvider[]>([]);
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [orderToReview, setOrderToReview] = useState<Order | null>(null);

    const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
    const [conversation, setConversation] = useState<Order | null>(null);

    const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
    const [orderToReport, setOrderToReport] = useState<Order | null>(null);

    const TABS = {
        HISTORY: 'Order History',
        PLANS: 'My Tiffin Plans',
        REGULARS: 'My Regulars',
        REWARDS: 'My Rewards',
        ACHIEVEMENTS: 'Achievements',
        ADDRESSES: 'My Addresses',
        NOTIFICATIONS: 'Notifications',
        SECURITY: 'Security',
        FOLLOWING: 'Following',
        COLLECTIONS: 'My Collections',
        WISHLIST: 'My Wishlist'
    };

    const [activeTab, setActiveTab] = useState(TABS.HISTORY);

    const fetchProfileData = useCallback(async () => {
        if (user && token) {
            setIsLoading(true);
            try {
                const [userOrders, allProviders, fullUserData] = await Promise.all([
                    orderApi.getOrdersForUser(user.id, token),
                    providerApi.getProviders(),
                    userApi.getUserProfile(user.id, token)
                ]);
                setOrders(userOrders);
                setProviders(allProviders);
                setFullUser(fullUserData);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, token]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    
    useEffect(() => {
        if (routeParams?.openReviewForOrderId && orders.length > 0) {
            const order = orders.find(o => o.id === routeParams.openReviewForOrderId);
            if (order) {
                setTimeout(() => handleOpenReviewModal(order), 100);
            }
        }
    }, [routeParams, orders]);

    const handleOpenReviewModal = (order: Order) => {
        setOrderToReview(order);
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setOrderToReview(null);
        setIsReviewModalOpen(false);
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!orderToReview || !token) return;
        const reviewData: Omit<Review, 'id'> = {
            author: user?.name || 'Anonymous',
            userId: user?.id,
            rating,
            comment,
        };
        await providerApi.addReview(orderToReview.providerId, reviewData, token);
        await orderApi.markOrderAsReviewed(orderToReview.id, token);
        await fetchProfileData();
    };

    const handleReportIssue = (order: Order) => {
        setOrderToReport(order);
        setIsReportIssueModalOpen(true);
    };

    const handleIssueSubmit = async (reason: DisputeReason, message: string) => {
        if (!orderToReport || !token) return;
        await orderApi.reportIssueOnOrder(orderToReport.id, reason, message, token);
        await fetchProfileData();
    };

    const handleUpdateAddresses = async (updatedAddresses: Address[]) => {
        if (!fullUser || !token) return;
        const updatedUser = await userApi.updateUserAddresses(fullUser.id, updatedAddresses, token);
        setFullUser(updatedUser);
        alert("Addresses updated successfully!");
    };
    
    const handleToggleFollow = useCallback(async (providerId: string) => {
        if (!fullUser || !token) return;
        const currentFollows = fullUser.followedProviderIds || [];
        const isFollowing = currentFollows.includes(providerId);
        const newFollows = isFollowing
            ? currentFollows.filter(id => id !== providerId)
            : [...currentFollows, providerId];

        setFullUser(prev => prev ? { ...prev, followedProviderIds: newFollows } : null);

        try {
            await userApi.updateUserFollows(fullUser.id, newFollows, token);
        } catch (error) {
            console.error("Failed to update follows:", error);
            setFullUser(prev => prev ? { ...prev, followedProviderIds: currentFollows } : null);
        }
    }, [fullUser, token]);
    
     const handleOpenConversationModal = (order: Order) => {
        setConversation(order);
        setIsConversationModalOpen(true);
    };

    const myRegulars = useMemo(() => {
        if (orders.length === 0 || providers.length === 0) return [];
        
        const mealMap = new Map<string, { meal: CartItem; provider: MealProvider }>();
        const allMealsMap = new Map<string, { meal: Meal; provider: MealProvider }>();
        providers.forEach(p => p.menu.forEach(m => allMealsMap.set(m.id, { meal: m, provider: p })));

        [...orders].sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).forEach(order => {
            order.items.forEach(item => {
                const provider = providers.find(p => p.id === item.providerId);
                if (provider && !mealMap.has(item.id) && allMealsMap.has(item.id)) {
                    mealMap.set(item.id, { meal: item, provider });
                }
            });
        });
        return Array.from(mealMap.values());
    }, [orders, providers]);

    const handleToggleWishlist = useCallback(async (mealId: string) => {
        if (!fullUser || !token) return;

        const currentWishlist = fullUser.wishlistMealIds || [];
        const isWishlisted = currentWishlist.includes(mealId);
        const newWishlist = isWishlisted
            ? currentWishlist.filter(id => id !== mealId)
            : [...currentWishlist, mealId];
        
        setFullUser(prev => prev ? { ...prev, wishlistMealIds: newWishlist } : null); // Optimistic UI

        try {
            await userApi.updateUserWishlist(fullUser.id, newWishlist, token);
        } catch (error) {
            console.error("Failed to update wishlist:", error);
            setFullUser(prev => prev ? { ...prev, wishlistMealIds: currentWishlist } : null); // Revert
            alert("Could not update your wishlist. Please try again.");
        }
    }, [fullUser, token]);

    const wishlistedMeals = useMemo(() => {
        if (!fullUser?.wishlistMealIds || providers.length === 0) return [];
        
        const allMealsMap = new Map<string, { meal: Meal; provider: MealProvider }>();
        providers.forEach(p => {
            p.menu.forEach(m => {
                allMealsMap.set(m.id, { meal: m, provider: p });
            });
        });

        return fullUser.wishlistMealIds
            .map(mealId => allMealsMap.get(mealId))
            .filter(Boolean) as { meal: Meal; provider: MealProvider }[];
    }, [fullUser?.wishlistMealIds, providers]);


    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16 flex justify-center"><Loader text="Loading your profile..." /></div>
        }
        
        switch (activeTab) {
            case TABS.HISTORY:
                 return (
                    <div>
                        {orders.length > 0 ? (
                            orders.map(order => {
                                const provider = providers.find(p => p.id === order.providerId);
                                return <OrderHistoryCard 
                                            key={order.id} 
                                            order={order} 
                                            provider={provider} 
                                            onWriteReview={handleOpenReviewModal}
                                            onContactProvider={handleOpenConversationModal}
                                            onReportIssue={handleReportIssue}
                                            navigate={navigate}
                                       />
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-8">You haven't placed any orders yet.</p>
                        )}
                    </div>
                );
            case TABS.PLANS:
                return <SubscriptionManagementPanel />;
            case TABS.REGULARS:
                 return (
                    <div>
                        {myRegulars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myRegulars.map(({ meal, provider }) => {
                                    const kitchenStatus = getKitchenStatus(provider);
                                    const originalMeal = provider.menu.find(m => m.id === meal.id);
                                    const isAvailable = originalMeal && originalMeal.isVisible !== false && originalMeal.isAvailable !== false;
                                    const canOrder = isAvailable && kitchenStatus.isOpen;

                                    return (
                                        <div key={meal.id} className={`bg-white p-3 rounded-lg shadow-sm border flex items-start gap-3 relative ${!canOrder ? 'opacity-60' : ''}`}>
                                            {!isAvailable && <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-br-lg">UNAVAILABLE</div>}
                                            <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow flex flex-col h-full">
                                                <div className="flex-grow">
                                                    <p className="font-bold text-gray-800">{meal.name}</p>
                                                    <p className="text-sm text-gray-500">from {provider.name}</p>
                                                    <p className="text-sm font-semibold text-brand-secondary mt-1">₹{meal.price.toFixed(0)}</p>
                                                </div>
                                                <button 
                                                    onClick={() => addToCart(meal, provider.id, provider.name)}
                                                    disabled={!canOrder}
                                                    className="self-end bg-brand-primary text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Add Again
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Your regularly ordered items will appear here after a few orders.</p>
                        )}
                    </div>
                );
            case TABS.REWARDS:
                const currentPoints = fullUser?.loyaltyPoints || 0;
                const rewardValue = (currentPoints * LOYALTY_POINT_VALUE).toFixed(2);
                return (
                    <div className="text-center p-8 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                        <GiftIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                        <h3 className="text-4xl font-bold text-yellow-800">{currentPoints}</h3>
                        <p className="font-semibold text-yellow-700 mb-2">Loyalty Points</p>
                        <p className="text-lg text-gray-700">
                            Which is equal to <span className="font-bold">₹{rewardValue}</span> in discounts!
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            You earn points for every completed order. Keep ordering to earn more rewards!
                        </p>
                    </div>
                );
            case TABS.ACHIEVEMENTS:
                return <AchievementsPanel earnedBadgeIds={fullUser?.earnedBadgeIds} />;
            case TABS.ADDRESSES:
                 return <AddressManager addresses={fullUser?.addresses || []} onUpdate={handleUpdateAddresses} />;
            case TABS.NOTIFICATIONS:
                 return <NotificationSettingsPanel />;
            case TABS.SECURITY:
                 return <SecuritySettingsPanel />;
            case TABS.FOLLOWING:
                const followedProviders = providers.filter(p => fullUser?.followedProviderIds?.includes(p.id));
                return (
                    <div>
                        {followedProviders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {followedProviders.map(p => (
                                    <MealProviderCard 
                                        key={p.id}
                                        provider={p}
                                        onSelect={(provider) => navigate(`/provider/${provider.id}`)}
                                        isAuthenticated={!!token}
                                        followedProviderIds={fullUser?.followedProviderIds}
                                        onToggleFollow={handleToggleFollow}
                                    />
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-gray-500 py-8">You haven't followed any kitchens yet.</p>
                        )}
                    </div>
                );
            case TABS.COLLECTIONS:
                 return <CollectionsPanel providers={providers} />;
            case TABS.WISHLIST:
                return (
                     <div>
                        {wishlistedMeals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wishlistedMeals.map(({ meal, provider }) => {
                                    const kitchenStatus = getKitchenStatus(provider);
                                    const isAvailable = meal.isAvailable !== false && meal.isVisible !== false;
                                    const canOrder = isAvailable && kitchenStatus.isOpen;

                                    return (
                                        <div key={meal.id} className={`bg-white p-3 rounded-lg shadow-sm border flex items-start gap-3 relative ${!canOrder ? 'opacity-60' : ''}`}>
                                            {!isAvailable && <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-br-lg">UNAVAILABLE</div>}
                                            <img src={meal.imageUrl} alt={meal.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow flex flex-col h-full">
                                                <div className="flex-grow">
                                                    <p className="font-bold text-gray-800">{meal.name}</p>
                                                    <p className="text-sm text-gray-500">from {provider.name}</p>
                                                    <p className="text-sm font-semibold text-brand-secondary mt-1">₹{meal.price.toFixed(0)}</p>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 mt-2">
                                                     <button 
                                                        onClick={() => handleToggleWishlist(meal.id)}
                                                        className="text-sm text-gray-500 hover:text-red-600 font-semibold"
                                                    >
                                                        Remove
                                                    </button>
                                                    <button 
                                                        onClick={() => addToCart(meal, provider.id, provider.name)}
                                                        disabled={!canOrder}
                                                        className="bg-brand-primary text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">You haven't wishlisted any meals yet.</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    }

    const reviewProviderName = providers.find(p => p.id === orderToReview?.providerId)?.name || 'the kitchen';
    const isDark = theme.name.includes('Dark');
    const panelClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg rounded-xl border ${isDark ? 'border-white/10' : 'border-white/40'}`;
    
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Left Panel: User Info */}
                    <div className={`w-full md:w-1/3 p-8 text-text ${panelClasses}`}>
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-brand-light dark:bg-brand-primary/20 flex items-center justify-center text-brand-dark dark:text-brand-primary font-bold text-4xl mx-auto mb-4">
                               {user?.name.charAt(0)}
                            </div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-text/80 mb-6">{user?.email}</p>
                        </div>
                        <nav className="space-y-2">
                            {Object.values(TABS).map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-left font-semibold p-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === tab ? 'bg-brand-primary/20 text-brand-primary' : 'text-text/80 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {tab === TABS.HISTORY && <HistoryIcon className="w-5 h-5" />}
                                    {tab === TABS.PLANS && <CalendarDaysIcon className="w-5 h-5" />}
                                    {tab === TABS.REGULARS && <ArrowPathIcon className="w-5 h-5" />}
                                    {tab === TABS.REWARDS && <GiftIcon className="w-5 h-5" />}
                                    {tab === TABS.ACHIEVEMENTS && <TrophyIcon className="w-5 h-5" />}
                                    {tab === TABS.ADDRESSES && <HomeIcon className="w-5 h-5" />}
                                    {tab === TABS.NOTIFICATIONS && <BellIcon className="w-5 h-5" />}
                                    {tab === TABS.SECURITY && <ShieldCheckIcon className="w-5 h-5" />}
                                    {tab === TABS.FOLLOWING && <HeartIcon className="w-5 h-5" isFilled={false}/>}
                                    {tab === TABS.COLLECTIONS && <BookmarkSquareIcon className="w-5 h-5" />}
                                    {tab === TABS.WISHLIST && <BookmarkIcon className="w-5 h-5" />}
                                    <span>{tab}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => navigate('/help')}
                                className="w-full text-left font-semibold p-3 rounded-lg transition-colors flex items-center gap-3 text-text/80 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <LifebuoyIcon className="w-5 h-5" />
                                <span>Help & Support</span>
                            </button>
                        </nav>
                        <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                             <button onClick={logout} className="w-full text-center font-semibold text-red-500 hover:text-red-700 transition">
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Tabs and Content */}
                    <div className={`w-full md:w-2/3 p-8 text-text ${panelClasses}`}>
                        <h2 className="text-3xl font-bold font-serif mb-6">{activeTab}</h2>
                        {renderContent()}
                    </div>
                </div>
            </div>
            
            {isReviewModalOpen && orderToReview && (
                <ReviewFormModal 
                    isOpen={isReviewModalOpen}
                    onClose={handleCloseReviewModal}
                    onSubmit={handleReviewSubmit}
                    providerName={reviewProviderName}
                />
            )}
            
            {isConversationModalOpen && conversation && (
                 <ConversationModal
                    isOpen={isConversationModalOpen}
                    onClose={() => setIsConversationModalOpen(false)}
                    onUpdate={fetchProfileData}
                    conversation={conversation}
                />
            )}
             {isReportIssueModalOpen && orderToReport && (
                <ReportIssueModal 
                    isOpen={isReportIssueModalOpen}
                    onClose={() => setIsReportIssueModalOpen(false)}
                    onSubmit={handleIssueSubmit}
                    order={orderToReport}
                />
            )}
        </div>
    );
};

export default ProfilePage;