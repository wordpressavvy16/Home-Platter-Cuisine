
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { Address } from '../types';
import { XMarkIcon, ExclamationCircleIcon, CheckCircleIcon } from '../constants';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Address, 'id'>) => Promise<void>;
  addressToEdit?: Address | null;
}

type FormState = {
  [key in keyof Omit<Address, 'id'>]: {
    value: string;
    isTouched: boolean;
    isValid: boolean;
    error: string;
  };
};

const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSubmit, addressToEdit }) => {
  const [formData, setFormData] = useState<FormState>({
    name: { value: '', isTouched: false, isValid: false, error: 'Label is required.' },
    street: { value: '', isTouched: false, isValid: false, error: 'Street is required.' },
    city: { value: '', isTouched: false, isValid: false, error: 'City is required.' },
    postalCode: { value: '', isTouched: false, isValid: false, error: 'Postal code is required.' },
    phone: { value: '', isTouched: false, isValid: false, error: 'A valid phone number is required.' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateField = (name: keyof FormState, value: string): { isValid: boolean, error: string } => {
    switch (name) {
      case 'name':
      case 'street':
      case 'city':
        return value.trim().length > 2 ? { isValid: true, error: '' } : { isValid: false, error: `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 3 characters.` };
      case 'postalCode':
        return /^\d{6}$/.test(value) ? { isValid: true, error: '' } : { isValid: false, error: 'Must be a 6-digit postal code.' };
      case 'phone':
        return /^\d{10}$/.test(value) ? { isValid: true, error: '' } : { isValid: false, error: 'Must be a 10-digit phone number.' };
      default:
        return { isValid: false, error: 'Invalid field.' };
    }
  };

  useEffect(() => {
    const initialState = {
        name: { value: '', isTouched: false, isValid: false, error: 'Label is required.' },
        street: { value: '', isTouched: false, isValid: false, error: 'Street is required.' },
        city: { value: '', isTouched: false, isValid: false, error: 'City is required.' },
        postalCode: { value: '', isTouched: false, isValid: false, error: 'Postal code is required.' },
        phone: { value: '', isTouched: false, isValid: false, error: 'A valid phone number is required.' },
    };
    
    if (addressToEdit) {
      Object.keys(addressToEdit).forEach(key => {
        if (key in initialState) {
          const value = addressToEdit[key as keyof Omit<Address, 'id'>];
          initialState[key as keyof FormState] = {
            ...initialState[key as keyof FormState],
            value,
            isValid: validateField(key as keyof FormState, value).isValid,
          };
        }
      });
    }
    setFormData(initialState);
    setSubmitError('');
  }, [addressToEdit, isOpen]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const { isValid, error } = validateField(name as keyof FormState, value);
    setFormData(prev => ({ 
      ...prev, 
      [name]: { ...prev[name as keyof FormState], value, isValid, error } 
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: { ...prev[name as keyof FormState], isTouched: true }
    }));
  };

  const isFormValid = useMemo(() => (Object.keys(formData) as Array<keyof FormState>).every(key => formData[key].isValid), [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      // Touch all fields to show errors
      setFormData(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key as keyof FormState].isTouched = true;
        });
        return newState;
      });
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const dataToSubmit = Object.keys(formData).reduce((acc, key) => {
        acc[key as keyof Omit<Address, 'id'>] = formData[key as keyof FormState].value;
        return acc;
      }, {} as Omit<Address, 'id'>);
      await onSubmit(dataToSubmit);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInputClasses = (field: FormState[keyof FormState]) => {
    if (!field.isTouched) return 'border-gray-300 focus:ring-brand-primary/50';
    return field.isValid
      ? 'border-green-500 ring-1 ring-green-500'
      : 'border-red-500 ring-1 ring-red-500';
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="address-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="address-form-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            {addressToEdit ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onClose} aria-label="Close address form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {Object.keys(formData).map(key => {
            const field = formData[key as keyof FormState];
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            return (
              <div key={key}>
                <label htmlFor={key} className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                <div className="relative">
                  <input id={key} name={key} type="text" value={field.value} onChange={handleChange} onBlur={handleBlur} required className={`w-full p-3 border rounded-lg focus:outline-none transition bg-gray-50 ${getInputClasses(field)}`} />
                   {field.isTouched && (
                      field.isValid 
                        ? <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        : <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {field.isTouched && !field.isValid && <p className="text-red-600 text-xs mt-1">{field.error}</p>}
              </div>
            )
          })}
          
          {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default AddressFormModal;
