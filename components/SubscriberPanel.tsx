import React, { useState, useEffect, useCallback } from 'react';
import * as orderApi from '../api/orderApi';
import type { SubscriptionOrder } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { UsersIcon } from '../constants';

const statusStyles: { [key in SubscriptionOrder['status']]: string } = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const SubscriberPanel = ({ providerId }: { providerId: string }) => {
    const { token } = useAuth();
    const [subscriptions, setSubscriptions] = useState<SubscriptionOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSubscriptions = useCallback(() => {
        if (token) {
            orderApi.getSubscriptionOrdersForProvider(providerId, token)
                .then(setSubscriptions)
                .catch(err => setError("Failed to fetch subscribers."))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            setError("Authentication token not found.");
        }
    }, [providerId, token]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED');

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <UsersIcon className="w-8 h-8 text-purple-600"/>
                <h2 className="text-2xl font-bold text-text">Subscribers</h2>
            </div>
            {isLoading ? (
                <div className="py-8"><Loader text="Loading subscribers..."/></div>
            ) : error ? (
                <p className="text-red-500 text-center py-8">{error}</p>
            ) : activeSubscriptions.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {activeSubscriptions.map(sub => {
                        const statusStyle = statusStyles[sub.status];
                        const resumeDate = sub.status === 'PAUSED' ? sub.pausePeriods?.[sub.pausePeriods.length - 1]?.endDate : null;
                        return (
                            <div key={sub.id} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text">{sub.customerName}</p>
                                        <p className="text-sm text-text/80">{sub.planName}</p>
                                    </div>
                                    <span className={`text-xs font-bold py-1 px-2 rounded-full ${statusStyle}`}>{sub.status}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t text-xs text-text/70">
                                    {resumeDate ? (
                                        <p>Resumes on: <span className="font-semibold text-yellow-800">{new Date(resumeDate).toLocaleDateString()}</span></p>
                                    ) : (
                                        <p>Ends on: <span className="font-semibold text-text">{new Date(sub.endDate).toLocaleDateString()}</span></p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-text/70 font-semibold">No active subscribers yet.</p>
                </div>
            )}
        </div>
    );
};

export default SubscriberPanel;