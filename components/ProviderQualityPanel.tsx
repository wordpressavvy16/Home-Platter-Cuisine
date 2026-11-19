import React, { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import type { AtRiskProvider } from '../api/adminApi';
import Loader from './Loader';
import { ShieldExclamationIcon } from '../constants';

const ProviderQualityPanel = () => {
    const { token } = useAuth();
    const [atRiskProviders, setAtRiskProviders] = useState<adminApi.AtRiskProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAtRiskProviders = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await adminApi.getAtRiskProviders(token);
            setAtRiskProviders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAtRiskProviders();
    }, [fetchAtRiskProviders]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <ShieldExclamationIcon className="w-8 h-8 text-red-500" />
                <div>
                    <h2 className="text-2xl font-bold text-text">Provider Quality Monitoring</h2>
                    <p className="text-text/70">Automatically flagged providers that may require attention.</p>
                </div>
            </div>
            {isLoading ? (
                <Loader text="Analyzing provider performance..." />
            ) : error ? (
                <p className="text-red-500 text-center py-8">{error}</p>
            ) : atRiskProviders.length > 0 ? (
                <div className="space-y-3">
                    {atRiskProviders.map(({ provider, reason, metric }) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                           <div>
                             <p className="font-bold text-red-800">{provider.name}</p>
                             <p className="text-sm text-red-700">{reason}</p>
                           </div>
                           <span className="font-bold text-lg text-red-600">{metric}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-text/70 font-semibold">No providers are currently at risk. All metrics are healthy.</p>
                </div>
            )}
        </div>
    );
};

export default ProviderQualityPanel;