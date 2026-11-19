import React, { useState } from 'react';
import type { MealProvider } from '../types';
import * as providerApi from '../api/providerApi';
import { useAuth } from '../hooks/useAuth';
import { TruckIcon } from '../constants';

interface DeliveryManagementPanelProps {
    provider: MealProvider;
}

const ToggleSwitch = ({ isChecked, onChange, disabled }: { isChecked: boolean, onChange: (checked: boolean) => void, disabled: boolean }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <span className="text-sm font-semibold text-text">Enable Third-Party Delivery</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-12 h-7 rounded-full transition ${isChecked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform ${isChecked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);


const DeliveryManagementPanel: React.FC<DeliveryManagementPanelProps> = ({ provider }) => {
    const { token, refreshProviderProfile } = useAuth();
    const [isEnabled, setIsEnabled] = useState(provider.deliveryIntegrationEnabled || false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async (checked: boolean) => {
        if (!token) return;
        setIsUpdating(true);
        setIsEnabled(checked); // Optimistic update
        try {
            await providerApi.updateProviderProfile(provider.id, { deliveryIntegrationEnabled: checked }, token);
            await refreshProviderProfile();
        } catch (error) {
            console.error("Failed to update delivery status", error);
            setIsEnabled(!checked); // Revert on failure
            alert("Could not update status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center rounded-xl">
             <TruckIcon className="w-16 h-16 text-blue-600 mb-4"/>
             <h2 className="text-2xl font-bold text-text">Delivery Management</h2>
             <p className="text-text/70 mt-2 flex-grow">Offload delivery logistics to our partners.</p>
             <div className="mt-4">
                 <ToggleSwitch isChecked={isEnabled} onChange={handleToggle} disabled={isUpdating} />
            </div>
        </div>
    );
};

export default DeliveryManagementPanel;