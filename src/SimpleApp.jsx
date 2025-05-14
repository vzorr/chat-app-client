import React, { useState, useEffect } from 'react';
import ConversationsList from './components/ConversationsList';
import ChatView from './components/ChatView';
import './App.css';

const SimpleApp = ({ currentUser: initialUser, allUsers, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize without token for testing
  useEffect(() => {
    if (!initialUser) {
      console.log('No initial user provided');
      setIsLoading(false);
      return;
    }
    
    console.log('Setting up user:', initialUser);
    
    // Set current user directly (without token for now)
    setCurrentUser(initialUser);
    
    // Initialize conversations for all other users
    const otherUsers = allUsers.filter(u => u.id !== initialUser.id);
    const initialConversations = otherUsers.map(user => ({
      id: `conv-${user.id}`,
      user: user,
      lastMessage: null,
      timestamp: new Date(),
      unreadCount: 0
    }));
    
    setConversations(initialConversations);
    setIsLoading(false);
  }, [initialUser, allUsers]);

  const handleSendMessage = (text) => {
    if (!activeConversation) return;
    
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      text,
      senderId: currentUser.id,
      receiverId: conversation.user.id,
      timestamp: new Date(),
      status: 'sent',
      serverConfirmed: true
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          lastMessage: {
            text,
            timestamp: new Date(),
            isFromMe: true
          },
          timestamp: new Date()
        };
      }
      return conv;
    }));
  };

  const handleTyping = (isTyping) => {
    console.log('Typing:', isTyping);
  };

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div>Loading Chat...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-loading">
        <div>No user selected</div>
      </div>
    );
  }

  const activeConversationData = conversations.find(c => c.id === activeConversation);
  const filteredMessages = activeConversationData ? messages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === activeConversationData.user.id) ||
    (msg.senderId === activeConversationData.user.id && msg.receiverId === currentUser.id)
  ) : [];

  return (
    <div className="whatsapp-container">
      <div className={`conversations-panel ${activeConversation ? 'mobile-hidden' : ''}`}>
        <ConversationsList
          conversations={conversations}
          currentUser={currentUser}
          onConversationClick={handleConversationClick}
          activeConversation={activeConversation}
          onlineUsers={onlineUsers}
          onLogout={onLogout}
        />
      </div>
      
      <div className={`chat-panel ${!activeConversation ? 'mobile-hidden' : ''}`}>
        {activeConversationData ? (
          <ChatView
            currentUser={currentUser}
            otherUser={activeConversationData.user}
            messages={filteredMessages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            isOtherUserOnline={onlineUsers[activeConversationData.user.id] || false}
            isOtherUserTyping={typingUsers[activeConversationData.user.id] || false}
            onBack={handleBack}
          />
        ) : (
          <div className="no-conversation">
            <div className="no-conversation-content">
              <h2>WhatsApp Clone</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleApp;