import React, { useState, useEffect, useCallback } from 'react';
import type { Collection, MealProvider } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as collectionApi from '../api/collectionApi';
import Loader from './Loader';
import { BookmarkSquareIcon, PencilIcon, TrashIcon, PlusIcon } from '../constants';
import CollectionFormModal from './CollectionFormModal';

interface ProviderCollectionsPanelProps {
    provider: MealProvider;
}

const ProviderCollectionsPanel: React.FC<ProviderCollectionsPanelProps> = ({ provider }) => {
    const { token } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);

    const fetchCollections = useCallback(async () => {
        if (!provider.id || !token) {
            setError('Provider data not available.');
            setIsLoading(false);
            return;
        }
        try {
            const data = await collectionApi.getCollectionsForProvider(provider.id, token);
            setCollections(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load collections.');
        } finally {
            setIsLoading(false);
        }
    }, [provider.id, token]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleOpenModal = (collection?: Collection) => {
        setCollectionToEdit(collection || null);
        setIsFormModalOpen(true);
    };

    const handleSaveCollection = async (data: { name: string; description?: string; isPublic?: boolean }) => {
        if (!token) return;
        
        const saveData = { name: data.name, description: data.description };

        if (collectionToEdit) {
            await collectionApi.updateProviderCollection(provider.id, collectionToEdit.id, saveData, token);
        } else {
            await collectionApi.createProviderCollection(provider.id, saveData, token);
        }
        await fetchCollections();
    };

    const handleDeleteCollection = async (id: string) => {
        if (!token) return;
        if (window.confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
            await collectionApi.deleteProviderCollection(provider.id, id, token);
            await fetchCollections();
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col items-center h-full">
                <BookmarkSquareIcon className="w-16 h-16 text-teal-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Manage Collections</h2>
                <div className="text-sm text-gray-500 mt-2 flex-grow text-center">
                    {isLoading ? <Loader text="" /> : 
                        collections.length > 0 ? (
                            <p>{collections.length} collection{collections.length > 1 ? 's' : ''} created.</p>
                        ) : (
                            <p>Group meals into collections like 'Weekly Specials'.</p>
                        )
                    }
                </div>
                 <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    New Collection
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

export default ProviderCollectionsPanel;
