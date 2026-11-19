
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';
import type { Collection } from '../types';

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; isPublic?: boolean }) => Promise<void>;
  collectionToEdit?: Collection | null;
}

const CollectionFormModal: React.FC<CollectionFormModalProps> = ({ isOpen, onClose, onSubmit, collectionToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (collectionToEdit) {
      setName(collectionToEdit.name);
      setDescription(collectionToEdit.description || '');
      setIsPublic(collectionToEdit.isPublic || false);
    } else {
      setName('');
      setDescription('');
      setIsPublic(false);
    }
    setError('');
  }, [collectionToEdit, isOpen]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Collection name is required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, isPublic });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="collection-form-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="collection-form-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            {collectionToEdit ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button onClick={onClose} aria-label="Close collection form" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Collection Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-2">Description (Optional)</label>
            <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
              <span className="text-sm font-medium text-gray-700">Make this collection public</span>
            </label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Save Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default CollectionFormModal;
