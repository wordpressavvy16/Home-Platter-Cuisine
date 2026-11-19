import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; expiresAt?: string }) => Promise<void>;
}

const QuoteFormModal: React.FC<QuoteFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid quote amount.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        amount,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setAmount(0);
      setExpiresAt('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send quote.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            Send Formal Quote
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700 block mb-2">Total Amount (₹)</label>
            <input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
              required 
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label htmlFor="expiresAt" className="text-sm font-medium text-gray-700 block mb-2">Expiration Date (Optional)</label>
            <input 
              id="expiresAt" 
              type="date" 
              value={expiresAt} 
              onChange={e => setExpiresAt(e.target.value)} 
              min={today}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Sending...' : 'Send Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default QuoteFormModal;