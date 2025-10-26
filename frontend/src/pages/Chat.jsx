import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Plus,
  Settings,
  MessageSquare,
  Trash2,
  LogOut,
  User,
  Key,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Search,
  MoreVertical,
  Edit3,
  Archive,
  Download,
  Copy,
  RefreshCw,
  Zap,
  Brain,
  Code,
  Lightbulb,
  Menu,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import './Chat.css';

export default function Chat() {
  const { user, logout, updateUser } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    loadMessages,
    deleteConversation,
    createNewConversation,
    setMessages,
    setCurrentConversation,
  } = useChat();

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(user?.preferences?.model || 'gpt-4');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.hasApiKey) {
      setShowApiKeyModal(true);
    }
  }, [user]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    if (!user?.hasApiKey) {
      toast.error('Please set your OpenAI API key first');
      setShowApiKeyModal(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversation?._id,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'start') {
                if (!currentConversation) {
                  setCurrentConversation({ _id: data.conversationId });
                }
              } else if (data.type === 'content') {
                assistantMessage.content += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } else if (data.type === 'error') {
                toast.error(data.error);
                break;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      toast.error('Failed to send message: ' + error.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    await loadMessages(conv._id);
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(convId);
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await userAPI.updateApiKey(apiKey);
      updateUser({ hasApiKey: true });
      toast.success('API key saved successfully');
      setShowApiKeyModal(false);
      setApiKey('');
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const prompts = [
    { icon: Brain, title: 'Explain Concepts', text: 'Break down complex topics simply' },
    { icon: Code, title: 'Write Code', text: 'Generate code snippets and solutions' },
    { icon: Lightbulb, title: 'Brainstorm Ideas', text: 'Creative problem solving' },
    { icon: Zap, title: 'Quick Answers', text: 'Get instant responses' },
  ];

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Sparkles />
            </div>
            <span className="brand-name">ChatGPT</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <XCircle size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="sidebar-action">
          <button onClick={createNewConversation} className="new-chat-btn">
            <Plus size={20} />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="sidebar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={40} />
              <p>No conversations yet</p>
              <span>Start chatting to create history</span>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleSelectConversation(conv)}
                className={`conversation-item ${
                  currentConversation?._id === conv._id ? 'active' : ''
                }`}
              >
                <div className="conversation-icon">
                  <MessageSquare size={16} />
                </div>
                <div className="conversation-content">
                  <h4>{conv.title}</h4>
                  <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="conversation-actions">
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="icon-btn danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <h4>{user?.name}</h4>
              <span>{user?.email}</span>
            </div>
            <button className="icon-btn" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={18} />
            </button>
          </div>

          {showSettings && (
            <div className="settings-dropdown">
              <button onClick={() => setShowApiKeyModal(true)} className="setting-item">
                <Key size={18} />
                <span>API Settings</span>
              </button>
              <button onClick={logout} className="setting-item danger">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            {!sidebarOpen && (
              <button 
                className="menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            )}
            <h1>{currentConversation?.title || 'New Conversation'}</h1>
          </div>

          <div className="header-right">
            <div className="model-selector">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div className={`api-status ${user?.hasApiKey ? 'active' : 'inactive'}`}>
              <div className="status-dot"></div>
              <span>{user?.hasApiKey ? 'Connected' : 'No API Key'}</span>
            </div>
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <Sparkles size={48} />
              </div>
              <h2>How can I help you today?</h2>
              <p>Choose a prompt below or start typing your own message</p>

              <div className="prompt-grid">
                {prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt.text)}
                    className="prompt-card"
                  >
                    <div className="prompt-icon">
                      <prompt.icon size={24} />
                    </div>
                    <h3>{prompt.title}</h3>
                    <p>{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <User size={20} />
                    ) : (
                      <Sparkles size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-text">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="message-actions">
                        <button className="action-btn" title="Copy">
                          <Copy size={14} />
                        </button>
                        <button className="action-btn" title="Regenerate">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Sparkles size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message ChatGPT..."
              rows={1}
              disabled={isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              className="send-btn"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="input-hint">
            {user?.hasApiKey ? (
              <>Using {selectedModel} • Press Enter to send</>
            ) : (
              <span className="error">⚠️ Please configure your API key</span>
            )}
          </p>
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configure API Key</h2>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Enter your OpenAI API key to start using the chat. Your key is stored securely and encrypted.
              </p>

              <div className="form-group">
                <label>OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="modal-input"
                />
              </div>

              <div className="info-box">
                <Key size={20} />
                <div>
                  <strong>How to get an API key?</strong>
                  <p>
                    Visit{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="btn-primary"
              >
                <Check size={18} />
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}