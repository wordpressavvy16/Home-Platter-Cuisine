
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, FolderPlusIcon } from '../constants';
import type { Collection, Meal } from '../types';
import * as collectionApi from '../api/collectionApi';
import { useAuth } from '../hooks/useAuth';
import CollectionFormModal from './CollectionFormModal';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  collections: Collection[];
  onUpdate?: () => void;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ isOpen, onClose, meal, collections, onUpdate }) => {
  const { token } = useAuth();
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialSelected = new Set<string>();
      collections.forEach(c => {
        if (c.mealIds.includes(meal.id)) {
          initialSelected.add(c.id);
        }
      });
      setSelectedCollectionIds(initialSelected);
    }
  }, [isOpen, collections, meal.id]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollectionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await collectionApi.updateMealInCollections(meal.id, Array.from(selectedCollectionIds), token);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Failed to save to collections:", error);
      alert("Could not update your collections. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateAndAdd = async (data: { name: string; description?: string; isPublic?: boolean }) => {
      if (!token) return;
      const newCollection = await collectionApi.createCollection(data, token);
      setSelectedCollectionIds(prev => new Set(prev).add(newCollection.id));
      onUpdate?.(); // This will re-fetch collections in parent
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
        <div role="dialog" aria-modal="true" aria-labelledby="add-to-collection-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b">
            <h2 id="add-to-collection-modal-title" className="text-xl font-bold text-gray-800 font-serif">
              Save to...
            </h2>
            <button onClick={onClose} aria-label="Close collection manager" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            <div className="space-y-3">
              {collections.map(collection => (
                <label key={collection.id} htmlFor={`collection-${collection.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer border">
                  <input
                    type="checkbox"
                    id={`collection-${collection.id}`}
                    checked={selectedCollectionIds.has(collection.id)}
                    onChange={() => handleToggleCollection(collection.id)}
                    className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{collection.name}</p>
                    <p className="text-xs text-gray-500">{collection.mealIds.length} item(s)</p>
                  </div>
                </label>
              ))}
            </div>
             <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-brand-primary font-semibold p-3 rounded-lg hover:bg-brand-light transition"
              >
                <FolderPlusIcon className="w-5 h-5"/> Create new collection
            </button>
          </div>
          <div className="p-4 bg-gray-50 mt-auto border-t">
            <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
          <CollectionFormModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateAndAdd}
          />
      )}
    </>,
    modalRoot
  );
};

export default AddToCollectionModal;
