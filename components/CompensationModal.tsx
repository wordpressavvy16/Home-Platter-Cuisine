import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/adminApi';
import type { Order } from '../types';
import { XMarkIcon } from '../constants';

interface CompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onCompensationSent: () => void;
}

const CompensationModal: React.FC<CompensationModalProps> = ({ isOpen, onClose, order, onCompensationSent }) => {
  const { token } = useAuth();
  const [discountPercentage, setDiscountPercentage] = useState(25);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (discountPercentage <= 0 || !expiresAt || !token) {
      setError('Please set a valid discount and expiration date.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await adminApi.issueCompensationCoupon({
        orderId: order.id,
        customerId: order.userId,
        discountPercentage,
        expiresAt: new Date(expiresAt).toISOString(),
      }, token);
      onCompensationSent();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send compensation.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const today = new Date();
  today.setDate(today.getDate() + 1); // Expiry must be at least tomorrow
  const minExpiryDate = today.toISOString().split('T')[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="compensation-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="compensation-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            Send Compensation
          </h2>
          <button onClick={onClose} aria-label="Close compensation form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600">Send a platform-funded, single-use coupon to <span className="font-bold">{order.customerName}</span> as a resolution for their issue with Order #{order.id.slice(-6)}.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discountPercentage" className="text-sm font-medium text-gray-700 block mb-2">Discount (%)</label>
              <input 
                id="discountPercentage" 
                type="number" 
                value={discountPercentage} 
                onChange={e => setDiscountPercentage(parseInt(e.target.value, 10) || 0)} 
                required 
                min="1" 
                max="100" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div>
              <label htmlFor="expiresAt" className="text-sm font-medium text-gray-700 block mb-2">Expires On</label>
              <input 
                id="expiresAt" 
                type="date" 
                value={expiresAt} 
                onChange={e => setExpiresAt(e.target.value)} 
                required 
                min={minExpiryDate}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Sending...' : 'Send Coupon & Resolve Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default CompensationModal;