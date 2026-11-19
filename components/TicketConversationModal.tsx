
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as supportApi from '../api/supportApi';
import type { SupportTicket, TicketMessage } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PaperAirplaneIcon, XMarkIcon, UserIcon, RobotIcon } from '../constants';
import Loader from './Loader';

interface TicketConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket;
  onUpdate: () => void; // Callback to refresh data in parent
}

const TicketConversationModal: React.FC<TicketConversationModalProps> = ({ isOpen, onClose, ticket, onUpdate }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>(ticket.messages || []);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    setMessages(ticket.messages || []);
  }, [ticket.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !modalRoot || !user || !token) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      await supportApi.addMessageToTicket(ticket.id, input, token);
      setInput('');
      onUpdate();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Could not send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const AdminIcon = () => (
    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">SA</div>
  );

  const AiIcon = () => (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
        <RobotIcon className="w-5 h-5" />
    </div>
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ticket-conversation-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[70vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="ticket-conversation-modal-title" className="text-xl font-bold text-gray-800 truncate" title={ticket.subject}>
            Ticket #{ticket.id.slice(-6)}: {ticket.subject}
          </h2>
          <button onClick={onClose} aria-label="Close ticket conversation" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map(msg => {
            const isSentByCurrentUser = msg.senderId === user.id;
            const isAdminMessage = msg.senderId.startsWith('sadmin');
            const isAiMessage = msg.senderId === 'ai_triage_bot';

            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isSentByCurrentUser ? 'justify-end' : ''}`}>
                {!isSentByCurrentUser && (
                    isAiMessage ? <AiIcon /> : isAdminMessage ? <AdminIcon/> : <UserIcon className="w-8 h-8 text-gray-500"/>
                )}
                <div className={`rounded-2xl p-3 max-w-xs ${
                  isSentByCurrentUser ? 'bg-brand-primary text-white rounded-br-none' 
                  : isAiMessage ? 'bg-blue-100 text-blue-900 rounded-bl-none border border-blue-200'
                  : (isAdminMessage ? 'bg-purple-100 text-purple-900 rounded-bl-none' : 'bg-gray-200 text-gray-800 rounded-bl-none')
                }`}>
                  <p className="text-sm font-bold">{msg.senderName}</p>
                  <p className="text-sm break-words mt-1">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-gray-200' : 'text-gray-500'} text-right`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isSentByCurrentUser && <UserIcon className="w-8 h-8 text-gray-500"/>}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your reply..."
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              disabled={isSending || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
            />
            <button type="submit" disabled={isSending || !input.trim() || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'} className="bg-brand-primary text-white p-3 rounded-lg hover:bg-brand-dark transition-colors disabled:bg-gray-400">
              {isSending ? <Loader text="" /> : <PaperAirplaneIcon className="w-6 h-6" />}
            </button>
          </form>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default TicketConversationModal;
