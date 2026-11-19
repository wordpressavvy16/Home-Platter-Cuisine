import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import * as collectionApi from '../api/collectionApi';
import { BackArrowIcon, PlusIcon } from '../constants';
import type { Meal, MealProvider, Collection } from '../types';
import Loader from './Loader';
import ManageableMealCard from './ManageableMealCard';
import MealFormModal from './MealFormModal';
import AddToProviderCollectionModal from './AddToProviderCollectionModal';

interface ManageMenuPageProps {
    navigate: (path: string) => void;
}

const ManageMenuPage: React.FC<ManageMenuPageProps> = ({ navigate }) => {
    const { user, token } = useAuth();
    const [provider, setProvider] = useState<MealProvider | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
    const [mealForCollections, setMealForCollections] = useState<Meal | null>(null);
    
    const providerId = user?.role === 'PROVIDER' ? user.id.replace('prov_', '') : null;

    const fetchProviderData = useCallback(async () => {
        if (providerId && token) {
            setIsLoading(true);
            try {
                const [providerData, collectionData] = await Promise.all([
                    providerApi.getProviderById(providerId),
                    collectionApi.getCollectionsForProvider(providerId, token)
                ]);
                setProvider(providerData || null);
                setCollections(collectionData);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [providerId, token]);

    useEffect(() => {
        fetchProviderData();
    }, [fetchProviderData]);

    const groupedMenu = useMemo(() => {
        if (!provider?.menu) return {};
        return provider.menu.reduce((acc, meal) => {
            const category = meal.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(meal);
            return acc;
        }, {} as Record<string, Meal[]>);
    }, [provider?.menu]);

    const categoryOrder = Object.keys(groupedMenu).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
    });

    const handleOpenMealModal = (meal?: Meal) => {
        setMealToEdit(meal || null);
        setIsMealModalOpen(true);
    };

    const handleOpenCollectionModal = (meal: Meal) => {
        setMealForCollections(meal);
        setIsCollectionModalOpen(true);
    };

    const handleSubmitMeal = async (mealData: Omit<Meal, 'id'> | Meal) => {
        if (!providerId || !token) return;
        
        if ('id' in mealData) {
            await providerApi.updateMeal(providerId, mealData, token);
        } else {
            await providerApi.addMeal(providerId, mealData, token);
        }
        await fetchProviderData(); // Re-fetch data to update UI
    };

    const handleUpdateMeal = async (updatedMeal: Meal) => {
        if (!providerId || !token) return;
        // Optimistically update the UI
        setProvider(prev => {
            if (!prev) return null;
            return {
                ...prev,
                menu: prev.menu.map(m => m.id === updatedMeal.id ? updatedMeal : m),
            };
        });
        try {
            await providerApi.updateMeal(providerId, updatedMeal, token);
        } catch (error) {
            console.error("Failed to update meal:", error);
            // Re-fetch to revert on failure
            await fetchProviderData();
        }
    };
    
    const handleRemoveMeal = async (mealId: string) => {
        if (!providerId || !token) return;
        // The confirmation is now inside the ManageableMealCard
        await providerApi.removeMeal(providerId, mealId, token);
        await fetchProviderData(); // Re-fetch data
    };

    if (isLoading) {
        return <div className="py-16 flex justify-center"><Loader text="Loading your kitchen data..." /></div>
    }

    if (!provider) {
        return (
             <div className="text-center py-16">
                <p className="text-2xl font-semibold text-gray-700">Could not find provider data.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 inline-block bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <>
            <div className="bg-background min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <BackArrowIcon className="w-6 h-6 text-gray-700" />
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Manage Menu
                            </h1>
                        </div>
                        <button 
                            onClick={() => handleOpenMealModal()}
                            className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors duration-300"
                        >
                            <PlusIcon className="w-6 h-6"/>
                            Add New Meal
                        </button>
                    </div>

                    {provider.menu.length > 0 ? (
                        <div className="space-y-8">
                            {categoryOrder.map(category => (
                                <div key={category}>
                                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-gray-200">{category}</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {groupedMenu[category].map(meal => (
                                            <ManageableMealCard 
                                                key={meal.id} 
                                                meal={meal} 
                                                onEdit={() => handleOpenMealModal(meal)}
                                                onRemove={handleRemoveMeal}
                                                onUpdateMeal={handleUpdateMeal}
                                                onAddToCollection={() => handleOpenCollectionModal(meal)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-xl text-gray-700 font-semibold">Your menu is empty</p>
                            <p className="text-gray-500 mt-2">Click "Add New Meal" to get started.</p>
                        </div>
                    )}
                </div>
            </div>
            <MealFormModal 
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                onSubmit={handleSubmitMeal}
                mealToEdit={mealToEdit}
            />
            {mealForCollections && (
                <AddToProviderCollectionModal
                    isOpen={isCollectionModalOpen}
                    onClose={() => setIsCollectionModalOpen(false)}
                    meal={mealForCollections}
                    collections={collections}
                    onUpdate={fetchProviderData}
                />
            )}
        </>
    );
};

export default ManageMenuPage;
