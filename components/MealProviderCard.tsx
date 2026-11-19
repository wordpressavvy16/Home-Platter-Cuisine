import React, { useMemo } from 'react';
import type { MealProvider } from '../types';
import { StarIcon, LocationPinIcon, HeartIcon, UsersIcon, ClockIcon, CurrencyDollarIcon, ShieldCheckIcon } from '../constants';
import { useTheme } from '../hooks/useTheme';
import * as analyticsService from '../services/analyticsService';

interface MealProviderCardProps {
  provider: MealProvider;
  onSelect: (provider: MealProvider) => void;
  isAuthenticated?: boolean;
  followedProviderIds?: string[];
  onToggleFollow?: (providerId: string) => void;
}

const MealProviderCard: React.FC<MealProviderCardProps> = ({ provider, onSelect, isAuthenticated, followedProviderIds, onToggleFollow }) => {
  const { theme } = useTheme();
  const isFollowing = followedProviderIds?.includes(provider.id) ?? false;
  const isDark = theme.name.includes('Dark');

  const handleFollowClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFollow?.(provider.id);
      analyticsService.trackEvent(isFollowing ? 'unfollow_provider' : 'follow_provider', {
        providerId: provider.id,
        providerName: provider.name
      });
  };
  
  const cardClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg border ${isDark ? 'border-white/10' : 'border-white/40'}`;

  return (
    <div 
      className={`rounded-xl overflow-hidden transform transition-all duration-300 cursor-pointer group animate-press hover:shadow-2xl hover:-translate-y-1.5 ${cardClasses} flex flex-col h-full`}
      onClick={() => onSelect(provider)}
    >
      <div className="relative overflow-hidden">
        <img className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" src={provider.bannerImageUrl} alt={`${provider.name} banner`} />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute top-0 right-0 p-2">
            {provider.hasMaxSafety && (
                <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <ShieldCheckIcon className="w-4 h-4"/>
                    <span>Max Safety</span>
                </div>
            )}
        </div>
        <div className="absolute bottom-0 left-0 p-4 flex items-center space-x-3">
            <img className="h-14 w-14 rounded-full border-2 border-white/50 shadow-md" src={provider.profileImageUrl} alt={`${provider.chefName} profile`} />
            <div>
                 <h3 className="text-lg font-serif font-bold text-white tracking-wide">{provider.name}</h3>
                 <p className="text-sm text-gray-200">by {provider.chefName}</p>
            </div>
        </div>
        {isAuthenticated && onToggleFollow && (
          <button 
            onClick={handleFollowClick}
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full p-2 hover:bg-black/50 transition-colors"
            aria-label={isFollowing ? 'Unfollow this kitchen' : 'Follow this kitchen'}
          >
            <HeartIcon 
              className={`w-5 h-5 transition-all ${isFollowing ? 'text-red-500' : 'text-gray-200'}`} 
              isFilled={isFollowing} 
            />
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
            <p className="text-text/80 text-sm mb-4 line-clamp-2">{provider.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-text/90 mb-3">
                <div className={`flex items-center gap-1 ${isDark ? 'bg-yellow-400/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} font-semibold py-1 px-2 rounded-full`}>
                    <StarIcon className="w-4 h-4" />
                    <span>{provider.rating.toFixed(1)}</span>
                </div>
                <div className={`flex items-center gap-1 ${isDark ? 'bg-sky-400/20 text-sky-300' : 'bg-sky-100 text-sky-800'} font-semibold py-1 px-2 rounded-full`}>
                    <span>{provider.cuisine}</span>
                </div>
                 <div className={`flex items-center gap-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} py-1 px-2 rounded-full`}>
                    <LocationPinIcon className="w-4 h-4" />
                    <span>{provider.address}</span>
                </div>
            </div>
            {/* New Info Row */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'} py-2`}>
                {provider.deliveryTime && (
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{provider.deliveryTime}</span>
                    </div>
                )}
                 {provider.avgCostForTwo && (
                    <div className="flex items-center gap-1.5">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>₹{provider.avgCostForTwo} for two</span>
                    </div>
                )}
            </div>
        </div>
        <div className="min-h-[2.5rem] flex items-end">
            {provider.cateringEnabled && provider.cateringGuestCapacity && (
                <div className={`w-full mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'} text-xs text-text/80 font-semibold flex items-center gap-2`}>
                    <UsersIcon className="w-4 h-4 text-brand-primary" />
                    <span>Cateters for {provider.cateringGuestCapacity.min} to {provider.cateringGuestCapacity.max} guests</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MealProviderCard;