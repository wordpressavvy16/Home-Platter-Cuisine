import React, { useState, useEffect, useCallback } from 'react';
import type { SubscriptionOrder, MealProvider } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as orderApi from '../api/orderApi';
import * as providerApi from '../api/providerApi';
import Loader from './Loader';
import { CalendarDaysIcon } from '../constants';
import PausePlanModal from './PausePlanModal';

const statusStyles: { [key in SubscriptionOrder['status']]: string } = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const SubscriptionManagementPanel: React.FC = () => {
    const { user, token } = useAuth();
    const [subscriptions, setSubscriptions] = useState<SubscriptionOrder[]>([]);
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planToPause, setPlanToPause] = useState<SubscriptionOrder | null>(null);

    const fetchData = useCallback(async () => {
        if (!user || !token) {
            setError('You must be logged in to view your plans.');
            setIsLoading(false);
            return;
        }
        try {
            const [subsData, provData] = await Promise.all([
                orderApi.getSubscriptionOrdersForUser(user.id, token),
                providerApi.getProviders(),
            ]);
            setSubscriptions(subsData);
            setProviders(provData);
        } catch (err: any) {
            setError(err.message || 'Failed to load subscription plans.');
        } finally {
            setIsLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (subscription: SubscriptionOrder) => {
        setPlanToPause(subscription);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <Loader text="Loading your tiffin plans..." />;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED');

    return (
        <>
            <div className="space-y-4">
                {activeSubscriptions.length > 0 ? (
                    activeSubscriptions.map(sub => {
                        const provider = providers.find(p => p.id === sub.providerId);
                        const statusStyle = statusStyles[sub.status];
                        return (
                            <div key={sub.id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{sub.planName}</p>
                                        <p className="text-sm text-gray-600">from {provider?.name || 'Unknown Kitchen'}</p>
                                    </div>
                                    <span className={`text-xs font-bold py-1 px-3 rounded-full ${statusStyle}`}>{sub.status}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                                    <p>End Date: <span className="font-semibold text-gray-700">{new Date(sub.endDate).toLocaleDateString()}</span></p>
                                </div>
                                {sub.status === 'ACTIVE' && (
                                    <div className="mt-3 text-right">
                                        <button onClick={() => handleOpenModal(sub)} className="text-sm font-semibold bg-brand-primary text-white py-1.5 px-3 rounded-md hover:bg-brand-dark transition">
                                            Pause Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                        <p className="text-gray-500">You have no active tiffin plans.</p>
                    </div>
                )}
            </div>
            {planToPause && (
                <PausePlanModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    subscription={planToPause}
                    onUpdate={fetchData}
                />
            )}
        </>
    );
};

export default SubscriptionManagementPanel;