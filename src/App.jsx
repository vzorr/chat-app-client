import React, { useState, useEffect, useRef } from 'react';
import ConversationsList from './components/ConversationsList';
import ChatView from './components/ChatView';
import SocketService from './services/SocketService';
import AuthService from './services/AuthService';
import './App.css';

const ChatApp = ({ currentUser, allUsers, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(new SocketService());

  useEffect(() => {
    const initUser = async () => {
      try {
        setIsLoading(true);
        console.log(`🔐 Initializing user: ${currentUser.email}`);
        
        // Fetch token for current user
        const token = await AuthService.fetchTokenForUser(currentUser);
        console.log(`✅ Token fetched for ${currentUser.email}`);
        
        // Setup conversations for other users
        const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
        setConversations(otherUsers.map(user => ({
          id: user.id,  // Use user ID as conversation ID for simplicity
          user,
          lastMessage: null,
          timestamp: new Date(),
          unreadCount: 0
        })));

        // Connect to socket server
        socketRef.current.connect(
          token,
          () => {
            console.log('✅ Connected to server');
          },
          (reason) => {
            console.warn('❌ Disconnected:', reason);
          }
        );

      } catch (error) {
        console.error('❌ Failed to initialize:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser, allUsers]);

  // Socket event listeners
  useEffect(() => {
    if (!currentUser) return;
    const socketService = socketRef.current;

    // Handle incoming messages
    const handleNewMessage = (message) => {
      console.log('📥 New message:', message);
      console.log('📥 Current user ID:', currentUser.id);
      console.log('📥 Message senderId:', message.senderId);
      console.log('📥 Message receiverId:', message.receiverId);
      
      // Don't process our own messages - they're already in the state
      if (message.senderId === currentUser.id) {
        console.log('📥 Ignoring own message');
        return;
      }
      
      // Extract text from message content
      let messageText = '';
      if (typeof message.content === 'string') {
        messageText = message.content;
      } else if (message.content && typeof message.content === 'object') {
        messageText = message.content.text || '';
      } else if (message.text) {
        messageText = message.text;
      }
      
      const newMessage = {
        id: message.messageId || message.id,
        text: messageText,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: new Date(message.timestamp || message.createdAt),
        status: 'delivered',
        content: message.content,
        serverConfirmed: true
      };
      
      console.log('📥 Adding message to state:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => {
        if (conv.user.id === message.senderId) {
          return {
            ...conv,
            lastMessage: {
              text: messageText,
              timestamp: newMessage.timestamp,
              isFromMe: false
            },
            unreadCount: conv.id === activeConversation ? 0 : conv.unreadCount + 1,
            serverConversationId: message.conversationId
          };
        }
        return conv;
      }));
    };

    // Handle message sent confirmation
    const handleMessageSent = (data) => {
      console.log('📨 Message sent:', data);
      
      // Update message status, don't create a new message
      setMessages(prev => prev.map(msg => {
        if (msg.tempId === data.clientTempId) {
          return {
            ...msg,
            id: data.messageId,
            status: 'delivered', // Set to delivered
            timestamp: new Date(data.timestamp),
            serverConfirmed: true
          };
        }
        return msg;
      }));
      
      // Update conversation's server ID if provided
      if (data.conversationId) {
        setConversations(prev => prev.map(conv => {
          if (conv.user.id === data.receiverId) {
            return { ...conv, serverConversationId: data.conversationId };
          }
          return conv;
        }));
      }
    };

    // Handle online/offline status
    const handleUserOnline = (data) => {
      console.log('🟢 User online:', data);
      const userId = data.id || data.userId;
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    };

    const handleUserOffline = (data) => {
      console.log('🔴 User offline:', data);
      const userId = data.id || data.userId;
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    };

    // Handle typing indicators
    const handleTyping = (data) => {
      const userId = data.userId || data.senderId;
      setTypingUsers(prev => ({ ...prev, [userId]: data.isTyping }));
    };

    // Register event listeners using SocketService's on method
    socketService.on('new_message', handleNewMessage);
    socketService.on('message_sent', handleMessageSent);
    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);
    socketService.on('typing', handleTyping);

    // Cleanup - since SocketService doesn't have an off method, we'll handle it differently
    return () => {
      // Check if the actual socket exists and has the off method
      if (socketService.socket && socketService.socket.off) {
        socketService.socket.off('new_message', handleNewMessage);
        socketService.socket.off('message_sent', handleMessageSent);
        socketService.socket.off('user_online', handleUserOnline);
        socketService.socket.off('user_offline', handleUserOffline);
        socketService.socket.off('typing', handleTyping);
      }
    };
  }, [currentUser, activeConversation]);

  const handleSendMessage = (text) => {
    if (!activeConversation) return;

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;

    const tempId = `temp-${Date.now()}`;
    const message = {
      id: tempId,
      tempId,
      text: text,
      senderId: currentUser.id,
      receiverId: conversation.user.id,
      timestamp: new Date(),
      status: 'pending'
    };

    // Add to messages immediately (optimistic update)
    setMessages(prev => [...prev, message]);

    // Send via socket - backend expects structured content
    socketRef.current.emit('send_message', {
      receiverId: conversation.user.id,
      content: {
        text: text,
        images: [],
        audio: null,
        replyTo: null,
        attachments: []
      },
      type: 'text',
      clientTempId: tempId
    });

    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          lastMessage: {
            text: text,
            timestamp: new Date(),
            isFromMe: true
          }
        };
      }
      return conv;
    }));
  };

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation.id);
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
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
            onTyping={(isTyping) => {
              socketRef.current.emit('typing', { 
                receiverId: activeConversationData.user.id, 
                isTyping 
              });
            }}
            isOtherUserOnline={onlineUsers[activeConversationData.user.id] || false}
            isOtherUserTyping={typingUsers[activeConversationData.user.id] || false}
            onBack={() => setActiveConversation(null)}
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