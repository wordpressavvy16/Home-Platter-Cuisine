import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Collection, MealProvider, Meal } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as collectionApi from '../api/collectionApi';
import Loader from './Loader';
import { FolderPlusIcon, PencilIcon, TrashIcon } from '../constants';
import CollectionFormModal from './CollectionFormModal';

interface CollectionsPanelProps {
    providers: MealProvider[];
}

const CollectionsPanel: React.FC<CollectionsPanelProps> = ({ providers }) => {
    const { token } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);
    
    const allMealsMap = useMemo(() => {
        const map = new Map<string, Meal>();
        providers.forEach(p => p.menu.forEach(m => map.set(m.id, m)));
        return map;
    }, [providers]);

    const fetchCollections = useCallback(async () => {
        if (!token) {
            setError('You must be logged in to view collections.');
            setIsLoading(false);
            return;
        }
        try {
            const data = await collectionApi.getCollectionsForUser(token);
            setCollections(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load collections.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleOpenModal = (collection?: Collection) => {
        setCollectionToEdit(collection || null);
        setIsFormModalOpen(true);
    };

    const handleSaveCollection = async (data: { name: string; description?: string; isPublic?: boolean }) => {
        if (!token) return;
        if (collectionToEdit) {
            await collectionApi.updateCollection(collectionToEdit.id, data, token);
        } else {
            await collectionApi.createCollection(data, token);
        }
        await fetchCollections();
    };

    const handleDeleteCollection = async (id: string) => {
        if (!token) return;
        if (window.confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
            await collectionApi.deleteCollection(id, token);
            await fetchCollections();
        }
    };

    if (isLoading) {
        return <Loader text="Loading your collections..." />;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    return (
        <>
            <div className="space-y-4">
                {collections.length > 0 ? (
                    collections.map(collection => (
                         <details key={collection.id} className="group bg-gray-50 rounded-lg border">
                            <summary className="p-4 flex justify-between items-center cursor-pointer list-none transition-colors hover:bg-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{collection.name}</p>
                                    <p className="text-sm text-gray-600">{collection.description || 'No description'}</p>
                                    <p className="text-xs text-gray-500 mt-1">{collection.mealIds.length} item(s) | {collection.isPublic ? 'Public' : 'Private'}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={(e) => {e.preventDefault(); handleOpenModal(collection)}} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={(e) => {e.preventDefault(); handleDeleteCollection(collection.id)}} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </summary>
                            <div className="border-t p-4 space-y-2">
                                {collection.mealIds.length > 0 ? collection.mealIds.map(mealId => {
                                    const meal = allMealsMap.get(mealId);
                                    if (!meal) return <div key={mealId} className="text-xs text-red-500">A saved meal is no longer available.</div>;
                                    return (
                                        <div key={mealId} className="flex items-center gap-3">
                                            <img src={meal.imageUrl} alt={meal.name} className="w-10 h-10 rounded-md object-cover"/>
                                            <span className="text-sm font-medium">{meal.name}</span>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-500">This collection is empty. Add meals from any kitchen!</p>
                                )}
                            </div>
                        </details>
                    ))
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">You haven't created any collections yet.</p>
                    </div>
                )}
                 <button 
                    onClick={() => handleOpenModal()}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors duration-300"
                >
                    <FolderPlusIcon className="w-5 h-5"/>
                    Create New Collection
                </button>
            </div>

            <CollectionFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleSaveCollection}
                collectionToEdit={collectionToEdit}
            />
        </>
    );
};

export default CollectionsPanel;