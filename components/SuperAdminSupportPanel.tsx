import React, { useState, useEffect, useCallback } from 'react';
import * as supportApi from '../api/supportApi';
import { useAuth } from '../hooks/useAuth';
import type { SupportTicket, TicketStatus } from '../types';
import Loader from './Loader';
import { LifebuoyIcon } from '../constants';
import TicketConversationModal from './TicketConversationModal';

const statusStyles: { [key in TicketStatus]: string } = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const SuperAdminSupportPanel = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');

    const fetchTickets = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await supportApi.getAllTickets(token);
            setTickets(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tickets.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const filteredTickets = tickets.filter(
        t => statusFilter === 'ALL' || t.status === statusFilter
    );

    const tableHeaders = ["User", "Role", "Subject", "Category", "Last Updated", "Status"];

    return (
        <>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <LifebuoyIcon className="w-8 h-8 text-brand-primary" />
                        <div>
                            <h2 className="text-2xl font-bold text-text">Support Tickets</h2>
                            <p className="text-text/70">Manage all user support inquiries.</p>
                        </div>
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
                            className="p-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <Loader text="Loading tickets..." />
                    ) : error ? (
                        <p className="text-red-500 text-center py-8">{error}</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {tableHeaders.map(header => (
                                        <th key={header} className="p-4 text-sm font-semibold text-gray-600 uppercase">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTickets.map(ticket => (
                                    <tr key={ticket.id} onClick={() => handleViewTicket(ticket)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="p-4 font-medium text-text">{ticket.userName}</td>
                                        <td className="p-4 text-text/80">{ticket.userRole}</td>
                                        <td className="p-4 text-text">{ticket.subject}</td>
                                        <td className="p-4 text-text/80">{ticket.category.replace(/_/g, ' ')}</td>
                                        <td className="p-4 text-text/80">{new Date(ticket.updatedAt).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold py-1 px-3 rounded-full ${statusStyles[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {filteredTickets.length === 0 && !isLoading && !error && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No tickets found matching your filter.</p>
                        </div>
                    )}
                </div>
            </div>
            {selectedTicket && (
                <TicketConversationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    ticket={selectedTicket}
                    onUpdate={fetchTickets}
                />
            )}
        </>
    );
};

export default SuperAdminSupportPanel;