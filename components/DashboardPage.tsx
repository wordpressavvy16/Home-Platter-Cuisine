import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import type { MealProvider } from '../types';
import { CrmIcon, MenuIcon, AnalyticsIcon, ArrowPathIcon } from '../constants';
import OrdersPanel from './OrdersPanel';
import MyKitchenProfilePanel from './MyKitchenProfilePanel';
import Loader from './Loader';
import BroadcastPanel from './BroadcastPanel';
import SubscriptionPanel from './SubscriptionPanel';
import CouponManager from './CouponManager';
import MessagingPanel from './MessagingPanel';
import ReviewManagementPanel from './ReviewManagementPanel';
import DeliveryManagementPanel from './DeliveryManagementPanel';
import DraggablePanel from './DraggablePanel';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ProviderCollectionsPanel from './ProviderCollectionsPanel';
import TiffinPlanManager from './TiffinPlanManager';
import SubscriberPanel from './SubscriberPanel'; // New Import

interface DashboardPageProps {
    navigate: (path: string, params?: Record<string, any>) => void;
}

const DEFAULT_LAYOUT = ['orders', 'reviews', 'subscribers', 'tiffinPlans', 'menu', 'collections', 'analytics', 'messaging', 'delivery', 'profile', 'broadcast', 'subscription', 'coupon', 'crm'];

// Define panel sizes for the Bento Grid
const panelSizes: Record<string, string> = {
    orders: 'md:col-span-6',
    reviews: 'md:col-span-4',
    subscribers: 'md:col-span-2',
    analytics: 'md:col-span-3',
    messaging: 'md:col-span-3',
    profile: 'md:col-span-2',
    menu: 'md:col-span-2',
    crm: 'md:col-span-2',
    tiffinPlans: 'md:col-span-3',
    collections: 'md:col-span-3',
    delivery: 'md:col-span-2',
    broadcast: 'md:col-span-2',
    subscription: 'md:col-span-2',
    coupon: 'md:col-span-2',
};


const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
    const { token, providerProfile, refreshProviderProfile } = useAuth();
    const [panelOrder, setPanelOrder] = useState<string[]>(DEFAULT_LAYOUT);
    const [isProfileReady, setIsProfileReady] = useState(false);

    useEffect(() => {
        if (providerProfile) {
            const layoutFromProfile = providerProfile.dashboardLayout;
            const savedLayout = (Array.isArray(layoutFromProfile) && layoutFromProfile.length > 0)
                ? layoutFromProfile.filter(id => DEFAULT_LAYOUT.includes(id)) : DEFAULT_LAYOUT;
            const missingPanels = DEFAULT_LAYOUT.filter(id => !savedLayout.includes(id));
            setPanelOrder([...savedLayout, ...missingPanels]);
            setIsProfileReady(true);
        } else {
            setIsProfileReady(false);
        }
    }, [providerProfile]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldOrder = panelOrder;
            const oldIndex = oldOrder.indexOf(active.id as string);
            const newIndex = oldOrder.indexOf(over.id as string);
            const newOrder = arrayMove(oldOrder, oldIndex, newIndex);
            setPanelOrder(newOrder);
            if (providerProfile && token) {
                try {
                    await providerApi.updateProviderDashboardLayout(providerProfile.id, newOrder, token);
                    await refreshProviderProfile();
                } catch (error) { setPanelOrder(oldOrder); alert("Could not save your new layout."); }
            }
        }
    };
    
    const handleResetLayout = async () => {
        if (providerProfile && token) {
            const currentOrder = panelOrder;
            setPanelOrder(DEFAULT_LAYOUT);
            try {
                await providerApi.updateProviderDashboardLayout(providerProfile.id, [], token); 
                await refreshProviderProfile();
            } catch (error) { setPanelOrder(currentOrder); alert("Could not reset layout."); }
        }
    };

    const dashboardPanels: { [key: string]: React.ReactNode } = React.useMemo(() => providerProfile ? {
        orders: <OrdersPanel providerId={providerProfile.id} provider={providerProfile} />,
        reviews: <ReviewManagementPanel providerId={providerProfile.id} />,
        subscribers: <SubscriberPanel providerId={providerProfile.id} />,
        tiffinPlans: <TiffinPlanManager provider={providerProfile} />,
        menu: (<div onClick={() => navigate('/dashboard/menu')} className="cursor-pointer w-full h-full text-center p-6 flex flex-col items-center justify-center rounded-xl"><MenuIcon className="w-16 h-16 text-brand-primary mb-4"/><h2 className="text-2xl font-bold text-text">Manage Menu</h2><p className="text-text/70 mt-2 flex-grow">Add, edit, or remove meals from your menu.</p></div>),
        collections: <ProviderCollectionsPanel provider={providerProfile} />,
        crm: (<div onClick={() => navigate('/dashboard/crm')} className="cursor-pointer w-full h-full text-center p-6 flex flex-col items-center justify-center rounded-xl"><CrmIcon className="w-16 h-16 text-purple-400 mb-4"/><h2 className="text-2xl font-bold text-text">Customer Directory</h2><p className="text-text/70 mt-2 flex-grow">View your customer list and order history.</p></div>),
        analytics: (<div onClick={() => navigate('/dashboard/analytics')} className="cursor-pointer w-full h-full text-center p-6 flex flex-col items-center justify-center rounded-xl"><AnalyticsIcon className="w-16 h-16 text-indigo-400 mb-4"/><h2 className="text-2xl font-bold text-text">Performance Analytics</h2><p className="text-text/70 mt-2 flex-grow">Analyze business health and get AI insights.</p></div>),
        profile: <MyKitchenProfilePanel provider={providerProfile} navigate={navigate} />,
        broadcast: <BroadcastPanel provider={providerProfile} onUpdate={refreshProviderProfile} />,
        subscription: <SubscriptionPanel provider={providerProfile} />,
        coupon: <CouponManager provider={providerProfile} />,
        messaging: <MessagingPanel provider={providerProfile} />,
        delivery: <DeliveryManagementPanel provider={providerProfile} />
    } : {}, [providerProfile, navigate, refreshProviderProfile]);

    if (!isProfileReady || !providerProfile) {
        return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading your dashboard..." /></div>;
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div><h1 className="text-4xl font-bold text-text font-serif">Provider Dashboard</h1><p className="text-xl text-text/80">Welcome back, {providerProfile.chefName}!</p></div>
                    <button onClick={handleResetLayout} className="flex items-center gap-2 text-sm font-semibold text-text/80 hover:text-text bg-black/10 py-2 px-4 rounded-lg shadow-sm border border-white/20 hover:bg-black/20 transition-colors"><ArrowPathIcon className="w-5 h-5"/>Reset Layout</button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 items-start">
                            {panelOrder.map(id => {
                                // Get panel size class from the lookup object
                                const panelClass = panelSizes[id] || 'md:col-span-2';
                                return (<DraggablePanel key={id} id={id} className={panelClass}><div className="h-full">{dashboardPanels[id]}</div></DraggablePanel>);
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default DashboardPage;
