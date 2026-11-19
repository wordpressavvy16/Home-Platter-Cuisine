import React, { useState, useCallback } from 'react';
import { analyzeReviews } from '../services/geminiService';
import type { Review, AnalysisResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { FeedbackIcon, ThumbsUpIcon, LightbulbIcon } from '../constants';

interface FeedbackPanelProps {
  reviews: Review[];
  title?: string;
  subtitle?: string;
  minReviews?: number;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ 
  reviews, 
  title = "AI Feedback Analysis",
  subtitle = "Get instant insights from your customer reviews.",
  minReviews = 2
}) => {
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!token) {
        setError("Authentication required to perform analysis.");
        return;
    }
    if (!reviews) {
        setError("No review data available to analyze.");
        return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const result = await analyzeReviews(reviews, token);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [reviews, token]);

  const hasEnoughReviews = reviews && reviews.length >= minReviews;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-indigo-100 p-3 rounded-full">
            <FeedbackIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      {analysis || isLoading || error ? (
         <div className="mt-4 p-4 border-t">
          {isLoading && <Loader text="Analyzing feedback... this may take a moment." />}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {analysis && (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h3 className="font-bold text-lg text-gray-700 mb-2">Overall Sentiment</h3>
                    <p className="text-gray-600 italic">"{analysis.overallSentiment}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <ThumbsUpIcon className="w-6 h-6 text-green-500" />
                           <h3 className="font-bold text-lg text-gray-700">Strengths</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-2">
                           <LightbulbIcon className="w-6 h-6 text-yellow-500" />
                           <h3 className="font-bold text-lg text-gray-700">Areas for Improvement</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {analysis.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <button 
                        onClick={() => setAnalysis(null)}
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                        Analyze Again
                    </button>
                </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg mt-4">
            <p className="text-gray-700">{reviews?.length || 0} review{reviews?.length !== 1 && 's'} available to analyze.</p>
            <button 
                onClick={handleAnalyze}
                disabled={!hasEnoughReviews || !token}
                className="mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {hasEnoughReviews ? 'Analyze Reviews' : `Need at least ${minReviews} review${minReviews > 1 ? 's' : ''}`}
            </button>
      </div>
      )}

    </div>
  );
};

export default FeedbackPanel;