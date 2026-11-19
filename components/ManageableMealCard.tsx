import React from 'react';
import type { Meal } from '../types';
import { VegIcon, NonVegIcon, PencilIcon, TrashIcon, StarIcon, BookmarkIcon } from '../constants';

interface ManageableMealCardProps {
    meal: Meal;
    onEdit: (meal: Meal) => void;
    onRemove: (mealId: string) => void;
    onUpdateMeal: (updatedMeal: Meal) => void;
    onAddToCollection: (meal: Meal) => void;
}

const ToggleSwitch = ({ label, isChecked, onChange, disabled = false }: { label: string, isChecked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-10 h-6 rounded-full transition ${isChecked ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isChecked ? 'translate-x-4' : ''}`}></div>
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);

const ManageableMealCard: React.FC<ManageableMealCardProps> = ({ meal, onEdit, onRemove, onUpdateMeal, onAddToCollection }) => {
    const TypeIcon = meal.type === 'NON_VEG' ? NonVegIcon : VegIcon;
    const hasDiscount = meal.discountPercentage && meal.discountPercentage > 0;
    const discountedPrice = hasDiscount ? meal.price * (1 - meal.discountPercentage / 100) : meal.price;

    const isVisible = meal.isVisible !== false; // Default to visible
    const isAvailable = meal.isAvailable !== false; // Default to available

    const handleVisibilityChange = (checked: boolean) => {
        onUpdateMeal({ ...meal, isVisible: checked });
    };

    const handleAvailabilityChange = (checked: boolean) => {
        onUpdateMeal({ ...meal, isAvailable: checked });
    };
    
    const handleFeatureToggle = () => {
        onUpdateMeal({ ...meal, isFeatured: !meal.isFeatured });
    };

    const handleRemove = () => {
        if (window.confirm("Are you sure you want to permanently delete this meal? This action cannot be undone.")) {
            onRemove(meal.id);
        }
    };

    const stockText = meal.stockQuantity === -1 ? 'Unlimited' : `${meal.stockQuantity} in stock`;
    const stockColor = meal.stockQuantity === 0 ? 'text-red-600' : meal.stockQuantity! > 0 && meal.stockQuantity! <= 5 ? 'text-orange-600' : 'text-gray-600';


    return (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 transition ${meal.isFeatured ? 'border-yellow-400' : 'border-gray-200'} ${!isVisible ? 'bg-gray-100 opacity-70' : ''}`}>
            <div className="flex flex-col md:flex-row items-start p-4 gap-4 relative">
                {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                        {meal.discountPercentage}% OFF
                    </div>
                )}
                <img src={meal.imageUrl} alt={meal.name} className="w-full md:w-32 h-32 object-cover rounded-md" />
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeIcon />
                        <h3 className="text-lg font-semibold text-gray-800">{meal.name}</h3>
                        {meal.isBulkOrderEligible && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">BULK</span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{meal.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-baseline gap-4">
                            <div className="flex items-baseline gap-2">
                                <p className="text-lg font-bold text-brand-secondary">₹{discountedPrice.toFixed(0)}</p>
                                {hasDiscount && (
                                    <p className="text-sm text-gray-500 line-through">₹{meal.price}</p>
                                )}
                            </div>
                            <span className={`text-sm font-semibold ${stockColor}`}>{stockText}</span>
                        </div>
                        <div className="flex gap-1">
                             <button 
                                onClick={() => onAddToCollection(meal)}
                                title="Add to collection"
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-brand-primary"/>
                            </button>
                             <button 
                                onClick={handleFeatureToggle}
                                title={meal.isFeatured ? "Un-feature this meal" : "Feature this meal"}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <StarIcon className={`w-5 h-5 ${meal.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}/>
                            </button>
                            <button 
                                onClick={() => onEdit(meal)}
                                className="flex items-center gap-1.5 bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                            </button>
                            <button 
                                onClick={handleRemove}
                                className="flex items-center gap-1.5 bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-3 border-t flex justify-end items-center gap-4">
                 <ToggleSwitch label="In Stock" isChecked={isAvailable} onChange={handleAvailabilityChange} disabled={!isVisible} />
                 <ToggleSwitch label="Visible" isChecked={isVisible} onChange={handleVisibilityChange} />
            </div>
        </div>
    );
};

export default ManageableMealCard;