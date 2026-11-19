
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { Coupon } from '../types';
import { XMarkIcon } from '../constants';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (couponData: Omit<Coupon, 'id' | 'providerId' | 'isActive'>) => Promise<void>;
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountPercentage <= 0 || !expiresAt) {
      setError('Please fill out all fields correctly.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        code,
        discountPercentage,
        expiresAt: new Date(expiresAt).toISOString(),
      });
      setCode('');
      setDiscountPercentage(10);
      setExpiresAt('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="coupon-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="coupon-form-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create New Coupon
          </h2>
          <button onClick={onClose} aria-label="Close coupon form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="code" className="text-sm font-medium text-gray-700 block mb-2">Coupon Code</label>
            <input 
              id="code" 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())} 
              required 
              placeholder="e.g., WELCOME15"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
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
              <label htmlFor="expiresAt" className="text-sm font-medium text-gray-700 block mb-2">Expiration Date</label>
              <input 
                id="expiresAt" 
                type="date" 
                value={expiresAt} 
                onChange={e => setExpiresAt(e.target.value)} 
                required 
                min={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default CouponFormModal;
