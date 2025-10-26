import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext'; // Import useAuth
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load if user is authenticated and hasn't loaded yet
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadConversations();
    }
    
    // Reset when user logs out
    if (!user) {
      hasLoadedRef.current = false;
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]); // Dependency on user

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.getConversations();
      setConversations(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to load conversations:', error);
      }
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const { data } = await chatAPI.getConversationMessages(conversationId);
      setCurrentConversation(data.conversation);
      setMessages(data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const createNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      messages,
      loading,
      loadConversations,
      loadMessages,
      deleteConversation,
      createNewConversation,
      setMessages,
      setCurrentConversation,
      setConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};