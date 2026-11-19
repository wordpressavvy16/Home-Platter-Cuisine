
import React from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '../constants';
import type { SampleMenu } from '../types';

interface SampleMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  sampleMenu?: SampleMenu;
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const SampleMenuModal: React.FC<SampleMenuModalProps> = ({ isOpen, onClose, planName, sampleMenu }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            Sample Menu: {planName}
          </h2>
          <button onClick={onClose} aria-label="Close menu view" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4">Please note: This is a sample menu to give you an idea of the variety. The actual meals may vary based on seasonal availability.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Day</th>
                  <th className="p-3 font-semibold text-gray-600">Lunch</th>
                  <th className="p-3 font-semibold text-gray-600">Dinner</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {daysOfWeek.map(day => (
                  <tr key={day}>
                    <td className="p-3 font-medium capitalize text-gray-800">{day}</td>
                    <td className="p-3 text-gray-700">{sampleMenu?.[day]?.lunch || '-'}</td>
                    <td className="p-3 text-gray-700">{sampleMenu?.[day]?.dinner || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default SampleMenuModal;
