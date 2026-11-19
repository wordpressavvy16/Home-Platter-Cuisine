import React from 'react';
import type { MealProvider } from '../types';
import MealProviderCard from './MealProviderCard';

interface ProviderCarouselProps {
    title: string;
    providers: MealProvider[];
    onSelectProvider: (provider: MealProvider) => void;
    icon?: React.ReactNode;
    isAuthenticated?: boolean;
    followedProviderIds?: string[];
    onToggleFollow?: (providerId: string) => void;
}

const ProviderCarousel: React.FC<ProviderCarouselProps> = ({ title, providers, onSelectProvider, icon, isAuthenticated, followedProviderIds, onToggleFollow }) => {

    if (providers.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                {icon}
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-text">
                    {title}
                </h2>
            </div>
            <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-hide items-stretch">
                {providers.map((provider, i) => (
                    <div key={provider.id} className="w-80 md:w-[22rem] flex-shrink-0 animate-slide-in-stagger" style={{'--stagger-delay': `${i * 100}ms`}}>
                        <MealProviderCard 
                            provider={provider} 
                            onSelect={onSelectProvider}
                            isAuthenticated={isAuthenticated}
                            followedProviderIds={followedProviderIds}
                            onToggleFollow={onToggleFollow}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProviderCarousel;