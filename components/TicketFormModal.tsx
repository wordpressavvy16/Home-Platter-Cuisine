
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';
import type { TicketCategory } from '../types';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; category: TicketCategory; message: string }) => Promise<void>;
}

const TICKET_CATEGORIES: { id: TicketCategory; label: string }[] = [
    { id: 'ORDER_PROBLEM', label: 'Problem with an Order' },
    { id: 'PAYMENT_ISSUE', label: 'Payment or Billing Issue' },
    { id: 'ACCOUNT_QUESTION', label: 'Account Question' },
    { id: 'TECHNICAL_GLITCH', label: 'Technical Glitch' },
    { id: 'OTHER', label: 'Other' },
];

const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTHER');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ subject, category, message });
      setSubject('');
      setCategory('OTHER');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ticket-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="ticket-form-modal-title" className="text-2xl font-bold text-gray-800 font-serif">Create a Support Ticket</h2>
          <button onClick={onClose} aria-label="Close ticket form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 block mb-2">Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="category" className="text-sm font-medium text-gray-700 block mb-2">Category</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value as TicketCategory)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary bg-white"
            >
              {TICKET_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-2">Describe your issue</label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default TicketFormModal;
