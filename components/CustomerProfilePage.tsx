import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as orderApi from '../api/orderApi';
import * as providerApi from '../api/providerApi';
import * as inquiryApi from '../api/inquiryApi';
import type { Order, MealProvider, Review, Inquiry, User } from '../types';
import Loader from './Loader';
import { BackArrowIcon, BellIcon, GiftIcon, CurrencyDollarIcon, ShoppingCartIcon, StarIcon, ChatBubbleLeftRightIcon as ChatBubbleIcon } from '../constants';
import ReviewCard from './ReviewCard';
import RewardCustomerModal from './RewardCustomerModal';
import ConversationModal from './ConversationModal';

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

interface CustomerProfilePageProps {
  customerId: string;
  navigate: (path: string) => void;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customerId, navigate }) => {
  const { user, token } = useAuth();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [provider, setProvider] = useState<MealProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remindersSent, setRemindersSent] = useState(new Set<string>());
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Order | Inquiry | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'reviews'>('orders');

  const providerId = user?.role === 'PROVIDER' ? user.id.replace('prov_', '') : null;

  const fetchData = useCallback(async () => {
    if (!providerId || !token) {
      setIsLoading(false);
      return;
    }
    try {
      const [allOrders, providerData, allInquiries] = await Promise.all([
        orderApi.getOrdersForProvider(providerId, token),
        providerApi.getProviderById(providerId),
        inquiryApi.getInquiriesForProvider(providerId, token),
      ]);
      setCustomerOrders(allOrders.filter(o => o.userId === customerId));
      setProvider(providerData || null);
      setInquiries(allInquiries);
    } catch (error) {
      console.error("Failed to fetch customer profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, providerId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleSendReminder = async (orderId: string) => {
    if (!token) return;
    setRemindersSent(prev => new Set(prev).add(orderId));
    try {
        await providerApi.sendReviewReminder(orderId, token);
    } catch (err) {
        console.error("Failed to send reminder:", err);
        setRemindersSent(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
        });
        alert("Failed to send reminder. Please try again.");
    }
  };
  
  const handleCreateReward = async (discount: number, expiry: string) => {
    if (!providerId || !token) return;
    try {
        await providerApi.createTargetedCoupon(providerId, { discountPercentage: discount, expiresAt: expiry, targetUserId: customerId }, token);
        alert('Reward sent successfully!');
    } catch (err) {
        console.error("Failed to send reward:", err);
        alert("Failed to send reward. Please try again.");
        throw err;
    }
  };
  
  const handleViewConversation = (conversation: Order | Inquiry) => {
    setSelectedConversation(conversation);
    setIsConversationModalOpen(true);
  };

  const customerDetails = customerOrders.length > 0 ? { name: customerOrders[0].customerName, email: customerOrders[0].customerEmail } : null;
  const customerReviews = provider?.reviews.filter(r => r.userId === customerId) || [];
  
  const customerStats = useMemo(() => {
    if (customerOrders.length === 0) return { totalOrders: 0, totalSpend: 0 };
    const totalSpend = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    return { totalOrders: customerOrders.length, totalSpend };
  }, [customerOrders]);

  const messageThreads = useMemo(() => {
    const orderThreads = customerOrders.filter(o => o.messages && o.messages.length > 0);
    const inquiryThreads = inquiries.filter(i => i.customerId === customerId);
    const allThreads: (Order | Inquiry)[] = [...orderThreads, ...inquiryThreads];
    allThreads.sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());
    return allThreads;
  }, [customerOrders, inquiries, customerId]);

  return (
    <>
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard/crm')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <BackArrowIcon className="w-6 h-6 text-gray-700" />
              </button>
              {isLoading ? (
                 <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
              ) : customerDetails ? (
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif">
                    {customerDetails.name}
                  </h1>
                  <p className="text-gray-600">{customerDetails.email}</p>
                </div>
              ) : (
                 <h1 className="text-3xl font-bold text-gray-700">Customer Profile</h1>
              )}
            </div>
             <button onClick={() => setIsRewardModalOpen(true)} className="flex items-center gap-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors self-start sm:self-center">
                <GiftIcon className="w-5 h-5"/>
                Reward Customer
            </button>
        </div>
        
        {isLoading ? (
            <div className="py-16 flex justify-center"><Loader text="Loading customer details..." /></div>
        ) : !customerDetails ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <p className="text-xl text-gray-700 font-semibold">Could not load customer data.</p>
            </div>
        ) : (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Spend" value={`₹${customerStats.totalSpend.toFixed(2)}`} icon={<CurrencyDollarIcon className="w-7 h-7 text-green-600"/>} />
                <KpiCard title="Total Orders" value={customerStats.totalOrders} icon={<ShoppingCartIcon className="w-7 h-7 text-blue-600"/>} />
                <KpiCard title="Reviews Submitted" value={customerReviews.length} icon={<StarIcon className="w-7 h-7 text-yellow-500"/>} />
            </div>

            {/* Tabbed Interface */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="border-b mb-4">
                    <div className="flex space-x-4">
                        <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Order History</button>
                        <button onClick={() => setActiveTab('messages')} className={`py-2 px-4 font-semibold ${activeTab === 'messages' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Message History</button>
                        <button onClick={() => setActiveTab('reviews')} className={`py-2 px-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-gray-500'}`}>Reviews</button>
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'orders' && (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                           {customerOrders.map(order => (
                                <div key={order.id} className="border p-3 rounded-lg bg-gray-50/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
                                            <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                                                {order.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}
                                            </ul>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="font-semibold text-lg">₹{order.totalAmount.toFixed(2)}</p>
                                            {!order.reviewSubmitted && (
                                                <div className="mt-2">
                                                    {remindersSent.has(order.id) ? (
                                                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1"><CheckIcon className="w-4 h-4 text-green-500"/>Reminder Sent</p>
                                                    ) : (
                                                        <button onClick={() => handleSendReminder(order.id)} title="Send Review Reminder" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition p-1.5 rounded-md hover:bg-blue-100"><BellIcon className="w-4 h-4"/>Send Reminder</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'messages' && (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {messageThreads.length > 0 ? messageThreads.map(thread => (
                               <button key={thread.id} onClick={() => handleViewConversation(thread)} className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                                   <p className="font-semibold text-gray-700">{'userId' in thread ? `Conversation for Order #${thread.id.slice(-6)}` : `Pre-order Inquiry`}</p>
                                   <p className="text-xs text-gray-500">Last message: {new Date(thread.lastMessageAt!).toLocaleString()}</p>
                                   <p className="text-sm text-gray-600 truncate italic mt-1">"{thread.messages?.[thread.messages.length - 1]?.text}"</p>
                               </button>
                           )) : <p className="text-gray-500 text-center py-8">No message history.</p>}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                         <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {customerReviews.length > 0 ? customerReviews.map(review => <ReviewCard key={review.id} review={review} />)
                            : <p className="text-gray-500 text-center py-8">This customer has not submitted any reviews yet.</p>}
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
    {customerDetails && <RewardCustomerModal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} onSubmit={handleCreateReward} customerName={customerDetails.name} />}
    {selectedConversation && (<ConversationModal isOpen={isConversationModalOpen} onClose={() => setIsConversationModalOpen(false)} onUpdate={fetchData} conversation={selectedConversation} />)}
    </>
  );
};

export default CustomerProfilePage;