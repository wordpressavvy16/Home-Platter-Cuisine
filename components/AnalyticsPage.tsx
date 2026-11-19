import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import * as orderApi from '../api/orderApi';
import { generateBusinessSummary } from '../services/geminiService';
import type { MealProvider, Order, PerformanceMetrics, BusinessSummary, Review, Meal } from '../types';
import { BackArrowIcon, CurrencyDollarIcon, ShoppingCartIcon, SparklesIcon, UserIcon, StarIcon } from '../constants';
import Loader from './Loader';
import FeedbackPanel from './FeedbackPanel';
import DemandForecastPanel from './DemandForecastPanel';
import MenuAnalysisPanel from './MenuAnalysisPanel'; // New Import

interface AnalyticsPageProps {
    // FIX: Replaced deprecated Route enum with string path for navigation.
    navigate: (path: string) => void;
}

const KpiCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ navigate }) => {
    const { user, token } = useAuth();
    const [provider, setProvider] = useState<MealProvider | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summary, setSummary] = useState<BusinessSummary | null>(null);
    const [summaryError, setSummaryError] = useState('');
    
    const providerId = user?.role === 'PROVIDER' ? user.id.replace('prov_', '') : null;

    useEffect(() => {
        if (providerId && token) {
            Promise.all([
                providerApi.getProviderById(providerId),
                orderApi.getOrdersForProvider(providerId, token)
            ]).then(([providerData, orderData]) => {
                setProvider(providerData || null);
                setOrders(orderData);
            }).catch(console.error)
              .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [providerId, token]);

    const metrics: PerformanceMetrics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const salesByDayMap = new Map<string, number>();
        orders.forEach(order => {
            const date = new Date(order.orderDate).toISOString().split('T')[0];
            salesByDayMap.set(date, (salesByDayMap.get(date) || 0) + order.totalAmount);
        });

        const salesByDay = Array.from(salesByDayMap.entries()).map(([date, sales]) => ({ date, sales })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

        const itemCounts = new Map<string, {name: string, quantity: number}>();
        orders.forEach(order => {
            order.items.forEach(item => {
                const existing = itemCounts.get(item.id);
                if(existing) {
                    existing.quantity += item.quantity;
                } else {
                    itemCounts.set(item.id, { name: item.name, quantity: item.quantity });
                }
            });
        });

        const topSellingItems = Array.from(itemCounts.values()).sort((a,b) => b.quantity - a.quantity).slice(0, 5);

        return { totalRevenue, totalOrders, averageOrderValue, salesByDay, topSellingItems };
    }, [orders]);
    
    const handleGenerateSummary = useCallback(async () => {
        if (!provider || !token) return;
        setIsSummaryLoading(true);
        setSummary(null);
        setSummaryError('');
        try {
            const result = await generateBusinessSummary(metrics, provider.reviews, token);
            setSummary(result);
        } catch (err: any) {
            setSummaryError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSummaryLoading(false);
        }
    }, [metrics, provider, token]);
    
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                 <div className="flex items-center gap-4 mb-8">
                    {/* FIX: Updated navigation call to use a string path instead of a deprecated Route enum value. */}
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <BackArrowIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Performance Analytics
                        </h1>
                        <p className="text-gray-600">Your complete business intelligence dashboard.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 flex justify-center"><Loader text="Loading your kitchen data..." /></div>
                ) : !providerId || !provider ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                        <p className="text-xl text-gray-700 font-semibold">Could not load your kitchen data.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* KPI Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <KpiCard title="Total Revenue" value={`₹${metrics.totalRevenue.toFixed(2)}`} icon={<CurrencyDollarIcon className="w-7 h-7 text-green-600"/>} />
                           <KpiCard title="Total Orders" value={`${metrics.totalOrders}`} icon={<ShoppingCartIcon className="w-7 h-7 text-blue-600"/>} />
                           <KpiCard title="Avg. Order Value" value={`₹${metrics.averageOrderValue.toFixed(2)}`} icon={<UserIcon className="w-7 h-7 text-purple-600"/>} />
                           <KpiCard title="Avg. Rating" value={`${provider.rating.toFixed(1)} / 5`} icon={<StarIcon className="w-7 h-7 text-yellow-500"/>} />
                        </div>

                        {/* AI Business Summary */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-brand-primary/10 p-3 rounded-full"><SparklesIcon className="w-8 h-8 text-brand-primary"/></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>AI Business Summary</h2>
                                        <p className="text-gray-500">Get a holistic overview of your business health.</p>
                                    </div>
                                </div>
                                <button onClick={handleGenerateSummary} disabled={isSummaryLoading || !token} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap">
                                    {isSummaryLoading ? 'Analyzing...' : 'Generate Summary'}
                                </button>
                            </div>
                            {isSummaryLoading && <div className="pt-8"><Loader text="Synthesizing data..."/></div>}
                            {summaryError && <p className="text-red-500 text-center pt-4">{summaryError}</p>}
                            {summary && (
                                <div className="mt-6 pt-6 border-t animate-fade-in space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Overall Performance</h3>
                                        <p className="text-gray-600">{summary.overallPerformance}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Customer Sentiment</h3>
                                        <p className="text-gray-600">{summary.customerSentimentAnalysis}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Actionable Insights</h3>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {summary.actionableInsights.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* New Demand Forecasting Panel */}
                        <DemandForecastPanel orders={orders} menu={provider.menu} />

                        {/* New Menu Analysis Panel */}
                        <MenuAnalysisPanel menu={provider.menu} />

                        {/* Data Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                               <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Items</h3>
                               {metrics.topSellingItems.length > 0 ? (
                                    <ul className="space-y-3">
                                       {metrics.topSellingItems.map(item => (
                                           <li key={item.name} className="flex justify-between items-center border-b pb-2">
                                               <span className="font-medium text-gray-700">{item.name}</span>
                                               <span className="font-bold text-brand-secondary bg-brand-light px-3 py-1 rounded-full text-sm">{item.quantity} sold</span>
                                           </li>
                                       ))}
                                   </ul>
                               ) : <p className="text-gray-500 text-center py-8">No order data yet.</p>}
                           </div>
                           <div className="bg-white p-6 rounded-xl shadow-lg">
                               <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Daily Sales</h3>
                               {metrics.salesByDay.length > 0 ? (
                                   <ul className="space-y-3">
                                        {metrics.salesByDay.map(day => (
                                            <li key={day.date} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                <span className="font-semibold text-green-700">₹{day.sales.toFixed(2)}</span>
                                            </li>
                                        ))}
                                   </ul>
                               ) : <p className="text-gray-500 text-center py-8">No sales data yet.</p>}
                           </div>
                        </div>

                        {/* Customer Feedback Analysis */}
                        <FeedbackPanel reviews={provider.reviews} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
