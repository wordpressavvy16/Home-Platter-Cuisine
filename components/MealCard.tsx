

import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed import for MealType to be a value import instead of a type-only import.
import { MealType, type Meal, type Collection } from '../types';
import { VegIcon, NonVegIcon, StarIcon, HeartIcon, LeafIcon, GlutenFreeIcon, NutIcon, DairyIcon, DIETARY_OPTIONS, ALLERGEN_OPTIONS, BookmarkIcon, EyeIcon } from '../constants';
import { useCart } from '../hooks/useCart';
import AddToCollectionModal from './AddToCollectionModal';
import { useTheme } from '../hooks/useTheme';
import * as analyticsService from '../services/analyticsService';
import MealQuickViewModal from './MealQuickViewModal';

// Define the type for the kitchen availability object
type AvailableSlot = {
    name: string;
    isPreOrder: boolean;
};

type KitchenAvailability = {
    status: 'OPEN' | 'PRE_ORDER' | 'CLOSED';
    message: string;
    availableSlots: AvailableSlot[];
}

interface MealCardProps {
  meal: Meal;
  providerId: string;
  providerName: string;
  kitchenAvailability: KitchenAvailability;
  isAuthenticated?: boolean;
  wishlistMealIds?: string[];
  collections?: Collection[];
  onToggleWishlist?: (mealId: string) => void;
  onUpdateCollections?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, providerId, providerName, kitchenAvailability, isAuthenticated, wishlistMealIds, collections, onToggleWishlist, onUpdateCollections }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSlotSelectorOpen, setIsSlotSelectorOpen] = useState(false);
  const slotSelectorRef = useRef<HTMLDivElement>(null);
  
  const isDark = theme.name.includes('Dark');
  const cardClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl border ${isDark ? 'border-white/10' : 'border-white/40'}`;

  const TypeIcon = meal.type === MealType.NON_VEG ? NonVegIcon : VegIcon;
  const hasDiscount = meal.discountPercentage && meal.discountPercentage > 0;
  const discountedPrice = hasDiscount ? meal.price * (1 - meal.discountPercentage / 100) : meal.price;
  
  const isMealAvailable = meal.isVisible !== false && meal.isAvailable !== false && meal.stockQuantity !== 0;
  const isSoldOut = meal.stockQuantity === 0;
  const isLowStock = meal.stockQuantity !== -1 && meal.stockQuantity! > 0 && meal.stockQuantity! <= 5;
  
  const canOrder = isMealAvailable && kitchenAvailability.status !== 'CLOSED';
  const isWishlisted = wishlistMealIds?.includes(meal.id) ?? false;
  const isInAnyCollection = collections?.some(c => c.mealIds.includes(meal.id)) ?? false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (slotSelectorRef.current && !slotSelectorRef.current.contains(event.target as Node)) {
        setIsSlotSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, deliveryWindow: string) => {
    e.stopPropagation();
    addToCart(meal, providerId, providerName, deliveryWindow);
    setIsSlotSelectorOpen(false);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(meal.id);
    analyticsService.trackEvent(isWishlisted ? 'remove_from_wishlist' : 'add_to_wishlist', {
      mealId: meal.id,
      mealName: meal.name,
    });
  };
  
  const handleCollectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated && collections) setIsCollectionModalOpen(true);
  };
  
  const renderTagIcon = (tagId: string, isAllergen: boolean) => {
      const tagInfo = (isAllergen ? ALLERGEN_OPTIONS : DIETARY_OPTIONS).find(opt => opt.id === tagId);
      if (!tagInfo) return null;
      let icon = null;
      switch (tagId) {
          case 'vegan':
          case 'keto':
          case 'low-fat':
              icon = <LeafIcon className="w-4 h-4 text-green-600" />;
              break;
          case 'gluten-free':
              icon = <GlutenFreeIcon className="w-4 h-4 text-orange-600" />;
              break;
          case 'nuts':
              icon = <NutIcon className="w-4 h-4 text-yellow-700" />;
              break;
          case 'dairy':
              icon = <DairyIcon className="w-4 h-4 text-blue-500" />;
              break;
          default: return null;
      }
      return <div title={tagInfo.description} className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'bg-slate-700' : 'bg-gray-100'} px-2 py-1 rounded-full border ${isDark ? 'border-white/10' : 'border-black/5'}`}>{icon}<span>{tagInfo.label}</span></div>;
  };

  const renderOrderButton = () => {
    if (!canOrder) {
      return <button disabled className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed">Unavailable</button>;
    }

    const slots = kitchenAvailability.availableSlots;
    
    if (slots.length === 1) {
      const slot = slots[0];
      return <button onClick={(e) => handleAddToCart(e, slot.name)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 animate-press">{slot.isPreOrder ? 'Pre-order for' : 'Add for'} {slot.name}</button>;
    }

    if (slots.length > 1) {
        return (
            <div className="relative" ref={slotSelectorRef}>
                <button onClick={() => setIsSlotSelectorOpen(prev => !prev)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 animate-press flex items-center gap-2">
                    Pre-order for...
                    <svg className={`w-4 h-4 transition-transform ${isSlotSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isSlotSelectorOpen && (
                    <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg py-1 z-20 animate-fade-in-very-fast ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-md`}>
                        {slots.map(slot => (
                            <button key={slot.name} onClick={(e) => handleAddToCart(e, slot.name)} className="block w-full text-left px-4 py-2 text-sm text-text hover:bg-black/10 dark:hover:bg-white/10">
                                {slot.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    return <button disabled className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed">Closed</button>;
  }

  return (
    <>
      <div onClick={() => setIsQuickViewOpen(true)} className={`cursor-pointer group rounded-lg overflow-hidden flex flex-col md:flex-row items-start p-4 gap-4 relative transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl ${cardClasses} ${!canOrder ? 'opacity-60' : ''}`}>
        <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-md overflow-hidden relative">
            <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            
            {/* --- BADGE LOGIC --- */}
            <div className="absolute top-0 left-0 z-10">
                {isSoldOut ? (
                    <div className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-br-lg">SOLD OUT</div>
                ) : isLowStock ? (
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">LOW STOCK</div>
                ) : (
                    (meal.isFeatured || hasDiscount) && (
                        <div className="flex items-center shadow-md">
                            {meal.isFeatured && (
                                <div className={`bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 flex items-center gap-1 ${!hasDiscount ? 'rounded-br-lg' : ''}`}>
                                    <StarIcon className="w-3 h-3" />
                                    <span>Chef's Special</span>
                                </div>
                            )}
                            {hasDiscount && (
                                <div className={`bg-red-600 text-white text-xs font-bold px-3 py-1 ${meal.isFeatured ? 'rounded-r-lg' : 'rounded-br-lg'}`}>
                                    {meal.discountPercentage}% OFF
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
        <div className="flex-grow text-text flex flex-col h-full">
          <div className="flex items-center gap-2 mb-1">
              <TypeIcon />
              <h3 className="text-lg font-semibold flex-grow">{meal.name}</h3>
              {isAuthenticated && (
                  <div className="flex items-center flex-shrink-0">
                      <button onClick={handleCollectionClick} className="p-1 text-text/60 hover:text-brand-primary transition-colors" aria-label="Add to a collection" title="Add to a collection"><BookmarkIcon className="w-6 h-6" isFilled={isInAnyCollection} /></button>
                      <button onClick={handleWishlistClick} className="p-1 text-text/60 hover:text-red-500 transition-colors" aria-label="Add to wishlist" title="Add to wishlist"><HeartIcon className="w-6 h-6" isFilled={isWishlisted} /></button>
                  </div>
              )}
          </div>
          <p className="text-text/80 text-sm mb-2 line-clamp-2 flex-grow">{meal.description}</p>
          <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[2rem]">{meal.dietaryTags?.map(tag => <div key={tag}>{renderTagIcon(tag, false)}</div>)}{meal.allergenInfo?.map(tag => <div key={tag}>{renderTagIcon(tag, true)}</div>)}</div>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
               <p className="text-lg font-bold text-brand-secondary">₹{discountedPrice.toFixed(0)}</p>
               {hasDiscount && <p className="text-sm text-text/70 line-through">₹{meal.price}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setIsQuickViewOpen(true); }} className={`p-2 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed animate-press ${isDark ? 'bg-slate-700 hover:bg-slate-600 border border-white/10' : 'bg-white/80 hover:bg-white border border-black/10'}`} aria-label="Quick View">
                <EyeIcon className="w-5 h-5" />
              </button>
              {renderOrderButton()}
            </div>
          </div>
        </div>
      </div>
      {isQuickViewOpen && (
        <MealQuickViewModal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} meal={meal} providerId={providerId} providerName={providerName} kitchenAvailability={kitchenAvailability} />
      )}
      {isCollectionModalOpen && collections && (<AddToCollectionModal isOpen={isCollectionModalOpen} onClose={() => setIsCollectionModalOpen(false)} meal={meal} collections={collections} onUpdate={onUpdateCollections}/>)}
    </>
  );
};

export default MealCard;
