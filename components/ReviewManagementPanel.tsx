import React, { useState, useEffect, useCallback } from 'react';
import * as providerApi from '../api/providerApi';
import type { MealProvider, Review } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import ReviewCard from './ReviewCard';
import ReplyFormModal from './ReplyFormModal';
import { FeedbackIcon } from '../constants';

interface ReviewManagementPanelProps {
    providerId: string;
}

const ReviewManagementPanel: React.FC<ReviewManagementPanelProps> = ({ providerId }) => {
    const { token } = useAuth();
    const [provider, setProvider] = useState<MealProvider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewToReply, setReviewToReply] = useState<Review | null>(null);

    const fetchProviderData = useCallback(() => {
        if (token) {
            setIsLoading(true);
            providerApi.getProviderById(providerId)
                .then(setProvider)
                .catch(err => {
                    console.error(err);
                    setError("Failed to fetch reviews.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            setError("Authentication token not found.");
        }
    }, [providerId, token]);

    useEffect(() => {
        fetchProviderData();
    }, [fetchProviderData]);
    
    const handleOpenModal = (review: Review) => {
        setReviewToReply(review);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setReviewToReply(null);
        setIsModalOpen(false);
    };

    const handleReplySubmit = async (replyText: string) => {
        if (!token || !reviewToReply) return;
        try {
            await providerApi.addReplyToReview(providerId, reviewToReply.id, replyText, token);
            fetchProviderData(); // Refresh data to show the new reply
        } catch (err) {
            console.error("Failed to submit reply:", err);
            alert("Failed to submit reply. Please try again.");
            throw err; // re-throw to keep modal open on error
        }
    };

    const reviews = provider?.reviews.slice().reverse() || [];

    return (
        <>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FeedbackIcon className="w-8 h-8 text-brand-secondary"/>
                    <h2 className="text-2xl font-bold text-text">Customer Feedback</h2>
                </div>
                {isLoading ? (
                    <div className="py-8"><Loader text="Loading reviews..."/></div>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : reviews.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {reviews.map(review => (
                            <div key={review.id}>
                                <ReviewCard review={review} />
                                {!review.providerReply && (
                                    <div className="text-right -mt-2 mr-2">
                                        <button 
                                            onClick={() => handleOpenModal(review)}
                                            className="bg-brand-primary text-white font-semibold py-1.5 px-4 rounded-b-lg hover:bg-brand-dark transition text-sm shadow-md"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-text/70 font-semibold">No reviews found yet.</p>
                    </div>
                )}
            </div>

            {isModalOpen && reviewToReply && (
                 <ReplyFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleReplySubmit}
                    review={reviewToReply}
                />
            )}
        </>
    );
};

export default ReviewManagementPanel;