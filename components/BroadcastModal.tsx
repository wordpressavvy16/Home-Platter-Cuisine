
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import * as geminiService from '../services/geminiService';
import { SparklesIcon, XMarkIcon } from '../constants';
import Loader from './Loader';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleAiAssist = async () => {
    if (!message.trim() || !token) {
        setError("Please write a draft message first.");
        return;
    }
    setIsRefining(true);
    setError('');
    try {
        const response = await geminiService.refineBroadcastMessage(message, token);
        setMessage(response.refinedMessage);
    } catch (err: any) {
        setError(err.message || 'AI Assist failed.');
    } finally {
        setIsRefining(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Announcement message cannot be empty.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create Broadcast
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-2">Your Announcement</label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., 'New weekend special: Paneer Tikka Pizza! 20% off on all orders above 500.'"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              maxLength={280}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{280 - message.length} characters remaining</p>
          </div>
          
          <button 
            type="button" 
            onClick={handleAiAssist}
            disabled={isRefining || !message.trim()} 
            className="w-full flex items-center justify-center gap-2 text-sm border-2 border-brand-primary/50 rounded-lg p-2 text-brand-primary hover:bg-brand-light transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isRefining ? (
                <>
                    <Loader text="" />
                    <span>Refining...</span>
                </>
            ) : (
                <>
                    <SparklesIcon className="w-4 h-4" />
                    AI Assist
                </>
            )}
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isRefining}
              className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default BroadcastModal;
