import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';

const ChatView = ({ 
  currentUser, 
  otherUser, 
  messages, 
  onSendMessage, 
  onTyping,
  isOtherUserOnline,
  isOtherUserTyping,
  onBack
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.length > 0) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
    } else {
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} className="status-icon" />;
      case 'sent':
        return <Check size={14} className="status-icon" />;
      case 'delivered':
        return <CheckCheck size={14} className="status-icon" />;
      case 'read':
        return <CheckCheck size={14} className="status-icon read-receipt" />;
      case 'failed':
        return <AlertCircle size={14} className="status-icon" style={{ color: '#f15c6d' }} />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="conversation-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        
        <div className="conversation-avatar">
          {otherUser.name[0].toUpperCase()}
          {isOtherUserOnline && <div className="online-indicator" />}
        </div>
        
        <div className="header-title">
          <h2>{otherUser.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#8696a0' }}>
            {isOtherUserTyping ? (
              <span className="typing-indicator">typing...</span>
            ) : (
              isOtherUserOnline ? 'online' : 'offline'
            )}
          </p>
        </div>
        
        <div className="header-actions">
          <button className="header-btn">
            <Video size={20} />
          </button>
          <button className="header-btn">
            <Phone size={20} />
          </button>
          <button className="header-btn">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1rem 0',
            }}>
              <span style={{
                background: '#182229',
                color: '#8696a0',
                padding: '0.25rem 0.75rem',
                borderRadius: '7px',
                fontSize: '0.75rem',
              }}>
                {formatDateLabel(dateKey)}
              </span>
            </div>
            
            {dateMessages.map(message => (
              <div
                key={message.id}
                className={`message-item ${message.senderId === currentUser.id ? 'own-message' : ''}`}
              >
                <div className={`message-bubble ${
                  message.senderId === currentUser.id ? 'own' : 'other'
                } ${message.status === 'pending' ? 'pending' : ''} ${
                  message.status === 'failed' ? 'failed' : ''
                }`}>
                  <p className="message-text">{message.text}</p>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                    {message.senderId === currentUser.id && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="input-container">
        <button className="icon-btn">
          <Smile size={24} />
        </button>
        <button className="icon-btn">
          <Paperclip size={24} />
        </button>
        
        <div className="input-box">
          <input
            type="text"
            placeholder="Type a message"
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        {messageInput.trim() ? (
          <button className="icon-btn send-btn" onClick={handleSend}>
            <Send size={24} />
          </button>
        ) : (
          <button className="icon-btn">
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatView;