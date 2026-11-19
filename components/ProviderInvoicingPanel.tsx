import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/adminApi';
import type { MealProvider, Invoice } from '../types';
import Loader from './Loader';
import { DocumentTextIcon } from '../constants';

const ProviderInvoicingPanel = () => {
    const { token } = useAuth();
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

    const fetchData = useCallback(async () => {
        if (!token) {
            setError('Authentication required.');
            setIsLoading(false);
            return;
        }
        try {
            const [providerData, invoiceData] = await Promise.all([
                adminApi.getAllProviders(token),
                adminApi.getInvoices(token),
            ]);
            setProviders(providerData);
            setInvoices(invoiceData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch invoicing data.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const getPrevMonthPeriod = () => {
        const now = new Date();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return prevMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const currentPeriod = useMemo(getPrevMonthPeriod, []);

    const handleGenerateInvoice = async (providerId: string) => {
        if (!token) return;
        setGeneratingIds(prev => new Set(prev).add(providerId));
        try {
            const newInvoice = await adminApi.generateInvoice(providerId, token);
            setInvoices(prev => [newInvoice, ...prev]);
        } catch (err: any) {
            alert(err.message || 'Failed to generate invoice.');
        } finally {
            setGeneratingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(providerId);
                return newSet;
            });
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
             <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="w-8 h-8 text-brand-primary" />
                <div>
                    <h2 className="text-2xl font-bold text-text">Provider Invoicing</h2>
                    <p className="text-text/70">Generate and manage monthly subscription invoices.</p>
                </div>
            </div>
            
            {isLoading ? (
                <Loader text="Loading invoicing data..."/>
            ) : error ? (
                 <p className="text-red-500 text-center py-8">{error}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-text/90">Invoice Generation for: <span className="text-brand-dark">{currentPeriod}</span></h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                           {providers.filter(p => p.isSetupComplete).map(provider => {
                               const hasInvoice = invoices.some(inv => inv.providerId === provider.id && inv.period === currentPeriod);
                               const isGenerating = generatingIds.has(provider.id);
                               
                               return (
                                   <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                       <span className="font-medium text-text">{provider.name}</span>
                                       {isGenerating ? (
                                           <Loader text="" />
                                       ) : hasInvoice ? (
                                           <span className="text-sm font-bold text-green-600">Invoice Generated</span>
                                       ) : (
                                           <button onClick={() => handleGenerateInvoice(provider.id)} className="text-sm font-semibold bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600">
                                               Generate
                                           </button>
                                       )}
                                   </div>
                               );
                           })}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-text/90">Recently Generated Invoices</h3>
                         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {invoices.length > 0 ? invoices.map(invoice => (
                                <div key={invoice.id} className="border p-3 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-text">{invoice.providerName}</p>
                                            <p className="text-sm text-text/70">{invoice.period}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-brand-secondary">₹{invoice.amount.toFixed(2)}</p>
                                            <p className="text-xs text-text/60">ID: {invoice.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text/80 mt-2 pt-2 border-t italic">
                                        <span className="font-semibold">AI Note:</span> {invoice.aiSummaryNotes}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-text/70 text-center pt-10">No invoices have been generated yet.</p>
                            )}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderInvoicingPanel;