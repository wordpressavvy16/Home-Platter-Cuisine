import React, { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import type { MealProvider } from '../types';
import Loader from './Loader';
import { UsersIcon, ShieldCheckIcon, ShieldExclamationIcon } from '../constants';

const ProviderManagementPanel = () => {
    const { token } = useAuth();
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProviders = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await adminApi.getAllProviders(token);
            setProviders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch providers.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);
    
    const handleStatusChange = async (action: 'approve' | 'suspend' | 'reactivate', providerId: string) => {
        if (!token) return;
        
        // Optimistically update UI
        setProviders(prev => prev.map(p => {
            if (p.id !== providerId) return p;
            if (action === 'approve') return { ...p, isSetupComplete: true };
            if (action === 'suspend') return { ...p, isSuspended: true };
            if (action === 'reactivate') return { ...p, isSuspended: false };
            return p;
        }));

        try {
            if (action === 'approve') await adminApi.approveProvider(providerId, token);
            if (action === 'suspend') await adminApi.suspendProvider(providerId, token);
            if (action === 'reactivate') await adminApi.reactivateProvider(providerId, token);
        } catch (err) {
            console.error(`Failed to ${action} provider`, err);
            alert(`Could not ${action} provider. Please try again.`);
            // Revert UI on failure
            fetchProviders();
        }
    }
    
    const getStatus = (provider: MealProvider) => {
        if(provider.isSuspended) return { text: 'Suspended', color: 'bg-red-100 text-red-800' };
        if(!provider.isSetupComplete) return { text: 'Pending Setup', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
    };
    
    const tableHeaders = ["Provider Name", "Chef Name", "Join Date", "Status", "Actions"];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <UsersIcon className="w-8 h-8 text-brand-primary" />
                <div>
                    <h2 className="text-2xl font-bold text-text">Provider Management</h2>
                    <p className="text-text/70">Approve, suspend, or manage providers on the platform.</p>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {isLoading ? (
                    <Loader text="Loading providers..." />
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                             <tr>
                                {tableHeaders.map(header => (
                                    <th key={header} className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {providers.map(p => {
                                const status = getStatus(p);
                                return (
                                <tr key={p.id}>
                                    <td className="p-4 font-medium text-text">{p.name}</td>
                                    <td className="p-4 text-text/80">{p.chefName}</td>
                                    <td className="p-4 text-text/80">{new Date(p.joinDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold py-1 px-3 rounded-full ${status.color}`}>{status.text}</span>
                                    </td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        {!p.isSetupComplete && (
                                            <button onClick={() => handleStatusChange('approve', p.id)} className="text-sm font-semibold text-green-600 hover:underline">Approve</button>
                                        )}
                                        {p.isSuspended ? (
                                             <button onClick={() => handleStatusChange('reactivate', p.id)} className="text-sm font-semibold text-blue-600 hover:underline">Reactivate</button>
                                        ) : (
                                            p.isSetupComplete && <button onClick={() => handleStatusChange('suspend', p.id)} className="text-sm font-semibold text-red-600 hover:underline">Suspend</button>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProviderManagementPanel;