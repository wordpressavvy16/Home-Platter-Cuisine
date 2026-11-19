
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, SparklesIcon } from '../constants';
import type { Review } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as geminiService from '../services/geminiService';
import Loader from './Loader';

interface ReplyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replyText: string) => Promise<void>;
  review: Review;
}

const ReplyFormModal: React.FC<ReplyFormModalProps> = ({ isOpen, onClose, onSubmit, review }) => {
  const { token } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleGenerateSuggestions = async () => {
    if (!token) return;
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setError('');
    try {
        const result = await geminiService.getReviewReplySuggestions(review, token);
        setSuggestions(result);
    } catch (err: any) {
        console.error(err);
        setError("Failed to get suggestions.");
    } finally {
        setIsLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError('Reply cannot be empty.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(replyText);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="reply-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="reply-form-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            Reply to Review
          </h2>
          <button onClick={onClose} aria-label="Close reply form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
            <div className="mb-4 p-3 bg-gray-100 rounded-lg border">
                <p className="text-sm font-semibold text-gray-600">Customer's comment:</p>
                <p className="text-sm text-gray-800 italic">"{review.comment}"</p>
            </div>
            
            <div className="space-y-2 mb-4">
                 <button 
                    type="button" 
                    onClick={handleGenerateSuggestions}
                    disabled={isLoadingSuggestions} 
                    className="w-full flex items-center justify-center gap-2 text-sm border-2 border-brand-primary/50 rounded-lg p-2 text-brand-primary hover:bg-brand-light transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoadingSuggestions ? (
                        <>
                            <Loader text="" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-4 h-4" />
                            AI Assist: Generate Suggestions
                        </>
                    )}
                </button>
                {suggestions.length > 0 && (
                    <div className="flex flex-col gap-2 animate-fade-in">
                        {suggestions.map((s, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => { setReplyText(s); setSuggestions([]); }}
                                className="w-full text-left p-2 border rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="replyText" className="text-sm font-medium text-gray-700 block mb-2">Your public reply</label>
                <textarea
                id="replyText"
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank the customer or address their concerns..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="pt-2">
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400"
                >
                {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default ReplyFormModal;
