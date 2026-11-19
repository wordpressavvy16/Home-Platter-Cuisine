import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../api/userApi';
import * as orderApi from '../api/orderApi';
import * as adminApi from '../api/adminApi';
import * as supportApi from '../api/supportApi';
import type { User, Order, MealProvider, Review, SupportTicket } from '../types';
import Loader from './Loader';
import { BackArrowIcon, CurrencyDollarIcon, ShoppingCartIcon, StarIcon, LifebuoyIcon, ExclamationTriangleIcon, ChatBubbleIcon } from '../constants';
import ReviewCard from './ReviewCard';
import CompensationModal from './CompensationModal';
import TicketConversationModal from './TicketConversationModal';

const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

interface SuperAdminUserProfilePageProps {
  userId: string;
  navigate: (path: string) => void;
}

const SuperAdminUserProfilePage: React.FC<SuperAdminUserProfilePageProps> = ({ userId, navigate }) => {
    const { token } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'reviews' | 'tickets'>('orders');

    // State for modals
    const [isCompensationModalOpen, setIsCompensationModalOpen] = useState(false);
    const [orderToCompensate, setOrderToCompensate] = useState<Order | null>(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const fetchData = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const [userData, userOrders, allProviders, allTickets] = await Promise.all([
                userApi.getUserProfile(userId, token),
                orderApi.getOrdersForUser(userId, token),
                adminApi.getAllProviders(token),
                supportApi.getAllTickets(token),
            ]);
            
            setUser(userData);
            setOrders(userOrders);
            setProviders(allProviders);

            const userReviews: Review[] = [];
            allProviders.forEach(p => {
                p.reviews.forEach(r => {
                    if (r.userId === userId) {
                        userReviews.push(r);
                    }
                });
            });
            setReviews(userReviews);
            
            const userTickets = allTickets.filter(t => t.userId === userId);
            setTickets(userTickets);

        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCompensationSent = async () => {
        if (!orderToCompensate || !token) return;
        try {
            await adminApi.resolveDispute(orderToCompensate.id, token);
            await fetchData();
        } catch (error) {
            console.error("Failed to resolve dispute after compensation:", error);
            alert("Compensation sent, but failed to automatically resolve dispute. Please refresh.");
            await fetchData();
        }
    };

    const handleOpenCompensationModal = (order: Order) => {
        setOrderToCompensate(order);
        setIsCompensationModalOpen(true);
    };

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsTicketModalOpen(true);
    };

    const userStats = useMemo(() => {
        const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return {
            totalOrders: orders.length,
            totalSpend: totalSpend.toFixed(2),
            totalReviews: reviews.length,
            totalTickets: tickets.length,
        };
    }, [orders, reviews, tickets]);
    
    if (isLoading) {
        return <div className="py-16 flex justify-center"><Loader text="Loading user profile..." /></div>;
    }
    
    if (!user) {
        return <p>User not found.</p>;
    }

    return (
        <>
            <div className="bg-background min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/super-admin')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <BackArrowIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif">{user.name}</h1>
                            <p className="text-gray-600">{user.email} - ({user.role})</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KpiCard title="Total Spend" value={`₹${userStats.totalSpend}`} icon={<CurrencyDollarIcon className="w-7 h-7 text-green-600"/>} />
                        <KpiCard title="Total Orders" value={userStats.totalOrders} icon={<ShoppingCartIcon className="w-7 h-7 text-blue-600"/>} />
                        <KpiCard title="Reviews Written" value={userStats.totalReviews} icon={<StarIcon className="w-7 h-7 text-yellow-500"/>} />
                        <KpiCard title="Support Tickets" value={userStats.totalTickets} icon={<LifebuoyIcon className="w-7 h-7 text-orange-500"/>} />
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="border-b mb-4">
                            <div className="flex space-x-4">
                                <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Order History</button>
                                <button onClick={() => setActiveTab('reviews')} className={`py-2 px-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Reviews Submitted</button>
                                <button onClick={() => setActiveTab('tickets')} className={`py-2 px-4 font-semibold ${activeTab === 'tickets' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Support Tickets</button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto pr-2">
                            {activeTab === 'orders' && (
                                <div className="space-y-4">
                                    {orders.map(order => {
                                        const hasOpenDispute = order.dispute && order.dispute.status === 'OPEN';
                                        return (
                                            <div key={order.id} className={`border p-3 rounded-lg ${hasOpenDispute ? 'bg-orange-50 border-orange-200' : 'bg-gray-50/50'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">Order #{order.id.slice(-6)} from {providers.find(p => p.id === order.providerId)?.name || 'Unknown'}</p>
                                                        <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()} - ₹{order.totalAmount.toFixed(2)}</p>
                                                    </div>
                                                    {hasOpenDispute && (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
                                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                                OPEN DISPUTE
                                                            </div>
                                                            <button onClick={() => handleOpenCompensationModal(order)} className="text-xs font-semibold bg-green-600 text-white py-1.5 px-3 rounded-md hover:bg-green-700">Resolve & Compensate</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {orders.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="space-y-4">
                                    {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                                    {reviews.length === 0 && <p className="text-center text-gray-500 py-8">No reviews submitted.</p>}
                                </div>
                            )}
                            {activeTab === 'tickets' && (
                                <div className="space-y-4">
                                    {tickets.map(ticket => (
                                        <div key={ticket.id} className="border p-3 rounded-lg bg-gray-50/50 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{ticket.subject} <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-blue-100 text-blue-800">{ticket.status}</span></p>
                                                <p className="text-sm text-gray-500">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => handleViewTicket(ticket)} className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-dark transition p-2 rounded-md hover:bg-brand-light">
                                                <ChatBubbleIcon className="w-4 h-4"/> View & Reply
                                            </button>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <p className="text-center text-gray-500 py-8">No support tickets found.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {orderToCompensate && (
                <CompensationModal
                    isOpen={isCompensationModalOpen}
                    onClose={() => setIsCompensationModalOpen(false)}
                    order={orderToCompensate}
                    onCompensationSent={handleCompensationSent}
                />
            )}

            {selectedTicket && (
                <TicketConversationModal
                    isOpen={isTicketModalOpen}
                    onClose={() => setIsTicketModalOpen(false)}
                    ticket={selectedTicket}
                    onUpdate={fetchData}
                />
            )}
        </>
    );
};

export default SuperAdminUserProfilePage;
