import React, { createContext, useState, useCallback, useMemo, useContext } from 'react';

interface ChatbotContextType {
  isOpen: boolean;
  systemMessage: string | null;
  openChatbot: (options?: { systemMessage?: string }) => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const openChatbot = useCallback((options?: { systemMessage?: string }) => {
    if (options?.systemMessage) {
      setSystemMessage(options.systemMessage);
    }
    setIsOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    // Reset message on close so it's generic next time unless specified
    setSystemMessage(null);
  }, []);
  
  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => {
        if (prev) { // If it's currently open and we are closing it
             setSystemMessage(null);
        }
        return !prev;
    });
  }, []);


  const value = useMemo(() => ({
    isOpen,
    systemMessage,
    openChatbot,
    closeChatbot,
    toggleChatbot,
  }), [isOpen, systemMessage, openChatbot, closeChatbot, toggleChatbot]);

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};