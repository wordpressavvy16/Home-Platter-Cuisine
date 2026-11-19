import React, { useState, useCallback } from 'react';
import type { MealProvider, TiffinPlan } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import Loader from './Loader';
import { PlusIcon, PencilIcon, TrashIcon, BookmarkSquareIcon } from '../constants';
import TiffinPlanFormModal from './TiffinPlanFormModal';

interface TiffinPlanManagerProps {
    provider: MealProvider;
}

const TiffinPlanManager: React.FC<TiffinPlanManagerProps> = ({ provider }) => {
    const { token, refreshProviderProfile } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<TiffinPlan | null>(null);

    const handleOpenModal = (plan?: TiffinPlan) => {
        setPlanToEdit(plan || null);
        setIsModalOpen(true);
    };

    const handleSavePlan = async (planData: Omit<TiffinPlan, 'id'> | TiffinPlan) => {
        if (!token) return;
        if ('id' in planData) {
            await providerApi.updateTiffinPlan(provider.id, planData.id, planData, token);
        } else {
            await providerApi.createTiffinPlan(provider.id, planData, token);
        }
        await refreshProviderProfile();
    };
    
    const handleDeletePlan = async (planId: string) => {
        if (!token) return;
        if (window.confirm("Are you sure you want to delete this tiffin plan?")) {
            await providerApi.deleteTiffinPlan(provider.id, planId, token);
            await refreshProviderProfile();
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                    <BookmarkSquareIcon className="w-8 h-8 text-green-600"/>
                    <h2 className="text-2xl font-bold text-text">Tiffin Plans</h2>
                </div>

                <div className="flex-grow space-y-3">
                    {provider.tiffinPlans && provider.tiffinPlans.length > 0 ? (
                        provider.tiffinPlans.map(plan => (
                            <div key={plan.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{plan.name}</p>
                                    <p className="text-sm text-gray-600">₹{plan.price} / {plan.duration.toLowerCase()}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(plan)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeletePlan(plan.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Create weekly or monthly tiffin plans for your customers.</p>
                        </div>
                    )}
                </div>
                
                <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    New Tiffin Plan
                </button>
            </div>
            
            <TiffinPlanFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSavePlan}
                planToEdit={planToEdit}
            />
        </>
    );
};

export default TiffinPlanManager;