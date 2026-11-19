
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import type { Invoice } from '../types';
import { XMarkIcon, DocumentTextIcon } from '../constants';
import Loader from './Loader';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
}

const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({ isOpen, onClose, providerId }) => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      setIsLoading(true);
      setError('');
      providerApi.getInvoicesForProvider(providerId, token)
        .then(setInvoices)
        .catch(err => setError(err.message || 'Failed to fetch invoices.'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, token, providerId]);

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-history-modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="invoice-history-modal-title" className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Billing History
          </h2>
          <button onClick={onClose} aria-label="Close billing history" className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <Loader text="Loading invoices..." />
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div>
                      <p className="font-bold text-lg text-gray-800">{invoice.period}</p>
                      <p className="text-xs text-gray-500">
                        Generated: {new Date(invoice.generatedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:text-right">
                      <p className="font-bold text-xl text-brand-dark">₹{invoice.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Invoice ID: {invoice.id.slice(-6)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Invoices Found</h3>
                <p className="text-gray-500 mt-2">Your past invoices will appear here.</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-2xl mt-auto text-center">
            <button onClick={onClose} className="font-semibold text-brand-primary hover:underline">
                Close
            </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default InvoiceHistoryModal;
