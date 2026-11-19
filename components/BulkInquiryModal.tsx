
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import * as inquiryApi from '../api/inquiryApi';
import * as providerApi from '../api/providerApi';
import type { MealProvider, Meal } from '../types';
import { XMarkIcon, ExclamationCircleIcon, CheckCircleIcon } from '../constants';
import Loader from './Loader';

interface BulkInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: MealProvider;
}

const BulkInquiryModal: React.FC<BulkInquiryModalProps> = ({ isOpen, onClose, provider: initialProvider }) => {
  const { user, token } = useAuth();
  const [provider, setProvider] = useState<MealProvider>(initialProvider);
  const [numGuests, setNumGuests] = useState(provider.cateringGuestCapacity?.min || 10);
  const [eventDate, setEventDate] = useState('');
  const [serviceWindow, setServiceWindow] = useState('');
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<{ isAvailable: boolean; message: string } | null>(null);

  const modalRoot = document.getElementById('modal-root');
  
  const bulkEligibleMeals = useMemo(() => {
    return provider.menu.filter(m => m.isBulkOrderEligible && m.isVisible);
  }, [provider.menu]);

  const availableWindows = useMemo(() => {
    if (!eventDate) return [];
    const dayOfWeek = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const scheduledWindows = provider.weeklySchedule?.[dayOfWeek];

    // If there are specific windows scheduled for that day, use them.
    if (scheduledWindows && scheduledWindows.length > 0) {
        return scheduledWindows;
    }
    
    // Otherwise, provide default windows for catering inquiries.
    return [
        { mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '15:00', orderCutoffTime: '10:00' },
        { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '22:00', orderCutoffTime: '17:00' },
    ];
  }, [eventDate, provider.weeklySchedule]);

  useEffect(() => {
    // Refresh provider data when modal opens to get latest bookings
    if (isOpen) {
        providerApi.getProviderById(initialProvider.id).then(data => {
            if (data) setProvider(data);
        });
    }
  }, [isOpen, initialProvider.id]);
  
  useEffect(() => {
    // Check availability whenever dependencies change
    if (eventDate && serviceWindow) {
      const bookingsForDate = provider.cateringBookings?.filter(b => b.eventDate === eventDate) || [];
      
      if (provider.cateringMode === 'simple') {
        const bookingsInWindow = bookingsForDate.filter(b => b.serviceWindow === serviceWindow).length;
        const maxEvents = provider.cateringMaxEventsPerWindow || 1;
        if (bookingsInWindow >= maxEvents) {
          setAvailability({ isAvailable: false, message: `This chef is fully booked for ${serviceWindow} on this date.` });
        } else {
          setAvailability({ isAvailable: true, message: `Available for ${serviceWindow}!` });
        }
      } else if (provider.cateringMode === 'professional') {
        const concurrentGuests = bookingsForDate.reduce((sum, booking) => sum + booking.guestCount, 0);
        const maxCapacity = provider.cateringProfessionalCapacity || 0;
        if (concurrentGuests + numGuests > maxCapacity) {
          setAvailability({ isAvailable: false, message: `This event size exceeds the chef's capacity for this date.` });
        } else {
          setAvailability({ isAvailable: true, message: 'Capacity available!' });
        }
      }
    } else {
      setAvailability(null);
    }
  }, [eventDate, serviceWindow, numGuests, provider]);


  if (!isOpen || !modalRoot) return null;

  const handleMealToggle = (mealId: string) => {
    setSelectedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
        setError("You must be logged in to send an inquiry.");
        return;
    }
    if (!eventDate || !serviceWindow || (bulkEligibleMeals.length > 0 && selectedMeals.size === 0)) {
      setError('Please select a date, service window, and at least one meal if options are available.');
      return;
    }
    if (!availability?.isAvailable) {
        setError(availability?.message || "Provider is not available.");
        return;
    }

    setError('');
    setIsSubmitting(true);
    
    const selectedMealDetails = Array.from(selectedMeals).map(id => {
        const meal = bulkEligibleMeals.find(m => m.id === id);
        return `- ${meal?.name}`;
    }).join('\n');

    const firstMessageText = `
        **New Catering Inquiry**
        - **Number of Guests:** ${numGuests}
        - **Event Date:** ${new Date(eventDate).toLocaleDateString()}
        - **Service:** ${serviceWindow}
        - **Interested in:**\n${selectedMealDetails || 'Provider to recommend menu.'}
        - **Special Requests:** ${specialRequests || 'None'}
    `.trim().replace(/^ +/gm, '');

    try {
      // Pass event details to be stamped on the inquiry for booking simulation
      const firstMessage = { 
        senderId: user.id, 
        text: firstMessageText,
        // Custom payload for the mock API to create a booking
        __bookingDetails: {
            eventDate,
            serviceWindow,
            guestCount: numGuests,
        }
      };
      // @ts-ignore - The backend will strip the custom payload
      await inquiryApi.createInquiry(provider.id, firstMessage, token);
      alert('Your inquiry has been sent! This has been simulated as a confirmed booking to block the calendar. The chef will get back to you shortly in your messages.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  today.setDate(today.getDate() + (provider.menu[0]?.bulkOrderConfig?.leadTimeHours || 24) / 24);
  const minDate = today.toISOString().split('T')[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="bulk-inquiry-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="bulk-inquiry-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            Catering Inquiry
          </h2>
          <button onClick={onClose} aria-label="Close catering inquiry" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-600">Fill out this form to start a conversation with {provider.chefName}. They will get back to you with a quote and confirm availability.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="numGuests" className="text-sm font-medium text-gray-700 block mb-1">Number of Guests</label>
              <input id="numGuests" type="number" value={numGuests} onChange={e => setNumGuests(parseInt(e.target.value, 10) || 1)} min={provider.cateringGuestCapacity?.min || 1} max={provider.cateringGuestCapacity?.max} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="eventDate" className="text-sm font-medium text-gray-700 block mb-1">Event Date</label>
              <input id="eventDate" type="date" value={eventDate} onChange={e => { setEventDate(e.target.value); setServiceWindow(''); }} required min={minDate} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
             <div>
              <label htmlFor="serviceWindow" className="text-sm font-medium text-gray-700 block mb-1">Service</label>
              <select id="serviceWindow" value={serviceWindow} onChange={e => setServiceWindow(e.target.value)} required disabled={!eventDate} className="w-full p-2 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100">
                <option value="">Select window...</option>
                {availableWindows.map(win => <option key={win.mealType} value={win.mealType}>{win.mealType} ({win.servingStartTime}-{win.servingEndTime})</option>)}
              </select>
            </div>
          </div>
          {availability && (
            <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${availability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {availability.isAvailable ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
                <span>{availability.message}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select meals you're interested in:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {bulkEligibleMeals.length > 0 ? bulkEligibleMeals.map(meal => (
                    <label key={meal.id} htmlFor={`meal-${meal.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" id={`meal-${meal.id}`} checked={selectedMeals.has(meal.id)} onChange={() => handleMealToggle(meal.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                        <span className="text-sm font-medium">{meal.name}</span>
                    </label>
                )) : (
                    <p className="text-sm text-gray-500 p-2">No specific bulk-order meals listed. You can ask the chef for recommendations in your special requests.</p>
                )}
            </div>
          </div>
          <div>
            <label htmlFor="specialRequests" className="text-sm font-medium text-gray-700 block mb-1">Special Requests (Optional)</label>
            <textarea id="specialRequests" rows={3} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="e.g., specific dietary needs, packaging requirements" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting || !availability?.isAvailable} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? <Loader text="Sending..." /> : 'Send Inquiry to Chef'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default BulkInquiryModal;
