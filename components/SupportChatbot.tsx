import React, { useState, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, RobotIcon, UserIcon } from '../constants';
import FeedbackButtons from './FeedbackButtons';
import { useChatbot } from '../providers/ChatbotProvider';

interface SupportChatbotProps {
    onClose: () => void;
}

const SupportChatbot: React.FC<SupportChatbotProps> = ({ onClose }) => {
    const { systemMessage } = useChatbot();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const welcomeText = systemMessage || "Hello! I'm the Home Platter Support bot. How can I help you today? You can ask about our services, how to manage your account, or check on an order.";
        setMessages([{
            id: 'system_welcome',
            role: 'SYSTEM',
            text: welcomeText,
        }]);
    }, [systemMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `user_${Date.now()}`, role: 'USER', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessageId = `model_${Date.now()}`;
        setMessages(prev => [...prev, { id: modelMessageId, role: 'MODEL', text: '' }]);
        
        try {
            const stream = await chatService.sendMessageStream(input);
            for await (const chunk of stream) {
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: msg.text + chunk.text } : msg
                ));
            }
        } catch (error) {
            console.error("Chat service error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === modelMessageId ? { ...msg, text: "Sorry, I encountered an error. Please try again." } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col h-[70vh] animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-light p-2 rounded-full">
                        <RobotIcon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Home Platter Support</h3>
                </div>
            </div>

            {/* Messages */}
            <div role="log" aria-live="polite" className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id}>
                        <div className={`flex items-start gap-3 ${msg.role === 'USER' ? 'justify-end' : ''}`}>
                            {msg.role !== 'USER' && (
                                 <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                                    <RobotIcon className="w-5 h-5 text-brand-dark" />
                                </div>
                            )}
                            <div className={`rounded-2xl p-3 max-w-xs md:max-w-sm ${
                                msg.role === 'USER' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            } ${msg.role === 'SYSTEM' ? 'bg-indigo-50 text-indigo-800 rounded-bl-none border border-indigo-200' : ''}`}>
                                 <p className="text-sm break-words">{msg.text}</p>
                            </div>
                             {msg.role === 'USER' && (
                                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                </div>
                            )}
                        </div>
                        {msg.role === 'MODEL' && msg.text && (
                            <div className="flex justify-start ml-11 mt-2">
                                <FeedbackButtons featureName="support_chatbot" details={{ messageId: msg.id, conversation: messages }} />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && messages[messages.length - 1].role !== 'MODEL' && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                            <RobotIcon className="w-5 h-5 text-brand-dark" />
                        </div>
                        <div className="rounded-2xl p-3 bg-gray-100 rounded-bl-none">
                           <div className="flex items-center gap-1.5">
                               <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                               <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                               <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-primary text-white p-3 rounded-lg hover:bg-brand-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportChatbot;