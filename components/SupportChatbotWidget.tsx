import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SupportChatbot from './SupportChatbot';
import { WhatsAppIcon, XMarkIcon } from '../constants';
import { useChatbot } from '../providers/ChatbotProvider';

const SupportChatbotWidget = () => {
    const { isOpen, toggleChatbot } = useChatbot();

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleChatbot}
                    className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform hover:scale-110 transition-all duration-200"
                    aria-label={isOpen ? "Close support chat" : "Open support chat"}
                >
                    {isOpen ? <XMarkIcon className="w-8 h-8" /> : <WhatsAppIcon className="w-8 h-8" />}
                </button>
            </div>
            {isOpen && <SupportChatbot onClose={toggleChatbot} />}
        </>
    );
};

export default SupportChatbotWidget;