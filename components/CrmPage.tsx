import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as orderApi from '../api/orderApi';
import type { CustomerSummary } from '../api/orderApi';
import Loader from './Loader';
import { BackArrowIcon } from '../constants';

interface CrmPageProps {
    navigate: (path: string, params?: Record<string, any>) => void;
}

const CrmPage: React.FC<CrmPageProps> = ({ navigate }) => {
    const { user, token } = useAuth();
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const providerId = user?.role === 'PROVIDER' ? user.id.replace('prov_', '') : null;

    useEffect(() => {
        if (providerId && token) {
            orderApi.getCustomersForProvider(providerId, token)
                .then(setCustomers)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [providerId, token]);

    const tableHeaders = ["Customer Name", "Email", "Total Orders"];

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <BackArrowIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Customer Directory
                        </h1>
                        <p className="text-gray-600">An overview of all your customers.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="py-16 flex justify-center"><Loader text="Loading your customers..." /></div>
                    ) : !providerId ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-700 font-semibold">Could not identify your kitchen.</p>
                        </div>
                    ) : customers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        {tableHeaders.map(header => (
                                            <th key={header} className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {customers.map(customer => (
                                        <tr 
                                            key={customer.userId} 
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/dashboard/crm/customer/${customer.userId}`)}
                                        >
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{customer.name}</span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-gray-600">{customer.email}</td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <span className="bg-blue-100 text-blue-800 font-bold text-sm py-1 px-3 rounded-full">{customer.orderCount}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-700 font-semibold">No Customers Yet</p>
                            <p className="text-gray-500 mt-2">Your customers will appear here once they place their first order.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrmPage;
