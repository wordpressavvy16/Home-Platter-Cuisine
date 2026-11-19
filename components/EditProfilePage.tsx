import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import type { MealProvider, ServiceWindow } from '../types';
import Loader from './Loader';
import { BackArrowIcon, TrashIcon, PlusIcon, ReceiptPercentIcon } from '../constants';
import { CATERING_EVENT_TYPES } from '../constants';

interface EditProfilePageProps {
  navigate: (path: string) => void;
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EditProfilePage: React.FC<EditProfilePageProps> = ({ navigate }) => {
  const { user, token, isProviderSetupComplete, providerProfile, refreshProviderProfile } = useAuth();
  const [provider, setProvider] = useState<Partial<MealProvider>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const providerId = providerProfile?.id || null;

  useEffect(() => {
    if (providerProfile) {
      setProvider({ 
        ...providerProfile, 
        galleryImages: providerProfile.galleryImages || [],
        weeklySchedule: providerProfile.weeklySchedule || {},
        orderThresholdDiscount: providerProfile.orderThresholdDiscount || { threshold: 0, percentage: 0 },
        cateringEnabled: providerProfile.cateringEnabled || false,
        cateringEventTypes: providerProfile.cateringEventTypes || [],
        cateringGuestCapacity: providerProfile.cateringGuestCapacity || { min: 10, max: 50 },
        cateringMode: providerProfile.cateringMode || 'simple',
        cateringMaxEventsPerWindow: providerProfile.cateringMaxEventsPerWindow || 1,
        cateringProfessionalCapacity: providerProfile.cateringProfessionalCapacity || 50,
        cateringBookings: providerProfile.cateringBookings || [],
      });
      setIsLoading(false);
    } else if (user?.role === 'PROVIDER') {
      setIsLoading(true);
      refreshProviderProfile().finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user, providerProfile, refreshProviderProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProvider(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProvider(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };
  
  const handleThresholdDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setProvider(prev => ({
        ...prev,
        orderThresholdDiscount: {
            ...(prev.orderThresholdDiscount || { threshold: 0, percentage: 0 }),
            [name]: numericValue,
        }
    }));
  };

  const handleAddPhoto = () => {
    if (newImageUrl.trim()) {
      const updatedImages = [...(provider.galleryImages || []), newImageUrl.trim()];
      setProvider(prev => ({ ...prev, galleryImages: updatedImages }));
      setNewImageUrl('');
    }
  };

  const handleDeletePhoto = (index: number) => {
    const updatedImages = [...(provider.galleryImages || [])];
    updatedImages.splice(index, 1);
    setProvider(prev => ({ ...prev, galleryImages: updatedImages }));
  };
  
  const handleScheduleChange = (day: string, index: number, field: keyof ServiceWindow, value: string) => {
    setProvider(prev => {
        if (!prev?.weeklySchedule?.[day]?.[index]) return prev;

        const newSchedule = { ...prev.weeklySchedule };
        const newDaySchedule = [...newSchedule[day]];
        newDaySchedule[index] = { ...newDaySchedule[index], [field]: value };
        newSchedule[day] = newDaySchedule;
        
        return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleAddWindow = (day: string) => {
    const newWindow: ServiceWindow = { mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '11:00' };
     setProvider(prev => {
        const prevSchedule = prev?.weeklySchedule || {};
        const daySchedule = prevSchedule[day] ? [...prevSchedule[day]] : [];
        daySchedule.push(newWindow);
        return {
            ...prev,
            weeklySchedule: {
                ...prevSchedule,
                [day]: daySchedule,
            }
        };
    });
  };
  
  const handleRemoveWindow = (day: string, index: number) => {
    setProvider(prev => {
        if (!prev?.weeklySchedule?.[day]) return prev;
        
        const newSchedule = { ...prev.weeklySchedule };
        const updatedDaySchedule = newSchedule[day].filter((_, i) => i !== index);

        if (updatedDaySchedule.length > 0) {
            newSchedule[day] = updatedDaySchedule;
        } else {
            delete newSchedule[day];
        }

        return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleCateringEventTypeChange = (typeId: string) => {
    setProvider(prev => {
        const currentTypes = prev.cateringEventTypes || [];
        const newTypes = currentTypes.includes(typeId) 
            ? currentTypes.filter(id => id !== typeId)
            : [...currentTypes, typeId];
        return { ...prev, cateringEventTypes: newTypes };
    });
  };

  const handleCateringCapacityChange = (field: 'min' | 'max', value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    setProvider(prev => ({
        ...prev,
        cateringGuestCapacity: {
            ...(prev.cateringGuestCapacity || { min: 0, max: 0 }),
            [field]: numericValue
        }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId || !token) return;
    setIsSaving(true);
    
    const profileUpdatePayload: Partial<MealProvider> = {
      name: provider.name,
      chefName: provider.chefName,
      cuisine: provider.cuisine,
      shortDescription: provider.shortDescription,
      longDescription: provider.longDescription,
      address: provider.address,
      profileImageUrl: provider.profileImageUrl,
      bannerImageUrl: provider.bannerImageUrl,
      galleryImages: provider.galleryImages,
      promoVideoUrl: provider.promoVideoUrl,
      weeklySchedule: provider.weeklySchedule,
      orderThresholdDiscount: provider.orderThresholdDiscount,
      cateringEnabled: provider.cateringEnabled,
      cateringEventTypes: provider.cateringEventTypes,
      cateringGuestCapacity: provider.cateringGuestCapacity,
      cateringMode: provider.cateringMode,
      cateringMaxEventsPerWindow: provider.cateringMaxEventsPerWindow,
      cateringProfessionalCapacity: provider.cateringProfessionalCapacity,
    };

    if (!profileUpdatePayload.orderThresholdDiscount || profileUpdatePayload.orderThresholdDiscount.threshold <= 0 || profileUpdatePayload.orderThresholdDiscount.percentage <= 0) {
        profileUpdatePayload.orderThresholdDiscount = undefined;
    }

    try {
      await providerApi.updateProviderProfile(providerId, profileUpdatePayload, token);
      await refreshProviderProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return <div className="py-16 flex justify-center"><Loader text="Loading your profile..." /></div>;
  }
  
  if (!providerId) {
     return <div className="text-center py-16">Could not load provider profile. Ensure you are logged in as a provider.</div>;
  }

  const isFirstTimeSetup = isProviderSetupComplete === false;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
            {!isFirstTimeSetup && (
                <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <BackArrowIcon className="w-6 h-6 text-gray-700" />
                </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
                Edit Kitchen Profile
            </h1>
        </div>
        
        {isFirstTimeSetup && (
            <div className="bg-brand-light border-l-4 border-brand-primary text-brand-dark p-4 rounded-lg mb-8" role="alert">
                <p className="font-bold text-xl">Welcome to Home Platter!</p>
                <p>Let's set up your kitchen profile to get you started. Fill out the details below and save.</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6 max-w-4xl mx-auto">
            {/* ... existing form fields ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Kitchen Name</label>
                    <input id="name" name="name" type="text" value={provider.name || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                </div>
                <div>
                    <label htmlFor="chefName" className="text-sm font-medium text-gray-700 block mb-2">Chef Name</label>
                    <input id="chefName" name="chefName" type="text" value={provider.chefName || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                </div>
            </div>
            <div>
                <label htmlFor="cuisine" className="text-sm font-medium text-gray-700 block mb-2">Cuisine Type</label>
                <input id="cuisine" name="cuisine" type="text" value={provider.cuisine || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="e.g., North Indian, Continental, South Indian"/>
            </div>
            <div>
                <label htmlFor="shortDescription" className="text-sm font-medium text-gray-700 block mb-2">Short Description</label>
                <input id="shortDescription" name="shortDescription" type="text" value={provider.shortDescription || ''} onChange={handleChange} required maxLength={100} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="A brief, catchy tagline for your kitchen."/>
            </div>
            <div>
                <label htmlFor="longDescription" className="text-sm font-medium text-gray-700 block mb-2">Long Description</label>
                <textarea id="longDescription" name="longDescription" rows={4} value={provider.longDescription || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="Tell customers the story behind your food."/>
            </div>
             <div>
                <label htmlFor="address" className="text-sm font-medium text-gray-700 block mb-2">Address (City)</label>
                <input id="address" name="address" type="text" value={provider.address || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" placeholder="e.g., Sector 22, Gurugram" />
            </div>
            <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800">Brand Images</h3>
                <div>
                    <label htmlFor="profileImageUrl" className="text-sm font-medium text-gray-700 block mb-2">Profile Image URL</label>
                    <div className="flex items-center gap-4">
                        <input id="profileImageUrl" name="profileImageUrl" type="url" value={provider.profileImageUrl || ''} onChange={handleChange} required className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                        {provider.profileImageUrl && <img src={provider.profileImageUrl} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />}
                    </div>
                </div>
                <div>
                    <label htmlFor="bannerImageUrl" className="text-sm font-medium text-gray-700 block mb-2">Banner Image URL</label>
                    <div className="flex items-center gap-4">
                        <input id="bannerImageUrl" name="bannerImageUrl" type="url" value={provider.bannerImageUrl || ''} onChange={handleChange} required className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                        {provider.bannerImageUrl && <img src={provider.bannerImageUrl} alt="Banner Preview" className="w-32 h-16 rounded-md object-cover border-2 border-white shadow-md" />}
                    </div>
                </div>
            </div>
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Photo Gallery</h3>
              <p className="text-sm text-gray-600">Add URLs of images that showcase your food, kitchen, or brand. These will be displayed on your public storefront.</p>
              <div className="flex gap-2">
                <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://example.com/your-image.jpg" className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                <button type="button" onClick={handleAddPhoto} className="flex-shrink-0 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/> Add Photo
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {(provider.galleryImages || []).map((imgUrl, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={imgUrl} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                    <button type="button" onClick={() => handleDeletePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete photo">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800">Promotional Video</h3>
                <p className="text-sm text-gray-600">Add a URL to a YouTube Short, Instagram Reel, or TikTok video to show off your kitchen.</p>
                <div>
                    <label htmlFor="promoVideoUrl" className="text-sm font-medium text-gray-700 block mb-2">Video URL</label>
                    <input 
                        id="promoVideoUrl" 
                        name="promoVideoUrl" 
                        type="url" 
                        value={provider.promoVideoUrl || ''} 
                        onChange={handleChange} 
                        placeholder="https://www.youtube.com/shorts/..." 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" 
                    />
                </div>
            </div>

            {/* Weekly Schedule Section */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Schedule</h3>
              <p className="text-sm text-gray-600">Define your operating hours for each day. Customers must order before the "Order By" time to receive their meal during the "Serving" window.</p>
              <div className="space-y-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-4 border rounded-lg bg-gray-50/50">
                    <h4 className="font-bold capitalize mb-2">{day}</h4>
                    {(provider.weeklySchedule?.[day] || []).map((window, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end mb-3 p-2 border-b">
                        <input type="text" value={window.mealType} onChange={e => handleScheduleChange(day, index, 'mealType', e.target.value)} placeholder="Meal Name (e.g. Lunch)" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                        <input type="time" value={window.orderCutoffTime} onChange={e => handleScheduleChange(day, index, 'orderCutoffTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" title="Order By" />
                        <div className="flex items-center gap-2">
                           <input type="time" value={window.servingStartTime} onChange={e => handleScheduleChange(day, index, 'servingStartTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" title="Serving Start" />
                           <span className="text-gray-500">-</span>
                           <input type="time" value={window.servingEndTime} onChange={e => handleScheduleChange(day, index, 'servingEndTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" title="Serving End" />
                        </div>
                        <button type="button" onClick={() => handleRemoveWindow(day, index)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5 mx-auto" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddWindow(day)} className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add Service Window</button>
                  </div>
                ))}
              </div>
            </div>

             {/* Automatic Order Discounts Section */}
            <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                    <ReceiptPercentIcon className="w-8 h-8 text-brand-primary"/>
                    <h3 className="text-lg font-semibold text-gray-800">Automatic Order Discounts</h3>
                </div>
                <p className="text-sm text-gray-600">Incentivize larger orders by offering an automatic discount. This will apply to any order from your kitchen that meets the minimum amount. Leave values at 0 to disable.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                    <div>
                        <label htmlFor="threshold" className="text-sm font-medium text-gray-700 block mb-2">Minimum Order Amount (₹)</label>
                        <input 
                            id="threshold" 
                            name="threshold" 
                            type="number" 
                            value={provider.orderThresholdDiscount?.threshold || 0} 
                            onChange={handleThresholdDiscountChange} 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" 
                            placeholder="e.g., 500"
                            min="0"
                        />
                    </div>
                     <div>
                        <label htmlFor="percentage" className="text-sm font-medium text-gray-700 block mb-2">Discount Percentage (%)</label>
                        <input 
                            id="percentage" 
                            name="percentage" 
                            type="number" 
                            value={provider.orderThresholdDiscount?.percentage || 0} 
                            onChange={handleThresholdDiscountChange} 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" 
                            placeholder="e.g., 10"
                            min="0" max="100"
                        />
                    </div>
                </div>
            </div>

            {/* Catering Services Section */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Catering Services</h3>
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="cateringEnabled" checked={provider.cateringEnabled || false} onChange={e => setProvider(prev => ({ ...prev, cateringEnabled: e.target.checked }))} className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                 <label htmlFor="cateringEnabled" className="text-sm font-medium text-gray-700">Enable Catering Services for my Kitchen</label>
              </div>

              {provider.cateringEnabled && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 animate-fade-in">
                  <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suitable Event Types</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CATERING_EVENT_TYPES.map(opt => (
                              <label key={opt.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100">
                                  <input type="checkbox" checked={provider.cateringEventTypes?.includes(opt.id)} onChange={() => handleCateringEventTypeChange(opt.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                                  <span className="text-sm">{opt.label}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                   <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Capacity</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="minGuests" className="text-xs font-medium text-gray-700 block mb-1">Minimum Guests</label>
                              <input id="minGuests" type="number" value={provider.cateringGuestCapacity?.min || ''} onChange={e => handleCateringCapacityChange('min', e.target.value)} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                          </div>
                          <div>
                              <label htmlFor="maxGuests" className="text-xs font-medium text-gray-700 block mb-1">Maximum Guests</label>
                              <input id="maxGuests" type="number" value={provider.cateringGuestCapacity?.max || ''} onChange={e => handleCateringCapacityChange('max', e.target.value)} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                          </div>
                      </div>
                  </div>

                  {/* New Capacity Management for Story 2.20 */}
                  <div className="pt-4 border-t">
                     <h4 className="text-sm font-medium text-gray-700 mb-2">Capacity Management Model</h4>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                           <input type="radio" name="cateringMode" value="simple" checked={provider.cateringMode === 'simple'} onChange={handleChange} />
                           Simple Mode
                        </label>
                         <label className="flex items-center gap-2">
                           <input type="radio" name="cateringMode" value="professional" checked={provider.cateringMode === 'professional'} onChange={handleChange} />
                           Professional Mode
                        </label>
                     </div>
                     <div className="mt-2 text-xs text-gray-500">
                        {provider.cateringMode === 'simple'
                           ? 'Best for small operators. Set a max number of events you can handle per service window (e.g., 1 for Lunch, 1 for Dinner).'
                           : 'Best for larger businesses. Set the total number of guests you can serve at any one time.'
                        }
                     </div>

                     <div className="mt-3">
                        {provider.cateringMode === 'simple' ? (
                           <div>
                              <label htmlFor="cateringMaxEventsPerWindow" className="text-xs font-medium text-gray-700 block mb-1">Max Events per Service Window</label>
                              <input id="cateringMaxEventsPerWindow" name="cateringMaxEventsPerWindow" type="number" value={provider.cateringMaxEventsPerWindow || 1} onChange={handleNumericChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                        ) : (
                           <div>
                              <label htmlFor="cateringProfessionalCapacity" className="text-xs font-medium text-gray-700 block mb-1">Max Concurrent Guests</label>
                              <input id="cateringProfessionalCapacity" name="cateringProfessionalCapacity" type="number" value={provider.cateringProfessionalCapacity || 50} onChange={handleNumericChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              )}
            </div>


            <div className="border-t pt-6">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;