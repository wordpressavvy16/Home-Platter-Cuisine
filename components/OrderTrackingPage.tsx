import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as orderApi from '../api/orderApi';
import * as providerApi from '../api/providerApi';
import type { Order, MealProvider } from '../types';
import Loader from './Loader';
import { BackArrowIcon, CheckCircleIcon } from '../constants';
import OrderTrackingMap from './OrderTrackingMap';

interface OrderTrackingPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

const statusMessages: { [key in Order['status']]: string } = {
  PENDING: 'Waiting for the kitchen to confirm your order.',
  CONFIRMED: 'Your order has been confirmed by the kitchen.',
  PREPARING: 'The chef is preparing your delicious meal!',
  OUT_FOR_DELIVERY: 'Your order is on its way to you!',
  DELIVERED: 'Your order has been delivered. Enjoy!',
  CANCELLED: 'This order has been cancelled.',
};

const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, navigate }) => {
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [provider, setProvider] = useState<MealProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("You must be logged in to track an order.");
        setIsLoading(false);
        return;
      }
      try {
        const orderData = await orderApi.getOrderById(orderId, token);
        setOrder(orderData);
        if (orderData) {
          const providerData = await providerApi.getProviderById(orderData.providerId);
          setProvider(providerData || null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling if the order is out for delivery
    const interval = setInterval(() => {
        setOrder(currentOrder => {
            if (currentOrder && currentOrder.status === 'OUT_FOR_DELIVERY') {
                fetchData();
            }
            return currentOrder;
        });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);

  }, [orderId, token]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading your order..." /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
  }

  if (!order || !provider) {
    return <div className="min-h-screen flex items-center justify-center"><p>Could not find order details.</p></div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <BackArrowIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif">
              Track Your Order
            </h1>
            <p className="text-gray-600">From {provider.name}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-xl font-bold text-brand-primary">{statusMessages[order.status]}</p>
            </div>
             <div className="flex-1">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold text-gray-800">#{order.id.slice(-8)}</p>
            </div>
             {order.deliveryPartner && (
                <div className="flex-1">
                    <p className="text-sm text-gray-500">Delivery Partner</p>
                    <p className="font-semibold text-gray-800">{order.deliveryPartner.name} ({order.deliveryPartner.vehicle})</p>
                </div>
             )}
             <div className="flex-1">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {order.status === 'OUT_FOR_DELIVERY' ? (
          <OrderTrackingMap provider={provider} order={order} />
        ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Order Delivered!</h2>
                <p className="text-gray-600 mt-2">We hope you enjoyed your meal.</p>
                <button 
                    onClick={() => navigate('/profile', { openReviewForOrderId: order.id })}
                    className="mt-6 bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors"
                >
                    Leave a Review
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
