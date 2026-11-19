import React from 'react';
import ReactDOM from 'react-dom';
import type { Order } from '../types';
import { BellIcon } from '../constants';

interface NewOrderAlertModalProps {
  order: Order;
  onAcknowledge: () => void;
}

const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({ order, onAcknowledge }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 text-center animate-slide-up border-4 border-brand-primary">
        <BellIcon className="w-20 h-20 text-brand-primary mx-auto mb-4 animate-bounce" />
        <h1 className="text-4xl font-bold text-brand-dark font-serif mb-2">New Order Received!</h1>
        <p className="text-gray-600 mb-6">You have a new order from <span className="font-semibold">{order.customerName}</span>.</p>

        <div className="text-left bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">Order Summary:</h3>
          <ul className="space-y-1 text-sm">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onAcknowledge}
          className="w-full bg-brand-primary text-white font-bold py-4 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 text-lg animate-press"
        >
          Acknowledge & Mute Alarm
        </button>
      </div>
    </div>,
    modalRoot
  );
};

export default NewOrderAlertModal;