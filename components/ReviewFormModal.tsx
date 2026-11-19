
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { StarIcon } from '../constants';

const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  providerName: string;
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({ isOpen, onClose, onSubmit, providerName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="review-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Write a Review
          </h2>
          <button onClick={onClose} aria-label="Close review form" className="p-2 rounded-full hover:bg-gray-200">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-gray-600">How was your experience with <span className="font-bold">{providerName}</span>?</p>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Your Rating</label>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    type="button"
                    key={starValue}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onClick={() => setRating(starValue)}
                    aria-label={`Rate ${starValue} out of 5 stars`}
                  >
                    <StarIcon
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="text-sm font-medium text-gray-700 block mb-2">Your Comments (Optional)</label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default ReviewFormModal;
