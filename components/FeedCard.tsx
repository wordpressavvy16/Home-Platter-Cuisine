import React from 'react';
import type { FeedItem, MealProvider } from '../types';
import { MegaphoneIcon, StarIcon } from '../constants';
import MealCard from './MealCard'; // Re-use for consistent meal display

interface FeedCardProps {
  item: FeedItem;
  onSelectProvider: (provider: { id: string }) => void; // Simplified provider data for nav
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const FeedCard: React.FC<FeedCardProps> = ({ item, onSelectProvider }) => {
  const { providerId, providerName, providerProfileImageUrl, timestamp, type, content } = item;

  const renderContent = () => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return (
          <div className="p-4 bg-blue-50 border-t">
            <div className="flex items-start gap-3">
              <MegaphoneIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-blue-800">New Announcement</p>
                <p className="text-gray-700">{content.message}</p>
              </div>
            </div>
          </div>
        );
      case 'FEATURED_MEAL':
        if (!content.meal) return null;
        return (
           <div className="p-4 bg-yellow-50 border-t">
             <div className="flex items-start gap-3 mb-3">
                <StarIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-yellow-800">New Featured Meal!</p>
                  <p className="text-sm text-gray-600">{providerName} is highlighting a new special.</p>
                </div>
            </div>
            {/* Using a simplified meal display */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex items-start p-3 gap-3 border border-gray-200">
                <img src={content.meal.imageUrl} alt={content.meal.name} className="w-24 h-24 object-cover rounded-md" />
                <div className="flex-grow">
                    <h3 className="text-md font-semibold text-gray-800">{content.meal.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{content.meal.description}</p>
                    <p className="text-lg font-bold text-brand-secondary">₹{content.meal.price.toFixed(0)}</p>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border animate-slide-up">
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={providerProfileImageUrl}
          alt={providerName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-grow">
          <button
            onClick={() => onSelectProvider({ id: providerId })}
            className="font-bold text-gray-800 hover:underline text-left"
          >
            {providerName}
          </button>
          <p className="text-sm text-gray-500">{timeSince(timestamp)}</p>
        </div>
      </div>

      {/* Card Content */}
      {renderContent()}
    </div>
  );
};

export default FeedCard;