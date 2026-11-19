import React, { useState, useEffect } from 'react';
import type { MealProvider } from '../types';
import * as providerApi from '../api/providerApi';
import { useAuth } from '../hooks/useAuth';
import { StarIcon, KitchenIcon, UsersIcon, PROVIDER_BADGES } from '../constants';

interface MyKitchenProfilePanelProps {
    provider: MealProvider;
    // FIX: Replaced deprecated Route enum with string path for navigation.
    navigate: (path: string) => void;
}

const ToggleSwitch = ({ isChecked, onChange, disabled }: { isChecked: boolean, onChange: (checked: boolean) => void, disabled: boolean }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <span className="text-sm font-semibold text-text">Accepting Orders</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-12 h-7 rounded-full transition ${isChecked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform ${isChecked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);


const MyKitchenProfilePanel: React.FC<MyKitchenProfilePanelProps> = ({ provider, navigate }) => {
    const { token, refreshProviderProfile } = useAuth();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (provider) {
            setIsAccepting(provider.isAcceptingOrders !== false);
        }
    }, [provider]);


    const handleToggle = async (checked: boolean) => {
        if (!token) return;
        setIsUpdating(true);
        setIsAccepting(checked); // Optimistic update
        try {
            await providerApi.updateProviderProfile(provider.id, { isAcceptingOrders: checked }, token);
            await refreshProviderProfile();
        } catch (error) {
            console.error("Failed to update status", error);
            setIsAccepting(!checked); // Revert on failure
            alert("Could not update status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const earnedBadges = PROVIDER_BADGES.filter(b => provider.earnedBadgeIds?.includes(b.id));

    return (
        <div
            className="w-full h-full p-6 flex flex-col text-center rounded-xl"
        >
             <div className="mb-4">
                 <ToggleSwitch isChecked={isAccepting} onChange={handleToggle} disabled={isUpdating} />
            </div>

            <div 
                // FIX: Updated navigation call to use a string path instead of a deprecated Route enum value.
                onClick={() => navigate('/dashboard/profile/edit')}
                className="flex-grow flex flex-col items-center justify-center cursor-pointer"
            >
                <KitchenIcon className="w-12 h-12 text-green-600 mb-3" />
                <h2 className="text-xl font-bold text-text">{provider.name}</h2>
                <p className="text-sm text-text/70 mt-1">Click to edit your public profile.</p>
            </div>
            
            <div className="w-full flex justify-around items-center border-t pt-4 mt-4">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-text">{provider.rating.toFixed(1)}</span>
                    <div className="flex items-center gap-1 text-sm text-text/70">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>Rating</span>
                    </div>
                </div>
                <div className="border-l h-8 border-gray-200"></div>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-text">{provider.reviews.length}</span>
                     <div className="flex items-center gap-1 text-sm text-text/70">
                        <UsersIcon className="w-4 h-4 text-text/70" />
                        <span>Reviews</span>
                    </div>
                </div>
            </div>
            {earnedBadges.length > 0 && (
                 <div className="mt-4 flex justify-center items-center gap-3">
                    {earnedBadges.slice(0, 3).map(badge => (
                        <div key={badge.id} title={badge.name} className="p-1.5 bg-yellow-100 rounded-full">
                            <badge.icon className="w-5 h-5 text-yellow-600" />
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default MyKitchenProfilePanel;