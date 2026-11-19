import React, { useState, useEffect, useCallback } from 'react';
import type { MealProvider, Order, User, Inquiry } from '../types';
import * as orderApi from '../api/orderApi';
import * as inquiryApi from '../api/inquiryApi';
import { useAuth } from '../hooks/useAuth';
import { ChatBubbleIcon } from '../constants';
import Loader from './Loader';
import ConversationModal from './ConversationModal';

interface MessagingPanelProps {
    provider: MealProvider | null;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ provider }) => {
    const { user, token } = useAuth();
    const [ordersWithMessages, setOrdersWithMessages] = useState<Order[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Order | Inquiry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'inquiries' | 'orders'>('inquiries');
    
    const fetchConversations = useCallback(async () => {
        if (!provider?.id || !token) return;
        setIsLoading(true);
        try {
            const [allOrders, allInquiries] = await Promise.all([
                orderApi.getOrdersForProvider(provider.id, token),
                inquiryApi.getInquiriesForProvider(provider.id, token),
            ]);
            
            const orderConversations = allOrders
                .filter(o => o.messages && o.messages.length > 0)
                .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());
            
            const inquiryConversations = allInquiries
                .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

            setOrdersWithMessages(orderConversations);
            setInquiries(inquiryConversations);

            // Default to inquiries tab if there are new ones, otherwise orders
            if (inquiryConversations.some(i => isUnread(i, user))) {
                setActiveTab('inquiries');
            } else if (orderConversations.some(o => isUnread(o, user))) {
                setActiveTab('orders');
            }

        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoading(false);
        }
    }, [provider?.id, token, user]);
    
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleOpenModal = (conversation: Order | Inquiry) => {
        setSelectedConversation(conversation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedConversation(null);
        setIsModalOpen(false);
    };
    
    const isUnread = (conversation: Order | Inquiry, currentUser: User | null): boolean => {
        if (!currentUser || !conversation.messages || conversation.messages.length === 0) return false;
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return lastMessage.senderId !== currentUser.id;
    };

    const conversationsToShow = activeTab === 'orders' ? ordersWithMessages : inquiries;
    
    return (
        <>
            <div className="p-6 flex flex-col items-center h-full">
                <ChatBubbleIcon className="w-16 h-16 text-cyan-600 mb-4" />
                <h2 className="text-2xl font-bold text-text">Messages</h2>
                 <div className="w-full border-b mt-4 mb-2">
                    <div className="flex -mb-px">
                        <button onClick={() => setActiveTab('inquiries')} className={`py-2 px-4 font-semibold text-sm ${activeTab === 'inquiries' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-text/70'}`}>
                            Inquiries ({inquiries.length})
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 font-semibold text-sm ${activeTab === 'orders' ? 'border-b-2 border-brand-primary text-brand-dark' : 'text-text/70'}`}>
                            Order Messages ({ordersWithMessages.length})
                        </button>
                    </div>
                </div>
                <div className="text-sm text-text/70 flex-grow text-center w-full">
                    {isLoading ? <Loader text="" /> :
                        conversationsToShow.length > 0 ? (
                             <div className="w-full text-left space-y-2">
                                {conversationsToShow.slice(0, 3).map(conv => (
                                     <button key={conv.id} onClick={() => handleOpenModal(conv)} className="w-full p-2 rounded-lg hover:bg-black/10 flex items-center gap-2">
                                        {isUnread(conv, user) && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>}
                                        <div className="truncate flex-grow text-left">
                                            <p className={`font-semibold ${isUnread(conv, user) ? 'text-text' : 'text-text/80'}`}>{conv.customerName}</p>
                                            <p className="text-xs text-text/70 truncate">{conv.messages?.[conv.messages!.length - 1]?.text}</p>
                                        </div>
                                     </button>
                                ))}
                            </div>
                        ) : (
                            <p className="pt-4">No {activeTab === 'orders' ? 'order messages' : 'inquiries'} yet.</p>
                        )
                    }
                </div>
            </div>
            {selectedConversation && (
                <ConversationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onUpdate={fetchConversations}
                    conversation={selectedConversation}
                    providerForNewInquiry={provider || undefined}
                />
            )}
        </>
    );
};

export default MessagingPanel;