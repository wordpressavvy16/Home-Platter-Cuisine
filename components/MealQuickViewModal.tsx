
import React from 'react';
import ReactDOM from 'react-dom';
import type { Meal } from '../types';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon, VegIcon, NonVegIcon, LeafIcon, GlutenFreeIcon, NutIcon, DairyIcon, ALLERGEN_OPTIONS, DIETARY_OPTIONS } from '../constants';

type AvailableSlot = {
    name: string;
    isPreOrder: boolean;
};

type KitchenAvailability = {
    status: 'OPEN' | 'PRE_ORDER' | 'CLOSED';
    message: string;
    availableSlots: AvailableSlot[];
};

interface MealQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  providerName: string;
  providerId: string;
  kitchenAvailability: KitchenAvailability;
}

const MealQuickViewModal: React.FC<MealQuickViewModalProps> = ({ isOpen, onClose, meal, providerName, providerId, kitchenAvailability }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const modalRoot = document.getElementById('modal-root');
  
  const isDark = theme.name.includes('Dark');
  const glassClasses = isDark ? 'bg-slate-800/60 border border-white/10' : 'bg-white/70 border-white/40';

  if (!isOpen || !modalRoot) return null;

  const TypeIcon = meal.type === 'NON_VEG' ? NonVegIcon : VegIcon;
  const hasDiscount = meal.discountPercentage && meal.discountPercentage > 0;
  const discountedPrice = hasDiscount ? meal.price * (1 - meal.discountPercentage / 100) : meal.price;
  const isAvailable = meal.isAvailable !== false && meal.stockQuantity !== 0;
  const canOrder = isAvailable && kitchenAvailability.status !== 'CLOSED';
  
  const renderTagIcon = (tagId: string, isAllergen: boolean) => {
      const tagInfo = (isAllergen ? ALLERGEN_OPTIONS : DIETARY_OPTIONS).find(opt => opt.id === tagId);
      if (!tagInfo) return null;
      let icon = null;
      switch (tagId) {
          case 'vegan':
          case 'keto':
          case 'low-fat': icon = <LeafIcon className="w-4 h-4 text-green-400" />; break;
          case 'gluten-free': icon = <GlutenFreeIcon className="w-4 h-4 text-yellow-400" />; break;
          case 'nuts': icon = <NutIcon className="w-4 h-4 text-orange-400" />; break;
          case 'dairy': icon = <DairyIcon className="w-4 h-4 text-blue-400" />; break;
          default: return null;
      }
      return <div title={tagInfo.label} className={`p-1.5 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-full flex items-center gap-1.5`}><div className="p-1 bg-background/50 rounded-full">{icon}</div><span className="text-xs font-semibold pr-1">{tagInfo.label}</span></div>;
  };

  const handleAddToCart = () => {
    const firstSlot = kitchenAvailability.availableSlots[0];
    if (canOrder && firstSlot) {
        addToCart(meal, providerId, providerName, firstSlot.name);
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-quick-view-title"
        className={`backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] animate-slide-up ${glassClasses}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white"><XMarkIcon className="w-6 h-6"/></button>
        <div className="w-full md:w-1/2 flex-shrink-0">
            <img src={meal.imageUrl} alt={meal.name} className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" />
        </div>
        <div className="p-6 md:p-8 flex flex-col overflow-y-auto text-text">
            <h2 id="meal-quick-view-title" className="text-3xl font-bold font-serif mb-2 flex items-center gap-3"><TypeIcon /> {meal.name}</h2>
            <p className="text-sm text-text/80 mb-4">from <span className="font-semibold">{providerName}</span></p>
            
            <p className="text-base text-text/90 mb-4 flex-grow">{meal.description}</p>
            
            {(meal.dietaryTags?.length || meal.allergenInfo?.length) ? (
              <div className="mb-4">
                  <h4 className="font-semibold mb-2">Dietary & Allergen Info</h4>
                  <div className="flex flex-wrap items-center gap-2">
                      {meal.dietaryTags?.map(tag => <div key={tag}>{renderTagIcon(tag, false)}</div>)}
                      {meal.allergenInfo?.map(tag => <div key={tag}>{renderTagIcon(tag, true)}</div>)}
                  </div>
              </div>
            ) : null}

            <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center gap-4">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-brand-secondary">₹{discountedPrice.toFixed(0)}</p>
                    {hasDiscount && <p className="text-lg text-text/70 line-through">₹{meal.price}</p>}
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={!canOrder}
                    className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed animate-press"
                >
                    Add to Cart
                </button>
            </div>
             {!isAvailable && <div className="mt-2 text-center bg-gray-700 text-white text-sm font-bold px-3 py-1 rounded-md">CURRENTLY OUT OF STOCK</div>}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default MealQuickViewModal;
