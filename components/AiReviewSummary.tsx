import React, { useState, useEffect } from 'react';
import { analyzeReviews } from '../services/geminiService';
import type { Review, AnalysisResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { ThumbsUpIcon, LightbulbIcon, UserIcon, MIN_REVIEWS_FOR_SUMMARY } from '../constants';
import FeedbackButtons from './FeedbackButtons';

interface AiReviewSummaryProps {
  reviews: Review[];
}

const AiReviewSummary: React.FC<AiReviewSummaryProps> = ({ reviews }) => {
  const { token, isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const performAnalysis = async () => {
      // Only run if authenticated and enough reviews exist
      if (!token || reviews.length < MIN_REVIEWS_FOR_SUMMARY) {
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const result = await analyzeReviews(reviews, token);
        setAnalysis(result);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during analysis.');
        console.error("AI Analysis failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    performAnalysis();
  }, [reviews, token]); // Re-run if reviews or auth state changes

  // Not enough reviews
  if (reviews.length < MIN_REVIEWS_FOR_SUMMARY) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600">Not enough reviews yet.</p>
        <p className="text-gray-500">An AI summary will be available once this kitchen receives more feedback.</p>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
     return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
        <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
        <p className="text-lg font-semibold text-gray-700">Log in to view the AI-powered summary</p>
        <p className="text-gray-500">Get instant insights from customer feedback.</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="py-8">
        <Loader text="Analyzing reviews... this may take a moment." />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 text-red-700 rounded-lg">
          <p>Could not generate summary.</p>
          <p className="text-sm">{error}</p>
      </div>
    );
  }

  // Success state
  if (analysis) {
    return (
      <div className="bg-brand-light p-6 rounded-lg animate-fade-in border border-brand-primary/20">
         <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg text-brand-dark mb-2">Overall Sentiment</h3>
                <p className="text-gray-700 italic">"{analysis.overallSentiment}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                       <ThumbsUpIcon className="w-6 h-6 text-green-600" />
                       <h3 className="font-bold text-lg text-gray-800">Strengths</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                     <div className="flex items-center gap-2 mb-2">
                       <LightbulbIcon className="w-6 h-6 text-yellow-500" />
                       <h3 className="font-bold text-lg text-gray-800">Areas for Improvement</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {analysis.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-primary/20">
                <FeedbackButtons featureName="ai_review_summary" />
            </div>
        </div>
      </div>
    );
  }
  
  // Default case (should not be reached if logic is correct)
  return null;
};

export default AiReviewSummary;