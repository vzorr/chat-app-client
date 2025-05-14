import React, { useState, useEffect, useRef } from 'react';
import ConversationsList from './ConversationsList';
import ChatView from './ChatView';
import SocketService from '../services/SocketService';
import AuthService from '../services/AuthService';
import '../App.css';

const ChatApp = ({ currentUser, allUsers, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(new SocketService());
  const pendingMessagesRef = useRef(new Map());

  useEffect(() => {
    const initUser = async () => {
      try {
        setIsLoading(true);
        console.log(`🔐 Fetching token for user: ${currentUser.email}`);
        const token = await AuthService.fetchTokenForUser(currentUser);

        console.log(`✅ Token fetched for user: ${currentUser.email}`);
        const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
        setConversations(otherUsers.map(user => ({
          id: `conv-${user.id}`,
          user,
          lastMessage: null,
          timestamp: new Date(),
          unreadCount: 0
        })));

        socketRef.current.connect(
          token,
          () => {
            console.log('✅ Connected to server');
            socketRef.current.emit('connection_status');
          },
          (reason) => {
            console.warn('❌ Disconnected from server:', reason);
          }
        );

      } catch (error) {
        console.error('❌ Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    return () => {
      console.warn('👋 Cleaning up socket connection and listeners...');
      socketRef.current.disconnect();
    };
  }, [currentUser, allUsers]);

  // Presence and connection events
  useEffect(() => {
    if (!currentUser) return;
    const socket = socketRef.current;

    socket.on('user_online', (data) => {
      console.log('📡 User online:', data);
      setOnlineUsers(prev => ({ ...prev, [data.id]: true }));
    });

    socket.on('user_offline', (data) => {
      console.log('🔕 User offline:', data);
      setOnlineUsers(prev => ({ ...prev, [data.id]: false }));
    });

    socket.on('connection_established', (data) => {
      console.log('🎯 Connection established:', data);
    });

    socket.on('connection_success', (data) => {
      console.log('🎯 Connection success:', data);
    });

    socket.on('connection_status_response', (data) => {
      console.log('🔄 Connection status response:', data);
    });

    socket.on('connect_error', (error) => {
      console.error(`🚨 Connection error: ${error.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // Message events (server driven)
  useEffect(() => {
    if (!currentUser) return;
    const socket = socketRef.current;

    socket.on('message_sent', (data) => {
      console.log('📨 Message sent confirmation:', data);
      const originalMessage = Array.from(pendingMessagesRef.current.values())
        .find(msg => msg.clientTempId === data.clientTempId);

      if (originalMessage) {
        setMessages(prev => [...prev, {
          id: data.messageId,
          text: originalMessage.text,
          senderId: originalMessage.senderId,
          receiverId: originalMessage.receiverId,
          timestamp: new Date(data.timestamp),
          status: 'sent',
          serverConfirmed: true,
          conversationId: data.conversationId
        }]);

        pendingMessagesRef.current.delete(data.clientTempId);
      }
    });

    socket.on('new_message', (message) => {
      console.log('📥 New message received:', message);
      setMessages(prev => [...prev, {
        id: message.messageId,
        text: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: new Date(message.timestamp),
        status: 'delivered',
        serverConfirmed: true,
        conversationId: message.conversationId
      }]);
    });
  }, [currentUser]);

  const handleSendMessage = (text) => {
    if (!activeConversation) return;

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;

    const tempId = `temp-${Date.now()}`;
    const message = {
      id: tempId,
      text,
      senderId: currentUser.id,
      receiverId: conversation.user.id,
      timestamp: new Date(),
      status: 'pending',
      clientTempId: tempId,
      serverConfirmed: false
    };

    setMessages(prev => [...prev, message]);
    pendingMessagesRef.current.set(tempId, message);

    socketRef.current.emit('send_message', {
      text,
      receiverId: conversation.user.id,
      conversationId: conversation.serverConversationId || `conv-${conversation.user.id}`,
      type: 'text',
      clientTempId: tempId
    });
  };

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation.id);
    setConversations(prev => prev.map(conv => conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv));
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  const activeConversationData = conversations.find(c => c.id === activeConversation);
  const filteredMessages = activeConversationData ? messages.filter(msg =>
    (msg.senderId === currentUser.id && msg.receiverId === activeConversationData.user.id) ||
    (msg.senderId === activeConversationData.user.id && msg.receiverId === currentUser.id)
  ) : [];

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="whatsapp-container">
      <div className={`conversations-panel ${activeConversation ? 'mobile-hidden' : ''}`}>
        <ConversationsList
          conversations={conversations}
          currentUser={currentUser}
          onConversationClick={handleConversationClick}
          activeConversation={activeConversation}
          onlineUsers={onlineUsers}
          onLogout={() => {
            socketRef.current.disconnect();
            onLogout();
          }}
        />
      </div>

      <div className={`chat-panel ${!activeConversation ? 'mobile-hidden' : ''}`}>
        {activeConversationData ? (
          <ChatView
            currentUser={currentUser}
            otherUser={activeConversationData.user}
            messages={filteredMessages}
            onSendMessage={handleSendMessage}
            onTyping={(isTyping) => socketRef.current.emit('typing', { conversationId: activeConversationData.id, isTyping })}
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

export default ChatApp;
