import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon } from '../constants';
import * as analyticsService from '../services/analyticsService';

interface FeedbackButtonsProps {
  featureName: string;
  details?: Record<string, any>;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ featureName, details }) => {
  const [feedback, setFeedback] = useState<'idle' | 'positive' | 'negative'>('idle');

  const handleFeedback = (rating: 'positive' | 'negative') => {
    if (feedback !== 'idle') return; // Prevent multiple submissions

    setFeedback(rating);
    analyticsService.trackEvent('ai_feedback_received', {
      feature: featureName,
      rating: rating,
      ...details,
    });
  };

  if (feedback !== 'idle') {
    return (
      <p className="text-xs font-semibold text-green-600 animate-fade-in">
        Thank you for your feedback!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-gray-500">Was this helpful?</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFeedback('positive')}
          className="p-1 text-gray-400 hover:text-green-500 transition-colors rounded-full hover:bg-green-100"
          aria-label="Helpful"
        >
          <ThumbsUpIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleFeedback('negative')}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-100"
          aria-label="Not helpful"
        >
          <ThumbsDownIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FeedbackButtons;