import React from 'react';
import type { Collection, Meal } from '../types';
import { BookmarkIcon } from '../constants';
import { useTheme } from '../hooks/useTheme';

interface CollectionCardProps {
    collection: Collection & { mealPreviews?: Meal[] };
    onSelect: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onSelect }) => {
    const { theme } = useTheme();
    const { name, description, mealIds, creatorName, mealPreviews = [] } = collection;
    const itemCount = mealIds.length;
    const isDark = theme.name.includes('Dark');
    const cardClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg border ${isDark ? 'border-white/10' : 'border-white/40'}`;

    return (
        <div 
            onClick={onSelect}
            className={`rounded-xl overflow-hidden transform hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full ${cardClasses}`}
        >
            <div className="relative p-4">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mealPreviews.slice(0, 4).map((meal, index) => (
                        <div key={index} className="overflow-hidden">
                            <img 
                                src={meal.imageUrl} 
                                alt={meal.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    ))}
                    {itemCount > 4 && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">+{itemCount - 4}</span>
                        </div>
                    )}
                     {itemCount === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BookmarkIcon className="w-16 h-16 text-text/10" isFilled={false}/>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 pt-0 flex-grow flex flex-col">
                <h3 className="text-lg font-serif font-bold text-text tracking-wide truncate group-hover:text-brand-primary transition-colors">{name}</h3>
                <p className="text-sm text-text/70 mb-2">
                    by {creatorName}
                </p>
                <div className="flex-grow">
                    <p className="text-sm text-text/80 line-clamp-2">{description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-text/70 mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                    <BookmarkIcon className="w-4 h-4" isFilled={true} />
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default CollectionCard;