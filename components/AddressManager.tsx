
import React, { useState } from 'react';
import type { Address } from '../types';
import AddressFormModal from './AddressFormModal';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';

interface AddressManagerProps {
    addresses: Address[];
    onUpdate: (updatedAddresses: Address[]) => Promise<void>;
}

const AddressManager: React.FC<AddressManagerProps> = ({ addresses, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    const handleOpenModal = (address?: Address) => {
        setAddressToEdit(address || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setAddressToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveAddress = async (formData: Omit<Address, 'id'>) => {
        let updatedAddresses;
        if (addressToEdit) {
            // Update existing address
            updatedAddresses = addresses.map(addr => 
                addr.id === addressToEdit.id ? { ...addr, ...formData } : addr
            );
        } else {
            // Add new address
            const newAddress: Address = { ...formData, id: `addr_${Date.now()}` };
            updatedAddresses = [...addresses, newAddress];
        }
        await onUpdate(updatedAddresses);
    };

    const handleDeleteAddress = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            await onUpdate(updatedAddresses);
        }
    };

    return (
        <>
            <div className="space-y-4">
                {addresses.length > 0 ? (
                    addresses.map(addr => (
                        <div key={addr.id} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-800">{addr.name}</p>
                                <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.postalCode}</p>
                                <p className="text-sm text-gray-600">{addr.phone}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => handleOpenModal(addr)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">You have no saved addresses.</p>
                    </div>
                )}
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors duration-300"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add New Address
                </button>
            </div>

            <AddressFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveAddress}
                addressToEdit={addressToEdit}
            />
        </>
    );
};

export default AddressManager;