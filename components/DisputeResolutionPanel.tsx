import React, { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import type { DisputedOrder } from '../api/adminApi';
import Loader from './Loader';
import { ExclamationTriangleIcon } from '../constants';
import CompensationModal from './CompensationModal';
import type { Order } from '../types';

const DisputeResolutionPanel = () => {
    const { token } = useAuth();
    const [disputes, setDisputes] = useState<adminApi.DisputedOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCompensationModalOpen, setIsCompensationModalOpen] = useState(false);
    const [orderToCompensate, setOrderToCompensate] = useState<Order | null>(null);

    const fetchDisputes = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await adminApi.getOpenDisputes(token);
            setDisputes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleDismiss = async (orderId: string) => {
        if (!token) return;

        // Optimistic update
        setDisputes(prev => prev.filter(item => item.order.id !== orderId));

        try {
            await adminApi.resolveDispute(orderId, token);
        } catch (err) {
            alert(`Failed to resolve dispute. Please try again.`);
            fetchDisputes(); // Revert on failure
        }
    };
    
    const handleOpenCompensationModal = (order: Order) => {
        setOrderToCompensate(order);
        setIsCompensationModalOpen(true);
    };

    const handleCompensationSent = async () => {
        if (orderToCompensate) {
            await handleDismiss(orderToCompensate.id);
        }
    };

    return (
        <>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-text">Order Dispute Resolution</h2>
                        <p className="text-text/70">Review and resolve customer-reported issues.</p>
                    </div>
                </div>
                {isLoading ? (
                    <Loader text="Loading open disputes..." />
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : disputes.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {disputes.map(({ order, providerName }) => (
                            <div key={order.id} className="p-4 border rounded-lg bg-orange-50/50">
                                <div className="border-b pb-2 mb-2">
                                    <p className="text-sm font-semibold text-gray-600">
                                        Dispute from <span className="font-bold text-brand-dark">{order.customerName}</span> regarding an order from <span className="font-bold text-brand-dark">{providerName}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">Order ID: {order.id}</p>
                                </div>
                                <div className="bg-white p-3 rounded-md border">
                                    <p className="text-sm font-bold text-gray-700">Reason: <span className="font-normal">{order.dispute?.reason.replace('_', ' ')}</span></p>
                                    <p className="text-sm text-gray-700 mt-2"><span className="font-bold">Customer's Message:</span><br/> <em className="text-gray-600">"{order.dispute?.customerMessage}"</em></p>
                                </div>
                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                                    <button onClick={() => handleDismiss(order.id)} className="text-sm font-semibold bg-gray-500 text-white py-1.5 px-3 rounded-md hover:bg-gray-600">Dismiss</button>
                                    <button onClick={() => handleOpenCompensationModal(order)} className="text-sm font-semibold bg-green-600 text-white py-1.5 px-3 rounded-md hover:bg-green-700">Resolve & Compensate</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-text/70 font-semibold">The dispute queue is clear. Well done!</p>
                    </div>
                )}
            </div>
            {orderToCompensate && (
                <CompensationModal
                    isOpen={isCompensationModalOpen}
                    onClose={() => setIsCompensationModalOpen(false)}
                    order={orderToCompensate}
                    onCompensationSent={handleCompensationSent}
                />
            )}
        </>
    );
};

export default DisputeResolutionPanel;