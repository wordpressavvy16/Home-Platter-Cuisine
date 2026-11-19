
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Loader from './Loader';
import { useAuth } from '../hooks/useAuth';
import type { Order, Message, MealProvider, Inquiry } from '../types';
import * as orderApi from '../api/orderApi';
import * as inquiryApi from '../api/inquiryApi';
import * as geminiService from '../services/geminiService';
import { PaperAirplaneIcon, XMarkIcon, RobotIcon, UserIcon, ReceiptPercentIcon, CheckCircleIcon } from '../constants';
import QuoteFormModal from './QuoteFormModal'; // New Import

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  conversation?: Order | Inquiry;
  providerForNewInquiry?: MealProvider;
  navigate?: (path: string, params?: Record<string, any>) => void; // New prop for navigation
}

const ConversationModal: React.FC<ConversationModalProps> = ({ isOpen, onClose, onUpdate, conversation, providerForNewInquiry, navigate }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  const [currentConversation, setCurrentConversation] = useState<Order | Inquiry | null>(conversation || null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
    } else if (providerForNewInquiry) {
      setCurrentConversation(null); // Reset for new inquiry
      setMessages([{
        id: 'ai_welcome',
        senderId: 'ai_assistant',
        text: `Hi! I'm an AI assistant for ${providerForNewInquiry.name}. Feel free to ask any questions about the menu or schedule before you order!`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [conversation, providerForNewInquiry, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);
  
  const triggerAiResponse = useCallback(async (inquiry: Inquiry, provider: MealProvider) => {
    if (!token) return;
    setIsAiThinking(true);
    try {
        const aiResponse = await geminiService.getAiInquiryResponse(inquiry, provider, token);
        const aiMessage: Message = {
            id: `msg_ai_${Date.now()}`,
            senderId: 'ai_assistant',
            text: aiResponse.responseText,
            timestamp: new Date().toISOString(),
        };
        const updatedInquiry = await inquiryApi.addMessageToInquiry(inquiry.id, aiMessage, token);
        setCurrentConversation(updatedInquiry);
        setMessages(updatedInquiry.messages);
        onUpdate();
    } catch (error) {
        console.error("AI failed to respond:", error);
    } finally {
        setIsAiThinking(false);
    }
  }, [token, onUpdate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !token) return;

    const messageText = input;
    setInput('');
    setIsSending(true);

    try {
      if (currentConversation) { // Replying to an existing conversation
        const messageData = { senderId: user.id, text: messageText };
        let updatedConversation;
        if ('userId' in currentConversation) { // It's an Order
          updatedConversation = await orderApi.sendMessageToOrder(currentConversation.id, messageData, token);
        } else { // It's an Inquiry
           updatedConversation = await inquiryApi.addMessageToInquiry(currentConversation.id, messageData, token);
        }
        setCurrentConversation(updatedConversation);
        setMessages(updatedConversation.messages || []);
      } else if (providerForNewInquiry) { // Creating a new inquiry
        const firstMessage = { senderId: user.id, text: messageText };
        const newInquiry = await inquiryApi.createInquiry(providerForNewInquiry.id, firstMessage, token);
        setCurrentConversation(newInquiry);
        setMessages(newInquiry.messages || []);
        triggerAiResponse(newInquiry, providerForNewInquiry);
      }
      onUpdate();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Could not send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSendQuote = async (quoteData: { amount: number; expiresAt?: string }) => {
    if (!currentConversation || 'userId' in currentConversation || !token) return;
    const updatedInquiry = await inquiryApi.sendQuote(currentConversation.id, quoteData, token);
    setCurrentConversation(updatedInquiry);
    setMessages(updatedInquiry.messages);
    onUpdate();
  };
  
  const handleAcceptQuote = () => {
    if (navigate && currentConversation && !('userId' in currentConversation)) {
      navigate('/checkout', { inquiryId: currentConversation.id });
      onClose();
    }
  };

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;
  
  // FIX: Changed `currentConversation.customerName()` to `currentConversation.customerName` because `customerName` is a string property, not a function.
  const conversationTitle = currentConversation 
    ? ('userId' in currentConversation ? `Order #${currentConversation.id.slice(-6)}` : `Inquiry with ${currentConversation.customerName}`)
    : `Question for ${providerForNewInquiry?.name}`;

  const isProviderView = user?.role === 'PROVIDER';

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
        <div role="dialog" aria-modal="true" aria-labelledby="conversation-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[70vh] animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b">
            <h2 id="conversation-modal-title" className="text-xl font-bold text-gray-800 font-serif">{conversationTitle}</h2>
            <button onClick={onClose} aria-label="Close conversation" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map(msg => {
              const isSentByCurrentUser = msg.senderId === user?.id;
              const isFromAI = msg.senderId.startsWith('ai_');
              
              if (msg.messageType === 'quote' && msg.quote) {
                  const isAccepted = msg.quote.isAccepted;
                  return (
                      <div key={msg.id} className="my-4">
                          <div className="p-4 bg-white border-2 border-brand-primary rounded-lg shadow-md max-w-xs mx-auto text-center">
                              <ReceiptPercentIcon className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                              <h3 className="font-bold text-gray-800">Formal Quote Sent</h3>
                              <p className="text-3xl font-bold text-brand-dark my-2">₹{msg.quote.amount.toFixed(2)}</p>
                              {msg.quote.expiresAt && <p className="text-xs text-gray-500">Expires: {new Date(msg.quote.expiresAt).toLocaleDateString()}</p>}
                              
                              {!isProviderView && !isAccepted && (
                                  <button onClick={handleAcceptQuote} className="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                                      Accept & Pay
                                  </button>
                              )}
                              {isAccepted && (
                                  <div className="mt-4 flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-100 p-2 rounded-lg">
                                      <CheckCircleIcon className="w-5 h-5" />
                                      <span>Quote Accepted</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              }

              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isSentByCurrentUser ? 'justify-end' : ''}`}>
                  {!isSentByCurrentUser && (
                    isFromAI 
                      ? <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0"><RobotIcon className="w-5 h-5 text-brand-dark" /></div> 
                      : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-gray-600" /></div>
                  )}
                  <div className={`rounded-2xl p-3 max-w-xs ${
                    isSentByCurrentUser ? 'bg-brand-primary text-white rounded-br-none' 
                    : isFromAI ? 'bg-blue-100 text-blue-900 rounded-bl-none border border-blue-200'
                    : 'bg-white text-gray-800 rounded-bl-none border'
                  }`}>
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-gray-200' : 'text-gray-500'} text-right`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isSentByCurrentUser && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-gray-600" /></div>}
                </div>
              );
            })}
            {isAiThinking && (
                 <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0"><RobotIcon className="w-5 h-5 text-brand-dark" /></div>
                    <div className="rounded-2xl p-3 bg-blue-100 rounded-bl-none border border-blue-200">
                       <div className="flex items-center gap-1.5">
                           <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                       </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            {isProviderView && currentConversation && !('userId' in currentConversation) && (
              <button onClick={() => setIsQuoteModalOpen(true)} className="w-full mb-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2">
                  <ReceiptPercentIcon className="w-5 h-5"/>
                  Send Formal Quote
              </button>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                disabled={isSending || isAiThinking}
              />
              <button type="submit" disabled={isSending || !input.trim() || isAiThinking} className="bg-brand-primary text-white p-3 rounded-lg hover:bg-brand-dark transition-colors disabled:bg-gray-400">
                {isSending ? <Loader text="" /> : <PaperAirplaneIcon className="w-6 h-6" />}
              </button>
            </form>
          </div>
        </div>
      </div>
      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={handleSendQuote}
      />
    </>,
    modalRoot
  );
};

export default ConversationModal;