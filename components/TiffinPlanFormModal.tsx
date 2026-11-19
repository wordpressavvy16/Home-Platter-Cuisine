import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { TiffinPlan, SampleMenu } from '../types';
import { XMarkIcon } from '../constants';

interface TiffinPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: Omit<TiffinPlan, 'id'> | TiffinPlan) => Promise<void>;
  planToEdit?: TiffinPlan | null;
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TiffinPlanFormModal: React.FC<TiffinPlanFormModalProps> = ({ isOpen, onClose, onSubmit, planToEdit }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [sampleMenu, setSampleMenu] = useState<SampleMenu>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setDuration(planToEdit.duration);
      setPrice(planToEdit.price);
      setDescription(planToEdit.description);
      setSampleMenu(planToEdit.sampleMenu || {});
    } else {
      setName('');
      setDuration('MONTHLY');
      setPrice(0);
      setDescription('');
      setSampleMenu({});
    }
    setError('');
  }, [planToEdit, isOpen]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleMenuChange = (day: string, mealType: 'lunch' | 'dinner', value: string) => {
    setSampleMenu(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [mealType]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) {
      setError('Plan Name and a valid Price are required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const planData = { name, duration, price, description, sampleMenu };
      if (planToEdit) {
        await onSubmit({ ...planToEdit, ...planData });
      } else {
        await onSubmit(planData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save plan.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            {planToEdit ? 'Edit Tiffin Plan' : 'Create New Tiffin Plan'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">Plan Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Monthly Veg Lunch Box" className="w-full p-2 border border-gray-300 rounded-lg"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-gray-700 block mb-1">Duration</label>
              <select id="duration" value={duration} onChange={e => setDuration(e.target.value as 'WEEKLY' | 'MONTHLY')} className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-1">Price (₹)</label>
              <input id="price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} required min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What's included in this plan?" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800">Sample Weekly Menu</h3>
            <p className="text-sm text-gray-500 mb-2">Let customers know what a typical week looks like. This is tentative and can be changed.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2">Day</th>
                    <th className="p-2">Lunch</th>
                    <th className="p-2">Dinner</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {daysOfWeek.map(day => (
                    <tr key={day}>
                      <td className="p-2 font-medium capitalize">{day}</td>
                      <td className="p-1"><input type="text" value={sampleMenu[day]?.lunch || ''} onChange={e => handleMenuChange(day, 'lunch', e.target.value)} className="w-full p-1 border border-gray-200 rounded"/></td>
                      <td className="p-1"><input type="text" value={sampleMenu[day]?.dinner || ''} onChange={e => handleMenuChange(day, 'dinner', e.target.value)} className="w-full p-1 border border-gray-200 rounded"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default TiffinPlanFormModal;