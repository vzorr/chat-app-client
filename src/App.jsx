import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatPanel from './components/ChatPanel';
import SocketService from './services/SocketService';
import AuthService from './services/AuthService';
import { USERS as STATIC_USERS } from './utils/constants';

const App = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [conversationId, setConversationId] = useState(null);

  const user1SocketRef = useRef(new SocketService());
  const user2SocketRef = useRef(new SocketService());

  // Fetch signed tokens for users from token generator server
  const fetchTokens = useCallback(async () => {
    try {
      const updatedUsers = await Promise.all(
        STATIC_USERS.map(async user => ({
          ...user,
          token: await AuthService.fetchTokenForUser(user)
        }))
      );
      setUsers(updatedUsers);
      console.log('✅ Tokens fetched and users updated');
    } catch (error) {
      console.error('❌ Failed to fetch tokens:', error);
    }
  }, []);

  // Initialize the chat sockets after users are loaded with tokens
  const initializeChat = useCallback(() => {
    if (users.length < 2) return;

    try {
      const syncPromises = users.map(user => AuthService.syncUser(user.token));
      Promise.all(syncPromises).then(() => {
        console.log('✅ Users synced successfully');

        setupUserSocket(user1SocketRef.current, users[0], users[1], '1');
        setupUserSocket(user2SocketRef.current, users[1], users[0], '2');
      });
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
    }
  }, [users]);

  const setupUserSocket = (socket, currentUser, otherUser, userNum) => {
    socket.connect(
      currentUser.token,
      () => {
        console.log(`✅ User ${userNum} connected`);
        socket.emit('set_presence', { status: 'online' });
      },
      () => {
        console.log(`❌ User ${userNum} disconnected`);
      }
    );

    socket.on('connection_established', (data) => {
      console.log(`User ${userNum} connection established:`, data);
    });

    socket.on('new_message', (message) => {
      console.log(`User ${userNum} received message:`, message);
      setMessages(prev => [...prev, {
        id: message.id,
        text: message.content.text,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: new Date(message.createdAt),
        status: message.status
      }]);
    });

    socket.on('message_sent', (data) => {
      console.log(`User ${userNum} message sent confirmation:`, data);
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    });

    socket.on('user_online', (data) => {
      console.log(`User ${userNum} received online status:`, data);
      setOnlineUsers(prev => ({ ...prev, [data.id]: true }));
    });

    socket.on('user_offline', (data) => {
      console.log(`User ${userNum} received offline status:`, data);
      setOnlineUsers(prev => ({ ...prev, [data.id]: false }));
    });

    socket.on('user_typing', (data) => {
      console.log(`User ${userNum} received typing status:`, data);
      setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }));
      if (!data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
        }, 1000);
      }
    });

    socket.on('presence_status', (data) => {
      console.log(`User ${userNum} received presence status:`, data);
      if (data.presence) {
        Object.entries(data.presence).forEach(([userId, presence]) => {
          setOnlineUsers(prev => ({ ...prev, [userId]: presence?.isOnline || false }));
        });
      }
    });
  };

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    initializeChat();
    return () => {
      user1SocketRef.current.disconnect();
      user2SocketRef.current.disconnect();
    };
  }, [initializeChat]);

  // Send message handlers
  const handleSendMessageUser1 = (text) => {
    const tempId = `temp-${Date.now()}`;
    const message = {
      id: tempId,
      text,
      senderId: users[0].id,
      receiverId: users[1].id,
      timestamp: new Date(),
      status: 'sent',
      clientTempId: tempId
    };

    setMessages(prev => [...prev, message]);

    user1SocketRef.current.emit('send_message', {
      text,
      receiverId: users[1].id,
      conversationId,
      type: 'text',
      clientTempId: tempId
    });
  };

  const handleSendMessageUser2 = (text) => {
    const tempId = `temp-${Date.now()}`;
    const message = {
      id: tempId,
      text,
      senderId: users[1].id,
      receiverId: users[0].id,
      timestamp: new Date(),
      status: 'sent',
      clientTempId: tempId
    };

    setMessages(prev => [...prev, message]);

    user2SocketRef.current.emit('send_message', {
      text,
      receiverId: users[0].id,
      conversationId,
      type: 'text',
      clientTempId: tempId
    });
  };

  // Typing handlers
  const handleTypingUser1 = (isTyping) => {
    if (conversationId) {
      user1SocketRef.current.emit('typing', { conversationId, isTyping });
    }
  };

  const handleTypingUser2 = (isTyping) => {
    if (conversationId) {
      user2SocketRef.current.emit('typing', { conversationId, isTyping });
    }
  };

  useEffect(() => {
    if (!users[0] || !users[1]) return;

    const interval = setInterval(() => {
      user1SocketRef.current.emit('get_presence', { userIds: [users[1].id] });
      user2SocketRef.current.emit('get_presence', { userIds: [users[0].id] });
    }, 5000);

    return () => clearInterval(interval);
  }, [users]);

  if (!users[0] || !users[1]) return <div>Loading users and tokens...</div>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* User 1 Panel */}
      <div className="flex-1 border-r border-gray-700">
        <ChatPanel
          currentUser={users[0]}
          otherUser={users[1]}
          messages={messages}
          onSendMessage={handleSendMessageUser1}
          onTyping={handleTypingUser1}
          isOtherUserOnline={onlineUsers[users[1].id] || false}
          isOtherUserTyping={typingUsers[users[1].id] || false}
        />
      </div>

      {/* User 2 Panel */}
      <div className="flex-1">
        <ChatPanel
          currentUser={users[1]}
          otherUser={users[0]}
          messages={messages}
          onSendMessage={handleSendMessageUser2}
          onTyping={handleTypingUser2}
          isOtherUserOnline={onlineUsers[users[0].id] || false}
          isOtherUserTyping={typingUsers[users[0].id] || false}
        />
      </div>
    </div>
  );
};

export default App;
