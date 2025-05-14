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
  isOtherUserTyping
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = messages.filter(
    msg => (msg.senderId === currentUser.id && msg.receiverId === otherUser.id) ||
           (msg.senderId === otherUser.id && msg.receiverId === currentUser.id)
  );

  return (
    <div className="flex-1 flex flex-col h-screen">
      <UserHeader 
        user={currentUser} 
        isCurrentUser={true} 
        isOtherUserOnline={isOtherUserOnline}
        isOtherUserTyping={isOtherUserTyping}
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
