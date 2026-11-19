import React, { useState } from 'react';
import type { MealProvider } from '../types';
import { ReceiptPercentIcon } from '../constants';
import InvoiceHistoryModal from './InvoiceHistoryModal';

interface SubscriptionPanelProps {
    provider: MealProvider | null;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ provider }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!provider) return null;

    const { subscription } = provider;

    return (
        <>
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <ReceiptPercentIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">My Subscription</h2>
                        <p className="text-sm text-text/70">Plan & Billing Details</p>
                    </div>
                </div>

                <div className="flex-grow space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-baseline">
                        <span className="text-text/80">Current Plan:</span>
                        <span className="font-bold text-lg text-text">{subscription.planName}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-text/80">Monthly Cost:</span>
                        <span className="font-bold text-lg text-text">₹{subscription.monthlyCost.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-text/80">Next Billing:</span>
                        <span className="font-bold text-lg text-text">{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                    View Billing History
                </button>
            </div>
            {isModalOpen && (
                <InvoiceHistoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    providerId={provider.id}
                />
            )}
        </>
    );
};

export default SubscriptionPanel;