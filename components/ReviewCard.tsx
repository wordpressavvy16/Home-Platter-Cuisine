import React from 'react';
import type { Review } from '../types';
import { StarIcon, ShieldCheckIcon } from '../constants';

interface ReviewCardProps {
  review: Review;
}

// FIX: Changed component definition to use React.FC for better prop type handling, resolving an issue where the 'key' prop was incorrectly being assigned.
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold text-xl flex-shrink-0">
          {review.author.charAt(0)}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800">{review.author}</h4>
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
           {review.isVerifiedPurchase && (
             <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-green-700">Verified Purchase</p>
             </div>
          )}
          <p className="text-gray-600 mt-1">{review.comment}</p>
        </div>
      </div>
      {review.providerReply && (
          <div className="mt-4 pt-4 border-t border-dashed ml-16">
              <h5 className="font-bold text-sm text-gray-700 mb-1">Reply from the Chef:</h5>
              <p className="text-gray-600 text-sm italic">"{review.providerReply.text}"</p>
          </div>
      )}
    </div>
  );
};

export default ReviewCard;