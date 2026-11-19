import React, { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import type { FlaggedReview } from '../api/adminApi';
import Loader from './Loader';
import { ShieldExclamationIcon, StarIcon } from '../constants';
import ReviewCard from './ReviewCard';

const ReviewModerationPanel = () => {
    const { token } = useAuth();
    const [flaggedReviews, setFlaggedReviews] = useState<adminApi.FlaggedReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFlaggedReviews = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await adminApi.getFlaggedReviews(token);
            setFlaggedReviews(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchFlaggedReviews();
    }, [fetchFlaggedReviews]);

    const handleResolve = async (providerId: string, reviewId: string, action: 'dismiss' | 'delete') => {
        if (!token) return;
        
        if (action === 'delete' && !window.confirm("Are you sure you want to permanently delete this review?")) {
            return;
        }

        // Optimistic update
        setFlaggedReviews(prev => prev.filter(item => item.review.id !== reviewId));

        try {
            await adminApi.resolveReviewFlag(providerId, reviewId, action, token);
        } catch (err) {
            alert(`Failed to ${action} review. Please try again.`);
            fetchFlaggedReviews(); // Revert on failure
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <ShieldExclamationIcon className="w-8 h-8 text-yellow-500" />
                <div>
                    <h2 className="text-2xl font-bold text-text">Review Moderation Queue</h2>
                    <p className="text-text/70">Manage user-flagged reviews.</p>
                </div>
            </div>
            {isLoading ? (
                <Loader text="Loading flagged reviews..." />
            ) : error ? (
                <p className="text-red-500 text-center py-8">{error}</p>
            ) : flaggedReviews.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {flaggedReviews.map(({ review, providerId, providerName }) => (
                        <div key={review.id} className="p-4 border rounded-lg bg-yellow-50/50">
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                                Review for: <span className="font-bold text-brand-dark">{providerName}</span>
                            </p>
                            <ReviewCard review={review} />
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                                <button onClick={() => handleResolve(providerId, review.id, 'dismiss')} className="text-sm font-semibold bg-blue-500 text-white py-1.5 px-3 rounded-md hover:bg-blue-600">Dismiss Flag</button>
                                <button onClick={() => handleResolve(providerId, review.id, 'delete')} className="text-sm font-semibold bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700">Delete Review</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-text/70 font-semibold">The moderation queue is empty.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewModerationPanel;