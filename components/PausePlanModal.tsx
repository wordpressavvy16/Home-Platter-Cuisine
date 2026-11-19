import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';
import type { SubscriptionOrder } from '../types';
import * as orderApi from '../api/orderApi';
import { useAuth } from '../hooks/useAuth';

interface PausePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionOrder;
  onUpdate: () => void;
}

const PausePlanModal: React.FC<PausePlanModalProps> = ({ isOpen, onClose, subscription, onUpdate }) => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !token) {
      setError('Please select both a start and end date.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('The end date must be after the start date.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await orderApi.pauseSubscription(subscription.id, startDate, endDate, token);
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to pause subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minStartDate = new Date();
  minStartDate.setDate(minStartDate.getDate() + 1); // Cannot pause starting today
  const minStartDateString = minStartDate.toISOString().split('T')[0];
  
  const minEndDate = new Date(startDate);
  minEndDate.setDate(minEndDate.getDate() + 2); // Must pause for at least one full day
  const minEndDateString = minEndDate.toISOString().split('T')[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Pause Your Tiffin Plan</h2>
          <button onClick={onClose} aria-label="Close pause form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Going on vacation? Pause your plan, and we'll extend the end date accordingly. You won't be charged for the pause duration.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700 block mb-1">Pause From</label>
              <input 
                id="startDate" 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required 
                min={minStartDateString}
                className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700 block mb-1">Resume On</label>
              <input 
                id="endDate" 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                required 
                min={startDate ? minEndDateString : ''}
                disabled={!startDate}
                className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Pausing...' : 'Confirm Pause'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default PausePlanModal;