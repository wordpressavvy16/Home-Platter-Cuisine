import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as orderApi from '../api/orderApi';
import type { Order, MealProvider } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { TruckIcon } from '../constants';
import NewOrderAlertModal from './NewOrderAlertModal';

const OrdersIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const statusStyles: { [key in Order['status']]: { text: string; bg: string; text_color: string } } = {
  PENDING: { text: 'Pending Confirmation', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
  CONFIRMED: { text: 'Order Confirmed', bg: 'bg-blue-100', text_color: 'text-blue-800' },
  PREPARING: { text: 'Preparing Meal', bg: 'bg-cyan-100', text_color: 'text-cyan-800' },
  OUT_FOR_DELIVERY: { text: 'Out for Delivery', bg: 'bg-teal-100', text_color: 'text-teal-800' },
  DELIVERED: { text: 'Delivered', bg: 'bg-green-100', text_color: 'text-green-800' },
  CANCELLED: { text: 'Cancelled', bg: 'bg-red-100', text_color: 'text-red-800' },
};

const getKitchenStatus = (provider: MealProvider) => {
    if (provider.isAcceptingOrders === false) return { isOpen: false, message: "This kitchen is currently closed and not accepting orders." };
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const schedule = provider.weeklySchedule?.[today] || [];
    if (schedule.length === 0) return { isOpen: false, message: "Closed today. Please check back another day!" };
    for (const window of schedule) {
        const [cutoffH, cutoffM] = window.orderCutoffTime.split(':').map(Number);
        const cutoffTime = cutoffH * 60 + cutoffM;
        if (currentTime < cutoffTime) return { isOpen: true, message: `Taking orders for ${window.mealType} until ${window.orderCutoffTime}.` };
    }
    for (const window of schedule) {
        const [servingStartH] = window.servingStartTime.split(':').map(Number);
        if(servingStartH * 60 > currentTime) return { isOpen: false, message: `Ordering is closed. Next window: ${window.mealType} (order by ${window.orderCutoffTime}).` };
    }
    return { isOpen: false, message: "All ordering windows for today are closed." };
};

interface IncomingOrderCardProps {
    order: Order;
    provider: MealProvider;
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    onRequestDelivery: (orderId: string) => void;
    isRequestingDelivery: boolean;
    isPulsing: boolean;
}

const IncomingOrderCard: React.FC<IncomingOrderCardProps> = ({ order, provider, onUpdateStatus, onRequestDelivery, isRequestingDelivery, isPulsing }) => {
    const { text, bg, text_color } = statusStyles[order.status];
    const pulseClass = isPulsing ? 'border-2 animate-pulse-border' : 'border';
    
    return (
        <div className={`${pulseClass} rounded-lg p-4`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                {/* Left side: Order details */}
                <div className="flex-grow">
                    <p className="font-semibold text-text">{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                    <p className="text-sm text-text/80">
                        For: <span className="font-medium text-brand-dark">{order.customerName}</span>
                    </p>
                    <p className="text-xs text-text/70 mt-1">{new Date(order.orderDate).toLocaleString()}</p>
                </div>
                {/* Right side: Status and value */}
                <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-bold text-lg text-brand-secondary">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs font-bold py-1 px-2 rounded-full inline-block mt-1 ${bg} ${text_color}`}>{text}</span>
                </div>
            </div>
             {/* Delivery Partner Info */}
            {order.deliveryPartner && (
                <div className="mt-3 pt-3 border-t border-dashed bg-black/5 p-3 rounded-md">
                    <div className="flex items-center gap-3">
                        <TruckIcon className="w-6 h-6 text-text/80" />
                        <div>
                            <p className="font-semibold text-sm text-text">Delivery Partner Assigned</p>
                            <p className="text-xs text-text/80">
                                {order.deliveryPartner.name} - {order.deliveryPartner.vehicle}
                            </p>
                        </div>
                    </div>
                     <div className="mt-2 text-xs grid grid-cols-2 gap-x-4">
                        <div className="text-text/70">Fee (Customer Paid): <span className="font-semibold text-green-700">₹{order.deliveryFeeApplied?.toFixed(2) || '0.00'}</span></div>
                        <div className="text-text/70">Cost (Your Expense): <span className="font-semibold text-red-700">₹{order.deliveryCost?.toFixed(2) || '0.00'}</span></div>
                    </div>
                </div>
            )}
            {/* Actions */}
            <div className="mt-4 pt-3 border-t flex justify-end gap-3">
                {order.status === 'PENDING' && (
                    <>
                        <button 
                            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                            className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                        >
                            Accept Order
                        </button>
                    </>
                )}
                 {order.status === 'CONFIRMED' && (
                    <button 
                        onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Mark as Preparing
                    </button>
                )}
                 {order.status === 'PREPARING' && (
                    provider.deliveryIntegrationEnabled ? (
                        <button
                            onClick={() => onRequestDelivery(order.id)}
                            disabled={isRequestingDelivery}
                            className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-400"
                        >
                            {isRequestingDelivery ? 'Requesting...' : 'Request Delivery Partner'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                            className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition"
                        >
                            Mark as Out for Delivery
                        </button>
                    )
                )}
                 {order.status === 'OUT_FOR_DELIVERY' && !order.deliveryPartner && (
                    <button 
                        onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                        className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition"
                    >
                        Mark as Delivered
                    </button>
                )}
                {order.status === 'OUT_FOR_DELIVERY' && order.deliveryPartner && (
                    <p className="text-sm font-semibold text-text/70">Awaiting delivery completion...</p>
                )}
                {order.status === 'DELIVERED' && (
                    <p className="text-sm font-semibold text-text/70">Order Completed</p>
                )}
                {order.status === 'CANCELLED' && (
                    <p className="text-sm font-semibold text-red-600">Order Cancelled by Provider</p>
                )}
            </div>
        </div>
    );
};

const OrdersPanel = ({ providerId, provider }: { providerId: string, provider: MealProvider }) => {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestingDeliveryId, setRequestingDeliveryId] = useState<string | null>(null);

    // --- New State for Order Alerts ---
    const isInitialLoad = useRef(true);
    const prevPendingOrderIds = useRef<Set<string>>(new Set());
    const [newOrderForAlert, setNewOrderForAlert] = useState<Order | null>(null);
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
    const alarmTimeoutRef = useRef<number | null>(null);
    const [pulsingOrderId, setPulsingOrderId] = useState<string | null>(null);

    const fetchOrders = useCallback(() => {
        if (token) {
            orderApi.getOrdersForProvider(providerId, token)
                .then(newOrders => {
                    setOrders(newOrders);
                    
                    // --- New Order Detection Logic ---
                    const currentPendingOrders = newOrders.filter(o => o.status === 'PENDING');
                    const currentPendingIds = new Set(currentPendingOrders.map(o => o.id));
                    
                    if (!isInitialLoad.current) {
                        const newOrder = currentPendingOrders.find(o => !prevPendingOrderIds.current.has(o.id));
                        if (newOrder) {
                            setNewOrderForAlert(newOrder);
                        }
                    }
                    
                    prevPendingOrderIds.current = currentPendingIds;
                    isInitialLoad.current = false;
                })
                .catch(err => {
                    console.error(err);
                    setError("Failed to fetch orders.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            setError("Authentication token not found.");
        }
    }, [providerId, token]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll for new orders every 30 seconds
        return () => clearInterval(interval);
    }, [fetchOrders]);
    
    const stopAlarm = useCallback(() => {
        alarmAudioRef.current?.pause();
        alarmAudioRef.current = null;
        if (alarmTimeoutRef.current) {
            clearTimeout(alarmTimeoutRef.current);
            alarmTimeoutRef.current = null;
        }
    }, []);

    const handleAlarmTimeout = useCallback(() => {
        stopAlarm();
        if (newOrderForAlert) {
            setPulsingOrderId(newOrderForAlert.id);
        }
        setNewOrderForAlert(null);
    }, [newOrderForAlert, stopAlarm]);

    useEffect(() => {
        if (newOrderForAlert && provider) {
            const kitchenStatus = getKitchenStatus(provider);
            if (kitchenStatus.isOpen) {
                const audio = new Audio('/alarm.mp3');
                audio.loop = true;
                audio.play().catch(e => console.error("Audio playback failed:", e));
                alarmAudioRef.current = audio;
                alarmTimeoutRef.current = window.setTimeout(handleAlarmTimeout, 45000);
            } else {
                setPulsingOrderId(newOrderForAlert.id);
                setNewOrderForAlert(null); // No modal/sound if closed
            }
        }
        return () => stopAlarm();
    }, [newOrderForAlert, provider, handleAlarmTimeout, stopAlarm]);
    
    const handleAcknowledgeAlert = () => {
        stopAlarm();
        setNewOrderForAlert(null);
        setPulsingOrderId(null);
    };

    const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
        if (!token) return;
        if (orderId === pulsingOrderId) setPulsingOrderId(null);

        if (status === 'CANCELLED') {
            if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                return;
            }
        }
        
        try {
            const updatedOrder = await orderApi.updateOrderStatus(orderId, status, token);
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? updatedOrder : order));
        } catch (err) {
            console.error("Failed to update order status:", err);
            alert("Failed to update order status. Please try again.");
        }
    };
    
    const handleRequestDelivery = async (orderId: string) => {
        if (!token) return;
        if (orderId === pulsingOrderId) setPulsingOrderId(null);
        setRequestingDeliveryId(orderId);
        try {
            const updatedOrder = await orderApi.requestDeliveryPartner(orderId, token);
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        } catch (err) {
            console.error("Failed to request delivery partner:", err);
            alert("Failed to request delivery partner. Please try again.");
        } finally {
            setRequestingDeliveryId(null);
        }
    };
    
    const activeOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'OUT_FOR_DELIVERY');
    const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

    return (
        <>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <OrdersIcon className="w-8 h-8 text-brand-secondary"/>
                    <h2 className="text-2xl font-bold text-text">Incoming Orders</h2>
                </div>
                {isLoading && orders.length === 0 ? (
                    <div className="py-8"><Loader text="Checking for new orders..."/></div>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {activeOrders.map(order => 
                            <IncomingOrderCard
                                key={order.id}
                                order={order}
                                provider={provider}
                                onUpdateStatus={handleUpdateStatus}
                                onRequestDelivery={handleRequestDelivery}
                                isRequestingDelivery={requestingDeliveryId === order.id}
                                isPulsing={order.id === pulsingOrderId}
                            />
                        )}
                        {activeOrders.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p className="text-text/70 font-semibold">No new orders requiring action.</p>
                            </div>
                        )}
                        {completedOrders.length > 0 && (
                            <details className="pt-4">
                                <summary className="cursor-pointer text-sm font-semibold text-text/80 hover:underline">View Completed Orders ({completedOrders.length})</summary>
                                <div className="space-y-4 mt-4">
                                    {completedOrders.map(order => 
                                        <IncomingOrderCard
                                            key={order.id}
                                            order={order}
                                            provider={provider}
                                            onUpdateStatus={handleUpdateStatus}
                                            onRequestDelivery={handleRequestDelivery}
                                            isRequestingDelivery={requestingDeliveryId === order.id}
                                            isPulsing={order.id === pulsingOrderId}
                                        />
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-text/70 font-semibold">No orders found yet.</p>
                    </div>
                )}
            </div>
            {newOrderForAlert && (
                <NewOrderAlertModal 
                    order={newOrderForAlert}
                    onAcknowledge={handleAcknowledgeAlert}
                />
            )}
        </>
    );
};

export default OrdersPanel;