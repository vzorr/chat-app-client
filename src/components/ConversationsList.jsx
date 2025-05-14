import React, { useState } from 'react';
import { Search, Menu, LogOut } from 'lucide-react';

const ConversationsList = ({ 
  conversations, 
  currentUser, 
  onConversationClick, 
  activeConversation,
  onlineUsers,
  onLogout 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="conversation-header">
        <div className="conversation-avatar">
          {currentUser.name[0].toUpperCase()}
          <div className="online-indicator" style={{ 
            backgroundColor: '#00a884',
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid #111b21'
          }} />
        </div>
        <div className="header-title">
          <h2>{currentUser.name}</h2>
        </div>
        <div className="header-actions">
          {onLogout && (
            <button className="header-btn" onClick={onLogout} title="Logout">
              <LogOut size={20} />
            </button>
          )}
          <button className="header-btn">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-box">
          <Search size={18} color="#8696a0" style={{ position: 'absolute' }} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {filteredConversations.map(conversation => (
          <div
            key={conversation.id}
            className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
            onClick={() => onConversationClick(conversation)}
          >
            <div className="conversation-avatar">
              {conversation.user.name[0].toUpperCase()}
              {onlineUsers[conversation.user.id] && (
                <div className="online-indicator" />
              )}
            </div>
            
            <div className="conversation-details">
              <div className="conversation-name">
                {conversation.user.name}
              </div>
              <div className="conversation-last-message">
                {conversation.lastMessage ? (
                  <>
                    {conversation.lastMessage.isFromMe && <span>You: </span>}
                    {conversation.lastMessage.text}
                  </>
                ) : (
                  <span style={{ fontStyle: 'italic' }}>No messages yet</span>
                )}
              </div>
            </div>
            
            <div className="conversation-meta">
              <div className="conversation-time">
                {formatTime(conversation.lastMessage?.timestamp || conversation.timestamp)}
              </div>
              {conversation.unreadCount > 0 && (
                <div className="unread-count">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ConversationsList;