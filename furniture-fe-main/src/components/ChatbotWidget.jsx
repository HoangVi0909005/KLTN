import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Minimize2 } from 'lucide-react';
import ChatService from '../api/ChatService';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Tạo session ID khi component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbot_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadChatHistory(storedSessionId);
    } else {
      const newSessionId = ChatService.generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('chatbot_session_id', newSessionId);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history
  const loadChatHistory = async (sessionId) => {
    try {
      const response = await ChatService.getChatHistory(sessionId);
      if (response.success && response.data) {
        const formattedMessages = response.data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: 'user',
          timestamp: msg.timestamp
        })).concat(response.data.map(msg => ({
          id: `${msg.id}_response`,
          text: msg.response,
          sender: 'bot',
          timestamp: msg.timestamp
        }))).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ChatService.sendMessage(inputMessage, sessionId);
      
      if (response.success && response.data) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'bot',
          timestamp: response.data.timestamp,
          suggestedProducts: response.data.suggestedProducts
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat
  const handleClearChat = async () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử chat?')) {
      try {
        await ChatService.clearChatHistory(sessionId);
        setMessages([]);
        const newSessionId = ChatService.generateSessionId();
        setSessionId(newSessionId);
        localStorage.setItem('chatbot_session_id', newSessionId);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <button 
        className="chatbot-trigger-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open chatbot"
      >
        <MessageCircle size={24} />
        <span className="chatbot-badge">AI</span>
      </button>
    );
  }

  return (
    <div className={`chatbot-widget ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-avatar">
            <MessageCircle size={20} />
          </div>
          <div className="chatbot-header-text">
            <h3>Trợ lý AI Nội thất</h3>
            <p>Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button 
            onClick={toggleMinimize}
            className="chatbot-icon-button"
            aria-label="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={handleClearChat}
            className="chatbot-icon-button"
            aria-label="Clear chat"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="chatbot-icon-button"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <MessageCircle size={48} />
                <h4>Xin chào! 👋</h4>
                <p>Tôi là trợ lý AI tư vấn nội thất. Hãy hỏi tôi bất cứ điều gì về sản phẩm!</p>
                <div className="chatbot-suggestions">
                  <button onClick={() => setInputMessage('Tôi cần tìm sofa cho phòng khách')}>
                    🛋️ Tìm sofa
                  </button>
                  <button onClick={() => setInputMessage('Giới thiệu bàn ăn giá tốt')}>
                    🍽️ Bàn ăn
                  </button>
                  <button onClick={() => setInputMessage('Tủ quần áo nào đẹp?')}>
                    👔 Tủ quần áo
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message ${message.sender}`}>
                <div className="chatbot-message-content">
                  <p>{message.text}</p>
                  
                  {/* Suggested Products */}
                  {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                    <div className="chatbot-products">
                      <p className="chatbot-products-title">Sản phẩm gợi ý:</p>
                      {message.suggestedProducts.map((product) => (
                        <div key={product.id} className="chatbot-product-card">
                          <img 
                            src={product.imageUrl || '/placeholder.png'} 
                            alt={product.name}
                            className="chatbot-product-image"
                          />
                          <div className="chatbot-product-info">
                            <h5>{product.name}</h5>
                            <p className="chatbot-product-category">{product.category}</p>
                            <p className="chatbot-product-price">{product.price} đ</p>
                            <button 
                              className="chatbot-product-button"
                              onClick={() => window.location.href = `/products/${product.id}`}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="chatbot-message-time">
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="chatbot-input"
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="chatbot-send-button"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotWidget;