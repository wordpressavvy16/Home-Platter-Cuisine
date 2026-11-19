import React, { useState } from 'react';
import type { MealProvider } from '../types';
import * as providerApi from '../api/providerApi';
import { useAuth } from '../hooks/useAuth';
import { MegaphoneIcon, PlusIcon } from '../constants';
import BroadcastModal from './BroadcastModal';

interface BroadcastPanelProps {
    provider: MealProvider | null;
    onUpdate: () => void;
}

const BroadcastPanel: React.FC<BroadcastPanelProps> = ({ provider, onUpdate }) => {
    const { token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmitAnnouncement = async (message: string) => {
        if (!provider?.id || !token) {
            throw new Error("Cannot send announcement: provider or auth token is missing.");
        }
        await providerApi.addAnnouncement(provider.id, message, token);
        onUpdate(); // Trigger data refresh on DashboardPage
    };

    const announcements = provider?.announcements || [];

    return (
        <>
            <div className="p-6 flex flex-col items-center h-full">
                <MegaphoneIcon className="w-16 h-16 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-text">Broadcasts</h2>
                <p className="text-text/70 mt-2 flex-grow text-center">Send updates and promotions directly to your customers.</p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    <PlusIcon className="w-5 h-5"/>
                    New Broadcast
                </button>
            </div>
            <BroadcastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitAnnouncement}
            />
        </>
    );
};

export default BroadcastPanel;