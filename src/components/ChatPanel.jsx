import React, { useEffect, useRef } from 'react';
import UserHeader from './UserHeader';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

const ChatPanel = ({ 
  currentUser, 
  otherUser, 
  messages, 
  onSendMessage, 
  onTyping,
  isOtherUserOnline,
  isOtherUserTyping,
  socket
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages to show only those that belong to this conversation
  // For sent messages: show immediately as pending
  // For received messages: only show if server confirmed
  const filteredMessages = messages.filter(msg => {
    // Show messages sent by current user to other user
    if (msg.senderId === currentUser.id && msg.receiverId === otherUser.id) {
      return true;
    }
    
    // Only show received messages if they're server confirmed
    if (msg.senderId === otherUser.id && msg.receiverId === currentUser.id) {
      return msg.serverConfirmed === true;
    }
    
    return false;
  });

  return (
    <div className="flex-1 flex flex-col h-screen">
      <UserHeader 
        user={currentUser} 
        isCurrentUser={true} 
        isOtherUserOnline={isOtherUserOnline}
        isOtherUserTyping={isOtherUserTyping}
        socket={socket}
      />
      <div className="flex-1 overflow-y-auto bg-gray-900 p-4">
        {filteredMessages.map(msg => (
          <MessageItem 
            key={msg.id} 
            message={msg} 
            isOwnMessage={msg.senderId === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
};

export default ChatPanel;