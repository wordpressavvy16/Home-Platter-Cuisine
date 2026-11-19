import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MealType, type Meal } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as geminiService from '../services/geminiService';
import { SparklesIcon, DIETARY_OPTIONS, ALLERGEN_OPTIONS } from '../constants';
import Loader from './Loader';


const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ToggleSwitch = ({ isChecked, onChange }: { isChecked: boolean, onChange: (checked: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition ${isChecked ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isChecked ? 'translate-x-4' : ''}`}></div>
        </div>
    </label>
);


interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mealData: Omit<Meal, 'id'> | Meal) => Promise<void>;
  mealToEdit?: Meal | null;
}

const MealFormModal: React.FC<MealFormModalProps> = ({ isOpen, onClose, onSubmit, mealToEdit }) => {
  const { token } = useAuth();
  const [meal, setMeal] = useState<Omit<Meal, 'id'> | Meal>({
    name: '',
    description: '',
    price: 0,
    type: MealType.VEG,
    imageUrl: '',
    discountPercentage: 0,
    category: '',
    stockQuantity: -1, // Default to unlimited
    dietaryTags: [],
    allergenInfo: [],
    isBulkOrderEligible: false,
    bulkOrderConfig: { minQuantity: 10, leadTimeHours: 24 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const defaultState = {
        name: '', description: '', price: 0, type: MealType.VEG, imageUrl: '', discountPercentage: 0, 
        category: '', stockQuantity: -1, dietaryTags: [], allergenInfo: [],
        isBulkOrderEligible: false, bulkOrderConfig: { minQuantity: 10, leadTimeHours: 24 },
    };
    if (mealToEdit) {
      setMeal({ ...defaultState, ...mealToEdit });
    } else {
      setMeal(defaultState);
    }
    setError('');
  }, [mealToEdit, isOpen]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value; // Don't use || 0 to allow empty number field
    setMeal(prev => ({ ...prev, [name]: val }));
  };

  const handleBulkConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value, 10) || 0;
    setMeal(prev => ({
        ...prev,
        bulkOrderConfig: {
            ...(prev.bulkOrderConfig || { minQuantity: 0, leadTimeHours: 0 }),
            [name]: numericValue
        }
    }));
  };
  
  const handleTagChange = (tagType: 'dietaryTags' | 'allergenInfo', tagId: string) => {
    setMeal(prev => {
        const currentTags = prev[tagType] || [];
        const newTags = currentTags.includes(tagId) 
            ? currentTags.filter(id => id !== tagId)
            : [...currentTags, tagId];
        return { ...prev, [tagType]: newTags };
    });
  };

  const handleGenerateDescription = async () => {
    if (!meal.name.trim() || !token) {
        setError("Please enter a meal name first.");
        return;
    }
    setIsGeneratingDesc(true);
    setError('');
    try {
        const result = await geminiService.generateMealDescription(meal.name, meal.type, token);
        setMeal(prev => ({ ...prev, description: result.description }));
    } catch (err: any) {
        setError(err.message || 'Failed to generate description.');
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal.name || meal.price <= 0 || !meal.imageUrl) {
      setError('Please fill out all required fields, including the meal image URL.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
        const stockQuantity = (typeof meal.stockQuantity === 'number' && !isNaN(meal.stockQuantity)) ? meal.stockQuantity : -1;
        const mealDataToSubmit = {
            ...meal,
            stockQuantity,
            discountPercentage: meal.discountPercentage && meal.discountPercentage > 0 ? meal.discountPercentage : undefined,
            category: meal.category?.trim() || undefined,
        };
        if (mealToEdit) {
            await onSubmit(mealDataToSubmit as Meal);
        } else {
            await onSubmit(mealDataToSubmit);
        }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = mealToEdit ? 'Edit Meal' : 'Add New Meal';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="meal-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="meal-form-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{formTitle}</h2>
          <button onClick={onClose} aria-label="Close meal form" className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Meal Name</label>
            <input id="name" name="name" type="text" value={meal.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={!meal.name.trim() || isGeneratingDesc}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-dark transition disabled:text-gray-400"
                >
                    {isGeneratingDesc ? <Loader text="" /> : <SparklesIcon className="w-4 h-4" />}
                    {isGeneratingDesc ? 'Generating...' : 'Auto-generate with AI'}
                </button>
            </div>
            <textarea id="description" name="description" rows={3} value={meal.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-2">Price (₹)</label>
              <input id="price" name="price" type="number" value={meal.price} onChange={handleChange} required min="0" step="10" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium text-gray-700 block mb-2">Meal Type</label>
              <select id="type" name="type" value={meal.type} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary bg-white">
                <option value="VEG">Veg</option>
                <option value="NON_VEG">Non-Veg</option>
                <option value="VEGAN">Vegan</option>
              </select>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="text-sm font-medium text-gray-700 block mb-2">Category</label>
                <input id="category" name="category" type="text" value={meal.category || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="e.g. Main Course"/>
              </div>
              <div>
                <label htmlFor="stockQuantity" className="text-sm font-medium text-gray-700 block mb-2">Stock Quantity</label>
                <input id="stockQuantity" name="stockQuantity" type="number" value={meal.stockQuantity} onChange={handleChange} min="-1" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="-1 for unlimited"/>
                <p className="text-xs text-gray-500 mt-1">Enter -1 for unlimited stock.</p>
              </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 block mb-2">Image URL</label>
            <input id="imageUrl" name="imageUrl" type="url" value={meal.imageUrl} onChange={handleChange} required placeholder="https://example.com/image.jpg" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
           <div>
              <label htmlFor="discountPercentage" className="text-sm font-medium text-gray-700 block mb-2">Discount Percentage (Optional)</label>
              <input id="discountPercentage" name="discountPercentage" type="number" value={meal.discountPercentage || 0} onChange={handleChange} min="0" max="100" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {DIETARY_OPTIONS.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                                <input type="checkbox" checked={meal.dietaryTags?.includes(opt.id)} onChange={() => handleTagChange('dietaryTags', opt.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Allergen Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {ALLERGEN_OPTIONS.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                                <input type="checkbox" checked={meal.allergenInfo?.includes(opt.id)} onChange={() => handleTagChange('allergenInfo', opt.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700">Bulk Order Settings</h4>
                        <p className="text-xs text-gray-500">Allow customers to inquire about this item for parties.</p>
                    </div>
                    <ToggleSwitch 
                        isChecked={meal.isBulkOrderEligible || false}
                        onChange={(checked) => setMeal(prev => ({ ...prev, isBulkOrderEligible: checked }))}
                    />
                </div>
                {meal.isBulkOrderEligible && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border animate-fade-in">
                        <div>
                            <label htmlFor="minQuantity" className="text-xs font-medium text-gray-700 block mb-1">Min. Quantity</label>
                            <input id="minQuantity" name="minQuantity" type="number" value={meal.bulkOrderConfig?.minQuantity || 10} onChange={handleBulkConfigChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label htmlFor="leadTimeHours" className="text-xs font-medium text-gray-700 block mb-1">Lead Time (Hours)</label>
                            <input id="leadTimeHours" name="leadTimeHours" type="number" value={meal.bulkOrderConfig?.leadTimeHours || 24} onChange={handleBulkConfigChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                )}
            </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting || isGeneratingDesc} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default MealFormModal;