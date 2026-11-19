import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/adminApi';
import type { PlatformKpis } from '../types';
import Loader from './Loader';
import { CurrencyDollarIcon, ShoppingCartIcon, KitchenIcon, UsersIcon } from '../constants';

const KpiCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

const SuperAdminKpiPanel = () => {
    const { token } = useAuth();
    const [kpis, setKpis] = useState<PlatformKpis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            adminApi.getPlatformKpis(token)
                .then(setKpis)
                .catch(err => {
                    console.error(err);
                    setError('Failed to load platform metrics.');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            setError('Authentication required.');
        }
    }, [token]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4 h-[92px]">
                         <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                         <div className="flex-grow space-y-2">
                             <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                             <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                         </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>
    }

    if (!kpis) {
        return <div className="bg-gray-100 text-gray-600 p-4 rounded-lg text-center">No KPI data available.</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <KpiCard title="Total Revenue" value={`₹${kpis.totalRevenue.toFixed(2)}`} icon={<CurrencyDollarIcon className="w-7 h-7 text-green-600"/>} />
           <KpiCard title="Total Orders" value={`${kpis.totalOrders}`} icon={<ShoppingCartIcon className="w-7 h-7 text-blue-600"/>} />
           <KpiCard title="Active Providers" value={`${kpis.totalProviders}`} icon={<KitchenIcon className="w-7 h-7 text-purple-600"/>} />
           <KpiCard title="Registered Customers" value={`${kpis.totalCustomers}`} icon={<UsersIcon className="w-7 h-7 text-yellow-500"/>} />
        </div>
    );
};

export default SuperAdminKpiPanel;
