import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as supportApi from '../api/supportApi';
import type { SupportTicket, TicketCategory, TicketStatus } from '../types';
import Loader from './Loader';
import { BackArrowIcon, PlusIcon } from '../constants';
import TicketFormModal from './TicketFormModal';
import TicketConversationModal from './TicketConversationModal';

interface HelpPageProps {
  navigate: (path: string) => void;
}

const statusStyles: { [key in TicketStatus]: string } = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const HelpPage: React.FC<HelpPageProps> = ({ navigate }) => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!token) {
      setError('You must be logged in to view your support tickets.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await supportApi.getTicketsForUser(token);
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (data: { subject: string; category: TicketCategory; message: string }) => {
    if (!token) throw new Error('Authentication error.');
    await supportApi.createTicket(data, token);
    await fetchTickets();
  };
  
  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsConversationModalOpen(true);
  };

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <BackArrowIcon className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif">
                Help & Support
              </h1>
            </div>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors duration-300"
            >
              <PlusIcon className="w-6 h-6" />
              Create New Ticket
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800">My Support Tickets</h2>
              <p className="text-gray-500 mt-1">Track the status of your inquiries here.</p>
            </div>
            {isLoading ? (
              <div className="py-16 flex justify-center"><Loader text="Loading your tickets..." /></div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : tickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Subject</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Category</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Last Updated</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} onClick={() => handleViewTicket(ticket)} className="hover:bg-gray-50 cursor-pointer">
                        <td className="p-4 font-medium text-gray-900">{ticket.subject}</td>
                        <td className="p-4 text-gray-600">{ticket.category.replace(/_/g, ' ')}</td>
                        <td className="p-4 text-gray-600">{new Date(ticket.updatedAt).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold py-1 px-3 rounded-full ${statusStyles[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-700 font-semibold">No tickets found</p>
                <p className="text-gray-500 mt-2">Click "Create New Ticket" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TicketFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
      
      {selectedTicket && (
        <TicketConversationModal
          isOpen={isConversationModalOpen}
          onClose={() => setIsConversationModalOpen(false)}
          ticket={selectedTicket}
          onUpdate={fetchTickets}
        />
      )}
    </>
  );
};

export default HelpPage;
