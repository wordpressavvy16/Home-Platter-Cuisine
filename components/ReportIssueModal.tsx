import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';
import type { Order, DisputeReason } from '../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: DisputeReason, message: string) => Promise<void>;
  order: Order;
}

const DISPUTE_REASONS: { id: DisputeReason; label: string }[] = [
    { id: 'QUALITY_ISSUE', label: 'Food Quality Issue' },
    { id: 'WRONG_ITEM', label: 'Received Wrong Item' },
    { id: 'NOT_DELIVERED', label: 'Order Not Delivered' },
    { id: 'OTHER', label: 'Other Issue' },
];

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onSubmit, order }) => {
  const [reason, setReason] = useState<DisputeReason>('QUALITY_ISSUE');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe the issue in detail.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(reason, message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="report-issue-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="report-issue-modal-title" className="text-2xl font-bold text-gray-800 font-serif">Report an Issue</h2>
          <button onClick={onClose} aria-label="Close form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Reporting an issue for Order ID: <span className="font-semibold">{order.id}</span></p>
          <div>
            <label htmlFor="reason" className="text-sm font-medium text-gray-700 block mb-2">What is the issue?</label>
            <select
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value as DisputeReason)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary bg-white"
            >
              {DISPUTE_REASONS.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-2">Please describe the problem in detail</label>
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
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default ReportIssueModal;