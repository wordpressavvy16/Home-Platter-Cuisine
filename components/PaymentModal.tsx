
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, ShieldCheckIcon } from '../constants';
import Loader from './Loader';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => Promise<void>;
  totalAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirmPayment, totalAmount }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    // Simulate network delay for payment gateway
    setTimeout(async () => {
        try {
            await onConfirmPayment();
            // On success, the parent component will handle closing and navigation.
        } catch (error) {
            // Error is handled by parent, but we should stop processing here.
             setIsProcessing(false);
        }
    }, 2500); // 2.5 second delay
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={isProcessing ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="payment-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="payment-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Confirm Payment
          </h2>
          {!isProcessing && (
             <button onClick={onClose} aria-label="Close payment confirmation" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
          )}
        </div>

        <div className="p-8 text-center">
            {isProcessing ? (
                <div className="py-8">
                    <Loader text="Processing payment..." />
                    <p className="text-sm text-gray-500 mt-4">Please do not close this window.</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-2">You are about to pay</p>
                    <p className="text-5xl font-bold text-brand-dark mb-8">
                        ₹{totalAmount.toFixed(2)}
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={handlePay}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 text-lg"
                        >
                           <ShieldCheckIcon className="w-6 h-6"/>
                           Pay Now
                        </button>
                         <button
                            onClick={onClose}
                            className="w-full text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                           Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default PaymentModal;
